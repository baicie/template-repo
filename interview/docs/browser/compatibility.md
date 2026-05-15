# 浏览器兼容性

全面的浏览器兼容性指南，涵盖兼容性检测、polyfill 使用、优雅降级策略和跨浏览器开发最佳实践。

## 🌐 浏览器市场概览

### 主流浏览器分布

| 浏览器      | 市场份额 | 内核    | 主要版本 | 支持状况         |
| ----------- | -------- | ------- | -------- | ---------------- |
| **Chrome**  | ~65%     | Blink   | 90+      | 现代特性支持良好 |
| **Safari**  | ~20%     | WebKit  | 14+      | 部分现代特性支持 |
| **Edge**    | ~4%      | Blink   | 90+      | 现代特性支持良好 |
| **Firefox** | ~3%      | Gecko   | 88+      | 现代特性支持良好 |
| **IE 11**   | ~1%      | Trident | 11       | 仅支持基础特性   |
| **移动端**  | 变化     | 各种    | 变化     | 兼容性差异较大   |

### 兼容性策略矩阵

```javascript
// 浏览器兼容性策略配置
const compatibilityStrategy = {
  // 完全支持：现代浏览器
  modern: {
    browsers: ["Chrome 90+", "Firefox 88+", "Safari 14+", "Edge 90+"],
    features: ["ES2020", "CSS Grid", "Web Components", "Service Workers"],
    strategy: "full-features",
  },

  // 基础支持：较旧浏览器
  legacy: {
    browsers: ["IE 11", "Chrome 60-89", "Safari 10-13"],
    features: ["ES5", "CSS Flexbox", "Basic APIs"],
    strategy: "graceful-degradation",
  },

  // 移动端适配
  mobile: {
    browsers: ["iOS Safari", "Chrome Mobile", "Samsung Internet"],
    features: ["Touch Events", "Responsive Design", "PWA"],
    strategy: "mobile-first",
  },
};
```

## 🔍 特性检测系统

### 全面的特性检测器

```javascript
// 浏览器特性检测系统
class FeatureDetector {
  constructor() {
    this.cache = new Map();
    this.detectionResults = {};
  }

  // 核心API检测
  detectCoreAPIs() {
    const coreFeatures = {
      // JavaScript 特性
      es6Classes: () => {
        try {
          eval("class Test{}");
          return true;
        } catch (e) {
          return false;
        }
      },

      es6Arrow: () => {
        try {
          eval("(() => {})");
          return true;
        } catch (e) {
          return false;
        }
      },

      es6Destructuring: () => {
        try {
          eval("const {a} = {a: 1}");
          return true;
        } catch (e) {
          return false;
        }
      },

      es6Modules: () => {
        const script = document.createElement("script");
        return "noModule" in script;
      },

      asyncAwait: () => {
        try {
          eval("(async () => {})");
          return true;
        } catch (e) {
          return false;
        }
      },

      // DOM API
      querySelector: () => !!document.querySelector,
      querySelectorAll: () => !!document.querySelectorAll,
      addEventListener: () => !!window.addEventListener,
      classList: () => !!document.createElement("div").classList,
      dataset: () => !!document.createElement("div").dataset,

      // 现代Web API
      fetch: () => !!window.fetch,
      promise: () => !!window.Promise,
      intersectionObserver: () => !!window.IntersectionObserver,
      resizeObserver: () => !!window.ResizeObserver,
      mutationObserver: () => !!window.MutationObserver,

      // 存储API
      localStorage: () => {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          return true;
        } catch (e) {
          return false;
        }
      },

      sessionStorage: () => {
        try {
          sessionStorage.setItem("test", "test");
          sessionStorage.removeItem("test");
          return true;
        } catch (e) {
          return false;
        }
      },

      indexedDB: () => !!window.indexedDB,

      // 媒体API
      getUserMedia: () =>
        !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webRTC: () =>
        !!(window.RTCPeerConnection || window.webkitRTCPeerConnection),

      // 其他API
      geolocation: () => !!navigator.geolocation,
      notification: () => !!window.Notification,
      serviceWorker: () => !!navigator.serviceWorker,
      pushManager: () => !!(navigator.serviceWorker && "PushManager" in window),
      webGL: () => this.detectWebGL(),
      canvas: () => !!document.createElement("canvas").getContext,
      svg: () =>
        !!(
          document.createElementNS &&
          document.createElementNS("http://www.w3.org/2000/svg", "svg")
            .createSVGRect
        ),

      // CSS特性
      cssGrid: () => CSS.supports("display", "grid"),
      cssFlexbox: () => CSS.supports("display", "flex"),
      cssCustomProperties: () => CSS.supports("color", "var(--test)"),
      cssCalc: () => CSS.supports("width", "calc(100% - 10px)"),
      cssTransforms: () => CSS.supports("transform", "translateX(10px)"),
      cssTransitions: () => CSS.supports("transition", "all 0.3s"),
      cssAnimations: () => CSS.supports("animation", "test 1s"),
      cssFilters: () => CSS.supports("filter", "blur(5px)"),
    };

    const results = {};
    Object.entries(coreFeatures).forEach(([feature, detector]) => {
      try {
        results[feature] = detector();
      } catch (error) {
        results[feature] = false;
      }
    });

    this.detectionResults.core = results;
    return results;
  }

  // WebGL检测
  detectWebGL() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  // 输入设备检测
  detectInputCapabilities() {
    const inputFeatures = {
      touch: () => "ontouchstart" in window || navigator.maxTouchPoints > 0,
      pointerEvents: () => !!window.PointerEvent,
      mouseEvents: () => "onmousedown" in window,
      keyboardEvents: () => "onkeydown" in window,
      gamepad: () => !!navigator.getGamepads,
      deviceMotion: () => !!window.DeviceMotionEvent,
      deviceOrientation: () => !!window.DeviceOrientationEvent,
    };

    const results = {};
    Object.entries(inputFeatures).forEach(([feature, detector]) => {
      results[feature] = detector();
    });

    this.detectionResults.input = results;
    return results;
  }

  // 网络特性检测
  detectNetworkCapabilities() {
    const networkFeatures = {
      onlineStatus: () => "onLine" in navigator,
      connection: () => !!navigator.connection,
      sendBeacon: () => !!navigator.sendBeacon,
      webSocket: () => !!window.WebSocket,
      sse: () => !!window.EventSource,
      backgroundSync: () =>
        "serviceWorker" in navigator &&
        "sync" in window.ServiceWorkerRegistration.prototype,
    };

    const results = {};
    Object.entries(networkFeatures).forEach(([feature, detector]) => {
      results[feature] = detector();
    });

    this.detectionResults.network = results;
    return results;
  }

  // 安全特性检测
  detectSecurityFeatures() {
    const securityFeatures = {
      https: () => location.protocol === "https:",
      csp: () =>
        !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
      hsts: () => this.checkHSTS(),
      webCrypto: () => !!window.crypto && !!window.crypto.subtle,
      secureContext: () => !!window.isSecureContext,
    };

    const results = {};
    Object.entries(securityFeatures).forEach(([feature, detector]) => {
      results[feature] = detector();
    });

    this.detectionResults.security = results;
    return results;
  }

  // 检查HSTS
  checkHSTS() {
    // 简化检测，实际应该检查HTTP头
    return location.protocol === "https:";
  }

  // 性能特性检测
  detectPerformanceFeatures() {
    const performanceFeatures = {
      performanceAPI: () => !!window.performance,
      performanceObserver: () => !!window.PerformanceObserver,
      userTiming: () => !!(window.performance && window.performance.mark),
      resourceTiming: () =>
        !!(window.performance && window.performance.getEntriesByType),
      navigationTiming: () =>
        !!(window.performance && window.performance.navigation),
      webWorkers: () => !!window.Worker,
      sharedWorkers: () => !!window.SharedWorker,
      transferableObjects: () => this.checkTransferableObjects(),
    };

    const results = {};
    Object.entries(performanceFeatures).forEach(([feature, detector]) => {
      results[feature] = detector();
    });

    this.detectionResults.performance = results;
    return results;
  }

  // 检查Transferable Objects支持
  checkTransferableObjects() {
    try {
      const buffer = new ArrayBuffer(1);
      const worker = new Worker("data:application/javascript,");
      worker.postMessage(buffer, [buffer]);
      worker.terminate();
      return buffer.byteLength === 0;
    } catch (e) {
      return false;
    }
  }

  // 浏览器信息检测
  detectBrowserInfo() {
    const ua = navigator.userAgent;
    const browserInfo = {
      userAgent: ua,
      vendor: navigator.vendor,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages || [],
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
    };

    // 浏览器识别
    if (ua.includes("Chrome") && !ua.includes("Edge")) {
      browserInfo.name = "Chrome";
      browserInfo.version = ua.match(/Chrome\/(\d+)/)?.[1];
    } else if (ua.includes("Firefox")) {
      browserInfo.name = "Firefox";
      browserInfo.version = ua.match(/Firefox\/(\d+)/)?.[1];
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      browserInfo.name = "Safari";
      browserInfo.version = ua.match(/Version\/(\d+)/)?.[1];
    } else if (ua.includes("Edge")) {
      browserInfo.name = "Edge";
      browserInfo.version = ua.match(/Edge\/(\d+)/)?.[1];
    } else if (ua.includes("MSIE") || ua.includes("Trident")) {
      browserInfo.name = "Internet Explorer";
      browserInfo.version = ua.match(/(?:MSIE |rv:)(\d+)/)?.[1];
    }

    // 移动设备检测
    browserInfo.isMobile =
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    browserInfo.isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
    browserInfo.isDesktop = !browserInfo.isMobile && !browserInfo.isTablet;

    this.detectionResults.browser = browserInfo;
    return browserInfo;
  }

  // 运行完整检测
  runFullDetection() {
    return {
      core: this.detectCoreAPIs(),
      input: this.detectInputCapabilities(),
      network: this.detectNetworkCapabilities(),
      security: this.detectSecurityFeatures(),
      performance: this.detectPerformanceFeatures(),
      browser: this.detectBrowserInfo(),
      timestamp: Date.now(),
    };
  }

  // 生成兼容性报告
  generateCompatibilityReport() {
    const detection = this.runFullDetection();

    // 计算支持度
    const calculateSupport = (features) => {
      const total = Object.keys(features).length;
      const supported = Object.values(features).filter(Boolean).length;
      return Math.round((supported / total) * 100);
    };

    const report = {
      browser: detection.browser,
      support: {
        core: calculateSupport(detection.core),
        input: calculateSupport(detection.input),
        network: calculateSupport(detection.network),
        security: calculateSupport(detection.security),
        performance: calculateSupport(detection.performance),
      },
      details: detection,
      recommendations: this.generateRecommendations(detection),
    };

    return report;
  }

  // 生成建议
  generateRecommendations(detection) {
    const recommendations = [];

    // 基于浏览器类型的建议
    if (detection.browser.name === "Internet Explorer") {
      recommendations.push("建议升级到现代浏览器以获得更好的性能和安全性");
    }

    // 基于特性支持的建议
    if (!detection.core.fetch) {
      recommendations.push("需要fetch polyfill以支持现代网络请求");
    }

    if (!detection.core.promise) {
      recommendations.push("需要Promise polyfill以支持异步编程");
    }

    if (!detection.core.localStorage) {
      recommendations.push("需要实现存储降级方案");
    }

    if (!detection.security.https) {
      recommendations.push("建议启用HTTPS以提高安全性");
    }

    return recommendations;
  }
}

// 使用示例
const detector = new FeatureDetector();
const report = detector.generateCompatibilityReport();
console.log("兼容性报告:", report);
```

