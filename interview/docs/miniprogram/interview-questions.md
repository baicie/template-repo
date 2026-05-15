# 小程序面试题集

本文收集了小程序开发中的常见面试题，涵盖基础概念、开发实践、性能优化等各个方面，帮助你全面掌握小程序技术栈。

## 基础概念 📚

### 1. 什么是小程序？小程序的优缺点是什么？

**答案：**

小程序是一种不需要下载安装即可使用的应用，它实现了应用"触手可及"的梦想，用户扫一扫或搜一下即可打开应用。

**优点：**

- 无需安装，即用即走
- 开发成本低，一套代码多端运行
- 审核周期短，发版快
- 用户获取成本低
- 可以调用原生能力
- 安全性高，运行在沙盒环境中

**缺点：**

- 功能受限，无法调用所有系统 API
- 代码包大小限制（主包 2MB，总包 20MB）
- 依赖于宿主应用
- 用户留存相对较低
- 调试相对复杂

### 2. 小程序的架构原理是什么？

**答案：**

小程序采用双线程架构：

```javascript
// 渲染层（Webview线程）
// 负责界面渲染，运行在多个Webview中
// 每个页面对应一个Webview线程

// 逻辑层（JSCore线程）
// 负责JS逻辑处理，运行在独立的JSCore线程中
// 所有页面共享同一个JSCore线程

// 通信机制
渲染层 ←→ Native ←→ 逻辑层

// 示例：setData 调用流程
Page({
  data: { message: 'Hello' },

  updateMessage() {
    // 1. 逻辑层执行 setData
    this.setData({
      message: 'World'
    })
    // 2. 数据通过 Native 传递给渲染层
    // 3. 渲染层更新视图
  }
})
```

**架构优势：**

- 安全性：逻辑层无法直接操作 DOM
- 性能：多 Webview 并行渲染
- 稳定性：逻辑层和渲染层分离

### 3. 小程序的生命周期有哪些？

**答案：**

```javascript
// 应用生命周期
App({
  onLaunch(options) {
    // 小程序初始化完成时触发，全局只触发一次
    console.log("应用启动", options);
  },

  onShow(options) {
    // 小程序启动，或从后台进入前台显示时触发
    console.log("应用显示", options);
  },

  onHide() {
    // 小程序从前台进入后台时触发
    console.log("应用隐藏");
  },

  onError(error) {
    // 小程序发生脚本错误或API调用报错时触发
    console.error("应用错误", error);
  },
});

// 页面生命周期
Page({
  onLoad(options) {
    // 页面加载时触发，一个页面只会调用一次
    console.log("页面加载", options);
  },

  onShow() {
    // 页面显示/切入前台时触发
    console.log("页面显示");
  },

  onReady() {
    // 页面初次渲染完成时触发，一个页面只会调用一次
    console.log("页面渲染完成");
  },

  onHide() {
    // 页面隐藏/切入后台时触发
    console.log("页面隐藏");
  },

  onUnload() {
    // 页面卸载时触发
    console.log("页面卸载");
  },
});

// 组件生命周期
Component({
  lifetimes: {
    created() {
      // 组件实例刚刚被创建好时触发
      console.log("组件创建");
    },

    attached() {
      // 组件实例进入页面节点树时触发
      console.log("组件挂载");
    },

    ready() {
      // 组件在视图层布局完成后执行
      console.log("组件就绪");
    },

    detached() {
      // 组件实例被从页面节点树移除时触发
      console.log("组件卸载");
    },
  },
});
```

### 4. 小程序的路由机制是什么？

**答案：**

```javascript
// 路由API
wx.navigateTo({
  url: "/pages/detail/detail?id=123",
  success: (res) => {},
  fail: (err) => {},
  complete: () => {},
});

wx.redirectTo({
  url: "/pages/login/login",
});

wx.navigateBack({
  delta: 1, // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
});

wx.switchTab({
  url: "/pages/index/index",
});

wx.reLaunch({
  url: "/pages/home/home",
});

// 路由限制
// 页面栈最多10层
// tabBar页面只能通过switchTab跳转
// 不能跳转到当前页面
```

