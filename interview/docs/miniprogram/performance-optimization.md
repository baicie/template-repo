# 小程序性能优化

性能优化是小程序开发中的重要环节，直接影响用户体验和留存率。本文详细介绍小程序性能优化的各个方面和最佳实践。

## 启动性能优化 🚀

### 代码包大小优化

```javascript
// 1. 代码分包配置
// app.json
{
  "pages": [
    "pages/index/index",
    "pages/profile/profile"
  ],
  "subPackages": [
    {
      "root": "packageA",
      "name": "packageA",
      "pages": [
        "pages/detail/detail",
        "pages/list/list"
      ],
      "independent": false
    },
    {
      "root": "packageB",
      "name": "packageB",
      "pages": [
        "pages/shop/shop",
        "pages/order/order"
      ],
      "independent": true // 独立分包
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  }
}

// 2. 按需加载组件
// pages/index/index.json
{
  "usingComponents": {
    // 只在需要时引入组件
    "heavy-component": "/components/heavy-component/heavy-component"
  },
  "componentPlaceholder": {
    // 组件占位
    "heavy-component": "loading-placeholder"
  }
}

// 3. 动态加载模块
// utils/lazy-load.js
export const lazyLoad = {
  // 懒加载工具函数
  async loadModule(modulePath) {
    try {
      const module = await import(modulePath)
      return module.default || module
    } catch (error) {
      console.error('模块加载失败:', error)
      throw error
    }
  },

  // 懒加载组件
  async loadComponent(componentPath) {
    const component = await this.loadModule(componentPath)
    return component
  }
}

// 使用懒加载
Page({
  async onLoad() {
    // 延迟加载非关键功能
    setTimeout(async () => {
      try {
        const analytics = await lazyLoad.loadModule('../utils/analytics')
        analytics.init()
      } catch (error) {
        console.warn('分析模块加载失败:', error)
      }
    }, 1000)
  }
})
```

### 首屏渲染优化

```javascript
// 1. 关键资源优先加载
Page({
  data: {
    // 首屏必要数据
    banners: [],
    categories: [],

    // 非首屏数据延迟加载
    recommendations: [],
    userInfo: null
  },

  async onLoad() {
    // 并行加载首屏关键数据
    try {
      const [banners, categories] = await Promise.all([
        this.loadBanners(),
        this.loadCategories()
      ])

      this.setData({
        banners,
        categories
      })

      // 首屏渲染完成后加载其他数据
      this.loadSecondaryData()

    } catch (error) {
      console.error('首屏数据加载失败:', error)
    }
  },

  async loadSecondaryData() {
    try {
      // 延迟加载非关键数据
      const [recommendations, userInfo] = await Promise.all([
        this.loadRecommendations(),
        this.loadUserInfo()
      ])

      this.setData({
        recommendations,
        userInfo
      })

    } catch (error) {
      console.warn('次要数据加载失败:', error)
    }
  }
})

// 2. 骨架屏优化
// components/skeleton/skeleton.wxml
<view class="skeleton" wx:if="{{loading}}">
  <view class="skeleton-header">
    <view class="skeleton-avatar"></view>
    <view class="skeleton-info">
      <view class="skeleton-line skeleton-line-title"></view>
      <view class="skeleton-line skeleton-line-subtitle"></view>
    </view>
  </view>

  <view class="skeleton-content">
    <view class="skeleton-line" wx:for="{{3}}" wx:key="index"></view>
  </view>
</view>

<view class="real-content" wx:else>
  <!-- 实际内容 -->
</view>
```

