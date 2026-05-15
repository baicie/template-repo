# 小程序云开发

云开发为小程序提供了完整的后端服务，包括云函数、云数据库、云存储等能力。本文详细介绍小程序云开发的各个方面和最佳实践。

## 云开发基础 ☁️

### 环境配置

```javascript
// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        // 环境 ID
        env: "your-env-id",
        // 是否在将用户访问记录到用户管理中，在控制台中可见
        traceUser: true,
      });
    }
  },
});

// 多环境配置
const envConfig = {
  development: "dev-env-id",
  testing: "test-env-id",
  production: "prod-env-id",
};

const currentEnv = process.env.NODE_ENV || "development";

wx.cloud.init({
  env: envConfig[currentEnv],
  traceUser: true,
});
```

### 云函数开发

```javascript
// 云函数目录结构
/*
cloudfunctions/
├── login/
│   ├── index.js
│   └── package.json
├── getUserInfo/
│   ├── index.js
│   └── package.json
└── sendMessage/
    ├── index.js
    └── package.json
*/

// cloudfunctions/login/index.js
const cloud = require("wx-server-sdk");

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  try {
    // 获取用户信息
    const { userInfo } = event;

    // 查询用户是否已存在
    const userResult = await db
      .collection("users")
      .where({
        openid: wxContext.OPENID,
      })
      .get();

    let user;

    if (userResult.data.length === 0) {
      // 新用户，创建记录
      const createResult = await db.collection("users").add({
        data: {
          openid: wxContext.OPENID,
          unionid: wxContext.UNIONID,
          userInfo,
          createTime: db.serverDate(),
          lastLoginTime: db.serverDate(),
        },
      });

      user = {
        _id: createResult._id,
        openid: wxContext.OPENID,
        userInfo,
        isNewUser: true,
      };
    } else {
      // 老用户，更新最后登录时间
      user = userResult.data[0];

      await db
        .collection("users")
        .doc(user._id)
        .update({
          data: {
            lastLoginTime: db.serverDate(),
            userInfo, // 更新用户信息
          },
        });

      user.isNewUser = false;
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("登录失败:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// cloudfunctions/getUserInfo/index.js
const cloud = require("wx-server-sdk");
cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { userId } = event;

  try {
    // 权限检查
    if (userId && userId !== wxContext.OPENID) {
      // 检查是否有权限查看其他用户信息
      const hasPermission = await checkPermission(
        wxContext.OPENID,
        "view_user"
      );
      if (!hasPermission) {
        return {
          success: false,
          error: "权限不足",
        };
      }
    }

    const targetId = userId || wxContext.OPENID;

    const result = await db
      .collection("users")
      .where({
        openid: targetId,
      })
      .get();

    if (result.data.length === 0) {
      return {
        success: false,
        error: "用户不存在",
      };
    }

    const user = result.data[0];

    // 过滤敏感信息
    const publicUser = {
      _id: user._id,
      userInfo: user.userInfo,
      createTime: user.createTime,
    };

    return {
      success: true,
      data: publicUser,
    };
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

async function checkPermission(openid, action) {
  // 权限检查逻辑
  const result = await db
    .collection("permissions")
    .where({
      openid,
      action,
      status: "active",
    })
    .get();

  return result.data.length > 0;
}
```

### 小程序端调用云函数