**路由传参：**

```javascript
// 传递参数
wx.navigateTo({
  url: "/pages/detail/detail?id=123&type=product",
});

// 接收参数
Page({
  onLoad(options) {
    console.log(options.id); // '123'
    console.log(options.type); // 'product'
  },
});
```

## 开发实践 💻

### 5. 如何进行小程序的数据绑定？

**答案：**

```javascript
// 单向数据绑定
Page({
  data: {
    message: "Hello World",
    user: {
      name: "张三",
      age: 25,
    },
    list: [1, 2, 3, 4, 5],
  },

  updateData() {
    // 简单数据更新
    this.setData({
      message: "Hello 小程序",
    });

    // 对象属性更新
    this.setData({
      "user.name": "李四",
      "user.age": 30,
    });

    // 数组更新
    this.setData({
      "list[0]": 10,
      [`list[${this.data.list.length}]`]: 6,
    });
  },
});
```

```xml
<!-- 模板中使用 -->
<view>{{message}}</view>
<view>姓名：{{user.name}}</view>
<view>年龄：{{user.age}}</view>

<view wx:for="{{list}}" wx:key="index">
  {{index}}: {{item}}
</view>

<!-- 条件渲染 -->
<view wx:if="{{user.age >= 18}}">成年人</view>
<view wx:else>未成年人</view>

<!-- 双向绑定（表单） -->
<input value="{{inputValue}}" bindinput="handleInput" />
```

### 6. 小程序中的事件处理机制是什么？

**答案：**

```javascript
// 事件绑定
Page({
  data: {
    count: 0,
  },

  // 冒泡事件
  handleTap(e) {
    console.log("tap事件", e);
    console.log("dataset:", e.currentTarget.dataset);
  },

  // 非冒泡事件
  handleCatchTap(e) {
    console.log("catchtap事件，阻止冒泡");
  },

  // 互斥事件
  handleMutTap(e) {
    console.log("mut-bind:tap事件");
  },

  // 传递参数
  handleButtonTap(e) {
    const { id, type } = e.currentTarget.dataset;
    console.log("参数:", id, type);
  },
});
```

```xml
<!-- 事件绑定 -->
<view bindtap="handleTap">点击我（冒泡）</view>
<view catchtap="handleCatchTap">点击我（不冒泡）</view>
<view mut-bind:tap="handleMutTap">互斥事件</view>

<!-- 传递参数 -->
<button
  bindtap="handleButtonTap"
  data-id="123"
  data-type="primary"
>
  带参数的按钮
</button>

<!-- 事件冒泡示例 -->
<view bindtap="parentTap">
  父元素
  <view bindtap="childTap">子元素</view>
</view>
```

**事件对象属性：**

- `type`: 事件类型
- `timeStamp`: 事件生成时的时间戳
- `target`: 触发事件的源组件
- `currentTarget`: 事件绑定的当前组件
- `detail`: 额外的信息
- `touches`: 触摸事件的触摸点信息

### 7. 如何实现小程序的组件通信？

**答案：**

```javascript
// 1. 父传子 - properties
// 子组件
Component({
  properties: {
    title: {
      type: String,
      value: '默认标题'
    },
    user: {
      type: Object,
      value: {}
    }
  }
})

// 父组件使用
// <child-component title="自定义标题" user="{{userInfo}}" />

// 2. 子传父 - 事件
// 子组件
Component({
  methods: {
    handleSubmit() {
      this.triggerEvent('submit', {
        data: 'from child'
      }, {
        bubbles: true,
        composed: true
      })
    }
  }
})

// 父组件
Page({
  handleChildSubmit(e) {
    console.log('收到子组件数据:', e.detail.data)
  }
})

// <child-component bind:submit="handleChildSubmit" />

// 3. 兄弟组件通信 - 事件总线
// utils/event-bus.js
class EventBus {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
}

export default new EventBus()

// 4. 全局状态管理
// store/index.js
class Store {
  constructor() {
    this.state = {}
    this.listeners = []
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.listeners.forEach(listener => listener(this.state))
  }

  getState() {
    return this.state
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

export default new Store()
```