```css
/* components/skeleton/skeleton.wxss */
.skeleton {
  padding: 20rpx;
}

.skeleton-header {
  display: flex;
  margin-bottom: 20rpx;
}

.skeleton-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  margin-left: 20rpx;
}

.skeleton-line {
  height: 28rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4rpx;
  margin-bottom: 16rpx;
}

.skeleton-line-title {
  width: 60%;
}

.skeleton-line-subtitle {
  width: 40%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### 预加载优化

```javascript
// 1. 数据预加载
// app.js
App({
  globalData: {
    preloadedData: {},
    preloadPromises: {},
  },

  onLaunch() {
    // 预加载关键数据
    this.preloadCriticalData();
  },

  async preloadCriticalData() {
    const preloadTasks = [
      { key: "userInfo", task: this.preloadUserInfo() },
      { key: "config", task: this.preloadConfig() },
      { key: "categories", task: this.preloadCategories() },
    ];

    preloadTasks.forEach(({ key, task }) => {
      this.globalData.preloadPromises[key] = task;
      task
        .then((data) => {
          this.globalData.preloadedData[key] = data;
        })
        .catch((error) => {
          console.warn(`预加载 ${key} 失败:`, error);
        });
    });
  },

  async getPreloadedData(key) {
    // 优先返回已缓存的数据
    if (this.globalData.preloadedData[key]) {
      return this.globalData.preloadedData[key];
    }

    // 等待预加载完成
    if (this.globalData.preloadPromises[key]) {
      try {
        const data = await this.globalData.preloadPromises[key];
        return data;
      } catch (error) {
        console.error(`获取预加载数据 ${key} 失败:`, error);
        return null;
      }
    }

    return null;
  },
});

// 2. 页面预加载
// pages/index/index.js
Page({
  async onLoad() {
    const app = getApp();

    // 使用预加载的数据
    const userInfo = await app.getPreloadedData("userInfo");
    if (userInfo) {
      this.setData({ userInfo });
    }

    // 预加载下一个可能访问的页面
    this.preloadNextPage();
  },

  preloadNextPage() {
    // 预加载商品详情页
    wx.preloadPage({
      url: "/pages/product/detail",
    });
  },

  navigateToDetail(e) {
    const { productId } = e.currentTarget.dataset;

    // 预加载商品数据
    this.preloadProductData(productId);

    wx.navigateTo({
      url: `/pages/product/detail?id=${productId}`,
    });
  },

  async preloadProductData(productId) {
    try {
      const productData = await api.getProduct(productId);

      // 缓存到全局数据
      getApp().globalData.preloadedData[`product_${productId}`] = productData;
    } catch (error) {
      console.warn("预加载商品数据失败:", error);
    }
  },
});
```

## 渲染性能优化 🎨

### 列表渲染优化

```javascript
// 1. 虚拟列表实现
// components/virtual-list/virtual-list.js
Component({
  properties: {
    items: {
      type: Array,
      value: [],
    },
    itemHeight: {
      type: Number,
      value: 100,
    },
    containerHeight: {
      type: Number,
      value: 600,
    },
    bufferSize: {
      type: Number,
      value: 5,
    },
  },

  data: {
    visibleItems: [],
    scrollTop: 0,
    totalHeight: 0,
    startIndex: 0,
    endIndex: 0,
  },

  observers: {
    "items, itemHeight": function (items, itemHeight) {
      this.calculateVisibleItems();
      this.setData({
        totalHeight: items.length * itemHeight,
      });
    },
  },

  methods: {
    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      this.setData({ scrollTop });
      this.calculateVisibleItems();
    },

    calculateVisibleItems() {
      const { items, itemHeight, containerHeight, scrollTop, bufferSize } =
        this.data;

      if (!items.length) return;

      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / itemHeight) - bufferSize
      );
      const endIndex = Math.min(
        items.length - 1,
        startIndex + visibleCount + bufferSize * 2
      );

      const visibleItems = [];
      for (let i = startIndex; i <= endIndex; i++) {
        visibleItems.push({
          ...items[i],
          index: i,
          top: i * itemHeight,
        });
      }

      this.setData({
        visibleItems,
        startIndex,
        endIndex,
      });
    },
  },
});

