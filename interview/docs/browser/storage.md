# 浏览器存储机制详解

深入解析浏览器端的各种存储方案，包括 Cookie、Web Storage、IndexedDB 等，以及它们的特性、使用场景和最佳实践。

## 📊 存储方案概览

### 存储类型对比

| 存储方式           | 容量限制     | 生命周期       | 作用域      | 数据类型      | 网络传输 |
| ------------------ | ------------ | -------------- | ----------- | ------------- | -------- |
| **Cookie**         | 4KB          | 可设置过期时间 | 域名+路径   | 字符串        | 自动发送 |
| **LocalStorage**   | 5-10MB       | 永久(手动清除) | 域名        | 字符串        | 不发送   |
| **SessionStorage** | 5-10MB       | 会话结束       | 域名+标签页 | 字符串        | 不发送   |
| **IndexedDB**      | 硬盘空间 50% | 永久(手动清除) | 域名        | 任意类型      | 不发送   |
| **WebSQL**         | 数百 MB      | 永久           | 域名        | 结构化数据    | 不发送   |
| **Cache API**      | 动态         | 永久(手动清除) | 域名        | Response 对象 | 不发送   |

## 🍪 Cookie 详解

### 基础用法

```javascript
// 设置Cookie
document.cookie =
  "username=john; expires=Thu, 18 Dec 2024 12:00:00 UTC; path=/";

// 读取Cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// 删除Cookie
function deleteCookie(name, path = "/") {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}
```

### Cookie 工具类

```javascript
class CookieManager {
  // 设置Cookie
  static set(name, value, options = {}) {
    const {
      expires, // 过期时间
      maxAge, // 最大生存时间(秒)
      path = "/", // 路径
      domain, // 域名
      secure = false, // 仅HTTPS
      httpOnly = false, // 仅HTTP(服务端设置)
      sameSite = "Lax", // 跨站策略
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}`;

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (maxAge) {
      cookieString += `; max-age=${maxAge}`;
    }

    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += "; secure";
    }

    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }

    document.cookie = cookieString;
  }

  // 获取Cookie
  static get(name) {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split("=");
      if (decodeURIComponent(cookieName) === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  // 获取所有Cookie
  static getAll() {
    const cookies = {};
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value || "");
      }
    });
    return cookies;
  }

  // 删除Cookie
  static remove(name, path = "/", domain) {
    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    document.cookie = cookieString;
  }

  // 检查Cookie是否存在
  static has(name) {
    return this.get(name) !== null;
  }
}

// 使用示例
CookieManager.set("user", "john", {
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
  secure: true,
  sameSite: "Strict",
});

const user = CookieManager.get("user");
console.log("当前用户:", user);
```

### Cookie 安全配置

```javascript
// 安全的Cookie设置
function setSecureCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // 生产环境安全配置
  CookieManager.set(name, value, {
    expires: expires,
    path: "/",
    secure: location.protocol === "https:", // 仅HTTPS
    sameSite: "Strict", // 严格的跨站策略
    // httpOnly: true  // 仅服务端可设置
  });
}

// 会话Cookie(关闭浏览器后删除)
function setSessionCookie(name, value) {
  CookieManager.set(name, value, {
    path: "/",
    secure: location.protocol === "https:",
    sameSite: "Lax",
    // 不设置expires和maxAge
  });
}
```

## 💾 Web Storage (LocalStorage & SessionStorage)

### 基础 API

```javascript
// LocalStorage - 持久化存储
localStorage.setItem("key", "value");
const value = localStorage.getItem("key");
localStorage.removeItem("key");
localStorage.clear(); // 清空所有

// SessionStorage - 会话存储
sessionStorage.setItem("key", "value");
const value = sessionStorage.getItem("key");
sessionStorage.removeItem("key");
sessionStorage.clear();
```

### Storage 工具类

```javascript
class StorageManager {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  // 设置值(自动序列化)
  set(key, value, expiry = null) {
    const data = {
      value: value,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : null,
    };

    try {
      this.storage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("存储失败:", error);
      return false;
    }
  }

