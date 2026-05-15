# JavaScript 防抖节流 - 性能优化核心技术

## 核心概念概述

**防抖（Debounce）**：在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时。

**节流（Throttle）**：限制一个函数在一定时间段内只能执行一次。

**应用场景**：搜索框输入、按钮点击、滚动事件、窗口 resize 等高频事件优化。

## 1. 防抖（Debounce）详解 ⏰

### 基础防抖实现

```javascript
// 基础防抖函数
function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    // 清除之前的定时器
    clearTimeout(timeout);

    // 设置新的定时器
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// 使用示例：搜索框输入
const searchInput = document.getElementById("search");
const debouncedSearch = debounce((value) => {
  console.log("搜索:", value);
  // 实际搜索逻辑
  fetch(`/api/search?q=${value}`)
    .then((response) => response.json())
    .then((data) => console.log(data));
}, 300);

searchInput.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});

// 原理演示
console.log("=== 防抖原理演示 ===");
const demoDebounce = debounce(() => {
  console.log("执行了！", new Date().toLocaleTimeString());
}, 1000);

// 连续调用
demoDebounce(); // 不会立即执行
demoDebounce(); // 重置计时器
demoDebounce(); // 重置计时器
// 只有最后一次调用后的1秒才执行
```

### 完整防抖实现

```javascript
// 完整的防抖实现，支持立即执行和取消
function debounce(func, wait, immediate = false) {
  let timeout;
  let result;

  const debounced = function (...args) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        result = func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      result = func.apply(this, args);
    }

    return result;
  };

  // 取消方法
  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  // 立即执行方法
  debounced.flush = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      return func.apply(this, arguments);
    }
  };

  return debounced;
}

// 测试立即执行
const immediateDebounce = debounce(
  () => {
    console.log("立即执行:", new Date().toLocaleTimeString());
  },
  1000,
  true
);

immediateDebounce(); // 立即执行
immediateDebounce(); // 不执行
immediateDebounce(); // 不执行

// 测试取消
const cancelableDebounce = debounce(() => {
  console.log("这不会被执行");
}, 1000);

cancelableDebounce();
cancelableDebounce.cancel(); // 取消执行
```

### 防抖的实际应用

```javascript
// 1. 搜索框自动完成
class SearchAutoComplete {
  constructor(input, apiUrl) {
    this.input = input;
    this.apiUrl = apiUrl;
    this.cache = new Map();

    // 防抖搜索
    this.debouncedSearch = debounce(this.search.bind(this), 300);

    this.bindEvents();
  }

  bindEvents() {
    this.input.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      if (query.length >= 2) {
        this.debouncedSearch(query);
      } else {
        this.clearResults();
      }
    });
  }

  async search(query) {
    // 检查缓存
    if (this.cache.has(query)) {
      this.displayResults(this.cache.get(query));
      return;
    }

    try {
      this.showLoading();

      const response = await fetch(
        `${this.apiUrl}?q=${encodeURIComponent(query)}`
      );
      const results = await response.json();

      // 缓存结果
      this.cache.set(query, results);
      this.displayResults(results);
    } catch (error) {
      console.error("搜索失败:", error);
      this.showError();
    } finally {
      this.hideLoading();
    }
  }

  displayResults(results) {
    // 显示搜索结果
    console.log("搜索结果:", results);
  }

  clearResults() {
    console.log("清空结果");
  }

  showLoading() {
    console.log("显示加载中...");
  }

  hideLoading() {
    console.log("隐藏加载中...");
  }

  showError() {
    console.log("显示错误信息");
  }
}

// 2. 表单验证
class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();

    this.setupValidation();
  }

  setupValidation() {
    const inputs = this.form.querySelectorAll("input[data-validate]");

    inputs.forEach((input) => {
      const debouncedValidate = debounce(() => {
        this.validateField(input);
      }, 500);

      input.addEventListener("input", debouncedValidate);
      input.addEventListener("blur", () => {
        // 失去焦点时立即验证
        debouncedValidate.flush();
      });
    });
  }

  validateField(input) {
    const rules = input.dataset.validate.split("|");
    const value = input.value.trim();
    const fieldErrors = [];

    rules.forEach((rule) => {
      if (rule === "required" && !value) {
        fieldErrors.push("此字段为必填项");
      } else if (rule === "email" && value && !this.isValidEmail(value)) {
        fieldErrors.push("请输入有效的邮箱地址");
      } else if (rule.startsWith("min:")) {
        const minLength = parseInt(rule.split(":")[1]);
        if (value.length < minLength) {
          fieldErrors.push(`最少需要${minLength}个字符`);
        }
      }
    });

    if (fieldErrors.length > 0) {
      this.errors.set(input.name, fieldErrors);
      this.showFieldError(input, fieldErrors[0]);
    } else {
      this.errors.delete(input.name);
      this.clearFieldError(input);
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showFieldError(input, message) {
    console.log(`字段 ${input.name} 错误:`, message);
  }

  clearFieldError(input) {
    console.log(`字段 ${input.name} 验证通过`);
  }
}

// 3. 窗口resize事件优化
class ResponsiveLayout {
  constructor() {
    this.handleResize = debounce(this.onResize.bind(this), 250);
    window.addEventListener("resize", this.handleResize);
  }

  onResize() {
    const width = window.innerWidth;

    if (width < 768) {
      this.setMobileLayout();
    } else if (width < 1024) {
      this.setTabletLayout();
    } else {
      this.setDesktopLayout();
    }

    // 重新计算布局
    this.recalculateLayout();
  }

  setMobileLayout() {
    console.log("切换到移动端布局");
  }

  setTabletLayout() {
    console.log("切换到平板布局");
  }

  setDesktopLayout() {
    console.log("切换到桌面布局");
  }

  recalculateLayout() {
    console.log("重新计算布局");
  }
}
```