```javascript
// 封装云函数调用
class CloudService {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
  }

  async callFunction(name, data = {}, options = {}) {
    const {
      useCache = false,
      cacheTime = 5 * 60 * 1000,
      timeout = 10000,
    } = options;

    const cacheKey = `${name}_${JSON.stringify(data)}`;

    // 检查缓存
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTime) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // 防止重复请求
    if (this.pending.has(cacheKey)) {
      return this.pending.get(cacheKey);
    }

    const promise = this._callFunction(name, data, timeout);
    this.pending.set(cacheKey, promise);

    try {
      const result = await promise;

      // 缓存结果
      if (useCache && result.success) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      return result;
    } finally {
      this.pending.delete(cacheKey);
    }
  }

  async _callFunction(name, data, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`云函数 ${name} 调用超时`));
      }, timeout);

      wx.cloud.callFunction({
        name,
        data,
        success: (res) => {
          clearTimeout(timer);
          resolve(res.result);
        },
        fail: (error) => {
          clearTimeout(timer);
          console.error(`云函数 ${name} 调用失败:`, error);
          reject(error);
        },
      });
    });
  }

  // 批量调用云函数
  async batchCall(calls) {
    const promises = calls.map(({ name, data, options }) =>
      this.callFunction(name, data, options).catch((error) => ({
        success: false,
        error: error.message,
      }))
    );

    return Promise.all(promises);
  }

  clearCache() {
    this.cache.clear();
  }
}

const cloudService = new CloudService();

// 使用示例
Page({
  async login() {
    try {
      wx.showLoading({ title: "登录中..." });

      const result = await cloudService.callFunction(
        "login",
        {
          userInfo: this.data.userInfo,
        },
        {
          timeout: 15000,
        }
      );

      if (result.success) {
        // 登录成功
        getApp().globalData.user = result.data;
        wx.showToast({
          title: "登录成功",
          icon: "success",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      wx.showToast({
        title: error.message || "登录失败",
        icon: "error",
      });
    } finally {
      wx.hideLoading();
    }
  },

  async loadUserData() {
    const calls = [
      { name: "getUserInfo", data: {} },
      { name: "getUserPosts", data: { limit: 10 } },
      { name: "getUserFollowers", data: {} },
    ];

    const results = await cloudService.batchCall(calls);

    const [userInfo, posts, followers] = results;

    this.setData({
      userInfo: userInfo.success ? userInfo.data : null,
      posts: posts.success ? posts.data : [],
      followers: followers.success ? followers.data : [],
    });
  },
});
```

## 云数据库 🗄️

### 数据库设计

```javascript
// 数据库集合设计示例

// users 集合
const userSchema = {
  _id: "auto", // 自动生成
  openid: "string", // 用户唯一标识
  unionid: "string", // 开放平台唯一标识
  userInfo: {
    nickName: "string",
    avatarUrl: "string",
    gender: "number",
    city: "string",
    province: "string",
    country: "string",
  },
  profile: {
    bio: "string",
    website: "string",
    birthday: "date",
  },
  settings: {
    notifications: "boolean",
    privacy: "string", // 'public' | 'private'
  },
  stats: {
    postsCount: "number",
    followersCount: "number",
    followingCount: "number",
  },
  status: "string", // 'active' | 'inactive' | 'banned'
  createTime: "date",
  updateTime: "date",
};

// posts 集合
const postSchema = {
  _id: "auto",
  authorId: "string", // 作者 openid
  title: "string",
  content: "string",
  images: ["string"], // 图片URL数组
  tags: ["string"],
  category: "string",
  status: "string", // 'draft' | 'published' | 'deleted'
  visibility: "string", // 'public' | 'private' | 'followers'
  stats: {
    viewCount: "number",
    likeCount: "number",
    commentCount: "number",
    shareCount: "number",
  },
  createTime: "date",
  updateTime: "date",
  publishTime: "date",
};

// comments 集合
const commentSchema = {
  _id: "auto",
  postId: "string",
  authorId: "string",
  parentId: "string", // 父评论ID，用于回复
  content: "string",
  status: "string", // 'active' | 'deleted' | 'hidden'
  likeCount: "number",
  createTime: "date",
};
```

### 数据库操作

