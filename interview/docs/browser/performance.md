# 性能优化实战

全面的前端性能优化指南，涵盖加载性能、运行时性能、渲染性能等多个维度的优化策略和最佳实践。

## 📊 性能指标概览

### 核心 Web 指标 (Core Web Vitals)

```javascript
// 性能指标监控
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = {};
  }

  // 监控Core Web Vitals
  initCoreWebVitals() {
    // LCP - Largest Contentful Paint
    this.observeLCP();

    // FID - First Input Delay
    this.observeFID();

    // CLS - Cumulative Layout Shift
    this.observeCLS();

    // TTFB - Time to First Byte
    this.observeTTFB();

    // FCP - First Contentful Paint
    this.observeFCP();
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      console.log("LCP:", lastEntry.startTime);
    });
    observer.observe({ entryTypes: ["largest-contentful-paint"] });
    this.observers.lcp = observer;
  }

  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        console.log("FID:", entry.processingStart - entry.startTime);
      });
    });
    observer.observe({ entryTypes: ["first-input"] });
    this.observers.fid = observer;
  }

  observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
      console.log("CLS:", clsValue);
    });
    observer.observe({ entryTypes: ["layout-shift"] });
    this.observers.cls = observer;
  }

  observeTTFB() {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    if (navigationEntry) {
      this.metrics.ttfb =
        navigationEntry.responseStart - navigationEntry.requestStart;
      console.log("TTFB:", this.metrics.ttfb);
    }
  }

  observeFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.fcp = entry.startTime;
        console.log("FCP:", entry.startTime);
      });
    });
    observer.observe({ entryTypes: ["paint"] });
    this.observers.fcp = observer;
  }

  // 获取所有指标
  getMetrics() {
    return { ...this.metrics };
  }

  // 发送指标到服务器
  sendMetrics() {
    const metrics = this.getMetrics();

    // 使用sendBeacon确保数据发送
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/metrics", JSON.stringify(metrics));
    } else {
      fetch("/api/metrics", {
        method: "POST",
        body: JSON.stringify(metrics),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  }

  // 清理观察器
  disconnect() {
    Object.values(this.observers).forEach((observer) => {
      observer.disconnect();
    });
  }
}

// 使用监控器
const monitor = new PerformanceMonitor();
monitor.initCoreWebVitals();

// 页面卸载时发送数据
window.addEventListener("beforeunload", () => {
  monitor.sendMetrics();
});
```

### 性能预算设置

```javascript
// 性能预算配置
const performanceBudget = {
  // 核心指标阈值
  coreWebVitals: {
    lcp: 2500, // 2.5秒
    fid: 100, // 100毫秒
    cls: 0.1, // 0.1
  },

  // 资源大小预算
  resourceBudget: {
    html: 25 * 1024, // 25KB
    css: 100 * 1024, // 100KB
    js: 200 * 1024, // 200KB
    images: 500 * 1024, // 500KB
    fonts: 100 * 1024, // 100KB
    total: 1 * 1024 * 1024, // 1MB
  },

  // 请求数量预算
  requestBudget: {
    total: 50,
    js: 10,
    css: 5,
    images: 30,
    fonts: 3,
  },
};

// 性能预算检查器
class PerformanceBudgetChecker {
  constructor(budget) {
    this.budget = budget;
  }

  checkResourceBudget() {
    const resources = performance.getEntriesByType("resource");
    const stats = this.analyzeResources(resources);

    Object.keys(this.budget.resourceBudget).forEach((type) => {
      const actual = stats.size[type] || 0;
      const budgeted = this.budget.resourceBudget[type];

      if (actual > budgeted) {
        console.warn(`${type} 超出预算: ${actual} > ${budgeted}`);
      }
    });

    return stats;
  }

  analyzeResources(resources) {
    const stats = {
      size: {},
      count: {},
      total: { size: 0, count: 0 },
    };

    resources.forEach((resource) => {
      const type = this.getResourceType(resource);
      const size = resource.transferSize || 0;

      stats.size[type] = (stats.size[type] || 0) + size;
      stats.count[type] = (stats.count[type] || 0) + 1;
      stats.total.size += size;
      stats.total.count += 1;
    });

    return stats;
  }

  getResourceType(resource) {
    const url = resource.name;
    if (url.includes(".js")) return "js";
    if (url.includes(".css")) return "css";
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "images";
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return "fonts";
    if (url.includes(".html")) return "html";
    return "other";
  }
}
```