### 8. 小程序的分包加载是如何实现的？

**答案：**

```json
// app.json 分包配置
{
  "pages": ["pages/index/index", "pages/profile/profile"],
  "subPackages": [
    {
      "root": "packageA",
      "name": "packageA",
      "pages": ["pages/cat/cat", "pages/dog/dog"],
      "independent": false
    },
    {
      "root": "packageB",
      "name": "packageB",
      "pages": ["pages/apple/apple", "pages/banana/banana"],
      "independent": true
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  }
}
```

```javascript
// 分包预加载
Page({
  onLoad() {
    // 预加载分包
    wx.preloadSubpackage({
      name: "packageA",
      success: (res) => {
        console.log("分包预加载成功", res);
      },
      fail: (err) => {
        console.error("分包预加载失败", err);
      },
    });
  },
});

// 跳转到分包页面
wx.navigateTo({
  url: "/packageA/pages/cat/cat",
});
```

**分包优势：**

- 减少主包大小，提升启动速度
- 按需加载，节省流量
- 突破 2MB 主包限制
- 独立分包可以独立运行

## 性能优化 ⚡

### 9. 小程序性能优化有哪些方法？

**答案：**

```javascript
// 1. setData 优化
Page({
  data: {
    list: [],
  },

  // ❌ 频繁调用 setData
  badUpdate() {
    for (let i = 0; i < 100; i++) {
      this.setData({
        [`list[${i}]`]: i,
      });
    }
  },

  // ✅ 批量更新
  goodUpdate() {
    const updates = {};
    for (let i = 0; i < 100; i++) {
      updates[`list[${i}]`] = i;
    }
    this.setData(updates);
  },

  // ✅ 只更新变化的数据
  smartUpdate(newList) {
    const updates = {};
    newList.forEach((item, index) => {
      if (this.data.list[index] !== item) {
        updates[`list[${index}]`] = item;
      }
    });

    if (Object.keys(updates).length > 0) {
      this.setData(updates);
    }
  },
});

// 2. 图片优化
// 使用 lazy-load
// <image src="{{src}}" lazy-load="{{true}}" />

// 图片压缩
const compressImage = (src) => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src,
      quality: 80,
      success: resolve,
      fail: reject,
    });
  });
};

// 3. 长列表优化 - 虚拟列表
Component({
  properties: {
    items: Array,
    itemHeight: Number,
  },

  data: {
    visibleItems: [],
    scrollTop: 0,
  },

  methods: {
    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      this.updateVisibleItems(scrollTop);
    },

    updateVisibleItems(scrollTop) {
      const { items, itemHeight } = this.data;
      const containerHeight = 600; // 容器高度

      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = startIndex + Math.ceil(containerHeight / itemHeight);

      const visibleItems = items.slice(startIndex, endIndex + 1);

      this.setData({
        visibleItems,
        scrollTop,
      });
    },
  },
});
```

### 10. 小程序的内存管理要注意什么？

**答案：**