## 🔄 Polyfill 管理系统

### 智能 Polyfill 加载器

```javascript
// Polyfill管理系统
class PolyfillManager {
  constructor() {
    this.polyfills = new Map();
    this.loadedPolyfills = new Set();
    this.loadingPromises = new Map();

    this.initializePolyfillRegistry();
  }

  // 初始化Polyfill注册表
  initializePolyfillRegistry() {
    this.polyfills.set("fetch", {
      test: () => !!window.fetch,
      url: "https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/fetch.min.js",
      fallback: this.createXHRFallback,
    });

    this.polyfills.set("promise", {
      test: () => !!window.Promise,
      url: "https://cdn.jsdelivr.net/npm/es6-promise@4.2.8/dist/es6-promise.min.js",
      fallback: this.createPromiseFallback,
    });

    this.polyfills.set("intersection-observer", {
      test: () => !!window.IntersectionObserver,
      url: "https://cdn.jsdelivr.net/npm/intersection-observer@0.12.2/intersection-observer.js",
      fallback: this.createIntersectionObserverFallback,
    });

    this.polyfills.set("resize-observer", {
      test: () => !!window.ResizeObserver,
      url: "https://cdn.jsdelivr.net/npm/resize-observer-polyfill@1.5.1/dist/ResizeObserver.min.js",
      fallback: this.createResizeObserverFallback,
    });

    this.polyfills.set("web-components", {
      test: () => !!(window.customElements && window.ShadowRoot),
      url: "https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.6.0/webcomponents-bundle.js",
      fallback: null,
    });

    this.polyfills.set("css-supports", {
      test: () => !!(window.CSS && window.CSS.supports),
      url: null,
      fallback: this.createCSSSupportsPolyfill,
    });

    this.polyfills.set("object-assign", {
      test: () => !!Object.assign,
      url: "https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.min.js",
      fallback: this.createObjectAssignPolyfill,
    });

    this.polyfills.set("array-includes", {
      test: () => !![].includes,
      url: null,
      fallback: this.createArrayIncludesPolyfill,
    });

    this.polyfills.set("string-includes", {
      test: () => !!"".includes,
      url: null,
      fallback: this.createStringIncludesPolyfill,
    });

    this.polyfills.set("local-storage", {
      test: () => {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          return true;
        } catch (e) {
          return false;
        }
      },
      url: null,
      fallback: this.createLocalStoragePolyfill,
    });
  }

  // 检查是否需要polyfill
  needsPolyfill(feature) {
    const polyfill = this.polyfills.get(feature);
    return polyfill && !polyfill.test();
  }

  // 加载单个polyfill
  async loadPolyfill(feature) {
    if (this.loadedPolyfills.has(feature)) {
      return true;
    }

    // 如果正在加载，返回现有的Promise
    if (this.loadingPromises.has(feature)) {
      return this.loadingPromises.get(feature);
    }

    const polyfill = this.polyfills.get(feature);
    if (!polyfill) {
      throw new Error(`Unknown polyfill: ${feature}`);
    }

    // 如果不需要polyfill，直接返回
    if (polyfill.test()) {
      this.loadedPolyfills.add(feature);
      return true;
    }

    const loadPromise = this.doLoadPolyfill(feature, polyfill);
    this.loadingPromises.set(feature, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedPolyfills.add(feature);
      return result;
    } finally {
      this.loadingPromises.delete(feature);
    }
  }

  // 执行polyfill加载
  async doLoadPolyfill(feature, polyfill) {
    if (polyfill.url) {
      // 从CDN加载
      try {
        await this.loadScript(polyfill.url);

        // 验证polyfill是否成功加载
        if (polyfill.test()) {
          console.log(`Polyfill loaded successfully: ${feature}`);
          return true;
        } else {
          throw new Error(`Polyfill test failed after loading: ${feature}`);
        }
      } catch (error) {
        console.warn(`Failed to load polyfill from CDN: ${feature}`, error);

        // 回退到内置实现
        if (polyfill.fallback) {
          polyfill.fallback();
          return true;
        }

        throw error;
      }
    } else if (polyfill.fallback) {
      // 直接使用内置实现
      polyfill.fallback();
      return true;
    } else {
      throw new Error(`No polyfill implementation available for: ${feature}`);
    }
  }

  // 加载脚本
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

      document.head.appendChild(script);
    });
  }

  // 批量加载polyfills
  async loadPolyfills(features) {
    const loadPromises = features.map((feature) => this.loadPolyfill(feature));
    const results = await Promise.allSettled(loadPromises);

    const report = {
      total: features.length,
      loaded: 0,
      failed: 0,
      details: {},
    };

    results.forEach((result, index) => {
      const feature = features[index];
      if (result.status === "fulfilled") {
        report.loaded++;
        report.details[feature] = { status: "loaded" };
      } else {
        report.failed++;
        report.details[feature] = {
          status: "failed",
          error: result.reason.message,
        };
      }
    });

    return report;
  }

  // 智能加载（基于特性检测）
  async loadRequired() {
    const requiredPolyfills = [];

    this.polyfills.forEach((polyfill, feature) => {
      if (!polyfill.test()) {
        requiredPolyfills.push(feature);
      }
    });

    if (requiredPolyfills.length === 0) {
      console.log("No polyfills required");
      return { total: 0, loaded: 0, failed: 0, details: {} };
    }

    console.log("Loading required polyfills:", requiredPolyfills);
    return this.loadPolyfills(requiredPolyfills);
  }

  // Polyfill回退实现
  createXHRFallback() {
    if (window.fetch) return;

    window.fetch = function (url, options = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || "GET", url);

        // 设置headers
        if (options.headers) {
          Object.entries(options.headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.onload = () => {
          const response = {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText)),
          };
          resolve(response);
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(options.body);
      });
    };
  }

  createPromiseFallback() {
    if (window.Promise) return;

    // 简化的Promise实现
    window.Promise = function (executor) {
      const self = this;
      this.state = "pending";
      this.value = undefined;
      this.onResolvedCallbacks = [];
      this.onRejectedCallbacks = [];

      function resolve(value) {
        if (self.state === "pending") {
          self.state = "resolved";
          self.value = value;
          self.onResolvedCallbacks.forEach((fn) => fn());
        }
      }

      function reject(reason) {
        if (self.state === "pending") {
          self.state = "rejected";
          self.value = reason;
          self.onRejectedCallbacks.forEach((fn) => fn());
        }
      }

      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    };

    window.Promise.prototype.then = function (onResolved, onRejected) {
      const promise2 = new Promise((resolve, reject) => {
        if (this.state === "resolved") {
          setTimeout(() => {
            try {
              const result = onResolved ? onResolved(this.value) : this.value;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, 0);
        } else if (this.state === "rejected") {
          setTimeout(() => {
            try {
              const result = onRejected ? onRejected(this.value) : this.value;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, 0);
        } else {
          this.onResolvedCallbacks.push(() => {
            try {
              const result = onResolved ? onResolved(this.value) : this.value;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });

          this.onRejectedCallbacks.push(() => {
            try {
              const result = onRejected ? onRejected(this.value) : this.value;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
        }
      });

      return promise2;
    };
  }

  createIntersectionObserverFallback() {
    if (window.IntersectionObserver) return;

    // 简化的IntersectionObserver实现
    window.IntersectionObserver = function (callback, options = {}) {
      this.callback = callback;
      this.root = options.root || null;
      this.rootMargin = options.rootMargin || "0px";
      this.thresholds = options.threshold || [0];
      this.observedElements = new Set();

      this.checkIntersections = this.checkIntersections.bind(this);
    };

    window.IntersectionObserver.prototype.observe = function (element) {
      this.observedElements.add(element);
      this.startWatching();
    };

    window.IntersectionObserver.prototype.unobserve = function (element) {
      this.observedElements.delete(element);
      if (this.observedElements.size === 0) {
        this.stopWatching();
      }
    };

    window.IntersectionObserver.prototype.disconnect = function () {
      this.observedElements.clear();
      this.stopWatching();
    };

    window.IntersectionObserver.prototype.startWatching = function () {
      if (!this.watching) {
        this.watching = true;
        this.checkIntersections();
        window.addEventListener("scroll", this.checkIntersections);
        window.addEventListener("resize", this.checkIntersections);
      }
    };

    window.IntersectionObserver.prototype.stopWatching = function () {
      this.watching = false;
      window.removeEventListener("scroll", this.checkIntersections);
      window.removeEventListener("resize", this.checkIntersections);
    };

    window.IntersectionObserver.prototype.checkIntersections = function () {
      const entries = [];
      this.observedElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;

        entries.push({
          target: element,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: rect,
          time: Date.now(),
        });
      });

      if (entries.length > 0) {
        this.callback(entries);
      }
    };
  }

  createCSSSupportsPolyfill() {
    if (window.CSS && window.CSS.supports) return;

    if (!window.CSS) {
      window.CSS = {};
    }

    window.CSS.supports = function (property, value) {
      const element = document.createElement("div");
      const capitalizedProperty = property.replace(
        /-([a-z])/g,
        (match, letter) => letter.toUpperCase()
      );

      try {
        element.style[property] = value;
        return (
          element.style[property] === value ||
          element.style[capitalizedProperty] === value
        );
      } catch (e) {
        return false;
      }
    };
  }

  createObjectAssignPolyfill() {
    if (Object.assign) return;

    Object.assign = function (target, ...sources) {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }

      const to = Object(target);

      sources.forEach((source) => {
        if (source != null) {
          Object.keys(source).forEach((key) => {
            to[key] = source[key];
          });
        }
      });

      return to;
    };
  }

  createArrayIncludesPolyfill() {
    if (Array.prototype.includes) return;

    Array.prototype.includes = function (searchElement, fromIndex = 0) {
      const O = Object(this);
      const len = parseInt(O.length) || 0;

      if (len === 0) return false;

      const n = parseInt(fromIndex) || 0;
      let k = n >= 0 ? n : Math.max(len + n, 0);

      while (k < len) {
        if (
          O[k] === searchElement ||
          (Number.isNaN(O[k]) && Number.isNaN(searchElement))
        ) {
          return true;
        }
        k++;
      }

      return false;
    };
  }

  createStringIncludesPolyfill() {
    if (String.prototype.includes) return;

    String.prototype.includes = function (search, start = 0) {
      if (typeof start !== "number") {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      }

      return this.indexOf(search, start) !== -1;
    };
  }

  createLocalStoragePolyfill() {
    if (window.localStorage) return;

    // 基于cookie的localStorage polyfill
    const storage = {
      length: 0,
      _data: {},

      getItem(key) {
        return this._data[key] || null;
      },

      setItem(key, value) {
        if (!(key in this._data)) {
          this.length++;
        }
        this._data[key] = String(value);
      },

      removeItem(key) {
        if (key in this._data) {
          delete this._data[key];
          this.length--;
        }
      },

      clear() {
        this._data = {};
        this.length = 0;
      },

      key(index) {
        const keys = Object.keys(this._data);
        return keys[index] || null;
      },
    };

    // 尝试从cookie恢复数据
    try {
      const cookieStorage = document.cookie
        .split(";")
        .find((row) => row.trim().startsWith("_localStorage="));

      if (cookieStorage) {
        const data = JSON.parse(
          decodeURIComponent(cookieStorage.split("=")[1])
        );
        storage._data = data;
        storage.length = Object.keys(data).length;
      }
    } catch (e) {
      // 忽略错误
    }

    // 保存到cookie
    const saveToStorage = () => {
      try {
        const data = JSON.stringify(storage._data);
        document.cookie = `_localStorage=${encodeURIComponent(
          data
        )}; path=/; max-age=31536000`;
      } catch (e) {
        // 忽略错误
      }
    };

    // 劫持方法以自动保存
    const originalSetItem = storage.setItem;
    const originalRemoveItem = storage.removeItem;
    const originalClear = storage.clear;

    storage.setItem = function (key, value) {
      originalSetItem.call(this, key, value);
      saveToStorage();
    };

    storage.removeItem = function (key) {
      originalRemoveItem.call(this, key);
      saveToStorage();
    };

    storage.clear = function () {
      originalClear.call(this);
      saveToStorage();
    };

    window.localStorage = storage;
  }
}

// 使用示例
const polyfillManager = new PolyfillManager();

// 自动加载所需的polyfills
polyfillManager.loadRequired().then((report) => {
  console.log("Polyfill加载报告:", report);

  if (report.failed > 0) {
    console.warn("某些polyfill加载失败，可能影响功能");
  }
});
```