## 🚀 加载性能优化

### 资源优化策略

```javascript
// 资源加载优化器
class ResourceOptimizer {
  constructor() {
    this.preloadQueue = [];
    this.prefetchQueue = [];
    this.criticalResources = new Set();
  }

  // 预加载关键资源
  preloadCriticalResources() {
    const criticalResources = [
      { href: "/critical.css", as: "style" },
      { href: "/hero-image.webp", as: "image" },
      { href: "/critical.js", as: "script" },
    ];

    criticalResources.forEach((resource) => {
      this.preload(resource.href, resource.as);
    });
  }

  preload(href, as, crossorigin = false) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = "anonymous";

    document.head.appendChild(link);
    this.criticalResources.add(href);
  }

  // 预获取后续资源
  prefetchNextPageResources() {
    const nextPageResources = ["/page2.js", "/page2.css", "/api/page2-data"];

    // 在空闲时预获取
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        nextPageResources.forEach((resource) => {
          this.prefetch(resource);
        });
      });
    }
  }

  prefetch(href) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }

  // 延迟加载非关键资源
  deferNonCriticalResources() {
    // 延迟加载非关键CSS
    this.loadNonCriticalCSS(["/non-critical.css", "/print.css"]);

    // 延迟加载非关键JS
    this.loadNonCriticalJS(["/analytics.js", "/social-widgets.js"]);
  }

  loadNonCriticalCSS(cssFiles) {
    cssFiles.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.media = "print";
      link.onload = function () {
        this.media = "all";
      };
      document.head.appendChild(link);
    });
  }

  loadNonCriticalJS(jsFiles) {
    jsFiles.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }

  // 智能资源提示
  addResourceHints() {
    // DNS预解析
    this.addDNSPrefetch(["https://api.example.com", "https://cdn.example.com"]);

    // 预连接
    this.addPreconnect(["https://fonts.googleapis.com"]);
  }

  addDNSPrefetch(domains) {
    domains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  addPreconnect(origins) {
    origins.forEach((origin) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }
}

// 初始化资源优化器
const optimizer = new ResourceOptimizer();
optimizer.addResourceHints();
optimizer.preloadCriticalResources();

// 页面加载完成后处理非关键资源
window.addEventListener("load", () => {
  optimizer.deferNonCriticalResources();
  optimizer.prefetchNextPageResources();
});
```

### 代码分割与懒加载