```javascript
// 1. 及时清理定时器
Page({
  data: {
    timer: null,
  },

  onLoad() {
    this.data.timer = setInterval(() => {
      console.log("定时任务");
    }, 1000);
  },

  onUnload() {
    // 清理定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },
});

// 2. 移除事件监听器
Page({
  onLoad() {
    this.handleNetworkChange = (res) => {
      console.log("网络状态变化:", res);
    };
    wx.onNetworkStatusChange(this.handleNetworkChange);
  },

  onUnload() {
    wx.offNetworkStatusChange(this.handleNetworkChange);
  },
});

// 3. 组件内存管理
Component({
  data: {
    observers: [],
  },

  lifetimes: {
    attached() {
      // 创建观察器
      const observer = wx.createIntersectionObserver(this);
      observer.observe(".target", (res) => {
        console.log("元素进入视口");
      });

      this.data.observers.push(observer);
    },

    detached() {
      // 清理观察器
      this.data.observers.forEach((observer) => {
        observer.disconnect();
      });
    },
  },
});

// 4. 大数据处理
const processLargeData = (data) => {
  // 分批处理
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  return batches.reduce((promise, batch) => {
    return promise.then((result) => {
      return new Promise((resolve) => {
        // 使用 setTimeout 避免阻塞主线程
        setTimeout(() => {
          const processed = processBatch(batch);
          resolve([...result, ...processed]);
        }, 0);
      });
    });
  }, Promise.resolve([]));
};
```

## 云开发相关 ☁️

### 11. 小程序云开发的优势是什么？

**答案：**

**云开发优势：**

- 无需搭建服务器，降低开发成本
- 天然鉴权，安全性高
- 弹性扩缩容，按需付费
- 开发效率高，专注业务逻辑
- 与小程序深度集成

```javascript
// 云开发初始化
wx.cloud.init({
  env: "your-env-id",
  traceUser: true,
});

// 云函数调用
wx.cloud.callFunction({
  name: "login",
  data: { userInfo },
  success: (res) => {
    console.log("登录成功", res);
  },
});

// 云数据库操作
const db = wx.cloud.database();

// 添加数据
db.collection("posts").add({
  data: {
    title: "标题",
    content: "内容",
    createTime: db.serverDate(),
  },
});

// 查询数据
db.collection("posts")
  .where({
    status: "published",
  })
  .orderBy("createTime", "desc")
  .limit(10)
  .get()
  .then((res) => {
    console.log("查询结果", res.data);
  });

// 云存储上传
wx.cloud.uploadFile({
  cloudPath: "images/photo.jpg",
  filePath: tempFilePath,
  success: (res) => {
    console.log("上传成功", res.fileID);
  },
});
```

### 12. 如何处理云函数的错误？

**答案：**

```javascript
// 云函数错误处理
const cloud = require("wx-server-sdk");
cloud.init();

exports.main = async (event, context) => {
  try {
    // 业务逻辑
    const result = await businessLogic(event);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("云函数执行失败:", error);

    // 错误分类处理
    if (error.code === "DATABASE_REQUEST_FAILED") {
      return {
        success: false,
        error: "数据库操作失败",
        code: "DB_ERROR",
      };
    } else if (error.code === "PERMISSION_DENIED") {
      return {
        success: false,
        error: "权限不足",
        code: "AUTH_ERROR",
      };
    } else {
      return {
        success: false,
        error: "服务器内部错误",
        code: "INTERNAL_ERROR",
      };
    }
  }
};

// 小程序端错误处理
const callCloudFunction = async (name, data) => {
  try {
    const result = await wx.cloud.callFunction({
      name,
      data,
    });

    if (result.result.success) {
      return result.result.data;
    } else {
      throw new Error(result.result.error);
    }
  } catch (error) {
    console.error(`云函数 ${name} 调用失败:`, error);

    // 用户友好的错误提示
    const errorMessages = {
      DB_ERROR: "数据加载失败，请稍后重试",
      AUTH_ERROR: "权限不足，请重新登录",
      INTERNAL_ERROR: "系统繁忙，请稍后重试",
    };

    const message = errorMessages[error.code] || error.message || "操作失败";

    wx.showToast({
      title: message,
      icon: "error",
    });

    throw error;
  }
};
```

## 调试与测试 🔧

### 13. 小程序如何进行调试？

**答案：**