## 2. 节流（Throttle）详解 🚦

### 基础节流实现

```javascript
// 基础节流函数
function throttle(func, wait) {
  let previous = 0;

  return function (...args) {
    const now = Date.now();

    if (now - previous > wait) {
      previous = now;
      func.apply(this, args);
    }
  };
}

// 使用示例：滚动事件
const throttledScroll = throttle(() => {
  console.log("滚动位置:", window.scrollY);
}, 100);

window.addEventListener("scroll", throttledScroll);

// 原理演示
console.log("=== 节流原理演示 ===");
const demoThrottle = throttle(() => {
  console.log("执行了！", new Date().toLocaleTimeString());
}, 1000);

// 连续调用
setInterval(() => {
  demoThrottle(); // 每秒最多执行一次
}, 100);
```

### 完整节流实现

```javascript
// 完整的节流实现，支持leading和trailing选项
function throttle(func, wait, options = {}) {
  let timeout;
  let previous = 0;

  const throttled = function (...args) {
    const now = Date.now();

    // 首次调用且不需要leading执行
    if (!previous && options.leading === false) {
      previous = now;
    }

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      // 可以执行
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout && options.trailing !== false) {
      // 设置trailing执行
      timeout = setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };

  // 取消方法
  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = null;
  };

  // 立即执行方法
  throttled.flush = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      previous = Date.now();
      return func.apply(this, arguments);
    }
  };

  return throttled;
}

// 测试不同选项
const leadingFalse = throttle(
  () => {
    console.log("不在开始执行");
  },
  1000,
  { leading: false }
);

const trailingFalse = throttle(
  () => {
    console.log("不在结束执行");
  },
  1000,
  { trailing: false }
);

const both = throttle(
  () => {
    console.log("开始和结束都执行");
  },
  1000,
  { leading: true, trailing: true }
);
```

### 节流的实际应用