```javascript
// 动态导入和代码分割
class CodeSplitter {
  constructor() {
    this.moduleCache = new Map();
    this.loadingModules = new Map();
  }

  // 路由级代码分割
  async loadRoute(routeName) {
    if (this.moduleCache.has(routeName)) {
      return this.moduleCache.get(routeName);
    }

    if (this.loadingModules.has(routeName)) {
      return this.loadingModules.get(routeName);
    }

    const loadPromise = this.dynamicImport(routeName);
    this.loadingModules.set(routeName, loadPromise);

    try {
      const module = await loadPromise;
      this.moduleCache.set(routeName, module);
      this.loadingModules.delete(routeName);
      return module;
    } catch (error) {
      this.loadingModules.delete(routeName);
      throw error;
    }
  }

  async dynamicImport(routeName) {
    const moduleMap = {
      home: () => import("./pages/Home.js"),
      about: () => import("./pages/About.js"),
      contact: () => import("./pages/Contact.js"),
      dashboard: () => import("./pages/Dashboard.js"),
    };

    const importFunction = moduleMap[routeName];
    if (!importFunction) {
      throw new Error(`Route ${routeName} not found`);
    }

    return await importFunction();
  }

  // 组件级懒加载
  async loadComponent(componentName, container) {
    try {
      const module = await import(`./components/${componentName}.js`);
      const Component = module.default;

      // 渲染组件
      const instance = new Component();
      container.appendChild(instance.render());

      return instance;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      // 显示错误状态
      container.innerHTML = '<div class="error">组件加载失败</div>';
    }
  }

  // 功能模块懒加载
  async loadFeature(featureName) {
    const featureModules = {
      charts: () => import("./features/charts/index.js"),
      editor: () => import("./features/editor/index.js"),
      calendar: () => import("./features/calendar/index.js"),
    };

    const loadFeature = featureModules[featureName];
    if (!loadFeature) {
      throw new Error(`Feature ${featureName} not found`);
    }

    return await loadFeature();
  }
}

// 交叉观察器懒加载
class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );

    this.loadingElements = new Set();
  }

  observe(element, loadCallback) {
    element.loadCallback = loadCallback;
    this.observer.observe(element);
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !this.loadingElements.has(entry.target)) {
        this.loadingElements.add(entry.target);
        this.loadElement(entry.target);
      }
    });
  }

  async loadElement(element) {
    try {
      await element.loadCallback();
      this.observer.unobserve(element);
      this.loadingElements.delete(element);
    } catch (error) {
      console.error("Lazy loading failed:", error);
      this.loadingElements.delete(element);
    }
  }

  // 图片懒加载
  lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]");

    images.forEach((img) => {
      this.observe(img, () => {
        return new Promise((resolve, reject) => {
          const actualImg = new Image();
          actualImg.onload = () => {
            img.src = img.dataset.src;
            img.classList.add("loaded");
            resolve();
          };
          actualImg.onerror = reject;
          actualImg.src = img.dataset.src;
        });
      });
    });
  }
}

// 使用示例
const codeSplitter = new CodeSplitter();
const lazyLoader = new LazyLoader();

// 路由懒加载
async function navigateToRoute(routeName) {
  try {
    const module = await codeSplitter.loadRoute(routeName);
    // 渲染路由组件
    document.getElementById("app").innerHTML = module.default.render();
  } catch (error) {
    console.error("Route loading failed:", error);
  }
}

// 初始化图片懒加载
lazyLoader.lazyLoadImages();
```

## 🎨 渲染性能优化

### 虚拟滚动实现

```javascript
// 高性能虚拟滚动
class VirtualScroller {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemHeight: 50,
      bufferSize: 5,
      ...options,
    };

    this.data = [];
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.scrollTop = 0;

    this.init();
  }

  init() {
    this.setupContainer();
    this.bindEvents();
  }

  setupContainer() {
    this.container.style.overflowY = "auto";
    this.container.style.position = "relative";

    // 创建滚动内容容器
    this.scrollContainer = document.createElement("div");
    this.scrollContainer.style.position = "absolute";
    this.scrollContainer.style.top = "0";
    this.scrollContainer.style.left = "0";
    this.scrollContainer.style.right = "0";

    // 创建虚拟占位容器
    this.spacer = document.createElement("div");

    this.container.appendChild(this.spacer);
    this.container.appendChild(this.scrollContainer);
  }

  bindEvents() {
    this.container.addEventListener("scroll", this.handleScroll.bind(this));
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  handleScroll() {
    const newScrollTop = this.container.scrollTop;

    // 节流滚动处理
    if (Math.abs(newScrollTop - this.scrollTop) < this.options.itemHeight / 2) {
      return;
    }

    this.scrollTop = newScrollTop;
    this.updateVisibleRange();
    this.renderVisibleItems();
  }

  handleResize() {
    this.updateVisibleRange();
    this.renderVisibleItems();
  }

  updateVisibleRange() {
    const containerHeight = this.container.clientHeight;
    const itemsPerScreen = Math.ceil(containerHeight / this.options.itemHeight);

    this.visibleStart = Math.max(
      0,
      Math.floor(this.scrollTop / this.options.itemHeight) -
        this.options.bufferSize
    );

    this.visibleEnd = Math.min(
      this.data.length - 1,
      this.visibleStart + itemsPerScreen + this.options.bufferSize * 2
    );
  }

  renderVisibleItems() {
    // 清空容器
    this.scrollContainer.innerHTML = "";

    // 设置容器位置
    this.scrollContainer.style.transform = `translateY(${
      this.visibleStart * this.options.itemHeight
    }px)`;

    // 渲染可见项
    for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
      const item = this.data[i];
      if (item) {
        const element = this.renderItem(item, i);
        this.scrollContainer.appendChild(element);
      }
    }

    // 更新占位高度
    this.spacer.style.height = `${
      this.data.length * this.options.itemHeight
    }px`;
  }

  renderItem(item, index) {
    const element = document.createElement("div");
    element.style.height = `${this.options.itemHeight}px`;
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.padding = "0 10px";
    element.style.borderBottom = "1px solid #eee";

    element.innerHTML = this.options.renderItem
      ? this.options.renderItem(item, index)
      : `<span>${item.name || item.title || JSON.stringify(item)}</span>`;

    return element;
  }

  setData(data) {
    this.data = data;
    this.updateVisibleRange();
    this.renderVisibleItems();
  }

  scrollToIndex(index) {
    const scrollTop = index * this.options.itemHeight;
    this.container.scrollTop = scrollTop;
  }

  destroy() {
    this.container.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  }
}

// 使用虚拟滚动
const virtualScroller = new VirtualScroller(
  document.getElementById("scroll-container"),
  {
    itemHeight: 60,
    bufferSize: 3,
    renderItem: (item, index) => `
            <div style="flex: 1;">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <span>#${index}</span>
        `,
  }
);

// 设置大量数据
const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
  title: `Item ${i}`,
  description: `Description for item ${i}`,
}));

virtualScroller.setData(largeDataSet);
```