```javascript
// cloudfunctions/database/index.js
const cloud = require("wx-server-sdk");
cloud.init();

const db = cloud.database();
const _ = db.command;

class DatabaseService {
  constructor() {
    this.db = db;
    this._ = _;
  }

  // 创建文档
  async create(collection, data) {
    try {
      const result = await this.db.collection(collection).add({
        data: {
          ...data,
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
        },
      });

      return {
        success: true,
        data: { _id: result._id },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 查询文档
  async find(collection, query = {}, options = {}) {
    try {
      const {
        limit = 20,
        skip = 0,
        orderBy = { createTime: "desc" },
        fields = {},
      } = options;

      let dbQuery = this.db.collection(collection);

      // 添加查询条件
      if (Object.keys(query).length > 0) {
        dbQuery = dbQuery.where(query);
      }

      // 添加字段筛选
      if (Object.keys(fields).length > 0) {
        dbQuery = dbQuery.field(fields);
      }

      // 添加排序
      if (orderBy) {
        Object.entries(orderBy).forEach(([field, order]) => {
          dbQuery = dbQuery.orderBy(field, order);
        });
      }

      // 添加分页
      const result = await dbQuery.skip(skip).limit(limit).get();

      return {
        success: true,
        data: result.data,
        total: result.data.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 更新文档
  async update(collection, id, data) {
    try {
      const result = await this.db
        .collection(collection)
        .doc(id)
        .update({
          data: {
            ...data,
            updateTime: db.serverDate(),
          },
        });

      return {
        success: true,
        data: { updated: result.stats.updated },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 删除文档（软删除）
  async softDelete(collection, id) {
    return this.update(collection, id, {
      status: "deleted",
      deleteTime: db.serverDate(),
    });
  }

  // 硬删除文档
  async delete(collection, id) {
    try {
      const result = await this.db.collection(collection).doc(id).remove();

      return {
        success: true,
        data: { deleted: result.stats.removed },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 聚合查询
  async aggregate(collection, pipeline) {
    try {
      const result = await this.db
        .collection(collection)
        .aggregate()
        .pipeline(pipeline)
        .end();

      return {
        success: true,
        data: result.list,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 事务操作
  async transaction(operations) {
    const transaction = await this.db.startTransaction();

    try {
      const results = [];

      for (const operation of operations) {
        const { type, collection, data, query } = operation;

        let result;
        switch (type) {
          case "add":
            result = await transaction.collection(collection).add({ data });
            break;
          case "update":
            result = await transaction
              .collection(collection)
              .where(query)
              .update({ data });
            break;
          case "remove":
            result = await transaction
              .collection(collection)
              .where(query)
              .remove();
            break;
          default:
            throw new Error(`不支持的操作类型: ${type}`);
        }

        results.push(result);
      }

      await transaction.commit();

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

const dbService = new DatabaseService();

// 导出云函数
exports.main = async (event, context) => {
  const { action, ...params } = event;

  switch (action) {
    case "create":
      return dbService.create(params.collection, params.data);
    case "find":
      return dbService.find(params.collection, params.query, params.options);
    case "update":
      return dbService.update(params.collection, params.id, params.data);
    case "delete":
      return dbService.delete(params.collection, params.id);
    case "aggregate":
      return dbService.aggregate(params.collection, params.pipeline);
    case "transaction":
      return dbService.transaction(params.operations);
    default:
      return {
        success: false,
        error: `不支持的操作: ${action}`,
      };
  }
};
```

### 小程序端数据库操作