```javascript
// 1. 无限滚动加载
class InfiniteScroll {
  constructor(container, loadMore) {
    this.container = container;
    this.loadMore = loadMore;
    this.loading = false;

    // 节流滚动事件
    this.throttledScroll = throttle(this.checkScroll.bind(this), 100);

    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener("scroll", this.throttledScroll);
  }

  checkScroll() {
    if (this.loading) return;

    const { scrollTop, scrollHeight, clientHeight } = this.container;
    const threshold = 100; // 距离底部100px时触发

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      this.loading = true;
      this.loadMore().finally(() => {
        this.loading = false;
      });
    }
  }

  destroy() {
    this.container.removeEventListener("scroll", this.throttledScroll);
  }
}

// 2. 鼠标移动事件优化
class MouseTracker {
  constructor(element) {
    this.element = element;
    this.position = { x: 0, y: 0 };

    // 节流鼠标移动事件
    this.throttledMouseMove = throttle(this.onMouseMove.bind(this), 16); // ~60fps

    this.bindEvents();
  }

  bindEvents() {
    this.element.addEventListener("mousemove", this.throttledMouseMove);
  }

  onMouseMove(event) {
    this.position.x = event.clientX;
    this.position.y = event.clientY;

    // 更新UI
    this.updateCursor();
    this.updateTooltip();
  }

  updateCursor() {
    console.log(`鼠标位置: (${this.position.x}, ${this.position.y})`);
  }

  updateTooltip() {
    // 更新提示框位置
  }
}

// 3. 按钮点击防重复
class SubmitButton {
  constructor(button, submitHandler) {
    this.button = button;
    this.submitHandler = submitHandler;

    // 节流点击事件，防止重复提交
    this.throttledSubmit = throttle(this.handleSubmit.bind(this), 2000, {
      leading: true, // 立即执行第一次
      trailing: false, // 不执行最后一次
    });

    this.bindEvents();
  }

  bindEvents() {
    this.button.addEventListener("click", this.throttledSubmit);
  }

  async handleSubmit(event) {
    event.preventDefault();

    this.setLoading(true);

    try {
      await this.submitHandler();
      this.showSuccess();
    } catch (error) {
      this.showError(error);
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    this.button.disabled = loading;
    this.button.textContent = loading ? "提交中..." : "提交";
  }

  showSuccess() {
    console.log("提交成功");
  }

  showError(error) {
    console.error("提交失败:", error);
  }
}

// 4. API请求限流
class APIThrottler {
  constructor(maxRequestsPerSecond = 10) {
    this.maxRequests = maxRequestsPerSecond;
    this.requests = [];

    // 节流函数用于清理过期请求记录
    this.cleanupThrottled = throttle(this.cleanup.bind(this), 1000);
  }

  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const now = Date.now();

      // 清理过期记录
      this.cleanupThrottled();

      // 检查是否超过限制
      const recentRequests = this.requests.filter((time) => now - time < 1000);

      if (recentRequests.length >= this.maxRequests) {
        const oldestRequest = Math.min(...recentRequests);
        const delay = 1000 - (now - oldestRequest);

        setTimeout(() => {
          this.makeRequest(url, options).then(resolve).catch(reject);
        }, delay);
      } else {
        this.makeRequest(url, options).then(resolve).catch(reject);
      }

      this.requests.push(now);
    });
  }

  async makeRequest(url, options) {
    try {
      const response = await fetch(url, options);
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  cleanup() {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < 1000);
  }
}
```

## 3. 防抖 vs 节流对比 ⚖️

### 场景对比分析

```javascript
// 对比演示函数
function createComparison() {
  let debounceCount = 0;
  let throttleCount = 0;
  let normalCount = 0;

  const normal = () => {
    normalCount++;
    console.log(`普通函数执行次数: ${normalCount}`);
  };

  const debouncedFunc = debounce(() => {
    debounceCount++;
    console.log(`防抖函数执行次数: ${debounceCount}`);
  }, 1000);

  const throttledFunc = throttle(() => {
    throttleCount++;
    console.log(`节流函数执行次数: ${throttleCount}`);
  }, 1000);

  return { normal, debouncedFunc, throttledFunc };
}

const { normal, debouncedFunc, throttledFunc } = createComparison();

// 模拟快速连续调用
console.log("=== 开始快速调用 ===");
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    normal(); // 执行10次
    debouncedFunc(); // 只执行1次（最后一次）
    throttledFunc(); // 执行1次（第一次）
  }, i * 100);
}

// 使用场景决策表
const scenarioGuide = {
  搜索框输入: {
    推荐: "防抖",
    原因: "只关心用户最终输入的内容",
    延迟: "300-500ms",
  },
  滚动事件处理: {
    推荐: "节流",
    原因: "需要持续响应滚动过程",
    延迟: "16-100ms",
  },
  按钮点击: {
    推荐: "防抖",
    原因: "防止意外多次点击",
    延迟: "300-1000ms",
  },
  窗口resize: {
    推荐: "防抖",
    原因: "只关心最终窗口大小",
    延迟: "100-300ms",
  },
  鼠标移动: {
    推荐: "节流",
    原因: "需要流畅的交互反馈",
    延迟: "16ms (60fps)",
  },
  表单验证: {
    推荐: "防抖",
    原因: "避免用户输入时频繁验证",
    延迟: "300-500ms",
  },
  自动保存: {
    推荐: "防抖",
    原因: "用户停止编辑后保存",
    延迟: "1000-2000ms",
  },
  监控数据上报: {
    推荐: "节流",
    原因: "定期上报，不遗漏数据",
    延迟: "1000-5000ms",
  },
};

console.table(scenarioGuide);
```