### DOM 操作优化

```javascript
// DOM操作优化器
class DOMOptimizer {
  constructor() {
    this.frameCallbacks = [];
    this.isScheduled = false;
  }

  // 批量DOM操作
  batchDOMOperations(operations) {
    // 创建文档片段
    const fragment = document.createDocumentFragment();

    operations.forEach((operation) => {
      if (operation.type === "create") {
        const element = document.createElement(operation.tag);
        if (operation.attributes) {
          Object.assign(element, operation.attributes);
        }
        if (operation.content) {
          element.textContent = operation.content;
        }
        fragment.appendChild(element);
      }
    });

    return fragment;
  }

  // 读写分离
  separateReadWrite(elements, readCallback, writeCallback) {
    // 先批量读取
    const readResults = elements.map((el) => readCallback(el));

    // 再批量写入
    elements.forEach((el, index) => {
      writeCallback(el, readResults[index]);
    });
  }

  // 使用requestAnimationFrame优化
  scheduleWork(callback) {
    this.frameCallbacks.push(callback);

    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => {
        this.isScheduled = false;
        const callbacks = [...this.frameCallbacks];
        this.frameCallbacks = [];

        callbacks.forEach((callback) => callback());
      });
    }
  }

  // 时间分片
  timeSliceExecution(tasks, chunkSize = 5) {
    let currentIndex = 0;

    const processTasks = () => {
      const startTime = performance.now();

      while (currentIndex < tasks.length && performance.now() - startTime < 5) {
        const endIndex = Math.min(currentIndex + chunkSize, tasks.length);

        for (let i = currentIndex; i < endIndex; i++) {
          tasks[i]();
        }

        currentIndex = endIndex;
      }

      if (currentIndex < tasks.length) {
        this.scheduleWork(processTasks);
      }
    };

    processTasks();
  }

  // 防抖动画
  debounceAnimation(element, animationClass, delay = 100) {
    if (element.animationTimer) {
      clearTimeout(element.animationTimer);
    }

    element.animationTimer = setTimeout(() => {
      element.classList.add(animationClass);

      element.addEventListener(
        "animationend",
        () => {
          element.classList.remove(animationClass);
        },
        { once: true }
      );
    }, delay);
  }
}

// 使用示例
const domOptimizer = new DOMOptimizer();

// 批量创建元素
const operations = Array.from({ length: 1000 }, (_, i) => ({
  type: "create",
  tag: "div",
  attributes: { className: "item" },
  content: `Item ${i}`,
}));

const fragment = domOptimizer.batchDOMOperations(operations);
document.getElementById("container").appendChild(fragment);

// 读写分离示例
const elements = document.querySelectorAll(".item");
domOptimizer.separateReadWrite(
  elements,
  (el) => el.offsetWidth, // 读取
  (el, width) => {
    // 写入
    el.style.width = `${width + 10}px`;
  }
);
```

## 🧠 内存优化

### 内存泄漏防止