```javascript
// 1. 控制台调试
console.log("普通日志");
console.warn("警告信息");
console.error("错误信息");
console.table([{ name: "张三", age: 25 }]);

// 2. 断点调试
Page({
  onLoad() {
    debugger; // 设置断点
    const data = this.processData();
  },
});

// 3. 性能监控
Page({
  onLoad() {
    const startTime = Date.now();

    this.loadData().then(() => {
      const loadTime = Date.now() - startTime;
      console.log("数据加载耗时:", loadTime, "ms");
    });
  },
});

// 4. 自定义调试面板
const DEBUG = true;

const debugLog = (tag, data) => {
  if (DEBUG) {
    console.log(`[${tag}]`, data);
  }
};

// 5. vConsole 集成
if (DEBUG) {
  const vConsole = new VConsole();
}

// 6. 真机调试
// 在开发者工具中点击"真机调试"
// 手机扫码连接进行调试
```

### 14. 小程序如何进行单元测试？

**答案：**

```javascript
// 使用 miniprogram-simulate 进行组件测试
const simulate = require("miniprogram-simulate");

describe("CustomButton Component", () => {
  let component;

  beforeEach(() => {
    component = simulate.render({
      usingComponents: {
        "custom-button": "/components/custom-button/custom-button",
      },
      template: `<custom-button text="测试按钮" bind:tap="handleTap" />`,
    });
  });

  afterEach(() => {
    component.detach();
  });

  test("should render with correct text", () => {
    const button = component.querySelector("custom-button");
    expect(button.data.text).toBe("测试按钮");
  });

  test("should trigger tap event", () => {
    const button = component.querySelector("custom-button");
    const mockTap = jest.fn();

    component.addEventListener("tap", mockTap);
    button.dispatchEvent("tap");

    expect(mockTap).toHaveBeenCalled();
  });
});

// 页面测试
describe("Index Page", () => {
  let page;

  beforeEach(() => {
    page = simulate.load("/pages/index/index");
  });

  test("should load data on page load", async () => {
    const spy = jest.spyOn(page.instance, "loadData");

    page.instance.onLoad();

    expect(spy).toHaveBeenCalled();
  });
});

// 工具函数测试
const { formatDate } = require("../../utils/date");

describe("Date Utils", () => {
  test("should format date correctly", () => {
    const date = new Date("2023-01-01");
    const formatted = formatDate(date, "YYYY-MM-DD");
    expect(formatted).toBe("2023-01-01");
  });
});
```

## 安全相关 🔒

### 15. 小程序的安全机制有哪些？

**答案：**

```javascript
// 1. 网络请求域名白名单
// 在小程序管理后台配置合法域名
// 只能请求配置的域名

// 2. 用户信息保护
Page({
  async getUserProfile() {
    try {
      const res = await wx.getUserProfile({
        desc: "用于完善用户资料",
      });
      console.log("用户信息:", res.userInfo);
    } catch (error) {
      console.log("用户拒绝授权");
    }
  },
});

// 3. 数据加密传输
const crypto = require("crypto");

const encryptData = (data, key) => {
  const cipher = crypto.createCipher("aes192", key);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// 4. 内容安全检测
wx.cloud
  .callFunction({
    name: "securityCheck",
    data: {
      content: userInput,
    },
  })
  .then((res) => {
    if (res.result.errCode === 0) {
      // 内容安全，可以发布
      this.publishContent(userInput);
    } else {
      wx.showToast({
        title: "内容包含敏感信息",
        icon: "error",
      });
    }
  });

// 5. 防重放攻击
const generateNonce = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const request = (url, data) => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return wx.request({
    url,
    data: {
      ...data,
      timestamp,
      nonce,
      signature: generateSignature(data, timestamp, nonce),
    },
  });
};
```

### 16. 如何防止小程序被逆向？

**答案：**