### 性能对比

```javascript
// 性能测试
function performanceTest() {
  const iterations = 100000;

  // 测试函数
  const testFunc = () => {
    Math.random() * 1000;
  };

  // 原始函数
  console.time("原始函数");
  for (let i = 0; i < iterations; i++) {
    testFunc();
  }
  console.timeEnd("原始函数");

  // 防抖函数
  const debouncedTest = debounce(testFunc, 100);
  console.time("防抖函数");
  for (let i = 0; i < iterations; i++) {
    debouncedTest();
  }
  console.timeEnd("防抖函数");

  // 节流函数
  const throttledTest = throttle(testFunc, 100);
  console.time("节流函数");
  for (let i = 0; i < iterations; i++) {
    throttledTest();
  }
  console.timeEnd("节流函数");
}

// performanceTest();
```

## 4. 高级应用场景 🚀

### 智能防抖节流

```javascript
// 智能防抖：根据用户行为调整延迟
class SmartDebounce {
  constructor(func, baseWait = 300) {
    this.func = func;
    this.baseWait = baseWait;
    this.timeout = null;
    this.callCount = 0;
    this.lastCallTime = 0;
  }

  call(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    // 如果调用频率很高，增加延迟
    if (timeSinceLastCall < 100) {
      this.callCount++;
    } else {
      this.callCount = 1;
    }

    // 根据调用频率动态调整延迟
    const dynamicWait = this.baseWait + this.callCount * 50;
    const maxWait = this.baseWait * 3;
    const actualWait = Math.min(dynamicWait, maxWait);

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.func.apply(this, args);
      this.callCount = 0;
    }, actualWait);

    this.lastCallTime = now;
  }
}

// 自适应节流：根据设备性能调整频率
class AdaptiveThrottle {
  constructor(func, baseWait = 100) {
    this.func = func;
    this.baseWait = baseWait;
    this.lastExecution = 0;
    this.executionTimes = [];
    this.adaptiveWait = baseWait;
  }

  call(...args) {
    const now = Date.now();

    if (now - this.lastExecution >= this.adaptiveWait) {
      const startTime = performance.now();

      this.func.apply(this, args);

      const executionTime = performance.now() - startTime;
      this.executionTimes.push(executionTime);

      // 保持最近10次执行时间
      if (this.executionTimes.length > 10) {
        this.executionTimes.shift();
      }

      // 根据平均执行时间调整节流间隔
      const avgExecutionTime =
        this.executionTimes.reduce((a, b) => a + b, 0) /
        this.executionTimes.length;

      if (avgExecutionTime > 16) {
        // 超过16ms，降低频率
        this.adaptiveWait = Math.min(this.baseWait * 2, 200);
      } else if (avgExecutionTime < 8) {
        // 小于8ms，可以提高频率
        this.adaptiveWait = Math.max(this.baseWait / 2, 50);
      }

      this.lastExecution = now;
    }
  }
}
```

### 组合防抖节流