  // 获取值(自动反序列化)
  get(key) {
    try {
      const item = this.storage.getItem(key);
      if (!item) return null;

      const data = JSON.parse(item);

      // 检查是否过期
      if (data.expiry && Date.now() > data.expiry) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error("读取失败:", error);
      return null;
    }
  }

  // 删除
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error("删除失败:", error);
      return false;
    }
  }

  // 清空
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error("清空失败:", error);
      return false;
    }
  }

  // 获取所有键
  keys() {
    return Object.keys(this.storage);
  }

  // 获取存储大小
  getSize() {
    let total = 0;
    for (let key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        total += this.storage[key].length + key.length;
      }
    }
    return total;
  }

  // 检查容量
  checkCapacity() {
    const testKey = "storage_test_key";
    const testValue = "x".repeat(1024); // 1KB
    let size = 0;

    try {
      while (true) {
        this.storage.setItem(testKey, testValue.repeat(size));
        size++;
      }
    } catch (e) {
      this.storage.removeItem(testKey);
      return (size - 1) * 1024; // KB
    }
  }
}

// 使用示例
const localStore = new StorageManager(localStorage);
const sessionStore = new StorageManager(sessionStorage);

// 存储用户信息(7天过期)
localStore.set(
  "userInfo",
  {
    name: "John",
    email: "john@example.com",
  },
  7 * 24 * 60 * 60 * 1000
); // 7天

// 存储临时数据
sessionStore.set("tempData", { page: 1, filters: [] });

// 读取数据
const userInfo = localStore.get("userInfo");
const tempData = sessionStore.get("tempData");
```

### 存储监听

```javascript
// 监听Storage变化(仅跨窗口)
window.addEventListener("storage", function (e) {
  if (e.storageArea === localStorage) {
    console.log("LocalStorage变化:", {
      key: e.key,
      oldValue: e.oldValue,
      newValue: e.newValue,
      url: e.url,
    });
  }
});

// 自定义存储事件(同窗口)
class ReactiveStorage extends StorageManager {
  constructor(storage) {
    super(storage);
    this.listeners = new Map();
  }

  set(key, value, expiry) {
    const oldValue = this.get(key);
    const success = super.set(key, value, expiry);

    if (success) {
      this.emit("change", {
        key,
        oldValue,
        newValue: value,
      });
    }

    return success;
  }

  remove(key) {
    const oldValue = this.get(key);
    const success = super.remove(key);

    if (success && oldValue !== null) {
      this.emit("change", {
        key,
        oldValue,
        newValue: null,
      });
    }

    return success;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        callback(data);
      });
    }
  }
}

// 使用响应式存储
const reactiveStore = new ReactiveStorage(localStorage);

reactiveStore.on("change", (data) => {
  console.log("存储变化:", data);
});