```javascript
// 1. 代码混淆
// 使用 webpack 插件进行代码混淆
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: true,
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ],
  },
};

// 2. 关键逻辑后移
// 将核心业务逻辑放在云函数中
const cloud = require("wx-server-sdk");

exports.main = async (event, context) => {
  // 核心算法在云端执行
  const result = complexCalculation(event.data);
  return { result };
};

// 3. 动态配置
// 关键配置从服务端获取
Page({
  async onLoad() {
    const config = await this.getRemoteConfig();
    this.setData({ config });
  },

  async getRemoteConfig() {
    const res = await wx.cloud.callFunction({
      name: "getConfig",
    });
    return res.result.config;
  },
});

// 4. 时间戳验证
const validateTimestamp = (timestamp) => {
  const now = Date.now();
  const diff = Math.abs(now - timestamp);
  return diff < 5 * 60 * 1000; // 5分钟内有效
};

// 5. 环境检测
const isDebugMode = () => {
  const systemInfo = wx.getSystemInfoSync();
  return systemInfo.platform === "devtools";
};

if (isDebugMode()) {
  console.warn("检测到调试环境");
  // 可以采取一些保护措施
}
```

## 项目实战 🚀

### 17. 如何设计一个可扩展的小程序架构？

**答案：**

```javascript
// 1. 目录结构设计
/*
miniprogram/
├── app.js
├── app.json
├── app.wxss
├── pages/           # 页面
├── components/      # 组件
├── utils/          # 工具函数
├── services/       # API服务
├── store/          # 状态管理
├── constants/      # 常量
├── assets/         # 静态资源
└── libs/           # 第三方库
*/

// 2. 模块化设计
// services/api.js
class ApiService {
  constructor() {
    this.baseURL = "https://api.example.com";
    this.timeout = 10000;
  }

  async request(config) {
    const { url, method = "GET", data = {} } = config;

    try {
      const res = await wx.request({
        url: `${this.baseURL}${url}`,
        method,
        data,
        timeout: this.timeout,
        header: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      return this.handleResponse(res);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 用户相关API
  user = {
    login: (data) => this.request({ url: "/user/login", method: "POST", data }),
    getProfile: () => this.request({ url: "/user/profile" }),
    updateProfile: (data) =>
      this.request({ url: "/user/profile", method: "PUT", data }),
  };

  // 商品相关API
  product = {
    getList: (params) => this.request({ url: "/products", data: params }),
    getDetail: (id) => this.request({ url: `/products/${id}` }),
  };
}

export default new ApiService();

// 3. 状态管理
// store/index.js
class Store {
  constructor() {
    this.state = {
      user: null,
      theme: "light",
      loading: false,
    };
    this.listeners = new Map();
  }

  setState(path, value) {
    this.setNestedValue(this.state, path, value);
    this.notify(path, value);
  }

  getState(path) {
    return this.getNestedValue(this.state, path);
  }

  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);

    return () => {
      this.listeners.get(path).delete(callback);
    };
  }
}

// 4. 组件基类
// components/base/base-component.js
export const BaseComponent = {
  lifetimes: {
    attached() {
      this.subscriptions = [];
      if (this.onAttached) {
        this.onAttached();
      }
    },

    detached() {
      // 清理订阅
      this.subscriptions.forEach((unsubscribe) => unsubscribe());
      if (this.onDetached) {
        this.onDetached();
      }
    },
  },

  methods: {
    subscribeStore(path, callback) {
      const unsubscribe = store.subscribe(path, callback);
      this.subscriptions.push(unsubscribe);
      return unsubscribe;
    },

    safeSetData(data) {
      if (this.data) {
        this.setData(data);
      }
    },
  },
};

// 5. 页面基类
// pages/base/base-page.js
export const BasePage = {
  onLoad() {
    this.subscriptions = [];
    if (this.onPageLoad) {
      this.onPageLoad();
    }
  },

  onUnload() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    if (this.onPageUnload) {
      this.onPageUnload();
    }
  },

  subscribeStore(path, callback) {
    const unsubscribe = store.subscribe(path, callback);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  },

  showLoading(title = "加载中...") {
    wx.showLoading({ title, mask: true });
  },

  hideLoading() {
    wx.hideLoading();
  },

  showError(message) {
    wx.showToast({
      title: message,
      icon: "error",
    });
  },
};
```