```javascript
// utils/database.js
class MiniProgramDatabase {
  constructor() {
    this.db = wx.cloud.database();
    this._ = this.db.command;
  }

  // 实时数据监听
  watchCollection(collection, query = {}, callback) {
    const watcher = this.db
      .collection(collection)
      .where(query)
      .watch({
        onChange: (snapshot) => {
          console.log("数据变化:", snapshot);
          callback(snapshot.docs, snapshot.type);
        },
        onError: (error) => {
          console.error("监听失败:", error);
        },
      });

    return watcher;
  }

  // 分页查询
  async paginate(collection, query = {}, options = {}) {
    const {
      page = 1,
      pageSize = 20,
      orderBy = { createTime: "desc" },
    } = options;

    try {
      let dbQuery = this.db.collection(collection).where(query);

      // 添加排序
      Object.entries(orderBy).forEach(([field, order]) => {
        dbQuery = dbQuery.orderBy(field, order);
      });

      const skip = (page - 1) * pageSize;
      const result = await dbQuery.skip(skip).limit(pageSize).get();

      return {
        success: true,
        data: result.data,
        pagination: {
          page,
          pageSize,
          total: result.data.length,
          hasMore: result.data.length === pageSize,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 复杂查询
  async complexQuery(collection, conditions) {
    try {
      let query = {};

      conditions.forEach((condition) => {
        const { field, operator, value } = condition;

        switch (operator) {
          case "eq":
            query[field] = value;
            break;
          case "neq":
            query[field] = this._.neq(value);
            break;
          case "gt":
            query[field] = this._.gt(value);
            break;
          case "gte":
            query[field] = this._.gte(value);
            break;
          case "lt":
            query[field] = this._.lt(value);
            break;
          case "lte":
            query[field] = this._.lte(value);
            break;
          case "in":
            query[field] = this._.in(value);
            break;
          case "nin":
            query[field] = this._.nin(value);
            break;
          case "exists":
            query[field] = this._.exists(value);
            break;
          case "regex":
            query[field] = this._.regex({
              regexp: value.pattern,
              options: value.flags,
            });
            break;
        }
      });

      const result = await this.db.collection(collection).where(query).get();

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 批量操作
  async batchOperation(operations) {
    const results = [];

    for (const operation of operations) {
      try {
        let result;
        const { type, collection, data, query, id } = operation;

        switch (type) {
          case "add":
            result = await this.db.collection(collection).add({ data });
            break;
          case "update":
            if (id) {
              result = await this.db
                .collection(collection)
                .doc(id)
                .update({ data });
            } else {
              result = await this.db
                .collection(collection)
                .where(query)
                .update({ data });
            }
            break;
          case "remove":
            if (id) {
              result = await this.db.collection(collection).doc(id).remove();
            } else {
              result = await this.db
                .collection(collection)
                .where(query)
                .remove();
            }
            break;
        }

        results.push({
          success: true,
          operation: type,
          result,
        });
      } catch (error) {
        results.push({
          success: false,
          operation: type,
          error: error.message,
        });
      }
    }

    return results;
  }
}

const miniDB = new MiniProgramDatabase();

// 使用示例
Page({
  data: {
    posts: [],
    watcher: null,
  },

  onLoad() {
    this.loadPosts();
    this.watchPosts();
  },

  onUnload() {
    // 关闭数据监听
    if (this.data.watcher) {
      this.data.watcher.close();
    }
  },

  async loadPosts() {
    const result = await miniDB.paginate(
      "posts",
      {
        status: "published",
        visibility: "public",
      },
      {
        page: 1,
        pageSize: 10,
        orderBy: { publishTime: "desc" },
      }
    );

    if (result.success) {
      this.setData({ posts: result.data });
    }
  },

  watchPosts() {
    const watcher = miniDB.watchCollection(
      "posts",
      {
        status: "published",
        visibility: "public",
      },
      (docs, type) => {
        console.log("帖子数据变化:", type, docs);
        this.setData({ posts: docs });
      }
    );

    this.setData({ watcher });
  },

  async searchPosts(keyword) {
    const result = await miniDB.complexQuery("posts", [
      { field: "status", operator: "eq", value: "published" },
      {
        field: "title",
        operator: "regex",
        value: { pattern: keyword, flags: "i" },
      },
    ]);

    if (result.success) {
      this.setData({ searchResults: result.data });
    }
  },
});
```

## 云存储 📁

### 文件上传