reactiveStore.set("count", 1); // 触发change事件
```

## 🗄️ IndexedDB 详解

### 基础概念

- **数据库**: 包含对象存储的容器
- **对象存储**: 类似表的数据存储空间
- **索引**: 用于快速查询的辅助结构
- **事务**: 确保数据一致性的操作单元

### IndexedDB 封装类

```javascript
class IndexedDBManager {
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  // 初始化数据库
  async init(stores = []) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath || "id",
              autoIncrement: store.autoIncrement || false,
            });

            // 创建索引
            if (store.indexes) {
              store.indexes.forEach((index) => {
                objectStore.createIndex(index.name, index.keyPath, {
                  unique: index.unique || false,
                });
              });
            }
          }
        });
      };
    });
  }

  // 添加数据
  async add(storeName, data) {
    return this.executeTransaction(storeName, "readwrite", (store) => {
      return store.add(data);
    });
  }

  // 更新数据
  async put(storeName, data) {
    return this.executeTransaction(storeName, "readwrite", (store) => {
      return store.put(data);
    });
  }

  // 获取数据
  async get(storeName, key) {
    return this.executeTransaction(storeName, "readonly", (store) => {
      return store.get(key);
    });
  }

  // 获取所有数据
  async getAll(storeName) {
    return this.executeTransaction(storeName, "readonly", (store) => {
      return store.getAll();
    });
  }

  // 删除数据
  async delete(storeName, key) {
    return this.executeTransaction(storeName, "readwrite", (store) => {
      return store.delete(key);
    });
  }

  // 清空存储
  async clear(storeName) {
    return this.executeTransaction(storeName, "readwrite", (store) => {
      return store.clear();
    });
  }

  // 通过索引查询
  async getByIndex(storeName, indexName, value) {
    return this.executeTransaction(storeName, "readonly", (store) => {
      const index = store.index(indexName);
      return index.get(value);
    });
  }

  // 范围查询
  async getRange(storeName, range) {
    return this.executeTransaction(storeName, "readonly", (store) => {
      const request = store.openCursor(range);
      const results = [];

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 执行事务
  async executeTransaction(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 关闭数据库
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 使用示例
async function initDB() {
  const dbManager = new IndexedDBManager("MyApp", 1);

  await dbManager.init([
    {
      name: "users",
      keyPath: "id",
      autoIncrement: true,
      indexes: [
        { name: "email", keyPath: "email", unique: true },
        { name: "name", keyPath: "name", unique: false },
      ],
    },
    {
      name: "posts",
      keyPath: "id",
      autoIncrement: true,
      indexes: [
        { name: "userId", keyPath: "userId", unique: false },
        { name: "createdAt", keyPath: "createdAt", unique: false },
      ],
    },
  ]);

  // 添加用户
  await dbManager.add("users", {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  });

  // 查询用户
  const user = await dbManager.getByIndex("users", "email", "john@example.com");
  console.log("用户信息:", user);

  // 获取所有用户
  const allUsers = await dbManager.getAll("users");
  console.log("所有用户:", allUsers);

  return dbManager;
}

// 初始化数据库
initDB()
  .then((db) => {
    console.log("数据库初始化成功");
    // 使用数据库...
  })
  .catch((error) => {
    console.error("数据库初始化失败:", error);
  });
```

## 🚀 Cache API 详解

### Service Worker 中使用

```javascript
// service-worker.js
const CACHE_NAME = "my-app-v1";
const urlsToCache = [
  "/",
  "/styles/main.css",
  "/scripts/main.js",
  "/images/logo.png",
];

// 安装事件 - 缓存资源
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// 获取事件 - 提供缓存
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // 如果有缓存，返回缓存
      if (response) {
        return response;
      }

      // 否则从网络获取
      return fetch(event.request);
    })
  );
});

// 更新缓存
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Cache API 工具类

```javascript
class CacheManager {
  constructor(cacheName) {
    this.cacheName = cacheName;
  }

  // 打开缓存
  async openCache() {
    return await caches.open(this.cacheName);
  }

  // 添加到缓存
  async add(request) {
    const cache = await this.openCache();
    return await cache.add(request);
  }

  // 批量添加到缓存
  async addAll(requests) {
    const cache = await this.openCache();
    return await cache.addAll(requests);
  }

  // 从缓存获取
  async get(request) {
    const cache = await this.openCache();
    return await cache.match(request);
  }

  // 更新缓存
  async put(request, response) {
    const cache = await this.openCache();
    return await cache.put(request, response);
  }

  // 删除缓存项
  async delete(request) {
    const cache = await this.openCache();
    return await cache.delete(request);
  }

  // 获取所有缓存键
  async keys() {
    const cache = await this.openCache();
    return await cache.keys();
  }

  // 缓存策略：缓存优先
  async cacheFirst(request) {
    const cachedResponse = await this.get(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      await this.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      console.error("网络请求失败:", error);
      throw error;
    }
  }

  // 缓存策略：网络优先
  async networkFirst(request) {
    try {
      const networkResponse = await fetch(request);
      await this.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      const cachedResponse = await this.get(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }

  // 缓存策略：仅缓存
  async cacheOnly(request) {
    return await this.get(request);
  }

  // 缓存策略：仅网络
  async networkOnly(request) {
    return await fetch(request);
  }
}

// 使用示例
const cacheManager = new CacheManager("api-cache-v1");

// 缓存API响应
async function fetchWithCache(url, strategy = "cacheFirst") {
  const request = new Request(url);

  switch (strategy) {
    case "cacheFirst":
      return await cacheManager.cacheFirst(request);
    case "networkFirst":
      return await cacheManager.networkFirst(request);
    case "cacheOnly":
      return await cacheManager.cacheOnly(request);
    case "networkOnly":
      return await cacheManager.networkOnly(request);
    default:
      return await cacheManager.cacheFirst(request);
  }
}
```