### 18. 小程序性能监控如何实现？

**答案：**

```javascript
// 1. 性能监控类
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.isEnabled = true;
  }

  // 页面加载时间监控
  startPageLoad(pageName) {
    if (!this.isEnabled) return;
    this.metrics[`${pageName}_start`] = Date.now();
  }

  endPageLoad(pageName) {
    if (!this.isEnabled) return;
    const startTime = this.metrics[`${pageName}_start`];
    if (startTime) {
      const loadTime = Date.now() - startTime;
      this.report("page_load_time", {
        page: pageName,
        duration: loadTime,
      });
    }
  }

  // API请求监控
  monitorRequest(url, startTime, endTime, success) {
    if (!this.isEnabled) return;
    this.report("api_request", {
      url,
      duration: endTime - startTime,
      success,
      timestamp: startTime,
    });
  }

  // 内存监控
  monitorMemory() {
    wx.onMemoryWarning((res) => {
      this.report("memory_warning", {
        level: res.level,
        timestamp: Date.now(),
      });
    });
  }

  // 错误监控
  monitorError() {
    const originalError = console.error;
    console.error = (...args) => {
      this.report("js_error", {
        message: args.join(" "),
        timestamp: Date.now(),
        stack: new Error().stack,
      });
      originalError.apply(console, args);
    };
  }

  // 数据上报
  report(type, data) {
    // 本地存储
    const key = `perf_${type}_${Date.now()}`;
    wx.setStorageSync(key, data);

    // 批量上报
    this.batchReport();
  }

  async batchReport() {
    const keys = wx.getStorageInfoSync().keys;
    const perfKeys = keys.filter((key) => key.startsWith("perf_"));

    if (perfKeys.length >= 10) {
      const data = perfKeys.map((key) => ({
        key,
        data: wx.getStorageSync(key),
      }));

      try {
        await wx.request({
          url: "https://api.example.com/performance",
          method: "POST",
          data: { metrics: data },
        });

        // 清理已上报数据
        perfKeys.forEach((key) => wx.removeStorageSync(key));
      } catch (error) {
        console.error("性能数据上报失败:", error);
      }
    }
  }
}

// 2. 使用监控
const monitor = new PerformanceMonitor();

// app.js
App({
  onLaunch() {
    monitor.monitorMemory();
    monitor.monitorError();
  },
});

// 页面中使用
Page({
  onLoad() {
    monitor.startPageLoad("index");
  },

  onReady() {
    monitor.endPageLoad("index");
  },

  async loadData() {
    const startTime = Date.now();
    try {
      const data = await api.getData();
      monitor.monitorRequest("/api/data", startTime, Date.now(), true);
      return data;
    } catch (error) {
      monitor.monitorRequest("/api/data", startTime, Date.now(), false);
      throw error;
    }
  },
});
```

---

## 总结 📝

小程序面试题涵盖了从基础概念到实际应用的各个方面：

1. **基础知识**：架构原理、生命周期、路由机制
2. **开发实践**：数据绑定、事件处理、组件通信
3. **性能优化**：setData 优化、内存管理、长列表处理
4. **云开发**：云函数、云数据库、云存储
5. **安全相关**：安全机制、防逆向、内容安全
6. **项目实战**：架构设计、性能监控、调试测试

掌握这些知识点，能够帮助你在小程序面试中脱颖而出，也为实际项目开发打下坚实基础！

🎯 **持续学习**：小程序技术在不断发展，建议关注官方文档更新，学习最新特性和最佳实践。