```javascript
// 云存储服务封装
class CloudStorageService {
  constructor() {
    this.uploadQueue = [];
    this.maxConcurrent = 3;
    this.isProcessing = false;
  }

  // 单文件上传
  async uploadFile(filePath, cloudPath, options = {}) {
    const {
      onProgress,
      compress = true,
      maxSize = 10 * 1024 * 1024, // 10MB
    } = options;

    try {
      // 文件大小检查
      const fileInfo = await this.getFileInfo(filePath);
      if (fileInfo.size > maxSize) {
        throw new Error(`文件大小超过限制 (${maxSize / 1024 / 1024}MB)`);
      }

      // 图片压缩
      let uploadPath = filePath;
      if (compress && this.isImage(filePath)) {
        uploadPath = await this.compressImage(filePath);
      }

      const result = await new Promise((resolve, reject) => {
        const uploadTask = wx.cloud.uploadFile({
          cloudPath,
          filePath: uploadPath,
          success: resolve,
          fail: reject,
        });

        // 监听上传进度
        if (onProgress) {
          uploadTask.onProgressUpdate(onProgress);
        }
      });

      return {
        success: true,
        fileID: result.fileID,
        statusCode: result.statusCode,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 批量上传
  async uploadFiles(files, options = {}) {
    const {
      concurrent = this.maxConcurrent,
      onProgress,
      onFileComplete,
    } = options;

    const results = [];
    const chunks = this.chunkArray(files, concurrent);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (file, index) => {
        const { filePath, cloudPath } = file;

        const result = await this.uploadFile(filePath, cloudPath, {
          onProgress: (progress) => {
            if (onProgress) {
              onProgress(progress, index, filePath);
            }
          },
        });

        if (onFileComplete) {
          onFileComplete(result, index, filePath);
        }

        return result;
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results;
  }

  // 队列上传
  addToUploadQueue(filePath, cloudPath, options = {}) {
    return new Promise((resolve, reject) => {
      this.uploadQueue.push({
        filePath,
        cloudPath,
        options,
        resolve,
        reject,
      });

      this.processUploadQueue();
    });
  }

  async processUploadQueue() {
    if (this.isProcessing || this.uploadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.uploadQueue.length > 0) {
      const batch = this.uploadQueue.splice(0, this.maxConcurrent);

      const promises = batch.map(async (item) => {
        try {
          const result = await this.uploadFile(
            item.filePath,
            item.cloudPath,
            item.options
          );
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
      });

      await Promise.allSettled(promises);
    }

    this.isProcessing = false;
  }

  // 获取文件信息
  async getFileInfo(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileInfo({
        filePath,
        success: resolve,
        fail: reject,
      });
    });
  }

  // 压缩图片
  async compressImage(filePath) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: filePath,
        quality: 80,
        success: (res) => resolve(res.tempFilePath),
        fail: reject,
      });
    });
  }

  // 判断是否为图片
  isImage(filePath) {
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf("."));
    return imageExts.includes(ext);
  }

  // 数组分块
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 生成云存储路径
  generateCloudPath(originalPath, prefix = "") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const ext = originalPath.substring(originalPath.lastIndexOf("."));

    return `${prefix}${timestamp}_${random}${ext}`;
  }
}

const cloudStorage = new CloudStorageService();

// 使用示例
Page({
  data: {
    uploadProgress: {},
  },

  // 选择并上传图片
  async chooseAndUploadImage() {
    try {
      const chooseResult = await this.chooseImage();
      const { tempFilePaths } = chooseResult;

      wx.showLoading({ title: "上传中..." });

      const uploadFiles = tempFilePaths.map((filePath) => ({
        filePath,
        cloudPath: cloudStorage.generateCloudPath(filePath, "images/"),
      }));

      const results = await cloudStorage.uploadFiles(uploadFiles, {
        onProgress: (progress, index, filePath) => {
          this.setData({
            [`uploadProgress.${index}`]: progress.progress,
          });
        },
        onFileComplete: (result, index) => {
          console.log(`文件 ${index} 上传完成:`, result);
        },
      });

      const successResults = results.filter((r) => r.success);
      const fileIDs = successResults.map((r) => r.fileID);

      this.setData({
        uploadedImages: [...(this.data.uploadedImages || []), ...fileIDs],
      });

      wx.showToast({
        title: `成功上传 ${successResults.length} 张图片`,
        icon: "success",
      });
    } catch (error) {
      wx.showToast({
        title: error.message || "上传失败",
        icon: "error",
      });
    } finally {
      wx.hideLoading();
      this.setData({ uploadProgress: {} });
    }
  },

  chooseImage() {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 9,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: resolve,
        fail: reject,
      });
    });
  },
});
```

### 文件管理