```javascript
// 内存管理器
class MemoryManager {
  constructor() {
    this.eventListeners = new Map();
    this.timers = new Set();
    this.observers = new Set();
    this.subscriptions = new Set();
  }

  // 安全的事件监听器管理
  addEventListener(element, event, handler, options) {
    const key = `${element}_${event}`;

    // 存储引用以便清理
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    this.eventListeners.get(key).push({ handler, options });

    element.addEventListener(event, handler, options);
  }

  removeEventListener(element, event, handler) {
    const key = `${element}_${event}`;
    const listeners = this.eventListeners.get(key);

    if (listeners) {
      const index = listeners.findIndex((l) => l.handler === handler);
      if (index > -1) {
        listeners.splice(index, 1);
        element.removeEventListener(event, handler);
      }
    }
  }

  // 定时器管理
  setTimeout(callback, delay) {
    const id = setTimeout((...args) => {
      this.timers.delete(id);
      callback(...args);
    }, delay);

    this.timers.add(id);
    return id;
  }

  setInterval(callback, interval) {
    const id = setInterval(callback, interval);
    this.timers.add(id);
    return id;
  }

  clearTimeout(id) {
    clearTimeout(id);
    this.timers.delete(id);
  }

  clearInterval(id) {
    clearInterval(id);
    this.timers.delete(id);
  }

  // 观察器管理
  createObserver(type, callback, options) {
    let observer;

    switch (type) {
      case "intersection":
        observer = new IntersectionObserver(callback, options);
        break;
      case "mutation":
        observer = new MutationObserver(callback);
        break;
      case "resize":
        observer = new ResizeObserver(callback);
        break;
      case "performance":
        observer = new PerformanceObserver(callback);
        break;
      default:
        throw new Error(`Unknown observer type: ${type}`);
    }

    this.observers.add(observer);
    return observer;
  }

  // 清理所有资源
  cleanup() {
    // 清理事件监听器
    this.eventListeners.forEach((listeners, key) => {
      const [element, event] = key.split("_");
      listeners.forEach(({ handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();

    // 清理定时器
    this.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    this.timers.clear();

    // 清理观察器
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();

    // 清理订阅
    this.subscriptions.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    this.subscriptions.clear();
  }
}

// 弱引用缓存
class WeakCache {
  constructor() {
    this.cache = new WeakMap();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }
}

// 对象池
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }

  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  clear() {
    this.pool = [];
  }
}

// 使用示例
const memoryManager = new MemoryManager();

// 创建对象池
const divPool = new ObjectPool(
  () => document.createElement("div"),
  (div) => {
    div.innerHTML = "";
    div.className = "";
    div.style.cssText = "";
  }
);

// 组件生命周期管理
class Component {
  constructor() {
    this.memoryManager = new MemoryManager();
  }

  mount() {
    // 添加事件监听器
    this.memoryManager.addEventListener(
      window,
      "resize",
      this.handleResize.bind(this)
    );

    // 创建观察器
    this.intersectionObserver = this.memoryManager.createObserver(
      "intersection",
      this.handleIntersection.bind(this)
    );
  }

  unmount() {
    // 自动清理所有资源
    this.memoryManager.cleanup();
  }

  handleResize() {
    // 处理窗口大小变化
  }

  handleIntersection(entries) {
    // 处理交叉观察
  }
}
```

## 📊 网络优化

### 请求优化