// 2. 分页加载优化
Page({
  data: {
    list: [],
    pageNum: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
  },

  async loadMore() {
    if (this.data.loading || !this.data.hasMore) return;

    try {
      this.setData({ loading: true });

      const newItems = await this.fetchList({
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
      });

      // 使用 concat 而不是扩展运算符，性能更好
      const updatedList = this.data.list.concat(newItems);

      this.setData({
        list: updatedList,
        pageNum: this.data.pageNum + 1,
        hasMore: newItems.length === this.data.pageSize,
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false });
      console.error("加载更多失败:", error);
    }
  },

  onReachBottom() {
    this.loadMore();
  },
});
```

### setData 优化

```javascript
// 1. 批量更新
Page({
  data: {
    user: {},
    posts: [],
    loading: false,
  },

  // ❌ 多次 setData 调用
  badUpdate() {
    this.setData({ loading: true });
    this.setData({ user: newUser });
    this.setData({ posts: newPosts });
    this.setData({ loading: false });
  },

  // ✅ 批量更新
  goodUpdate() {
    this.setData({
      loading: false,
      user: newUser,
      posts: newPosts,
    });
  },

  // 2. 精确更新路径
  updateUserName(newName) {
    // ❌ 更新整个对象
    // this.setData({
    //   user: { ...this.data.user, name: newName }
    // })

    // ✅ 精确更新路径
    this.setData({
      "user.name": newName,
    });
  },

  // 3. 条件更新
  conditionalUpdate(newData) {
    const updates = {};

    // 只更新真正变化的数据
    if (newData.name !== this.data.user.name) {
      updates["user.name"] = newData.name;
    }

    if (newData.avatar !== this.data.user.avatar) {
      updates["user.avatar"] = newData.avatar;
    }

    if (Object.keys(updates).length > 0) {
      this.setData(updates);
    }
  },
});

// 4. setData 优化工具
class SetDataOptimizer {
  constructor(context) {
    this.context = context;
    this.pendingUpdates = {};
    this.timer = null;
  }

  // 防抖更新
  debounceUpdate(key, value, delay = 100) {
    this.pendingUpdates[key] = value;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, delay);
  }

  // 立即更新
  immediateUpdate(key, value) {
    this.pendingUpdates[key] = value;
    this.flush();
  }

  // 批量提交更新
  flush() {
    if (Object.keys(this.pendingUpdates).length > 0) {
      this.context.setData(this.pendingUpdates);
      this.pendingUpdates = {};
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// 使用优化器
Page({
  onLoad() {
    this.optimizer = new SetDataOptimizer(this);
  },

  handleInput(e) {
    const { value } = e.detail;
    // 防抖更新搜索关键词
    this.optimizer.debounceUpdate("searchKeyword", value, 300);
  },

  handleSubmit() {
    // 立即更新提交状态
    this.optimizer.immediateUpdate("submitting", true);
  },
});
```

### 组件渲染优化

```javascript
// 1. 条件渲染优化
Component({
  properties: {
    items: Array,
    showDetails: Boolean,
  },

  data: {
    processedItems: [],
  },

  observers: {
    items: function (items) {
      // 只处理可见的数据
      if (items && items.length > 0) {
        this.processItems(items);
      }
    },
  },

  methods: {
    processItems(items) {
      // 延迟处理大量数据
      if (items.length > 100) {
        this.processItemsInChunks(items);
      } else {
        this.setData({
          processedItems: this.transformItems(items),
        });
      }
    },

    processItemsInChunks(items) {
      const chunkSize = 20;
      let index = 0;
      const processedItems = [];

      const processChunk = () => {
        const chunk = items.slice(index, index + chunkSize);
        const transformedChunk = this.transformItems(chunk);

        processedItems.push(...transformedChunk);
        index += chunkSize;

        if (index < items.length) {
          // 使用 requestAnimationFrame 避免阻塞渲染
          wx.nextTick(processChunk);
        } else {
          this.setData({ processedItems });
        }
      };

      processChunk();
    },

    transformItems(items) {
      return items.map((item) => ({
        ...item,
        displayName: item.name || "未知",
        formattedDate: this.formatDate(item.createdAt),
      }));
    },
  },
});

// 2. 组件缓存
const ComponentCache = new Map();

Component({
  properties: {
    cacheKey: String,
    data: Object,
  },

  lifetimes: {
    attached() {
      // 尝试从缓存获取数据
      if (this.data.cacheKey) {
        const cached = ComponentCache.get(this.data.cacheKey);
        if (cached) {
          this.setData(cached);
          return;
        }
      }

      this.processData();
    },

    detached() {
      // 缓存组件数据
      if (this.data.cacheKey) {
        ComponentCache.set(this.data.cacheKey, {
          processedData: this.data.processedData,
          computedValue: this.data.computedValue,
        });
      }
    },
  },

  methods: {
    processData() {
      // 处理数据的耗时操作
      const processedData = this.heavyComputation(this.data.data);
      this.setData({ processedData });
    },
  },
});
```

## 内存管理优化 💾

### 内存泄漏预防

```javascript
// 1. 定时器管理
Page({
  data: {
    timers: [],
  },

  onLoad() {
    // 记录定时器ID
    const timer1 = setInterval(() => {
      this.updateTime();
    }, 1000);

    const timer2 = setTimeout(() => {
      this.loadData();
    }, 5000);

    this.setData({
      timers: [timer1, timer2],
    });
  },

  onUnload() {
    // 清理所有定时器
    this.data.timers.forEach((timer) => {
      clearInterval(timer);
      clearTimeout(timer);
    });
  },

  // 定时器管理器
  createTimer(callback, interval, type = "interval") {
    const timerId =
      type === "interval"
        ? setInterval(callback, interval)
        : setTimeout(callback, interval);

    this.setData({
      timers: [...this.data.timers, timerId],
    });

    return timerId;
  },

  clearTimer(timerId) {
    clearInterval(timerId);
    clearTimeout(timerId);

    this.setData({
      timers: this.data.timers.filter((id) => id !== timerId),
    });
  },
});

// 2. 事件监听器管理
Page({
  onLoad() {
    // 绑定事件监听器
    this.onNetworkStatusChange = this.handleNetworkStatusChange.bind(this);
    wx.onNetworkStatusChange(this.onNetworkStatusChange);

    this.onMemoryWarning = this.handleMemoryWarning.bind(this);
    wx.onMemoryWarning(this.onMemoryWarning);
  },

  onUnload() {
    // 移除事件监听器
    if (this.onNetworkStatusChange) {
      wx.offNetworkStatusChange(this.onNetworkStatusChange);
    }

    if (this.onMemoryWarning) {
      wx.offMemoryWarning(this.onMemoryWarning);
    }
  },

  handleNetworkStatusChange(res) {
    console.log("网络状态变化:", res);
  },

  handleMemoryWarning(res) {
    console.warn("内存警告:", res);
    this.clearCache();
  },
});

// 3. 图片资源管理
Component({
  data: {
    imageCache: new Map(),
    maxCacheSize: 50,
  },

  methods: {
    loadImage(src) {
      // 检查缓存
      if (this.data.imageCache.has(src)) {
        return Promise.resolve(this.data.imageCache.get(src));
      }

      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src,
          success: (res) => {
            // 添加到缓存
            this.addToCache(src, res);
            resolve(res);
          },
          fail: reject,
        });
      });
    },

    addToCache(key, value) {
      const cache = this.data.imageCache;

      // 清理缓存
      if (cache.size >= this.data.maxCacheSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      cache.set(key, value);
    },

    clearImageCache() {
      this.data.imageCache.clear();
    },
  },

  lifetimes: {
    detached() {
      // 组件销毁时清理缓存
      this.clearImageCache();
    },
  },
});
```

### 数据结构优化

```javascript
// 1. 大数据处理
class DataManager {
  constructor() {
    this.data = new Map();
    this.maxSize = 1000;
    this.accessCount = new Map();
  }