```javascript
// cloudfunctions/fileManager/index.js
const cloud = require("wx-server-sdk");
cloud.init();

const db = cloud.database();

class FileManager {
  constructor() {
    this.db = db;
  }

  // 获取文件下载链接
  async getDownloadURL(fileIDs) {
    try {
      const result = await cloud.getTempFileURL({
        fileList: Array.isArray(fileIDs) ? fileIDs : [fileIDs],
      });

      return {
        success: true,
        data: result.fileList,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 删除文件
  async deleteFiles(fileIDs) {
    try {
      const result = await cloud.deleteFile({
        fileList: Array.isArray(fileIDs) ? fileIDs : [fileIDs],
      });

      return {
        success: true,
        data: result.fileList,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 文件记录管理
  async createFileRecord(fileInfo) {
    try {
      const result = await this.db.collection("files").add({
        data: {
          ...fileInfo,
          createTime: db.serverDate(),
          status: "active",
        },
      });

      return {
        success: true,
        data: { _id: result._id },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 批量创建文件记录
  async createFileRecords(fileInfos) {
    try {
      const operations = fileInfos.map((fileInfo) => ({
        data: {
          ...fileInfo,
          createTime: db.serverDate(),
          status: "active",
        },
      }));

      const results = [];
      for (const operation of operations) {
        const result = await this.db.collection("files").add(operation);
        results.push(result);
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 获取用户文件列表
  async getUserFiles(openid, options = {}) {
    try {
      const { page = 1, pageSize = 20, fileType = null } = options;

      let query = {
        ownerOpenid: openid,
        status: "active",
      };

      if (fileType) {
        query.fileType = fileType;
      }

      const skip = (page - 1) * pageSize;
      const result = await this.db
        .collection("files")
        .where(query)
        .orderBy("createTime", "desc")
        .skip(skip)
        .limit(pageSize)
        .get();

      return {
        success: true,
        data: result.data,
        pagination: {
          page,
          pageSize,
          hasMore: result.data.length === pageSize,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 文件使用统计
  async getFileStats(openid) {
    try {
      const pipeline = [
        {
          $match: {
            ownerOpenid: openid,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$fileType",
            count: { $sum: 1 },
            totalSize: { $sum: "$size" },
          },
        },
      ];

      const result = await this.db
        .collection("files")
        .aggregate()
        .pipeline(pipeline)
        .end();

      return {
        success: true,
        data: result.list,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

const fileManager = new FileManager();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { action, ...params } = event;

  switch (action) {
    case "getDownloadURL":
      return fileManager.getDownloadURL(params.fileIDs);
    case "deleteFiles":
      return fileManager.deleteFiles(params.fileIDs);
    case "createFileRecord":
      return fileManager.createFileRecord({
        ...params.fileInfo,
        ownerOpenid: wxContext.OPENID,
      });
    case "createFileRecords":
      return fileManager.createFileRecords(
        params.fileInfos.map((info) => ({
          ...info,
          ownerOpenid: wxContext.OPENID,
        }))
      );
    case "getUserFiles":
      return fileManager.getUserFiles(wxContext.OPENID, params.options);
    case "getFileStats":
      return fileManager.getFileStats(wxContext.OPENID);
    default:
      return {
        success: false,
        error: `不支持的操作: ${action}`,
      };
  }
};
```

## 云调用 📞

### HTTP API 调用