```javascript
// 网络请求优化器
class NetworkOptimizer {
  constructor() {
    this.requestCache = new Map();
    this.pendingRequests = new Map();
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffFactor: 2,
    };
  }

  // 请求去重
  async request(url, options = {}) {
    const key = this.getRequestKey(url, options);

    // 检查缓存
    if (this.requestCache.has(key) && !options.skipCache) {
      return this.requestCache.get(key);
    }

    // 检查正在进行的请求
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // 创建请求Promise
    const requestPromise = this.makeRequest(url, options);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;

      // 缓存结果
      if (!options.skipCache) {
        this.requestCache.set(key, result);

        // 设置缓存过期
        if (options.cacheTimeout) {
          setTimeout(() => {
            this.requestCache.delete(key);
          }, options.cacheTimeout);
        }
      }

      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  async makeRequest(url, options) {
    const { maxRetries, retryDelay, backoffFactor } = this.retryConfig;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries && this.shouldRetry(error)) {
          const delay = retryDelay * Math.pow(backoffFactor, attempt);
          await this.sleep(delay);
          continue;
        }

        break;
      }
    }

    throw lastError;
  }

  shouldRetry(error) {
    // 网络错误或5xx服务器错误可以重试
    return error.name === "TypeError" || error.message.includes("HTTP 5");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getRequestKey(url, options) {
    return `${options.method || "GET"}_${url}_${JSON.stringify(
      options.body || {}
    )}`;
  }

  // 批量请求
  async batchRequest(requests) {
    const chunks = this.chunkArray(requests, 5); // 每批5个请求
    const results = [];

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map((req) => this.request(req.url, req.options))
      );
      results.push(...chunkResults);
    }

    return results;
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 预加载
  async preloadResources(urls) {
    const preloadPromises = urls.map((url) => {
      return this.request(url, { skipCache: false, cacheTimeout: 300000 }); // 5分钟缓存
    });

    // 不等待结果，仅预加载
    Promise.allSettled(preloadPromises);
  }

  // 清理缓存
  clearCache() {
    this.requestCache.clear();
  }
}

// HTTP/2 Server Push模拟
class ResourcePusher {
  constructor() {
    this.pushCache = new Map();
  }

  // 推送关键资源
  pushCriticalResources() {
    const criticalResources = [
      "/api/user-info",
      "/api/navigation",
      "/api/initial-data",
    ];

    criticalResources.forEach((resource) => {
      this.pushResource(resource);
    });
  }

  async pushResource(url) {
    if (this.pushCache.has(url)) {
      return this.pushCache.get(url);
    }

    const promise = fetch(url).then((res) => res.json());
    this.pushCache.set(url, promise);

    return promise;
  }

  // 获取推送的资源
  getPushedResource(url) {
    return this.pushCache.get(url);
  }
}

// 使用示例
const networkOptimizer = new NetworkOptimizer();
const resourcePusher = new ResourcePusher();

// 页面初始化时推送关键资源
resourcePusher.pushCriticalResources();

// 使用优化的请求
async function loadUserData() {
  try {
    // 尝试获取推送的资源
    let userData = resourcePusher.getPushedResource("/api/user-info");

    if (!userData) {
      // 回退到普通请求
      userData = networkOptimizer.request("/api/user-info", {
        cacheTimeout: 60000, // 1分钟缓存
      });
    }

    return await userData;
  } catch (error) {
    console.error("Failed to load user data:", error);
    throw error;
  }
}
```

## 📋 性能清单

### 性能审计清单

```javascript
// 性能审计工具
class PerformanceAuditor {
  constructor() {
    this.audits = [];
    this.results = {};
  }

  // 注册审计项
  addAudit(name, auditFunction, weight = 1) {
    this.audits.push({ name, auditFunction, weight });
  }

  // 运行所有审计
  async runAudits() {
    const results = {};

    for (const audit of this.audits) {
      try {
        results[audit.name] = await audit.auditFunction();
      } catch (error) {
        results[audit.name] = {
          passed: false,
          error: error.message,
        };
      }
    }

    this.results = results;
    return this.generateReport();
  }

  generateReport() {
    const report = {
      score: 0,
      audits: this.results,
      recommendations: [],
    };

    let totalWeight = 0;
    let weightedScore = 0;

    Object.keys(this.results).forEach((auditName) => {
      const audit = this.audits.find((a) => a.name === auditName);
      const result = this.results[auditName];

      if (result.passed) {
        weightedScore += audit.weight;
      } else {
        report.recommendations.push({
          audit: auditName,
          message: result.message || "需要优化",
        });
      }

      totalWeight += audit.weight;
    });

    report.score = Math.round((weightedScore / totalWeight) * 100);
    return report;
  }
}

// 性能审计项
const auditor = new PerformanceAuditor();

// 首屏渲染时间审计
auditor.addAudit(
  "first-contentful-paint",
  async () => {
    const entries = performance.getEntriesByType("paint");
    const fcp = entries.find(
      (entry) => entry.name === "first-contentful-paint"
    );

    return {
      passed: fcp && fcp.startTime < 1500,
      value: fcp ? fcp.startTime : null,
      message: fcp ? `FCP: ${fcp.startTime.toFixed(2)}ms` : "FCP not measured",
    };
  },
  2
);

// 资源大小审计
auditor.addAudit(
  "resource-size",
  async () => {
    const resources = performance.getEntriesByType("resource");
    const totalSize = resources.reduce(
      (sum, resource) => sum + (resource.transferSize || 0),
      0
    );

    return {
      passed: totalSize < 2 * 1024 * 1024, // 2MB
      value: totalSize,
      message: `Total resources: ${(totalSize / 1024 / 1024).toFixed(2)}MB`,
    };
  },
  1
);

// 未使用的CSS审计
auditor.addAudit(
  "unused-css",
  async () => {
    // 这需要更复杂的分析，这里简化处理
    const stylesheets = document.styleSheets;
    let totalRules = 0;

    for (let sheet of stylesheets) {
      try {
        totalRules += sheet.cssRules.length;
      } catch (e) {
        // 跨域样式表
      }
    }

    return {
      passed: totalRules < 1000,
      value: totalRules,
      message: `CSS rules: ${totalRules}`,
    };
  },
  1
);

// 运行审计
auditor.runAudits().then((report) => {
  console.log("Performance Report:", report);

  if (report.score < 80) {
    console.warn("Performance needs improvement:");
    report.recommendations.forEach((rec) => {
      console.warn(`- ${rec.audit}: ${rec.message}`);
    });
  }
});
```