  set(key, value) {
    // LRU 缓存策略
    if (this.data.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.data.set(key, value);
    this.accessCount.set(key, 0);
  }

  get(key) {
    if (this.data.has(key)) {
      // 更新访问计数
      const count = this.accessCount.get(key) || 0;
      this.accessCount.set(key, count + 1);
      return this.data.get(key);
    }
    return null;
  }

  evictLeastUsed() {
    let minCount = Infinity;
    let leastUsedKey = null;

    for (const [key, count] of this.accessCount) {
      if (count < minCount) {
        minCount = count;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.data.delete(leastUsedKey);
      this.accessCount.delete(leastUsedKey);
    }
  }

  clear() {
    this.data.clear();
    this.accessCount.clear();
  }

  getStats() {
    return {
      size: this.data.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }
}

// 2. 弱引用管理
class WeakRefManager {
  constructor() {
    this.refs = new Set();
    this.cleanupTimer = null;
  }

  add(obj) {
    const ref = new WeakRef(obj);
    this.refs.add(ref);
    this.scheduleCleanup();
    return ref;
  }

  scheduleCleanup() {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setTimeout(() => {
      this.cleanup();
      this.cleanupTimer = null;
    }, 10000); // 10秒后清理
  }

  cleanup() {
    const deadRefs = [];

    for (const ref of this.refs) {
      if (ref.deref() === undefined) {
        deadRefs.push(ref);
      }
    }

    deadRefs.forEach((ref) => this.refs.delete(ref));
  }

  clear() {
    this.refs.clear();
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
```

## 网络性能优化 🌐

### 请求优化

```javascript
// 1. 请求缓存
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async get(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);

      // 检查是否过期
      if (!this.isExpired(cached)) {
        return cached.data;
      }

      this.cache.delete(cacheKey);
    }

    // 检查是否有相同的请求正在进行
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // 发起新请求
    const promise = this.makeRequest(url, options);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const data = await promise;

      // 缓存结果
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expires: options.cacheTime || 5 * 60 * 1000, // 默认5分钟
      });

      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  getCacheKey(url, options) {
    return `${url}_${JSON.stringify(options)}`;
  }

  isExpired(cached) {
    return Date.now() - cached.timestamp > cached.expires;
  }

  async makeRequest(url, options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        ...options,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: reject,
      });
    });
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// 2. 请求合并
class RequestBatcher {
  constructor() {
    this.batches = new Map();
    this.batchDelay = 50; // 50ms内的请求合并
  }