## 📱 移动端存储

### App Cache (已废弃)

```html
<!-- 应用缓存清单(已废弃，使用Service Worker替代) -->
<html manifest="cache.manifest"></html>
```

### PWA 存储策略

```javascript
// PWA存储管理
class PWAStorageManager {
  constructor() {
    this.localStorage = new StorageManager(localStorage);
    this.sessionStorage = new StorageManager(sessionStorage);
    this.indexedDB = null;
    this.cacheManager = new CacheManager("pwa-cache-v1");
  }

  async init() {
    // 初始化IndexedDB
    this.indexedDB = new IndexedDBManager("PWAStorage", 1);
    await this.indexedDB.init([
      {
        name: "offline_data",
        keyPath: "id",
        autoIncrement: true,
      },
    ]);
  }

  // 存储用户设置
  saveUserSettings(settings) {
    this.localStorage.set("userSettings", settings);
  }

  // 存储离线数据
  async saveOfflineData(data) {
    await this.indexedDB.add("offline_data", {
      ...data,
      timestamp: Date.now(),
      synced: false,
    });
  }

  // 同步离线数据
  async syncOfflineData() {
    const offlineData = await this.indexedDB.getAll("offline_data");
    const unsyncedData = offlineData.filter((item) => !item.synced);

    for (const item of unsyncedData) {
      try {
        // 同步到服务器
        await fetch("/api/sync", {
          method: "POST",
          body: JSON.stringify(item),
        });

        // 标记为已同步
        item.synced = true;
        await this.indexedDB.put("offline_data", item);
      } catch (error) {
        console.error("同步失败:", error);
      }
    }
  }

  // 清理过期数据
  async cleanupExpiredData() {
    const now = Date.now();
    const expiredTime = 30 * 24 * 60 * 60 * 1000; // 30天

    const allData = await this.indexedDB.getAll("offline_data");
    const expiredData = allData.filter(
      (item) => now - item.timestamp > expiredTime && item.synced
    );

    for (const item of expiredData) {
      await this.indexedDB.delete("offline_data", item.id);
    }
  }
}
```

## 🔄 存储选择策略

### 使用场景对比

```javascript
const storageStrategies = {
  // 小量配置数据
  config: {
    storage: "LocalStorage",
    reason: "持久化、简单易用、自动同步到所有标签页",
  },

  // 用户认证信息
  auth: {
    storage: "Cookie (httpOnly)",
    reason: "自动发送到服务器、安全性高",
  },

  // 页面状态
  pageState: {
    storage: "SessionStorage",
    reason: "仅当前会话有效、不占用永久空间",
  },

  // 大量结构化数据
  appData: {
    storage: "IndexedDB",
    reason: "容量大、支持复杂查询、事务安全",
  },

  // 静态资源缓存
  assets: {
    storage: "Cache API",
    reason: "专为HTTP资源设计、支持离线访问",
  },

  // 临时计算结果
  tempResults: {
    storage: "Memory (变量)",
    reason: "最快访问速度、自动清理",
  },
};

// 存储选择器
class StorageSelector {
  static selectStorage(dataSize, persistence, complexity, networkSync) {
    // 数据大小
    if (dataSize > 5 * 1024 * 1024) {
      // 5MB
      return "IndexedDB";
    }

    // 网络同步需求
    if (networkSync) {
      return "Cookie";
    }

    // 持久化需求
    if (!persistence) {
      if (dataSize < 1024) {
        // 1KB
        return "Memory";
      }
      return "SessionStorage";
    }

    // 复杂查询需求
    if (complexity) {
      return "IndexedDB";
    }

    // 默认LocalStorage
    return "LocalStorage";
  }
}

// 使用示例
console.log(StorageSelector.selectStorage(100, true, false, false)); // LocalStorage
console.log(StorageSelector.selectStorage(10000000, true, true, false)); // IndexedDB
console.log(StorageSelector.selectStorage(50, true, false, true)); // Cookie
```