```javascript
// cloudfunctions/httpApi/index.js
const cloud = require("wx-server-sdk");
const axios = require("axios");

cloud.init();

class HttpApiService {
  constructor() {
    this.timeout = 10000;
    this.retryCount = 3;
  }

  // 发送HTTP请求
  async request(config) {
    const {
      url,
      method = "GET",
      data = {},
      headers = {},
      timeout = this.timeout,
    } = config;

    try {
      const response = await axios({
        url,
        method,
        data,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        timeout,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
      };
    }
  }

  // 带重试的请求
  async requestWithRetry(config, retryCount = this.retryCount) {
    for (let i = 0; i <= retryCount; i++) {
      const result = await this.request(config);

      if (result.success) {
        return result;
      }

      // 最后一次重试失败
      if (i === retryCount) {
        return result;
      }

      // 等待后重试
      await this.delay(Math.pow(2, i) * 1000); // 指数退避
    }
  }

  // 发送微信模板消息
  async sendTemplateMessage(openid, templateId, data, options = {}) {
    const { page = "", miniprogram = null, color = "#173177" } = options;

    try {
      const result = await cloud.openapi.subscribeMessage.send({
        touser: openid,
        template_id: templateId,
        page,
        miniprogram,
        data,
        miniprogram_state: "formal", // 'formal' | 'trial' | 'developer'
        lang: "zh_CN",
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 生成小程序码
  async generateQRCode(scene, options = {}) {
    const {
      page = "pages/index/index",
      width = 430,
      autoColor = false,
      lineColor = { r: 0, g: 0, b: 0 },
      isHyaline = false,
    } = options;

    try {
      const result = await cloud.openapi.wxacode.getUnlimited({
        scene,
        page,
        width,
        auto_color: autoColor,
        line_color: lineColor,
        is_hyaline: isHyaline,
      });

      // 上传到云存储
      const uploadResult = await cloud.uploadFile({
        cloudPath: `qrcodes/${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.png`,
        fileContent: result.buffer,
      });

      return {
        success: true,
        data: {
          fileID: uploadResult.fileID,
          buffer: result.buffer,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 内容安全检查
  async securityCheck(content, openid) {
    try {
      const result = await cloud.openapi.security.msgSecCheck({
        content,
        openid,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 图片内容安全检查
  async imageSecurityCheck(media) {
    try {
      const result = await cloud.openapi.security.imgSecCheck({
        media,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const httpApiService = new HttpApiService();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { action, ...params } = event;

  switch (action) {
    case "request":
      return httpApiService.request(params.config);
    case "requestWithRetry":
      return httpApiService.requestWithRetry(params.config, params.retryCount);
    case "sendTemplateMessage":
      return httpApiService.sendTemplateMessage(
        params.openid || wxContext.OPENID,
        params.templateId,
        params.data,
        params.options
      );
    case "generateQRCode":
      return httpApiService.generateQRCode(params.scene, params.options);
    case "securityCheck":
      return httpApiService.securityCheck(params.content, wxContext.OPENID);
    case "imageSecurityCheck":
      return httpApiService.imageSecurityCheck(params.media);
    default:
      return {
        success: false,
        error: `不支持的操作: ${action}`,
      };
  }
};
```

## 最佳实践 ✨

### 错误处理

```javascript
// 统一错误处理
class CloudErrorHandler {
  static handle(error, context = {}) {
    console.error("云开发错误:", error, context);

    // 错误分类
    const errorType = this.classifyError(error);

    // 错误上报
    this.reportError(error, errorType, context);

    // 返回用户友好的错误信息
    return this.getUserFriendlyMessage(errorType);
  }

  static classifyError(error) {
    if (error.errCode) {
      // 云开发特定错误
      switch (error.errCode) {
        case -1:
          return "SYSTEM_ERROR";
        case -501004:
          return "QUOTA_EXCEEDED";
        case -404003:
          return "COLLECTION_NOT_FOUND";
        case -502001:
          return "PERMISSION_DENIED";
        default:
          return "CLOUD_ERROR";
      }
    } else if (error.code === "NETWORK_ERROR") {
      return "NETWORK_ERROR";
    } else {
      return "UNKNOWN_ERROR";
    }
  }

  static getUserFriendlyMessage(errorType) {
    const messages = {
      SYSTEM_ERROR: "系统繁忙，请稍后重试",
      QUOTA_EXCEEDED: "服务使用量超限，请联系管理员",
      COLLECTION_NOT_FOUND: "数据不存在",
      PERMISSION_DENIED: "权限不足",
      NETWORK_ERROR: "网络连接失败，请检查网络",
      CLOUD_ERROR: "云服务异常",
      UNKNOWN_ERROR: "未知错误，请稍后重试",
    };

    return messages[errorType] || messages["UNKNOWN_ERROR"];
  }

  static reportError(error, errorType, context) {
    // 错误上报逻辑
    // 可以发送到监控服务或日志系统
  }
}

// 在云函数中使用
exports.main = async (event, context) => {
  try {
    // 业务逻辑
    const result = await businessLogic(event);
    return result;
  } catch (error) {
    return {
      success: false,
      error: CloudErrorHandler.handle(error, { event, context }),
    };
  }
};
```

### 性能优化

```javascript
// 云函数性能优化
class PerformanceOptimizer {
  static async batchProcess(items, processor, batchSize = 10) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(processor);
      const batchResults = await Promise.allSettled(batchPromises);

      results.push(
        ...batchResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : { error: result.reason }
        )
      );
    }

    return results;
  }

  static memoize(fn, ttl = 5 * 60 * 1000) {
    const cache = new Map();

    return async function (...args) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }

      const result = await fn.apply(this, args);
      cache.set(key, {
        value: result,
        timestamp: Date.now(),
      });

      return result;
    };
  }

  static async withTimeout(promise, timeout = 10000) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("操作超时")), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}

// 使用示例
const cachedGetUser = PerformanceOptimizer.memoize(async (userId) => {
  return db.collection("users").doc(userId).get();
}, 60000); // 缓存1分钟

exports.main = async (event, context) => {
  const { userIds } = event;

  // 批量处理用户查询
  const results = await PerformanceOptimizer.batchProcess(
    userIds,
    async (userId) => {
      return PerformanceOptimizer.withTimeout(cachedGetUser(userId), 5000);
    },
    5
  );

  return {
    success: true,
    data: results,
  };
};
```

### 安全实践

```javascript
// 云函数安全实践
class SecurityManager {
  static validateInput(data, rules) {
    const errors = [];

    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field];

      if (
        rule.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} 是必填字段`);
        return;
      }

      if (value !== undefined && value !== null) {
        if (rule.type && typeof value !== rule.type) {
          errors.push(`${field} 类型错误`);
        }

        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${field} 长度不能少于 ${rule.minLength}`);
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${field} 长度不能超过 ${rule.maxLength}`);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${field} 格式不正确`);
        }
      }
    });

    return errors;
  }

  static checkPermission(openid, resource, action) {
    // 权限检查逻辑
    // 可以从数据库查询用户权限
    return true; // 简化示例
  }

  static sanitizeData(data) {
    // 数据清理，防止XSS等攻击
    if (typeof data === "string") {
      return data.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );
    }

    if (typeof data === "object" && data !== null) {
      const sanitized = {};
      Object.entries(data).forEach(([key, value]) => {
        sanitized[key] = this.sanitizeData(value);
      });
      return sanitized;
    }

    return data;
  }

  static rateLimitCheck(openid, action, limit = 100, window = 60000) {
    // 频率限制检查
    // 实际实现需要使用 Redis 或数据库
    return true; // 简化示例
  }
}

// 在云函数中使用
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  try {
    // 输入验证
    const validationErrors = SecurityManager.validateInput(event, {
      title: { required: true, type: "string", maxLength: 100 },
      content: { required: true, type: "string", maxLength: 5000 },
    });

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(", "),
      };
    }

    // 权限检查
    if (!SecurityManager.checkPermission(wxContext.OPENID, "posts", "create")) {
      return {
        success: false,
        error: "权限不足",
      };
    }

    // 频率限制
    if (!SecurityManager.rateLimitCheck(wxContext.OPENID, "create_post")) {
      return {
        success: false,
        error: "操作过于频繁，请稍后重试",
      };
    }

    // 数据清理
    const sanitizedData = SecurityManager.sanitizeData(event);

    // 业务逻辑
    const result = await createPost(sanitizedData, wxContext.OPENID);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return CloudErrorHandler.handle(error, { event, context });
  }
};
```

---

🎯 **下一步**: 掌握了云开发后，建议学习 [小程序面试题集](./interview-questions.md) 来巩固所学知识！