  async batchRequest(url, params) {
    const batchKey = url;

    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, {
        requests: [],
        timer: null,
      });
    }

    const batch = this.batches.get(batchKey);

    return new Promise((resolve, reject) => {
      batch.requests.push({ params, resolve, reject });

      if (batch.timer) {
        clearTimeout(batch.timer);
      }

      batch.timer = setTimeout(() => {
        this.executeBatch(batchKey);
      }, this.batchDelay);
    });
  }

  async executeBatch(batchKey) {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.requests.length === 0) return;

    try {
      // 合并请求参数
      const allParams = batch.requests.map((req) => req.params);

      // 发起批量请求
      const results = await this.makeBatchRequest(batchKey, allParams);

      // 分发结果
      batch.requests.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      // 所有请求都失败
      batch.requests.forEach((req) => {
        req.reject(error);
      });
    } finally {
      this.batches.delete(batchKey);
    }
  }

  async makeBatchRequest(url, paramsList) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: "POST",
        data: { batch: paramsList },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.results);
          } else {
            reject(new Error(`批量请求失败: ${res.statusCode}`));
          }
        },
        fail: reject,
      });
    });
  }
}

// 3. 预加载和预取
class PreloadManager {
  constructor() {
    this.preloadCache = new Map();
    this.preloadQueue = [];
    this.isProcessing = false;
  }

  preload(url, options = {}) {
    if (this.preloadCache.has(url)) {
      return this.preloadCache.get(url);
    }

    const promise = this.addToQueue(url, options);
    this.preloadCache.set(url, promise);

    this.processQueue();

    return promise;
  }

  addToQueue(url, options) {
    return new Promise((resolve, reject) => {
      this.preloadQueue.push({
        url,
        options,
        resolve,
        reject,
      });
    });
  }

  async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, 3); // 每次处理3个

      await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const data = await this.fetchData(item.url, item.options);
            item.resolve(data);
          } catch (error) {
            item.reject(error);
          }
        })
      );

      // 避免阻塞主线程
      await new Promise((resolve) => wx.nextTick(resolve));
    }

    this.isProcessing = false;
  }

  async fetchData(url, options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        ...options,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`预加载失败: ${res.statusCode}`));
          }
        },
        fail: reject,
      });
    });
  }
}
```

### 图片优化

```javascript
// 1. 图片懒加载
Component({
  properties: {
    src: String,
    lazyLoad: {
      type: Boolean,
      value: true,
    },
    placeholder: String,
  },

  data: {
    currentSrc: "",
    isLoaded: false,
    isInView: false,
  },

  lifetimes: {
    attached() {
      if (this.data.lazyLoad) {
        this.createIntersectionObserver();
      } else {
        this.loadImage();
      }
    },

    detached() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },
  },

  observers: {
    src: function (newSrc) {
      if (newSrc && !this.data.lazyLoad) {
        this.loadImage();
      }
    },
  },

  methods: {
    createIntersectionObserver() {
      this.observer = this.createIntersectionObserver({
        rootMargin: "100px", // 提前100px开始加载
      });

      this.observer.relativeToViewport().observe(".lazy-image", (res) => {
        if (res.intersectionRatio > 0 && !this.data.isInView) {
          this.setData({ isInView: true });
          this.loadImage();
        }
      });
    },

    loadImage() {
      if (!this.data.src || this.data.isLoaded) return;

      const img = new Image();
      img.onload = () => {
        this.setData({
          currentSrc: this.data.src,
          isLoaded: true,
        });
      };

      img.onerror = () => {
        console.error("图片加载失败:", this.data.src);
        if (this.data.placeholder) {
          this.setData({
            currentSrc: this.data.placeholder,
            isLoaded: true,
          });
        }
      };

      img.src = this.data.src;
    },
  },
});