## ⚡ 性能优化

### 存储性能对比

```javascript
// 性能测试
class StoragePerformanceTest {
  static async testStorage(storage, operations = 1000) {
    const data = { id: 1, name: "Test", data: "x".repeat(100) };

    // 写入测试
    const writeStart = performance.now();
    for (let i = 0; i < operations; i++) {
      await storage.set(`key_${i}`, { ...data, id: i });
    }
    const writeTime = performance.now() - writeStart;

    // 读取测试
    const readStart = performance.now();
    for (let i = 0; i < operations; i++) {
      await storage.get(`key_${i}`);
    }
    const readTime = performance.now() - readStart;

    // 删除测试
    const deleteStart = performance.now();
    for (let i = 0; i < operations; i++) {
      await storage.remove(`key_${i}`);
    }
    const deleteTime = performance.now() - deleteStart;

    return {
      writeTime: writeTime.toFixed(2),
      readTime: readTime.toFixed(2),
      deleteTime: deleteTime.toFixed(2),
      totalTime: (writeTime + readTime + deleteTime).toFixed(2),
    };
  }

  static async runAllTests() {
    const localStorage = new StorageManager(window.localStorage);
    const sessionStorage = new StorageManager(window.sessionStorage);

    console.log("LocalStorage:", await this.testStorage(localStorage));
    console.log("SessionStorage:", await this.testStorage(sessionStorage));
  }
}

// 批量操作优化
class BatchStorageManager extends StorageManager {
  constructor(storage) {
    super(storage);
    this.batchQueue = [];
    this.batchTimer = null;
    this.batchDelay = 100; // 100ms
  }

  batchSet(key, value) {
    this.batchQueue.push({ operation: "set", key, value });
    this.scheduleBatch();
  }

  batchRemove(key) {
    this.batchQueue.push({ operation: "remove", key });
    this.scheduleBatch();
  }

  scheduleBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.batchDelay);
  }

  processBatch() {
    const operations = [...this.batchQueue];
    this.batchQueue = [];

    // 批量处理
    operations.forEach((op) => {
      if (op.operation === "set") {
        super.set(op.key, op.value);
      } else if (op.operation === "remove") {
        super.remove(op.key);
      }
    });

    console.log(`批量处理 ${operations.length} 个操作`);
  }
}
```

## 📋 面试要点

### 常见问题

1. **Cookie 和 Storage 的区别**

   - 容量限制、生命周期、作用域
   - 网络传输、安全性、API 便利性

2. **如何选择合适的存储方案**

   - 根据数据大小、持久化需求、查询复杂度选择
   - 考虑浏览器兼容性和性能要求

3. **IndexedDB 的优势和使用场景**
   - 大容量、支持事务、异步 API
   - 适合离线应用、复杂数据结构

### 最佳实践

```javascript
// 存储最佳实践清单
const storagebestPractices = {
  security: [
    "敏感数据不要存储在客户端",
    "Cookie设置httpOnly和secure",
    "验证存储数据的完整性",
  ],

  performance: [
    "避免存储大量数据到LocalStorage",
    "使用批量操作减少IO",
    "定期清理过期数据",
  ],

  compatibility: ["检查浏览器支持情况", "提供降级方案", "处理存储配额超限"],

  maintenance: ["版本化存储结构", "提供数据迁移方案", "监控存储使用情况"],
};
```

---

_了解各种浏览器存储机制的特性和适用场景，能够帮助开发者构建更高效、更安全的 Web 应用。_