```javascript
// 组合防抖和节流
function debounceThrottle(func, debounceWait, throttleWait) {
  let debounceTimeout;
  let throttleTimeout;
  let lastThrottleTime = 0;

  return function (...args) {
    const now = Date.now();

    // 节流逻辑：确保最小执行间隔
    if (now - lastThrottleTime >= throttleWait) {
      lastThrottleTime = now;
      func.apply(this, args);
    }

    // 防抖逻辑：确保最后一次调用会执行
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (now - lastThrottleTime >= throttleWait) {
        func.apply(this, args);
        lastThrottleTime = Date.now();
      }
    }, debounceWait);
  };
}

// 使用示例：搜索框，既要响应式搜索，又要避免过于频繁
const smartSearch = debounceThrottle(
  (query) => {
    console.log("智能搜索:", query);
  },
  300,
  1000
);

// RequestAnimationFrame 节流
function rafThrottle(func) {
  let isScheduled = false;

  return function (...args) {
    if (isScheduled) return;

    isScheduled = true;
    requestAnimationFrame(() => {
      func.apply(this, args);
      isScheduled = false;
    });
  };
}

// 适用于动画相关的事件处理
const animationHandler = rafThrottle(() => {
  console.log("动画帧更新");
});
```

### 异步防抖节流

```javascript
// 异步防抖
function asyncDebounce(asyncFunc, wait) {
  let timeout;
  let pendingPromise;

  return function (...args) {
    return new Promise((resolve, reject) => {
      // 取消之前的调用
      if (timeout) {
        clearTimeout(timeout);
      }

      // 如果有正在执行的异步操作，等待它完成
      if (pendingPromise) {
        pendingPromise.finally(() => {
          timeout = setTimeout(async () => {
            try {
              pendingPromise = asyncFunc.apply(this, args);
              const result = await pendingPromise;
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              pendingPromise = null;
            }
          }, wait);
        });
      } else {
        timeout = setTimeout(async () => {
          try {
            pendingPromise = asyncFunc.apply(this, args);
            const result = await pendingPromise;
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
          }
        }, wait);
      }
    });
  };
}

// 异步节流
function asyncThrottle(asyncFunc, wait) {
  let lastExecution = 0;
  let pendingPromise;

  return function (...args) {
    const now = Date.now();

    if (pendingPromise) {
      return pendingPromise;
    }

    if (now - lastExecution >= wait) {
      lastExecution = now;

      pendingPromise = asyncFunc.apply(this, args);

      return pendingPromise.finally(() => {
        pendingPromise = null;
      });
    }

    return Promise.resolve();
  };
}

// 使用示例
const asyncSearch = async (query) => {
  const response = await fetch(`/api/search?q=${query}`);
  return response.json();
};

const debouncedAsyncSearch = asyncDebounce(asyncSearch, 300);
const throttledAsyncSearch = asyncThrottle(asyncSearch, 1000);

// 使用
debouncedAsyncSearch("javascript").then((results) => {
  console.log("防抖搜索结果:", results);
});

throttledAsyncSearch("react").then((results) => {
  console.log("节流搜索结果:", results);
});
```

## 5. 性能优化最佳实践 📊

### 内存优化

```javascript
// 避免内存泄漏的防抖节流
class OptimizedDebounceThrottle {
  constructor() {
    this.timers = new Map();
    this.callbacks = new WeakMap();
  }

  debounce(key, func, wait) {
    // 清除之前的定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const timer = setTimeout(() => {
      func();
      this.timers.delete(key);
    }, wait);

    this.timers.set(key, timer);
  }

  throttle(key, func, wait) {
    const lastExecution = this.callbacks.get(func) || 0;
    const now = Date.now();

    if (now - lastExecution >= wait) {
      this.callbacks.set(func, now);
      func();
    }
  }

  clear(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  destroy() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}

// 全局实例
const optimizedDT = new OptimizedDebounceThrottle();

// 使用示例
const searchHandler = () => console.log("搜索执行");
optimizedDT.debounce("search", searchHandler, 300);

// 页面卸载时清理
window.addEventListener("beforeunload", () => {
  optimizedDT.destroy();
});
```

### 批量处理优化