## 🎯 优雅降级策略

### 功能降级管理器

```javascript
// 功能降级管理系统
class GracefulDegradationManager {
  constructor() {
    this.featureSupport = new Map();
    this.fallbackStrategies = new Map();
    this.enhancementLayers = new Map();

    this.initializeStrategies();
  }

  // 初始化降级策略
  initializeStrategies() {
    // 图片懒加载降级策略
    this.fallbackStrategies.set("lazyLoading", {
      check: () => "IntersectionObserver" in window,
      enhanced: this.setupIntersectionObserverLazyLoading,
      fallback: this.setupScrollBasedLazyLoading,
    });

    // 平滑滚动降级策略
    this.fallbackStrategies.set("smoothScroll", {
      check: () => CSS.supports("scroll-behavior", "smooth"),
      enhanced: this.setupCSSScrollBehavior,
      fallback: this.setupJavaScriptSmoothScroll,
    });

    // 网格布局降级策略
    this.fallbackStrategies.set("cssGrid", {
      check: () => CSS.supports("display", "grid"),
      enhanced: this.setupCSSGrid,
      fallback: this.setupFlexboxGrid,
    });

    // 自定义属性降级策略
    this.fallbackStrategies.set("cssVariables", {
      check: () => CSS.supports("color", "var(--test)"),
      enhanced: this.setupCSSVariables,
      fallback: this.setupStaticCSS,
    });

    // 动画降级策略
    this.fallbackStrategies.set("animations", {
      check: () => CSS.supports("animation", "test 1s"),
      enhanced: this.setupCSSAnimations,
      fallback: this.setupJavaScriptAnimations,
    });

    // 触摸事件降级策略
    this.fallbackStrategies.set("touchEvents", {
      check: () => "ontouchstart" in window,
      enhanced: this.setupTouchEvents,
      fallback: this.setupMouseEvents,
    });

    // Web Workers降级策略
    this.fallbackStrategies.set("webWorkers", {
      check: () => !!window.Worker,
      enhanced: this.setupWebWorkers,
      fallback: this.setupMainThreadProcessing,
    });

    // Service Worker降级策略
    this.fallbackStrategies.set("serviceWorker", {
      check: () => "serviceWorker" in navigator,
      enhanced: this.setupServiceWorker,
      fallback: this.setupApplicationCache,
    });
  }

  // 应用降级策略
  applyStrategy(feature) {
    const strategy = this.fallbackStrategies.get(feature);
    if (!strategy) {
      console.warn(`No strategy defined for feature: ${feature}`);
      return false;
    }

    const isSupported = strategy.check();
    this.featureSupport.set(feature, isSupported);

    if (isSupported) {
      console.log(`Using enhanced implementation for: ${feature}`);
      strategy.enhanced();
    } else {
      console.log(`Using fallback implementation for: ${feature}`);
      strategy.fallback();
    }

    return isSupported;
  }

  // 应用所有策略
  applyAllStrategies() {
    const results = {};

    this.fallbackStrategies.forEach((strategy, feature) => {
      results[feature] = this.applyStrategy(feature);
    });

    return results;
  }

  // 图片懒加载策略实现
  setupIntersectionObserverLazyLoading() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add("loaded");
              observer.unobserve(img);
            }
          }
        });
      },
      { rootMargin: "50px" }
    );

    document.querySelectorAll("img[data-src]").forEach((img) => {
      observer.observe(img);
    });
  }

  setupScrollBasedLazyLoading() {
    let ticking = false;

    const checkImages = () => {
      const images = document.querySelectorAll("img[data-src]");
      const windowHeight = window.innerHeight;

      images.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.top < windowHeight + 50) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          img.classList.add("loaded");
        }
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(checkImages);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    checkImages(); // 初始检查
  }

  // 平滑滚动策略实现
  setupCSSScrollBehavior() {
    // CSS已经设置了scroll-behavior: smooth
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  setupJavaScriptSmoothScroll() {
    const smoothScroll = (target, duration = 800) => {
      const start = window.pageYOffset;
      const targetPosition = target.offsetTop;
      const distance = targetPosition - start;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = this.easeInOutQuad(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          smoothScroll(target);
        }
      });
    });
  }

  // 缓动函数
  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  // CSS Grid策略实现
  setupCSSGrid() {
    // CSS Grid已通过CSS实现
    console.log("Using native CSS Grid");
  }

  setupFlexboxGrid() {
    // 为不支持Grid的浏览器添加Flexbox Grid类
    document.querySelectorAll(".grid-container").forEach((container) => {
      container.classList.add("flexbox-grid");

      // 计算列数并应用相应的类
      const children = container.children;
      const columns = container.dataset.columns || 3;

      Array.from(children).forEach((child) => {
        child.style.flex = `0 0 calc(${100 / columns}% - 20px)`;
        child.style.margin = "10px";
      });
    });
  }

  // CSS变量策略实现
  setupCSSVariables() {
    // CSS变量已通过CSS实现
    console.log("Using native CSS custom properties");
  }

  setupStaticCSS() {
    // 为不支持CSS变量的浏览器创建静态样式
    const style = document.createElement("style");
    style.textContent = `
      .theme-primary { color: #007bff; }
      .theme-secondary { color: #6c757d; }
      .theme-success { color: #28a745; }
      .theme-danger { color: #dc3545; }
      .theme-warning { color: #ffc107; }
      .theme-info { color: #17a2b8; }
    `;
    document.head.appendChild(style);

    // 替换CSS变量类名
    document.querySelectorAll('[class*="--"]').forEach((element) => {
      const className = element.className;
      const staticClass = className.replace(/var\(--(\w+)\)/, "theme-$1");
      element.className = staticClass;
    });
  }

  // 动画策略实现
  setupCSSAnimations() {
    // CSS动画已通过CSS实现
    console.log("Using native CSS animations");
  }

  setupJavaScriptAnimations() {
    // JavaScript动画实现
    const animateElement = (element, properties, duration = 400) => {
      const start = performance.now();
      const initialStyles = {};

      // 记录初始样式
      Object.keys(properties).forEach((prop) => {
        initialStyles[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
      });

      const animate = (time) => {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);

        Object.entries(properties).forEach(([prop, target]) => {
          const current =
            initialStyles[prop] + (target - initialStyles[prop]) * progress;
          element.style[prop] =
            current + (prop.includes("opacity") ? "" : "px");
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    // 绑定动画触发器
    document.querySelectorAll(".animate-on-scroll").forEach((element) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateElement(entry.target, {
              opacity: 1,
              transform: "translateY(0)",
            });
          }
        });
      });

      observer.observe(element);
    });
  }

  // 触摸事件策略实现
  setupTouchEvents() {
    // 设置触摸事件处理
    document.addEventListener("touchstart", this.handleTouchStart.bind(this), {
      passive: true,
    });
    document.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: true,
    });
    document.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });
  }

  setupMouseEvents() {
    // 设置鼠标事件作为触摸事件的降级
    document.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  handleTouchStart(e) {
    this.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  handleTouchMove(e) {
    if (this.lastTouch) {
      const deltaX = e.touches[0].clientX - this.lastTouch.x;
      const deltaY = e.touches[0].clientY - this.lastTouch.y;

      // 处理滑动手势
      this.handleSwipe(deltaX, deltaY);
    }
  }

  handleTouchEnd(e) {
    this.lastTouch = null;
  }

  handleMouseDown(e) {
    this.mouseDown = true;
    this.lastMouse = { x: e.clientX, y: e.clientY };
  }

  handleMouseMove(e) {
    if (this.mouseDown && this.lastMouse) {
      const deltaX = e.clientX - this.lastMouse.x;
      const deltaY = e.clientY - this.lastMouse.y;

      this.handleSwipe(deltaX, deltaY);
    }
  }

  handleMouseUp(e) {
    this.mouseDown = false;
    this.lastMouse = null;
  }

  handleSwipe(deltaX, deltaY) {
    // 处理滑动逻辑
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50) {
        console.log("向右滑动");
      } else if (deltaX < -50) {
        console.log("向左滑动");
      }
    }
  }

  // Web Workers策略实现
  setupWebWorkers() {
    this.workerSupported = true;
    console.log("Web Workers supported, using background processing");
  }

  setupMainThreadProcessing() {
    this.workerSupported = false;
    console.log("Web Workers not supported, using main thread processing");

    // 实现时间切片来避免阻塞UI
    this.processInChunks = (items, processor, callback) => {
      const chunks = this.chunkArray(items, 100);
      let currentChunk = 0;

      const processChunk = () => {
        if (currentChunk < chunks.length) {
          chunks[currentChunk].forEach(processor);
          currentChunk++;
          setTimeout(processChunk, 10); // 给UI时间响应
        } else {
          callback();
        }
      };

      processChunk();
    };
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Service Worker策略实现
  setupServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }
  }

  setupApplicationCache() {
    // Application Cache已废弃，提供基本的缓存策略
    console.log("Service Worker not supported, using basic caching strategies");

    // 实现简单的资源缓存
    this.cacheResources = (resources) => {
      resources.forEach((resource) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = resource;
        document.head.appendChild(link);
      });
    };
  }

  // 获取特性支持状态
  getFeatureSupport() {
    return Object.fromEntries(this.featureSupport);
  }

  // 生成降级报告
  generateDegradationReport() {
    const support = this.getFeatureSupport();
    const total = Object.keys(support).length;
    const supported = Object.values(support).filter(Boolean).length;

    return {
      summary: {
        total,
        supported,
        unsupported: total - supported,
        supportPercentage: Math.round((supported / total) * 100),
      },
      details: support,
      recommendations: this.generateRecommendations(support),
    };
  }

  generateRecommendations(support) {
    const recommendations = [];

    Object.entries(support).forEach(([feature, isSupported]) => {
      if (!isSupported) {
        switch (feature) {
          case "lazyLoading":
            recommendations.push("使用基于滚动的图片懒加载，性能可能略低");
            break;
          case "smoothScroll":
            recommendations.push("使用JavaScript实现平滑滚动，体验基本一致");
            break;
          case "cssGrid":
            recommendations.push("使用Flexbox布局，可能需要调整样式");
            break;
          case "webWorkers":
            recommendations.push("在主线程处理数据，注意性能影响");
            break;
          default:
            recommendations.push(`${feature} 使用降级实现，功能可能受限`);
        }
      }
    });

    return recommendations;
  }
}

// 使用示例
const degradationManager = new GracefulDegradationManager();

// 应用所有降级策略
const supportStatus = degradationManager.applyAllStrategies();
console.log("功能支持状态:", supportStatus);

// 生成降级报告
const report = degradationManager.generateDegradationReport();
console.log("降级策略报告:", report);

// 在页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  degradationManager.applyAllStrategies();
});
```

## 📱 移动端兼容性

### 移动端适配管理器

```javascript
// 移动端兼容性管理器
class MobileCompatibilityManager {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.orientation = this.getOrientation();
    this.devicePixelRatio = window.devicePixelRatio || 1;

    this.init();
  }

  // 移动设备检测
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  detectTablet() {
    return /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
  }

  getOrientation() {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }

  // 初始化移动端适配
  init() {
    this.setupViewport();
    this.setupTouchHandling();
    this.setupOrientationChange();
    this.setupIOSFixes();
    this.setupAndroidFixes();
    this.setupClickDelay();
    this.setupScrollBehavior();
  }

  // 视口设置
  setupViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');

    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      document.head.appendChild(viewport);
    }

    // 基础视口设置
    let content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

    // iOS Safari特殊处理
    if (this.isIOS()) {
      content += ", viewport-fit=cover"; // 支持刘海屏
    }

    viewport.content = content;

    // 动态调整视口以防止缩放
    if (this.isMobile) {
      this.preventZoom();
    }
  }

  // 防止缩放
  preventZoom() {
    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener("gesturestart", (e) => {
      e.preventDefault();
    });
  }

  // 触摸处理设置
  setupTouchHandling() {
    // 阻止默认的触摸行为
    document.addEventListener(
      "touchmove",
      (e) => {
        // 允许滚动容器内的滚动
        if (!e.target.closest(".scrollable")) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // 改善触摸反馈
    this.addTouchFeedback();
  }

  // 添加触摸反馈
  addTouchFeedback() {
    const style = document.createElement("style");
    style.textContent = `
      .touch-feedback {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      .touch-feedback:active {
        background-color: rgba(0, 0, 0, 0.05);
        transform: scale(0.98);
        transition: all 0.1s ease;
      }
    `;
    document.head.appendChild(style);

    // 自动添加触摸反馈类
    document
      .querySelectorAll('button, .btn, [role="button"]')
      .forEach((element) => {
        element.classList.add("touch-feedback");
      });
  }

  // 屏幕方向变化处理
  setupOrientationChange() {
    const handleOrientationChange = () => {
      setTimeout(() => {
        this.orientation = this.getOrientation();
        document.body.classList.toggle(
          "portrait",
          this.orientation === "portrait"
        );
        document.body.classList.toggle(
          "landscape",
          this.orientation === "landscape"
        );

        // 触发自定义事件
        window.dispatchEvent(
          new CustomEvent("orientationchange", {
            detail: { orientation: this.orientation },
          })
        );

        // 重新计算视口高度
        this.updateViewportHeight();
      }, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    // 初始设置
    handleOrientationChange();
  }

  // 更新视口高度（解决移动端100vh问题）
  updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    // 添加CSS
    if (!document.querySelector("#vh-fix")) {
      const style = document.createElement("style");
      style.id = "vh-fix";
      style.textContent = `
        .full-height {
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
        }
      `;
      document.head.appendChild(style);
    }
  }

  // iOS特殊修复
  setupIOSFixes() {
    if (!this.isIOS()) return;

    // 修复iOS Safari的滚动问题
    document.body.style.webkitOverflowScrolling = "touch";

    // 修复iOS输入框缩放问题
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        if (parseFloat(getComputedStyle(input).fontSize) < 16) {
          input.style.fontSize = "16px";
        }
      });
    });

    // 修复iOS状态栏问题
    if (window.navigator.standalone) {
      document.body.classList.add("standalone");
    }

    // 修复iOS Safari的100vh问题
    this.fixIOSViewportHeight();
  }

  fixIOSViewportHeight() {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
  }

  // Android特殊修复
  setupAndroidFixes() {
    if (!this.isAndroid()) return;

    // 修复Android软键盘问题
    this.fixAndroidKeyboard();

    // 修复Android Chrome的滚动性能
    document.body.style.transform = "translateZ(0)";
  }

  fixAndroidKeyboard() {
    let initialViewportHeight = window.innerHeight;

    const checkKeyboard = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;

      if (heightDifference > 150) {
        // 软键盘打开
        document.body.classList.add("keyboard-open");
      } else {
        // 软键盘关闭
        document.body.classList.remove("keyboard-open");
        initialViewportHeight = currentHeight;
      }
    };

    window.addEventListener("resize", checkKeyboard);

    // 添加键盘样式
    const style = document.createElement("style");
    style.textContent = `
      .keyboard-open {
        height: 100vh;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }

  // 点击延迟修复
  setupClickDelay() {
    // 使用FastClick库的简化版本
    let touchStartX, touchStartY, touchStartTime;

    document.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    });

    document.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = Math.abs(touchEndX - touchStartX);
      const deltaY = Math.abs(touchEndY - touchStartY);
      const deltaTime = touchEndTime - touchStartTime;

      // 判断是否为点击（而非滑动）
      if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
        // 阻止默认的300ms延迟
        e.preventDefault();

        // 手动触发点击事件
        const target = document.elementFromPoint(touchEndX, touchEndY);
        if (target) {
          target.click();
        }
      }
    });
  }

  // 滚动行为优化
  setupScrollBehavior() {
    // 启用硬件加速滚动
    const scrollContainers = document.querySelectorAll(
      ".scroll-container, .scrollable"
    );
    scrollContainers.forEach((container) => {
      container.style.webkitOverflowScrolling = "touch";
      container.style.transform = "translateZ(0)";
    });

    // 防止过度滚动
    document.addEventListener(
      "touchmove",
      (e) => {
        const target = e.target.closest(".scroll-container");
        if (!target) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  // 平台检测方法
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  isSafari() {
    return (
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    );
  }

  isChrome() {
    return /Chrome/.test(navigator.userAgent);
  }

  // 响应式字体大小
  setupResponsiveFontSize() {
    const setFontSize = () => {
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );
      const fontSize = Math.max(16, Math.min(20, vw / 25));
      document.documentElement.style.fontSize = fontSize + "px";
    };

    setFontSize();
    window.addEventListener("resize", setFontSize);
    window.addEventListener("orientationchange", () => {
      setTimeout(setFontSize, 100);
    });
  }

  // 性能优化
  optimizeForMobile() {
    if (!this.isMobile) return;

    // 减少动画
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (prefersReducedMotion.matches) {
      document.body.classList.add("reduce-motion");
    }

    // 延迟加载非关键资源
    this.lazyLoadNonCriticalResources();

    // 优化图片
    this.optimizeImages();
  }

  lazyLoadNonCriticalResources() {
    // 延迟加载JavaScript
    const scripts = document.querySelectorAll("script[data-src]");
    scripts.forEach((script) => {
      setTimeout(() => {
        script.src = script.dataset.src;
      }, 1000);
    });

    // 延迟加载CSS
    const stylesheets = document.querySelectorAll("link[data-href]");
    stylesheets.forEach((link) => {
      setTimeout(() => {
        link.href = link.dataset.href;
      }, 500);
    });
  }

  optimizeImages() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      // 为高DPI屏幕提供2x图片
      if (this.devicePixelRatio >= 2 && img.dataset.src2x) {
        img.src = img.dataset.src2x;
      }

      // 添加loading="lazy"属性
      if (!img.loading) {
        img.loading = "lazy";
      }
    });
  }

  // 获取设备信息
  getDeviceInfo() {
    return {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isDesktop: !this.isMobile && !this.isTablet,
      orientation: this.orientation,
      devicePixelRatio: this.devicePixelRatio,
      platform: {
        ios: this.isIOS(),
        android: this.isAndroid(),
        safari: this.isSafari(),
        chrome: this.isChrome(),
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      support: {
        touch: "ontouchstart" in window,
        pointer: !!window.PointerEvent,
        deviceMotion: !!window.DeviceMotionEvent,
        orientation: !!window.DeviceOrientationEvent,
      },
    };
  }
}

// 使用示例
const mobileManager = new MobileCompatibilityManager();

// 获取设备信息
const deviceInfo = mobileManager.getDeviceInfo();
console.log("设备信息:", deviceInfo);

// 根据设备信息调整界面
if (deviceInfo.isMobile) {
  document.body.classList.add("mobile");
  mobileManager.setupResponsiveFontSize();
  mobileManager.optimizeForMobile();
}

// 监听方向变化
window.addEventListener("orientationchange", (e) => {
  console.log("屏幕方向变化:", e.detail.orientation);
});
```

## 📋 兼容性测试清单

### 自动化兼容性测试

```javascript
// 兼容性测试套件
class CompatibilityTestSuite {
  constructor() {
    this.testResults = {};
    this.testCategories = ["core", "modern", "mobile", "accessibility"];
  }

  // 运行完整测试套件
  async runFullTestSuite() {
    console.log("开始兼容性测试...");

    const results = {
      summary: {},
      details: {},
      timestamp: Date.now(),
    };

    for (const category of this.testCategories) {
      console.log(`测试类别: ${category}`);
      results.details[category] = await this.runCategoryTests(category);
    }

    results.summary = this.generateSummary(results.details);
    this.testResults = results;

    return results;
  }

  // 运行分类测试
  async runCategoryTests(category) {
    const tests = this.getTestsForCategory(category);
    const results = {};

    for (const [testName, testFunction] of Object.entries(tests)) {
      try {
        results[testName] = await testFunction();
      } catch (error) {
        results[testName] = {
          passed: false,
          error: error.message,
        };
      }
    }

    return results;
  }

  // 获取分类测试
  getTestsForCategory(category) {
    const testCategories = {
      core: {
        DOM_querySelector: this.testQuerySelector,
        Event_addEventListener: this.testEventListener,
        JSON_parse: this.testJSON,
        Array_methods: this.testArrayMethods,
        Object_methods: this.testObjectMethods,
        LocalStorage: this.testLocalStorage,
        SessionStorage: this.testSessionStorage,
      },

      modern: {
        Fetch_API: this.testFetch,
        Promise: this.testPromise,
        ES6_Classes: this.testES6Classes,
        Arrow_Functions: this.testArrowFunctions,
        Template_Literals: this.testTemplateLiterals,
        Destructuring: this.testDestructuring,
        Async_Await: this.testAsyncAwait,
        CSS_Grid: this.testCSSGrid,
        CSS_Flexbox: this.testCSSFlexbox,
        CSS_Variables: this.testCSSVariables,
      },

      mobile: {
        Touch_Events: this.testTouchEvents,
        Orientation_Change: this.testOrientationChange,
        Device_Motion: this.testDeviceMotion,
        Viewport_Meta: this.testViewportMeta,
        Mobile_Scrolling: this.testMobileScrolling,
      },

      accessibility: {
        ARIA_Support: this.testARIA,
        Keyboard_Navigation: this.testKeyboardNavigation,
        Screen_Reader: this.testScreenReader,
        Color_Contrast: this.testColorContrast,
        Focus_Management: this.testFocusManagement,
      },
    };

    return testCategories[category] || {};
  }

  // 核心功能测试
  testQuerySelector() {
    return {
      passed: !!(document.querySelector && document.querySelectorAll),
      details: "CSS选择器API支持",
    };
  }

  testEventListener() {
    return {
      passed: !!window.addEventListener,
      details: "事件监听器API支持",
    };
  }

  testJSON() {
    try {
      const obj = { test: "value" };
      const str = JSON.stringify(obj);
      const parsed = JSON.parse(str);
      return {
        passed: parsed.test === "value",
        details: "JSON序列化和解析",
      };
    } catch (e) {
      return {
        passed: false,
        details: "JSON API不支持",
      };
    }
  }

  testArrayMethods() {
    const arr = [1, 2, 3];
    const methods = ["forEach", "map", "filter", "reduce", "indexOf"];
    const supported = methods.filter(
      (method) => typeof arr[method] === "function"
    );

    return {
      passed: supported.length === methods.length,
      details: `支持 ${supported.length}/${methods.length} 个数组方法`,
      supported,
    };
  }

  testObjectMethods() {
    const methods = ["keys", "values", "entries", "assign"];
    const supported = methods.filter(
      (method) => typeof Object[method] === "function"
    );

    return {
      passed: supported.length >= 2, // 至少支持基础方法
      details: `支持 ${supported.length}/${methods.length} 个Object方法`,
      supported,
    };
  }

  testLocalStorage() {
    try {
      localStorage.setItem("test", "value");
      const value = localStorage.getItem("test");
      localStorage.removeItem("test");
      return {
        passed: value === "value",
        details: "LocalStorage读写正常",
      };
    } catch (e) {
      return {
        passed: false,
        details: "LocalStorage不可用",
      };
    }
  }

  testSessionStorage() {
    try {
      sessionStorage.setItem("test", "value");
      const value = sessionStorage.getItem("test");
      sessionStorage.removeItem("test");
      return {
        passed: value === "value",
        details: "SessionStorage读写正常",
      };
    } catch (e) {
      return {
        passed: false,
        details: "SessionStorage不可用",
      };
    }
  }

  // 现代API测试
  async testFetch() {
    if (!window.fetch) {
      return { passed: false, details: "Fetch API不支持" };
    }

    try {
      // 测试基本的fetch功能
      const response = await fetch("data:text/plain,test");
      const text = await response.text();
      return {
        passed: text === "test",
        details: "Fetch API正常工作",
      };
    } catch (e) {
      return {
        passed: false,
        details: "Fetch API执行失败",
      };
    }
  }

  testPromise() {
    if (!window.Promise) {
      return { passed: false, details: "Promise不支持" };
    }

    try {
      const promise = new Promise((resolve) => resolve("test"));
      return {
        passed: typeof promise.then === "function",
        details: "Promise API正常",
      };
    } catch (e) {
      return {
        passed: false,
        details: "Promise创建失败",
      };
    }
  }

  testES6Classes() {
    try {
      eval(`
        class TestClass {
          constructor(value) {
            this.value = value;
          }
          getValue() {
            return this.value;
          }
        }
        const instance = new TestClass('test');
        if (instance.getValue() !== 'test') throw new Error('Class method failed');
      `);
      return {
        passed: true,
        details: "ES6 Classes支持",
      };
    } catch (e) {
      return {
        passed: false,
        details: "ES6 Classes不支持",
      };
    }
  }

  testArrowFunctions() {
    try {
      eval(
        'const arrow = () => "test"; if (arrow() !== "test") throw new Error("Arrow function failed");'
      );
      return {
        passed: true,
        details: "箭头函数支持",
      };
    } catch (e) {
      return {
        passed: false,
        details: "箭头函数不支持",
      };
    }
  }

  testTemplateLiterals() {
    try {
      eval(
        'const value = "test"; const template = `Hello ${value}`; if (template !== "Hello test") throw new Error("Template literal failed");'
      );
      return {
        passed: true,
        details: "模板字符串支持",
      };
    } catch (e) {
      return {
        passed: false,
        details: "模板字符串不支持",
      };
    }
  }

  testDestructuring() {
    try {
      eval(
        'const {a, b} = {a: 1, b: 2}; if (a !== 1 || b !== 2) throw new Error("Destructuring failed");'
      );
      return {
        passed: true,
        details: "解构赋值支持",
      };
    } catch (e) {
      return {
        passed: false,
        details: "解构赋值不支持",
      };
    }
  }

  testAsyncAwait() {
    try {
      eval(
        '(async () => { const result = await Promise.resolve("test"); return result; })'
      );
      return {
        passed: true,
        details: "Async/Await支持",
      };
    } catch (e) {
      return {
        passed: false,
        details: "Async/Await不支持",
      };
    }
  }

  testCSSGrid() {
    return {
      passed: CSS.supports && CSS.supports("display", "grid"),
      details:
        CSS.supports && CSS.supports("display", "grid")
          ? "CSS Grid支持"
          : "CSS Grid不支持",
    };
  }

  testCSSFlexbox() {
    return {
      passed: CSS.supports && CSS.supports("display", "flex"),
      details:
        CSS.supports && CSS.supports("display", "flex")
          ? "CSS Flexbox支持"
          : "CSS Flexbox不支持",
    };
  }

  testCSSVariables() {
    return {
      passed: CSS.supports && CSS.supports("color", "var(--test)"),
      details:
        CSS.supports && CSS.supports("color", "var(--test)")
          ? "CSS变量支持"
          : "CSS变量不支持",
    };
  }

  // 移动端测试
  testTouchEvents() {
    return {
      passed: "ontouchstart" in window,
      details: "ontouchstart" in window ? "触摸事件支持" : "触摸事件不支持",
    };
  }

  testOrientationChange() {
    return {
      passed: "onorientationchange" in window,
      details:
        "onorientationchange" in window
          ? "屏幕方向变化支持"
          : "屏幕方向变化不支持",
    };
  }

  testDeviceMotion() {
    return {
      passed: !!window.DeviceMotionEvent,
      details: window.DeviceMotionEvent
        ? "设备运动事件支持"
        : "设备运动事件不支持",
    };
  }

  testViewportMeta() {
    const viewport = document.querySelector('meta[name="viewport"]');
    return {
      passed: !!viewport,
      details: viewport ? "Viewport meta标签已设置" : "Viewport meta标签未设置",
    };
  }

  testMobileScrolling() {
    const testDiv = document.createElement("div");
    testDiv.style.cssText =
      "-webkit-overflow-scrolling: touch; overflow: auto;";

    return {
      passed: testDiv.style.webkitOverflowScrolling === "touch",
      details:
        testDiv.style.webkitOverflowScrolling === "touch"
          ? "平滑滚动支持"
          : "平滑滚动不支持",
    };
  }

  // 可访问性测试
  testARIA() {
    const testDiv = document.createElement("div");
    testDiv.setAttribute("aria-label", "test");

    return {
      passed: testDiv.getAttribute("aria-label") === "test",
      details: "ARIA属性支持",
    };
  }

  testKeyboardNavigation() {
    const links = document.querySelectorAll(
      "a, button, input, select, textarea"
    );
    let focusableCount = 0;

    links.forEach((element) => {
      if (element.tabIndex >= 0) {
        focusableCount++;
      }
    });

    return {
      passed: focusableCount > 0,
      details: `发现 ${focusableCount} 个可聚焦元素`,
    };
  }

  testScreenReader() {
    // 检查是否有适当的标题结构
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const hasH1 = document.querySelector("h1");

    return {
      passed: headings.length > 0 && !!hasH1,
      details: `发现 ${headings.length} 个标题，${hasH1 ? "有" : "无"}H1标题`,
    };
  }

  testColorContrast() {
    // 简化的对比度测试
    const body = getComputedStyle(document.body);
    const hasGoodContrast = body.color !== body.backgroundColor;

    return {
      passed: hasGoodContrast,
      details: hasGoodContrast ? "文字和背景有对比度" : "文字和背景对比度不足",
    };
  }

  testFocusManagement() {
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return {
      passed: focusableElements.length > 0,
      details: `发现 ${focusableElements.length} 个可聚焦元素`,
    };
  }

  // 生成测试摘要
  generateSummary(details) {
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      categories: {},
    };

    Object.entries(details).forEach(([category, tests]) => {
      const categoryStats = {
        total: Object.keys(tests).length,
        passed: 0,
        failed: 0,
      };

      Object.values(tests).forEach((test) => {
        if (test.passed) {
          categoryStats.passed++;
          summary.passed++;
        } else {
          categoryStats.failed++;
          summary.failed++;
        }
        summary.total++;
      });

      categoryStats.percentage = Math.round(
        (categoryStats.passed / categoryStats.total) * 100
      );
      summary.categories[category] = categoryStats;
    });

    summary.percentage = Math.round((summary.passed / summary.total) * 100);

    return summary;
  }

  // 生成HTML报告
  generateHTMLReport() {
    const results = this.testResults;
    if (!results) {
      return "<p>请先运行测试</p>";
    }

    let html = `
      <div class="compatibility-report">
        <h2>浏览器兼容性测试报告</h2>
        <div class="summary">
          <h3>总体概况</h3>
          <p>总测试数: ${results.summary.total}</p>
          <p>通过率: ${results.summary.percentage}%</p>
          <p>通过: ${results.summary.passed}, 失败: ${results.summary.failed}</p>
        </div>
    `;

    Object.entries(results.details).forEach(([category, tests]) => {
      const categoryStats = results.summary.categories[category];
      html += `
        <div class="category">
          <h3>${category} (${categoryStats.percentage}%)</h3>
          <div class="tests">
      `;

      Object.entries(tests).forEach(([testName, result]) => {
        const status = result.passed ? "passed" : "failed";
        html += `
          <div class="test ${status}">
            <span class="test-name">${testName}</span>
            <span class="test-status">${result.passed ? "✓" : "✗"}</span>
            <span class="test-details">${result.details}</span>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `
        <style>
          .compatibility-report { font-family: Arial, sans-serif; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
          .category { margin-bottom: 20px; }
          .test { display: flex; justify-content: space-between; padding: 8px; margin: 2px 0; }
          .test.passed { background: #d4edda; color: #155724; }
          .test.failed { background: #f8d7da; color: #721c24; }
          .test-name { font-weight: bold; }
          .test-status { font-size: 18px; }
          .test-details { font-style: italic; }
        </style>
      </div>
    `;

    return html;
  }
}

// 使用示例
const testSuite = new CompatibilityTestSuite();

// 运行测试
testSuite.runFullTestSuite().then((results) => {
  console.log("兼容性测试完成:", results);

  // 显示报告
  const reportHTML = testSuite.generateHTMLReport();
  document.body.insertAdjacentHTML("beforeend", reportHTML);

  // 根据测试结果调整应用行为
  if (results.summary.percentage < 80) {
    console.warn("兼容性较低，启用降级模式");
    document.body.classList.add("compatibility-mode");
  }
});
```

---

_浏览器兼容性是 Web 开发的重要考虑因素。通过特性检测、polyfill 和优雅降级，可以为不同浏览器的用户提供一致的体验。_