// 2. 图片压缩和格式优化
class ImageOptimizer {
  static getOptimizedUrl(originalUrl, options = {}) {
    const {
      width = 750,
      height = "auto",
      quality = 80,
      format = "webp",
    } = options;

    // 根据设备像素比调整尺寸
    const pixelRatio = wx.getSystemInfoSync().pixelRatio;
    const targetWidth = Math.ceil(width * pixelRatio);

    // 构建优化后的URL
    const params = new URLSearchParams({
      w: targetWidth,
      h: height === "auto" ? "auto" : Math.ceil(height * pixelRatio),
      q: quality,
      f: format,
    });

    return `${originalUrl}?${params.toString()}`;
  }

  static async compressImage(filePath, options = {}) {
    const { quality = 80, maxWidth = 1080, maxHeight = 1080 } = options;

    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: filePath,
        quality,
        compressedWidth: maxWidth,
        compressedHeight: maxHeight,
        success: resolve,
        fail: reject,
      });
    });
  }

  static async getImageInfo(src) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: resolve,
        fail: reject,
      });
    });
  }
}

// 3. 图片预加载
class ImagePreloader {
  constructor() {
    this.cache = new Set();
    this.loading = new Set();
  }

  async preload(urls) {
    const uncachedUrls = urls.filter((url) => !this.cache.has(url));

    if (uncachedUrls.length === 0) return;

    const promises = uncachedUrls.map((url) => this.preloadSingle(url));

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn("图片预加载失败:", error);
    }
  }

  async preloadSingle(url) {
    if (this.cache.has(url) || this.loading.has(url)) {
      return;
    }

    this.loading.add(url);

    try {
      await ImageOptimizer.getImageInfo(url);
      this.cache.add(url);
    } catch (error) {
      console.warn(`图片预加载失败: ${url}`, error);
    } finally {
      this.loading.delete(url);
    }
  }

  isPreloaded(url) {
    return this.cache.has(url);
  }

  clear() {
    this.cache.clear();
    this.loading.clear();
  }
}
```

## 监控和调试 📊

### 性能监控

```javascript
// 1. 性能指标收集
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.startTime = Date.now();
  }

  // 页面加载时间
  markPageStart(pageName) {
    this.metrics[`${pageName}_start`] = Date.now();
  }

  markPageEnd(pageName) {
    const startTime = this.metrics[`${pageName}_start`];
    if (startTime) {
      const loadTime = Date.now() - startTime;
      this.metrics[`${pageName}_load_time`] = loadTime;

      // 上报性能数据
      this.report("page_load", {
        page: pageName,
        loadTime,
        timestamp: Date.now(),
      });
    }
  }

  // 网络请求监控
  monitorRequest(url, startTime, endTime, success) {
    const duration = endTime - startTime;

    this.report("network_request", {
      url,
      duration,
      success,
      timestamp: startTime,
    });
  }

  // 内存使用监控
  monitorMemory() {
    wx.onMemoryWarning((res) => {
      this.report("memory_warning", {
        level: res.level,
        timestamp: Date.now(),
      });
    });
  }

  // FPS 监控
  startFPSMonitoring() {
    let frameCount = 0;
    let lastTime = Date.now();

    const countFrame = () => {
      frameCount++;
      const currentTime = Date.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        this.report("fps", {
          fps,
          timestamp: currentTime,
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      wx.nextTick(countFrame);
    };

    countFrame();
  }

  // 上报数据
  report(type, data) {
    // 本地存储
    const key = `perf_${type}_${Date.now()}`;
    wx.setStorageSync(key, data);

    // 批量上报
    this.batchReport();
  }

  async batchReport() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      const perfKeys = keys.filter((key) => key.startsWith("perf_"));

      if (perfKeys.length < 10) return; // 累积一定数量再上报

      const perfData = perfKeys.map((key) => ({
        key,
        data: wx.getStorageSync(key),
      }));

      await this.sendToServer(perfData);

      // 清理已上报的数据
      perfKeys.forEach((key) => wx.removeStorageSync(key));
    } catch (error) {
      console.error("性能数据上报失败:", error);
    }
  }

  async sendToServer(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: "https://api.example.com/performance",
        method: "POST",
        data: { metrics: data },
        success: resolve,
        fail: reject,
      });
    });
  }
}