```javascript
// 批量防抖：收集多次调用，一次处理
function batchDebounce(func, wait, batchSize = 10) {
  let timeout;
  let batch = [];

  return function (item) {
    batch.push(item);

    // 达到批次大小，立即处理
    if (batch.length >= batchSize) {
      clearTimeout(timeout);
      const currentBatch = [...batch];
      batch = [];
      func(currentBatch);
      return;
    }

    // 否则等待更多项目
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (batch.length > 0) {
        const currentBatch = [...batch];
        batch = [];
        func(currentBatch);
      }
    }, wait);
  };
}

// 使用示例：批量上传文件
const batchUpload = batchDebounce(
  (files) => {
    console.log(`批量上传 ${files.length} 个文件:`, files);
    // 实际上传逻辑
  },
  1000,
  5
);

// 模拟文件选择
for (let i = 1; i <= 12; i++) {
  setTimeout(() => {
    batchUpload(`file${i}.jpg`);
  }, i * 100);
}
```

### 可视化调试工具

```javascript
// 防抖节流调试工具
class DebounceThrottleDebugger {
  constructor() {
    this.logs = [];
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  log(type, funcName, action) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, type, funcName, action });

    console.log(`[${timestamp}] ${type} - ${funcName}: ${action}`);
  }

  createDebuggedDebounce(func, wait, name = 'anonymous') {
    this.log('DEBOUNCE', name, 'created');

    return debounce((...args) => {
      this.log('DEBOUNCE', name, 'executed');
      return func.apply(this, args);
    }, wait);
  }

  createDebuggedThrottle(func, wait, name = 'anonymous') {
    this.log('THROTTLE', name, 'created');

    return throttle((...args) => {
      this.log('THROTTLE', name, 'executed');
      return func.apply(this, args);
    }, wait);
  }

  getStats() {
    const stats = {
      total: this.logs.length,
      debounce: this.logs.filter(log => log.type === 'DEBOUNCE').length,
      throttle: this.logs.filter(log => log.type === 'THROTTLE').length
    };

    console.table(stats);
    return stats;
  }

  clearLogs() {
    this.logs = [];
  }
}

// 使用调试器
const debugger = new DebounceThrottleDebugger();
debugger.enable();

const debuggedSearch = debugger.createDebuggedDebounce(
  (query) => console.log('搜索:', query),
  300,
  'searchFunction'
);

const debuggedScroll = debugger.createDebuggedThrottle(
  () => console.log('滚动处理'),
  100,
  'scrollHandler'
);

// 查看统计
setTimeout(() => {
  debugger.getStats();
}, 5000);
```

## 面试重点总结 🎯

### 必须掌握的核心概念

1. **防抖 vs 节流的区别**

   - 防抖：延迟执行，重复触发会重置
   - 节流：限制频率，固定时间间隔执行
   - 适用场景的选择

2. **实现原理**

   - setTimeout/clearTimeout 的使用
   - 时间戳对比的逻辑
   - this 绑定和参数传递

3. **高级特性**
   - leading/trailing 选项
   - 取消和立即执行方法
   - 异步函数的处理

### 常考面试题类型

```javascript
// 1. 基础实现
// 手写防抖和节流函数

// 2. 应用场景
// 什么时候用防抖？什么时候用节流？

// 3. 实际问题
// 搜索框应该用防抖还是节流？为什么？

// 4. 性能优化
// 如何优化防抖节流的性能？

// 5. 边界情况
// 异步函数如何实现防抖节流？
```

### 实际应用场景速查

| 场景        | 推荐方案 | 延迟时间   | 原因               |
| ----------- | -------- | ---------- | ------------------ |
| 搜索框输入  | 防抖     | 300-500ms  | 只关心最终输入     |
| 滚动事件    | 节流     | 16-100ms   | 需要持续响应       |
| 按钮点击    | 防抖     | 300-1000ms | 防止重复提交       |
| 窗口 resize | 防抖     | 100-300ms  | 只关心最终尺寸     |
| 鼠标移动    | 节流     | 16ms       | 保持流畅体验       |
| 表单验证    | 防抖     | 300-500ms  | 避免频繁验证       |
| 自动保存    | 防抖     | 1-2 秒     | 用户停止编辑后保存 |

### 记忆要点

- **防抖**：最后一次说了算，适合"停止后执行"的场景
- **节流**：固定节拍执行，适合"持续响应"的场景
- **性能优化**：避免内存泄漏，合理选择延迟时间
- **实际应用**：根据用户体验需求选择合适的方案

掌握防抖节流是前端性能优化的必备技能！