### 最佳实践

```javascript
// 性能优化最佳实践
const performanceBestPractices = {
  // 加载优化
  loading: [
    "使用CDN加速静态资源",
    "启用gzip/brotli压缩",
    "合理使用浏览器缓存",
    "预加载关键资源",
    "延迟加载非关键资源",
    "代码分割减少首屏加载",
  ],

  // 渲染优化
  rendering: [
    "减少DOM操作",
    "避免强制同步布局",
    "使用CSS3硬件加速",
    "虚拟滚动处理大列表",
    "防抖动画和交互",
    "will-change提示变化属性",
  ],

  // 内存优化
  memory: [
    "及时清理事件监听器",
    "避免全局变量污染",
    "使用对象池复用对象",
    "合理使用闭包",
    "清理定时器和观察器",
    "图片懒加载释放内存",
  ],

  // 网络优化
  network: [
    "请求去重避免重复",
    "合并小请求减少RTT",
    "使用HTTP/2多路复用",
    "实施适当的重试策略",
    "缓存常用API响应",
    "压缩请求响应数据",
  ],
};

// 性能监控和报警
class PerformanceMonitoring {
  constructor() {
    this.thresholds = {
      fcp: 1500,
      lcp: 2500,
      fid: 100,
      cls: 0.1,
    };
  }

  startMonitoring() {
    // 监控Core Web Vitals
    this.monitorWebVitals();

    // 监控长任务
    this.monitorLongTasks();

    // 监控内存使用
    this.monitorMemoryUsage();
  }

  monitorWebVitals() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "largest-contentful-paint") {
          this.checkThreshold("lcp", entry.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  }

  monitorLongTasks() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration}ms`);
          this.reportIssue("long-task", { duration: entry.duration });
        }
      });
    });

    observer.observe({ entryTypes: ["longtask"] });
  }

  monitorMemoryUsage() {
    if ("memory" in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (usage > 0.9) {
          console.warn("High memory usage:", usage);
          this.reportIssue("high-memory", { usage });
        }
      }, 30000); // 每30秒检查一次
    }
  }

  checkThreshold(metric, value) {
    if (value > this.thresholds[metric]) {
      console.warn(`${metric.toUpperCase()} threshold exceeded:`, value);
      this.reportIssue(metric, { value });
    }
  }

  reportIssue(type, data) {
    // 发送性能问题报告
    fetch("/api/performance-issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: location.href,
      }),
    });
  }
}

// 启动性能监控
const monitoring = new PerformanceMonitoring();
monitoring.startMonitoring();
```

---

_前端性能优化是一个系统性工程，需要从加载、渲染、内存、网络等多个维度进行全面优化，持续监控和改进是保持良好性能的关键。_