// 2. 页面性能监控集成
const performanceMonitor = new PerformanceMonitor();

// 在 app.js 中初始化
App({
  onLaunch() {
    performanceMonitor.monitorMemory();
    performanceMonitor.startFPSMonitoring();
  },
});

// 在页面中使用
Page({
  onLoad() {
    performanceMonitor.markPageStart("index");
  },

  onReady() {
    performanceMonitor.markPageEnd("index");
  },

  async loadData() {
    const startTime = Date.now();

    try {
      const data = await api.getData();
      const endTime = Date.now();

      performanceMonitor.monitorRequest("/api/data", startTime, endTime, true);
      return data;
    } catch (error) {
      const endTime = Date.now();
      performanceMonitor.monitorRequest("/api/data", startTime, endTime, false);
      throw error;
    }
  },
});
```

### 调试工具

```javascript
// 1. 性能分析器
class Profiler {
  constructor() {
    this.profiles = new Map();
    this.isEnabled = process.env.NODE_ENV === "development";
  }

  start(name) {
    if (!this.isEnabled) return;

    this.profiles.set(name, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage(),
    });
  }

  end(name) {
    if (!this.isEnabled) return;

    const profile = this.profiles.get(name);
    if (!profile) return;

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const result = {
      name,
      duration: endTime - profile.startTime,
      memoryDelta: endMemory - profile.startMemory,
      timestamp: Date.now(),
    };

    console.log(`[Profiler] ${name}:`, result);
    this.profiles.delete(name);

    return result;
  }

  getMemoryUsage() {
    // 模拟内存使用情况
    return wx.getStorageInfoSync().currentSize || 0;
  }

  measure(name, fn) {
    if (!this.isEnabled) return fn();

    this.start(name);

    try {
      const result = fn();

      if (result && typeof result.then === "function") {
        // 异步函数
        return result.finally(() => {
          this.end(name);
        });
      } else {
        // 同步函数
        this.end(name);
        return result;
      }
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

// 2. 调试面板
class DebugPanel {
  constructor() {
    this.isVisible = false;
    this.metrics = {};
    this.logs = [];
  }

  show() {
    if (this.isVisible) return;

    this.isVisible = true;
    this.createPanel();
  }

  hide() {
    this.isVisible = false;
    this.removePanel();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  addMetric(name, value) {
    this.metrics[name] = {
      value,
      timestamp: Date.now(),
    };

    this.updatePanel();
  }

  addLog(level, message, data) {
    this.logs.unshift({
      level,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
    });

    // 限制日志数量
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    this.updatePanel();
  }

  createPanel() {
    // 创建调试面板UI
    // 这里需要根据小程序的UI框架来实现
    console.log("Debug panel created");
  }

  removePanel() {
    console.log("Debug panel removed");
  }

  updatePanel() {
    if (!this.isVisible) return;

    // 更新面板内容
    console.log("Metrics:", this.metrics);
    console.log("Recent logs:", this.logs.slice(0, 10));
  }
}

// 使用示例
const profiler = new Profiler();
const debugPanel = new DebugPanel();

Page({
  onLoad() {
    // 开发环境下显示调试面板
    if (process.env.NODE_ENV === "development") {
      // 双击显示/隐藏调试面板
      let tapCount = 0;
      this.onTitleTap = () => {
        tapCount++;
        if (tapCount === 2) {
          debugPanel.toggle();
          tapCount = 0;
        }
        setTimeout(() => {
          tapCount = 0;
        }, 300);
      };
    }
  },

  async loadData() {
    return profiler.measure("loadData", async () => {
      const data = await api.getData();
      debugPanel.addMetric("dataSize", data.length);
      return data;
    });
  },
});
```

---

🎯 **下一步**: 掌握了性能优化后，建议学习 [小程序云开发](./cloud-development.md) 来构建完整的后端服务！
