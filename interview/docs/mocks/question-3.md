# 模拟面试三 - 详细回答

## 🌐 浏览器相关

### 浏览器：浏览器事件循环环

**问题**：描述浏览器的事件循环机制。

**回答**：

浏览器事件循环是 JavaScript 执行异步任务的核心机制，确保单线程的 JavaScript 能够处理并发操作。

**事件循环组成部分**：

1. **调用栈（Call Stack）**：执行同步代码
2. **任务队列（Task Queue）**：存放宏任务
3. **微任务队列（Microtask Queue）**：存放微任务
4. **Web APIs**：处理异步操作

```javascript
// 事件循环示例
console.log("1"); // 同步任务

setTimeout(() => {
  console.log("2"); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // 微任务
});

console.log("4"); // 同步任务

// 输出顺序：1 -> 4 -> 3 -> 2
```

**执行顺序详解**：

```javascript
// 复杂的事件循环示例
async function asyncFunction() {
  console.log("async start");

  await new Promise((resolve) => {
    console.log("promise executor");
    resolve();
  });

  console.log("async end");
}

console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

asyncFunction();

new Promise((resolve) => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise1 resolved");
});

console.log("script end");

/*
输出顺序：
script start
async start
promise executor
promise1
script end
async end
promise1 resolved
setTimeout
*/
```

**宏任务 vs 微任务**：

```javascript
// 宏任务（Macrotasks）
const macroTasks = {
  setTimeout: () => setTimeout(() => console.log("setTimeout"), 0),
  setInterval: () => setInterval(() => console.log("setInterval"), 100),
  setImmediate: () => setImmediate(() => console.log("setImmediate")), // Node.js
  requestAnimationFrame: () => requestAnimationFrame(() => console.log("RAF")),
  I_O: () => {
    // 文件读取、网络请求等
  },
};

// 微任务（Microtasks）
const microTasks = {
  Promise: () => Promise.resolve().then(() => console.log("Promise")),
  async_await: async () => {
    await Promise.resolve();
    console.log("async/await");
  },
  queueMicrotask: () => queueMicrotask(() => console.log("queueMicrotask")),
  MutationObserver: () => {
    const observer = new MutationObserver(() =>
      console.log("MutationObserver")
    );
    const div = document.createElement("div");
    observer.observe(div, { childList: true });
    div.appendChild(document.createTextNode(""));
  },
};
```

**事件循环实现模拟**：

```javascript
class EventLoop {
  constructor() {
    this.callStack = [];
    this.macroTaskQueue = [];
    this.microTaskQueue = [];
    this.isRunning = false;
  }

  // 添加宏任务
  addMacroTask(task) {
    this.macroTaskQueue.push(task);
    if (!this.isRunning) {
      this.run();
    }
  }

  // 添加微任务
  addMicroTask(task) {
    this.microTaskQueue.push(task);
  }

  // 执行事件循环
  run() {
    this.isRunning = true;

    while (this.macroTaskQueue.length > 0 || this.microTaskQueue.length > 0) {
      // 1. 执行一个宏任务
      if (this.macroTaskQueue.length > 0) {
        const macroTask = this.macroTaskQueue.shift();
        this.executeTask(macroTask);
      }

      // 2. 执行所有微任务
      while (this.microTaskQueue.length > 0) {
        const microTask = this.microTaskQueue.shift();
        this.executeTask(microTask);
      }
    }

    this.isRunning = false;
  }

  executeTask(task) {
    try {
      task();
    } catch (error) {
      console.error("Task execution error:", error);
    }
  }
}

// 使用示例
const eventLoop = new EventLoop();

eventLoop.addMacroTask(() => console.log("Macro 1"));
eventLoop.addMicroTask(() => console.log("Micro 1"));
eventLoop.addMacroTask(() => console.log("Macro 2"));
eventLoop.addMicroTask(() => console.log("Micro 2"));
```

### 浏览器：如何定位内存泄露

**问题**：如何在浏览器中定位和解决内存泄漏？

**回答**：

内存泄漏是指程序中已分配的内存无法被垃圾回收器回收，导致内存使用量持续增长。

**常见内存泄漏原因**：

```javascript
// 1. 全局变量
window.globalArray = [];
function addData() {
  window.globalArray.push(new Array(1000000)); // 持续增长
}

// 2. 未清理的事件监听器
class Component {
  constructor() {
    this.handleScroll = this.handleScroll.bind(this);
    window.addEventListener("scroll", this.handleScroll);
  }

  // 忘记移除监听器
  destroy() {
    // window.removeEventListener('scroll', this.handleScroll); // 应该添加这行
  }

  handleScroll() {
    // 处理滚动
  }
}

// 3. 闭包引用
function createClosure() {
  const largeData = new Array(1000000).fill("data");

  return function () {
    // 即使不使用largeData，它也不会被回收
    console.log("closure executed");
  };
}

// 4. DOM引用
class DOMManager {
  constructor() {
    this.elements = [];
  }

  addElement() {
    const div = document.createElement("div");
    document.body.appendChild(div);
    this.elements.push(div); // 保持引用

    // 即使从DOM中移除，elements数组仍然引用着这些节点
    setTimeout(() => {
      document.body.removeChild(div);
      // 忘记从数组中移除引用
    }, 1000);
  }
}
```

**检测内存泄漏的方法**：

**1. Chrome DevTools Memory 面板**

```javascript
// 内存快照对比工具
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
  }

  // 创建内存快照
  takeSnapshot(label) {
    // 在 DevTools 中手动创建快照
    console.log(`Snapshot taken: ${label}`);

    // 或使用 Performance API
    if (performance.memory) {
      const memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now(),
        label,
      };

      this.snapshots.push(memory);
      return memory;
    }
  }

  // 比较快照
  compareSnapshots(snapshot1, snapshot2) {
    const diff = {
      usedDiff: snapshot2.used - snapshot1.used,
      totalDiff: snapshot2.total - snapshot1.total,
      timeDiff: snapshot2.timestamp - snapshot1.timestamp,
    };

    console.log("Memory diff:", diff);
    return diff;
  }

  // 监控内存使用
  startMonitoring(interval = 5000) {
    this.monitoringInterval = setInterval(() => {
      if (performance.memory) {
        const current = performance.memory.usedJSHeapSize;
        console.log(
          `Current memory usage: ${(current / 1024 / 1024).toFixed(2)} MB`
        );

        // 检测内存增长
        if (this.snapshots.length > 0) {
          const last = this.snapshots[this.snapshots.length - 1];
          const growth = current - last.used;
          if (growth > 10 * 1024 * 1024) {
            // 10MB增长
            console.warn("Potential memory leak detected!");
          }
        }
      }
    }, interval);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}
```

**2. 自动化内存泄漏检测**

```javascript
// 内存泄漏检测工具
class LeakDetector {
  constructor() {
    this.objects = new WeakMap();
    this.references = new Map();
  }

  // 跟踪对象
  track(obj, name) {
    const id = this.generateId();
    this.objects.set(obj, { id, name, timestamp: Date.now() });
    this.references.set(id, new WeakRef(obj));

    return id;
  }

  // 检查泄漏
  checkLeaks() {
    const leaks = [];

    for (const [id, ref] of this.references.entries()) {
      const obj = ref.deref();
      if (obj) {
        const info = this.objects.get(obj);
        if (info && Date.now() - info.timestamp > 60000) {
          // 1分钟后仍存在
          leaks.push(info);
        }
      } else {
        // 对象已被回收，从引用中移除
        this.references.delete(id);
      }
    }

    return leaks;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// 使用示例
const detector = new LeakDetector();

function createPotentialLeak() {
  const obj = { data: new Array(100000) };
  detector.track(obj, "LargeObject");

  // 模拟忘记清理
  setTimeout(() => {
    const leaks = detector.checkLeaks();
    if (leaks.length > 0) {
      console.warn("Memory leaks detected:", leaks);
    }
  }, 65000);
}
```

**3. 实际项目中的内存管理**

```javascript
// 内存安全的组件基类
class MemorySafeComponent {
  constructor() {
    this.eventListeners = [];
    this.timers = [];
    this.subscriptions = [];
    this.observers = [];
  }

  // 安全的事件监听
  addEventListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.eventListeners.push({ element, event, handler, options });
  }

  // 安全的定时器
  setTimeout(callback, delay) {
    const id = setTimeout(callback, delay);
    this.timers.push(id);
    return id;
  }

  setInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.timers.push(id);
    return id;
  }

  // 安全的观察者
  observe(target, callback, options) {
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    this.observers.push(observer);
    return observer;
  }

  // 清理所有资源
  destroy() {
    // 清理事件监听器
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventListeners = [];

    // 清理定时器
    this.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    this.timers = [];

    // 清理观察者
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    // 清理订阅
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
  }
}

// 使用示例
class MyComponent extends MemorySafeComponent {
  constructor() {
    super();
    this.init();
  }

  init() {
    // 安全的事件监听
    this.addEventListener(window, "resize", this.handleResize.bind(this));

    // 安全的定时器
    this.setInterval(() => {
      this.updateData();
    }, 1000);

    // 安全的DOM观察
    this.observe(document.body, this.handleMutation.bind(this), {
      childList: true,
      subtree: true,
    });
  }

  handleResize() {
    console.log("Window resized");
  }

  updateData() {
    console.log("Data updated");
  }

  handleMutation(mutations) {
    console.log("DOM mutated", mutations);
  }
}

// 组件使用
const component = new MyComponent();

// 组件销毁时自动清理所有资源
setTimeout(() => {
  component.destroy();
}, 10000);
```

**内存泄漏预防最佳实践**：

```javascript
// 最佳实践集合
const MemoryBestPractices = {
  // 1. 使用WeakMap和WeakSet
  useWeakReferences() {
    const cache = new WeakMap(); // 而不是 Map

    function cacheData(obj, data) {
      cache.set(obj, data);
    }

    // 当obj被垃圾回收时，cache中的条目也会自动删除
  },

  // 2. 及时清理DOM引用
  manageDOMReferences() {
    class DOMManager {
      constructor() {
        this.elementRefs = new Set();
      }

      createElement(tag) {
        const element = document.createElement(tag);
        this.elementRefs.add(element);
        return element;
      }

      removeElement(element) {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.elementRefs.delete(element);
      }

      cleanup() {
        this.elementRefs.forEach((element) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });
        this.elementRefs.clear();
      }
    }
  },

  // 3. 使用AbortController管理请求
  manageAsyncOperations() {
    class RequestManager {
      constructor() {
        this.controllers = new Set();
      }

      async fetch(url, options = {}) {
        const controller = new AbortController();
        this.controllers.add(controller);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          return response;
        } finally {
          this.controllers.delete(controller);
        }
      }

      abortAll() {
        this.controllers.forEach((controller) => controller.abort());
        this.controllers.clear();
      }
    }
  },
};
```

## ⚙️ 工程化

### 工程化：谈下 webpack loader 的原理

**问题**：webpack loader 是如何工作的？如何自定义 loader？

**回答**：

webpack loader 是用于转换模块源代码的函数，它使 webpack 能够处理各种类型的文件。

**Loader 工作原理**：

```javascript
// Loader 的本质是一个函数
function myLoader(source, map, meta) {
  // source: 文件内容字符串
  // map: source map 对象
  // meta: 元数据对象

  // 处理源代码
  const transformedSource = transformCode(source);

  // 返回处理后的代码
  return transformedSource;
}

// 异步 Loader
function asyncLoader(source, map, meta) {
  const callback = this.async(); // 获取异步回调

  // 异步处理
  setTimeout(() => {
    const result = processAsync(source);
    callback(null, result, map, meta);
  }, 100);
}

// 导出 loader
module.exports = myLoader;
```

**Loader 执行机制**：

```javascript
// webpack 内部 loader 执行流程模拟
class LoaderRunner {
  constructor() {
    this.loaders = [];
  }

  // 添加 loader
  addLoader(loader) {
    this.loaders.push(loader);
  }

  // 执行 loader 链
  async runLoaders(resource, source) {
    let currentSource = source;

    // Loader 从右到左（从下到上）执行
    for (let i = this.loaders.length - 1; i >= 0; i--) {
      const loader = this.loaders[i];

      // 创建 loader 上下文
      const context = this.createContext(resource);

      try {
        currentSource = await this.executeLoader(
          loader,
          currentSource,
          context
        );
      } catch (error) {
        throw new Error(`Loader ${loader.name} failed: ${error.message}`);
      }
    }

    return currentSource;
  }

  createContext(resource) {
    return {
      resource,
      resourcePath: resource,
      async: () => {
        return (err, result, map, meta) => {
          if (err) throw err;
          return result;
        };
      },
      callback: (err, result, map, meta) => {
        if (err) throw err;
        return result;
      },
      query: {},
      emitFile: (name, content) => {
        // 输出文件
        console.log(`Emit file: ${name}`);
      },
    };
  }

  executeLoader(loader, source, context) {
    return new Promise((resolve, reject) => {
      try {
        const result = loader.call(context, source);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
```

**自定义 Loader 示例**：

**1. 简单的文本替换 Loader**

```javascript
// replace-loader.js
const { getOptions } = require("loader-utils");

module.exports = function (source) {
  // 获取 loader 配置选项
  const options = getOptions(this) || {};
  const { search, replace } = options;

  if (!search || replace === undefined) {
    return source;
  }

  // 执行替换
  const result = source.replace(new RegExp(search, "g"), replace);

  return result;
};

// webpack.config.js 中使用
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "./loaders/replace-loader.js",
            options: {
              search: "console.log",
              replace: "logger.info",
            },
          },
        ],
      },
    ],
  },
};
```

**2. CSS 变量注入 Loader**

```javascript
// css-vars-loader.js
const postcss = require("postcss");
const { getOptions } = require("loader-utils");

module.exports = function (source) {
  const callback = this.async();
  const options = getOptions(this) || {};

  // 使用 PostCSS 处理 CSS
  postcss([
    // 注入 CSS 变量
    function injectVars(root) {
      const vars = options.vars || {};

      // 在根节点添加变量
      const varDeclarations = Object.entries(vars)
        .map(([key, value]) => `--${key}: ${value};`)
        .join("\n  ");

      if (varDeclarations) {
        root.prepend(
          postcss.rule({
            selector: ":root",
            source: root.source,
          })
        );

        const rootRule = root.first;
        rootRule.append(varDeclarations);
      }
    },
  ])
    .process(source, { from: this.resourcePath })
    .then((result) => {
      callback(null, result.css, result.map);
    })
    .catch((error) => {
      callback(error);
    });
};

// 使用配置
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "./loaders/css-vars-loader.js",
            options: {
              vars: {
                "primary-color": "#3498db",
                "font-size": "16px",
              },
            },
          },
        ],
      },
    ],
  },
};
```

**3. 模板编译 Loader**

```javascript
// template-loader.js
const { getOptions, interpolateName } = require("loader-utils");

module.exports = function (source) {
  const options = getOptions(this) || {};
  const { templateEngine = "handlebars" } = options;

  // 根据模板引擎编译模板
  let compiledTemplate;

  switch (templateEngine) {
    case "handlebars":
      compiledTemplate = compileHandlebars(source);
      break;
    case "ejs":
      compiledTemplate = compileEJS(source);
      break;
    default:
      throw new Error(`Unsupported template engine: ${templateEngine}`);
  }

  // 返回 JavaScript 模块
  return `
    module.exports = function(data) {
      return (${compiledTemplate})(data);
    };
  `;
};

function compileHandlebars(source) {
  // 简化的 Handlebars 编译
  return `function(data) {
    let result = \`${source}\`;
    Object.keys(data).forEach(key => {
      const regex = new RegExp('{{\\\\s*' + key + '\\\\s*}}', 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  }`;
}

function compileEJS(source) {
  // 简化的 EJS 编译
  return `function(data) {
    let result = \`${source}\`;
    result = result.replace(/<%=\\s*(.+?)\\s*%>/g, (match, expression) => {
      return eval('data.' + expression);
    });
    return result;
  }`;
}
```

**4. 资源优化 Loader**

```javascript
// image-optimize-loader.js
const sharp = require("sharp");
const { getOptions } = require("loader-utils");

module.exports = function (content) {
  const callback = this.async();
  const options = getOptions(this) || {};

  const { quality = 80, format = "webp", resize = null } = options;

  // 处理图片
  let pipeline = sharp(content);

  // 调整尺寸
  if (resize) {
    pipeline = pipeline.resize(resize.width, resize.height);
  }

  // 设置格式和质量
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality });
      break;
  }

  pipeline
    .toBuffer()
    .then((buffer) => {
      callback(null, buffer);
    })
    .catch((error) => {
      callback(error);
    });
};

// 标记为原始 loader（处理二进制数据）
module.exports.raw = true;
```

**Loader 开发最佳实践**：

```javascript
// loader-utils.js - 通用工具函数
const { getOptions, interpolateName } = require("loader-utils");
const validateOptions = require("schema-utils");

// Loader 开发工具类
class LoaderHelper {
  constructor(context) {
    this.context = context;
    this.options = getOptions(context) || {};
  }

  // 验证选项
  validateOptions(schema) {
    validateOptions(schema, this.options, "My Loader");
  }

  // 生成文件名
  generateFilename(template = "[name].[ext]") {
    return interpolateName(this.context, template, {
      content: this.context.resourcePath,
    });
  }

  // 输出文件
  emitFile(filename, content) {
    this.context.emitFile(filename, content);
  }

  // 添加依赖
  addDependency(file) {
    this.context.addDependency(file);
  }

  // 缓存结果
  cacheable() {
    if (this.context.cacheable) {
      this.context.cacheable();
    }
  }
}

// 使用示例
module.exports = function myLoader(source) {
  const helper = new LoaderHelper(this);

  // 验证选项
  helper.validateOptions({
    type: "object",
    properties: {
      option1: { type: "string" },
      option2: { type: "number" },
    },
  });

  // 标记可缓存
  helper.cacheable();

  // 处理源代码
  const result = processSource(source, helper.options);

  return result;
};
```

**Loader 链式调用示例**：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          // 从下到上执行
          {
            loader: "vue-loader", // 3. 最后执行，处理 Vue 组件
            options: {
              compilerOptions: {
                preserveWhitespace: false,
              },
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader", // 4. 将 CSS 注入到页面
          "css-loader", // 3. 处理 CSS 导入和 URL
          "postcss-loader", // 2. PostCSS 处理
          "sass-loader", // 1. 首先执行，编译 SCSS
        ],
      },
    ],
  },
};
```

## 📚 框架相关

### 框架：React Hooks 实现原理

**问题**：React Hooks 是如何实现的？

**回答**：

React Hooks 通过闭包和链表数据结构实现状态管理，让函数组件拥有类组件的能力。

**Hooks 实现原理**：

```javascript
// 简化的 React Hooks 实现
let currentFiber = null;
let hookIndex = 0;

// Fiber 节点结构
function createFiber(component, props) {
  return {
    component,
    props,
    hooks: [], // Hook 链表
    memoizedState: null,
    effectList: [],
  };
}

// useState 实现
function useState(initialState) {
  const fiber = currentFiber;
  const index = hookIndex++;

  // 获取或创建 hook
  let hook = fiber.hooks[index];
  if (!hook) {
    hook = {
      memoizedState:
        typeof initialState === "function" ? initialState() : initialState,
      queue: [],
      dispatch: null,
    };
    fiber.hooks[index] = hook;
  }

  // 处理更新队列
  const queue = hook.queue;
  let newState = hook.memoizedState;

  queue.forEach((update) => {
    if (typeof update === "function") {
      newState = update(newState);
    } else {
      newState = update;
    }
  });

  hook.memoizedState = newState;
  hook.queue = [];

  // 创建 dispatch 函数
  const dispatch = (action) => {
    hook.queue.push(action);
    // 触发重新渲染
    scheduleUpdate(fiber);
  };

  hook.dispatch = dispatch;

  return [hook.memoizedState, dispatch];
}

// useEffect 实现
function useEffect(callback, deps) {
  const fiber = currentFiber;
  const index = hookIndex++;

  let hook = fiber.hooks[index];
  if (!hook) {
    hook = {
      memoizedState: null,
      deps: null,
      cleanup: null,
    };
    fiber.hooks[index] = hook;
  }

  // 检查依赖是否变化
  const prevDeps = hook.deps;
  const hasChanged =
    !prevDeps || !deps || deps.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    // 清理上一次的副作用
    if (hook.cleanup) {
      hook.cleanup();
    }

    // 执行副作用
    const cleanup = callback();
    hook.cleanup = cleanup;
    hook.deps = deps;
  }
}

// useCallback 实现
function useCallback(callback, deps) {
  const fiber = currentFiber;
  const index = hookIndex++;

  let hook = fiber.hooks[index];
  if (!hook) {
    hook = {
      memoizedState: [callback, deps],
    };
    fiber.hooks[index] = hook;
  }

  const [prevCallback, prevDeps] = hook.memoizedState;

  // 检查依赖是否变化
  if (!prevDeps || deps.some((dep, i) => dep !== prevDeps[i])) {
    hook.memoizedState = [callback, deps];
    return callback;
  }

  return prevCallback;
}

// useMemo 实现
function useMemo(factory, deps) {
  const fiber = currentFiber;
  const index = hookIndex++;

  let hook = fiber.hooks[index];
  if (!hook) {
    hook = {
      memoizedState: [factory(), deps],
    };
    fiber.hooks[index] = hook;
  }

  const [prevValue, prevDeps] = hook.memoizedState;

  // 检查依赖是否变化
  if (!prevDeps || deps.some((dep, i) => dep !== prevDeps[i])) {
    const newValue = factory();
    hook.memoizedState = [newValue, deps];
    return newValue;
  }

  return prevValue;
}

// useRef 实现
function useRef(initialValue) {
  const fiber = currentFiber;
  const index = hookIndex++;

  let hook = fiber.hooks[index];
  if (!hook) {
    hook = {
      memoizedState: { current: initialValue },
    };
    fiber.hooks[index] = hook;
  }

  return hook.memoizedState;
}
```

**自定义 Hook 实现**：

```javascript
// 自定义 Hook 示例
function useLocalStorage(key, initialValue) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return initialValue;
    }
  });

  // 设置值的函数
  const setValue = useCallback(
    (value) => {
      try {
        // 允许值为函数，类似 useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error setting localStorage:", error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// 使用自定义 Hook
function MyComponent() {
  const [name, setName] = useLocalStorage("name", "");

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter your name"
    />
  );
}
```

**更复杂的自定义 Hook**：

```javascript
// useAsync Hook
function useAsync(asyncFunction, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, deps);

  return { ...state, execute };
}

// useDebounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// usePrevious Hook
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// useToggle Hook
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }];
}
```

**Hook 规则和实现机制**：

```javascript
// Hook 调用规则检查
class HookValidator {
  constructor() {
    this.isInComponent = false;
    this.hookCallStack = [];
  }

  // 检查 Hook 调用规则
  validateHookCall(hookName) {
    // 规则1: 只能在组件或自定义 Hook 中调用
    if (!this.isInComponent) {
      throw new Error(
        `${hookName} can only be called inside a component or custom hook`
      );
    }

    // 规则2: 不能在循环、条件或嵌套函数中调用
    if (this.isInConditionalContext()) {
      throw new Error(
        `${hookName} cannot be called inside loops, conditions, or nested functions`
      );
    }

    this.hookCallStack.push(hookName);
  }

  isInConditionalContext() {
    // 简化的条件检查
    const stack = new Error().stack;
    return (
      stack.includes("if") || stack.includes("for") || stack.includes("while")
    );
  }

  enterComponent() {
    this.isInComponent = true;
    this.hookCallStack = [];
  }

  exitComponent() {
    this.isInComponent = false;
  }
}

// 增强的 useState 实现
function enhancedUseState(initialState) {
  const validator = new HookValidator();
  validator.validateHookCall("useState");

  return useState(initialState);
}
```

### 框架：常见框架的 Diff 算法

**问题**：React、Vue 等框架的 Diff 算法是如何工作的？

**回答**：

Diff 算法用于比较新旧虚拟 DOM 树的差异，最小化实际 DOM 操作，提高渲染性能。

**React Diff 算法**：

```javascript
// React Diff 算法实现
class ReactDiff {
  constructor() {
    this.PLACEMENT = "PLACEMENT";
    this.DELETION = "DELETION";
    this.UPDATE = "UPDATE";
  }

  // 主要的 diff 函数
  diff(oldFiber, newElement) {
    const effects = [];

    // 情况1: 新元素为空，删除旧节点
    if (!newElement) {
      if (oldFiber) {
        effects.push({
          type: this.DELETION,
          fiber: oldFiber,
        });
      }
      return effects;
    }

    // 情况2: 旧节点为空，创建新节点
    if (!oldFiber) {
      const newFiber = this.createFiber(newElement);
      effects.push({
        type: this.PLACEMENT,
        fiber: newFiber,
      });
      return effects;
    }

    // 情况3: 类型相同，更新属性
    if (oldFiber.type === newElement.type) {
      const newFiber = {
        ...oldFiber,
        props: newElement.props,
      };

      if (this.hasPropsChanged(oldFiber.props, newElement.props)) {
        effects.push({
          type: this.UPDATE,
          fiber: newFiber,
          oldProps: oldFiber.props,
          newProps: newElement.props,
        });
      }

      // 递归处理子节点
      const childEffects = this.diffChildren(
        oldFiber.child,
        newElement.children
      );
      effects.push(...childEffects);

      return effects;
    }

    // 情况4: 类型不同，替换节点
    effects.push({
      type: this.DELETION,
      fiber: oldFiber,
    });

    const newFiber = this.createFiber(newElement);
    effects.push({
      type: this.PLACEMENT,
      fiber: newFiber,
    });

    return effects;
  }

  // 子节点 diff（最复杂的部分）
  diffChildren(oldChildren, newChildren) {
    const effects = [];
    const oldChildrenArray = this.fiberToArray(oldChildren);
    const newChildrenArray = Array.isArray(newChildren)
      ? newChildren
      : [newChildren];

    // 第一轮遍历：处理相同位置的节点
    let oldIndex = 0;
    let newIndex = 0;
    let lastPlacedIndex = 0;

    for (
      ;
      oldIndex < oldChildrenArray.length && newIndex < newChildrenArray.length;
      oldIndex++, newIndex++
    ) {
      const oldChild = oldChildrenArray[oldIndex];
      const newChild = newChildrenArray[newIndex];

      if (this.isSameNode(oldChild, newChild)) {
        const childEffects = this.diff(oldChild, newChild);
        effects.push(...childEffects);
        lastPlacedIndex = Math.max(lastPlacedIndex, oldIndex);
      } else {
        break;
      }
    }

    // 第二轮遍历：处理剩余的新节点
    if (newIndex < newChildrenArray.length) {
      const remainingOldChildren = oldChildrenArray.slice(oldIndex);
      const remainingNewChildren = newChildrenArray.slice(newIndex);

      // 创建 key -> oldChild 的映射
      const oldChildrenMap = new Map();
      remainingOldChildren.forEach((child, index) => {
        const key = child.key || index;
        oldChildrenMap.set(key, child);
      });

      // 处理剩余的新节点
      remainingNewChildren.forEach((newChild, index) => {
        const key = newChild.key || index;
        const oldChild = oldChildrenMap.get(key);

        if (oldChild) {
          // 找到对应的旧节点，可能需要移动
          const childEffects = this.diff(oldChild, newChild);
          effects.push(...childEffects);

          if (oldChild.index < lastPlacedIndex) {
            // 需要移动
            effects.push({
              type: this.PLACEMENT,
              fiber: oldChild,
            });
          } else {
            lastPlacedIndex = oldChild.index;
          }

          oldChildrenMap.delete(key);
        } else {
          // 新节点，需要创建
          const newFiber = this.createFiber(newChild);
          effects.push({
            type: this.PLACEMENT,
            fiber: newFiber,
          });
        }
      });

      // 删除剩余的旧节点
      oldChildrenMap.forEach((oldChild) => {
        effects.push({
          type: this.DELETION,
          fiber: oldChild,
        });
      });
    }

    // 第三轮：删除剩余的旧节点
    for (; oldIndex < oldChildrenArray.length; oldIndex++) {
      effects.push({
        type: this.DELETION,
        fiber: oldChildrenArray[oldIndex],
      });
    }

    return effects;
  }

  isSameNode(oldNode, newNode) {
    return oldNode.type === newNode.type && oldNode.key === newNode.key;
  }

  hasPropsChanged(oldProps, newProps) {
    const oldKeys = Object.keys(oldProps);
    const newKeys = Object.keys(newProps);

    if (oldKeys.length !== newKeys.length) {
      return true;
    }

    return oldKeys.some((key) => oldProps[key] !== newProps[key]);
  }

  createFiber(element) {
    return {
      type: element.type,
      props: element.props,
      key: element.key,
      child: null,
      sibling: null,
      return: null,
    };
  }

  fiberToArray(fiber) {
    const result = [];
    let current = fiber;

    while (current) {
      result.push(current);
      current = current.sibling;
    }

    return result;
  }
}
```

**Vue Diff 算法**：

```javascript
// Vue 3 的 Diff 算法实现
class VueDiff {
  constructor() {
    this.STABLE_FRAGMENT = 1;
    this.KEYED_FRAGMENT = 2;
    this.UNKEYED_FRAGMENT = 3;
  }

  // Vue 的 patchChildren 实现
  patchChildren(oldChildren, newChildren, container, parentAnchor) {
    const oldLength = oldChildren.length;
    const newLength = newChildren.length;
    const commonLength = Math.min(oldLength, newLength);

    // 快速路径：简单情况
    if (oldLength === 0) {
      // 没有旧子节点，直接挂载新的
      this.mountChildren(newChildren, container, parentAnchor);
      return;
    }

    if (newLength === 0) {
      // 没有新子节点，卸载所有旧的
      this.unmountChildren(oldChildren);
      return;
    }

    // 复杂情况：使用最长递增子序列算法
    this.patchKeyedChildren(oldChildren, newChildren, container, parentAnchor);
  }

  // 带 key 的子节点 diff
  patchKeyedChildren(oldChildren, newChildren, container, parentAnchor) {
    let i = 0;
    const newLength = newChildren.length;
    let oldEnd = oldChildren.length - 1;
    let newEnd = newLength - 1;

    // 1. 从头开始同步
    while (i <= oldEnd && i <= newEnd) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];

      if (this.isSameVNodeType(oldVNode, newVNode)) {
        this.patch(oldVNode, newVNode, container);
      } else {
        break;
      }
      i++;
    }

    // 2. 从尾开始同步
    while (i <= oldEnd && i <= newEnd) {
      const oldVNode = oldChildren[oldEnd];
      const newVNode = newChildren[newEnd];

      if (this.isSameVNodeType(oldVNode, newVNode)) {
        this.patch(oldVNode, newVNode, container);
      } else {
        break;
      }
      oldEnd--;
      newEnd--;
    }

    // 3. 公共序列已处理完，处理剩余节点
    if (i > oldEnd) {
      // 旧节点已全部处理，新增剩余新节点
      if (i <= newEnd) {
        const nextPos = newEnd + 1;
        const anchor =
          nextPos < newLength ? newChildren[nextPos].el : parentAnchor;

        while (i <= newEnd) {
          this.patch(null, newChildren[i], container, anchor);
          i++;
        }
      }
    } else if (i > newEnd) {
      // 新节点已全部处理，删除剩余旧节点
      while (i <= oldEnd) {
        this.unmount(oldChildren[i]);
        i++;
      }
    } else {
      // 4. 处理未知序列（最复杂的情况）
      this.patchUnknownChildren(
        oldChildren,
        newChildren,
        i,
        oldEnd,
        newEnd,
        container,
        parentAnchor
      );
    }
  }

  // 处理未知序列
  patchUnknownChildren(
    oldChildren,
    newChildren,
    start,
    oldEnd,
    newEnd,
    container,
    parentAnchor
  ) {
    const oldLength = oldEnd - start + 1;
    const newLength = newEnd - start + 1;

    // 创建新节点索引映射
    const keyToNewIndexMap = new Map();
    for (let i = start; i <= newEnd; i++) {
      const nextChild = newChildren[i];
      keyToNewIndexMap.set(nextChild.key, i);
    }

    // 创建新索引到旧索引的映射
    const newIndexToOldIndexMap = new Array(newLength);
    for (let i = 0; i < newLength; i++) {
      newIndexToOldIndexMap[i] = 0;
    }

    let moved = false;
    let maxNewIndexSoFar = 0;
    let patched = 0;

    // 遍历旧子节点
    for (let i = start; i <= oldEnd; i++) {
      const prevChild = oldChildren[i];

      if (patched >= newLength) {
        // 已经处理了所有新节点，删除剩余旧节点
        this.unmount(prevChild);
        continue;
      }

      let newIndex;
      if (prevChild.key != null) {
        newIndex = keyToNewIndexMap.get(prevChild.key);
      } else {
        // 没有 key，尝试找到相同类型的节点
        for (let j = start; j <= newEnd; j++) {
          if (
            newIndexToOldIndexMap[j - start] === 0 &&
            this.isSameVNodeType(prevChild, newChildren[j])
          ) {
            newIndex = j;
            break;
          }
        }
      }

      if (newIndex === undefined) {
        // 在新子节点中找不到，删除
        this.unmount(prevChild);
      } else {
        newIndexToOldIndexMap[newIndex - start] = i + 1;

        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }

        this.patch(prevChild, newChildren[newIndex], container);
        patched++;
      }
    }

    // 生成最长递增子序列
    const increasingNewIndexSequence = moved
      ? this.getSequence(newIndexToOldIndexMap)
      : [];

    let j = increasingNewIndexSequence.length - 1;

    // 从后往前遍历，插入和移动节点
    for (let i = newLength - 1; i >= 0; i--) {
      const nextIndex = start + i;
      const nextChild = newChildren[nextIndex];
      const anchor =
        nextIndex + 1 < newChildren.length
          ? newChildren[nextIndex + 1].el
          : parentAnchor;

      if (newIndexToOldIndexMap[i] === 0) {
        // 新节点，挂载
        this.patch(null, nextChild, container, anchor);
      } else if (moved) {
        // 需要移动
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          this.move(nextChild, container, anchor);
        } else {
          j--;
        }
      }
    }
  }

  // 最长递增子序列算法
  getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;

    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = (u + v) >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p[v];
    }
    return result;
  }

  isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }

  patch(oldVNode, newVNode, container, anchor) {
    // 具体的节点更新逻辑
    console.log("Patching node:", oldVNode, newVNode);
  }

  unmount(vnode) {
    // 卸载节点
    console.log("Unmounting node:", vnode);
  }

  move(vnode, container, anchor) {
    // 移动节点
    console.log("Moving node:", vnode);
  }
}
```

**Diff 算法优化策略**：

```javascript
// Diff 算法优化策略
class OptimizedDiff {
  constructor() {
    this.cache = new Map();
  }

  // 策略1: 静态提升
  hoistStatic(vnode) {
    if (this.isStatic(vnode)) {
      // 静态节点提升到渲染函数外部
      return this.getStaticVNode(vnode);
    }
    return vnode;
  }

  isStatic(vnode) {
    return (
      vnode.props &&
      Object.keys(vnode.props).every(
        (key) => typeof vnode.props[key] !== "function" && !key.startsWith("on")
      ) &&
      (!vnode.children || vnode.children.every((child) => this.isStatic(child)))
    );
  }

  getStaticVNode(vnode) {
    const key = this.generateStaticKey(vnode);
    if (!this.cache.has(key)) {
      this.cache.set(key, vnode);
    }
    return this.cache.get(key);
  }

  // 策略2: 预编译优化
  precompileOptimization(template) {
    // 编译时分析，生成优化的渲染函数
    const analysis = this.analyzeTemplate(template);

    return {
      staticNodes: analysis.staticNodes,
      dynamicNodes: analysis.dynamicNodes,
      patchFlags: analysis.patchFlags,
    };
  }

  analyzeTemplate(template) {
    return {
      staticNodes: [], // 静态节点列表
      dynamicNodes: [], // 动态节点列表
      patchFlags: [], // 更新标记
    };
  }

  // 策略3: 快速路径
  fastPath(oldVNode, newVNode) {
    // 相同引用，直接返回
    if (oldVNode === newVNode) {
      return [];
    }

    // 相同类型且无子节点的简单元素
    if (
      oldVNode.type === newVNode.type &&
      !oldVNode.children &&
      !newVNode.children
    ) {
      return this.patchProps(oldVNode, newVNode);
    }

    // 文本节点
    if (typeof oldVNode === "string" && typeof newVNode === "string") {
      return oldVNode === newVNode
        ? []
        : [{ type: "TEXT_UPDATE", oldVNode, newVNode }];
    }

    return null; // 使用标准 diff 流程
  }

  patchProps(oldVNode, newVNode) {
    const patches = [];
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};

    // 检查属性变化
    Object.keys(newProps).forEach((key) => {
      if (oldProps[key] !== newProps[key]) {
        patches.push({
          type: "PROP_UPDATE",
          key,
          oldValue: oldProps[key],
          newValue: newProps[key],
        });
      }
    });

    // 检查删除的属性
    Object.keys(oldProps).forEach((key) => {
      if (!(key in newProps)) {
        patches.push({
          type: "PROP_DELETE",
          key,
        });
      }
    });

    return patches;
  }
}
```

## 🔧 基础知识

### 基础：JavaScript 异步编程

**问题**：JavaScript 异步编程的发展历程和最佳实践？

**回答**：

JavaScript 异步编程经历了从回调函数到 Promise，再到 async/await 的发展历程。

**1. 回调函数时代**

```javascript
// 传统回调函数
function fetchData(callback) {
  setTimeout(() => {
    callback(null, "data");
  }, 1000);
}

// 回调地狱问题
fetchUser(userId, (err, user) => {
  if (err) {
    console.error(err);
    return;
  }

  fetchUserPosts(user.id, (err, posts) => {
    if (err) {
      console.error(err);
      return;
    }

    fetchPostComments(posts[0].id, (err, comments) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(comments);
    });
  });
});
```

**2. Promise 时代**

```javascript
// Promise 实现
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onFulfilledCallbacks.forEach((callback) => callback(value));
      }
    };

    const reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((callback) => callback(reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    return new MyPromise((resolve, reject) => {
      const handleFulfilled = (value) => {
        try {
          const result = onFulfilled(value);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      const handleRejected = (reason) => {
        try {
          const result = onRejected(reason);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === "fulfilled") {
        setTimeout(() => handleFulfilled(this.value), 0);
      } else if (this.state === "rejected") {
        setTimeout(() => handleRejected(this.reason), 0);
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let completedCount = 0;

      promises.forEach((promise, index) => {
        Promise.resolve(promise)
          .then((value) => {
            results[index] = value;
            completedCount++;

            if (completedCount === promises.length) {
              resolve(results);
            }
          })
          .catch(reject);
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        Promise.resolve(promise).then(resolve).catch(reject);
      });
    });
  }
}

// 使用 Promise 链式调用
fetchUser(userId)
  .then((user) => fetchUserPosts(user.id))
  .then((posts) => fetchPostComments(posts[0].id))
  .then((comments) => console.log(comments))
  .catch((error) => console.error(error));
```

**3. async/await 时代**

```javascript
// async/await 语法糖
async function fetchUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchUserPosts(user.id);
    const comments = await fetchPostComments(posts[0].id);

    return comments;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// 并发处理
async function fetchMultipleData() {
  try {
    // 并发执行
    const [users, posts, comments] = await Promise.all([
      fetchUsers(),
      fetchPosts(),
      fetchComments(),
    ]);

    return { users, posts, comments };
  } catch (error) {
    console.error("Error in concurrent fetch:", error);
  }
}

// 串行 vs 并行
async function serialVsParallel() {
  console.time("Serial");
  // 串行执行 - 总时间 = 各任务时间之和
  const result1 = await task1(); // 1s
  const result2 = await task2(); // 1s
  const result3 = await task3(); // 1s
  console.timeEnd("Serial"); // ~3s

  console.time("Parallel");
  // 并行执行 - 总时间 = 最长任务时间
  const [parallelResult1, parallelResult2, parallelResult3] = await Promise.all(
    [
      task1(), // 1s
      task2(), // 1s
      task3(), // 1s
    ]
  );
  console.timeEnd("Parallel"); // ~1s
}
```

**4. 现代异步模式**

```javascript
// Generator 函数实现异步
function* asyncGenerator() {
  try {
    const user = yield fetchUser(userId);
    const posts = yield fetchUserPosts(user.id);
    const comments = yield fetchPostComments(posts[0].id);

    return comments;
  } catch (error) {
    console.error("Generator error:", error);
  }
}

// 自动执行器
function runGenerator(generator) {
  return new Promise((resolve, reject) => {
    const gen = generator();

    function step(nextValue) {
      const result = gen.next(nextValue);

      if (result.done) {
        resolve(result.value);
      } else {
        Promise.resolve(result.value)
          .then(step)
          .catch((error) => {
            gen.throw(error);
          });
      }
    }

    step();
  });
}

// 异步迭代器
class AsyncIterator {
  constructor(data) {
    this.data = data;
    this.index = 0;
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next() {
    if (this.index >= this.data.length) {
      return { done: true };
    }

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      value: this.data[this.index++],
      done: false,
    };
  }
}

// 使用异步迭代器
async function processAsyncData() {
  const asyncData = new AsyncIterator([1, 2, 3, 4, 5]);

  for await (const item of asyncData) {
    console.log(item);
  }
}
```

**5. 错误处理和最佳实践**

```javascript
// 错误处理最佳实践
class AsyncErrorHandler {
  static async withRetry(asyncFn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await asyncFn();
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }

        console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // 指数退避
      }
    }
  }

  static async withTimeout(asyncFn, timeout = 5000) {
    return Promise.race([
      asyncFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), timeout)
      ),
    ]);
  }

  static async withCircuitBreaker(asyncFn, threshold = 5, resetTime = 60000) {
    if (!this.circuitState) {
      this.circuitState = {
        failures: 0,
        lastFailureTime: null,
        state: "CLOSED", // CLOSED, OPEN, HALF_OPEN
      };
    }

    const state = this.circuitState;

    // 检查熔断器状态
    if (state.state === "OPEN") {
      if (Date.now() - state.lastFailureTime > resetTime) {
        state.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await asyncFn();

      // 成功时重置
      if (state.state === "HALF_OPEN") {
        state.state = "CLOSED";
        state.failures = 0;
      }

      return result;
    } catch (error) {
      state.failures++;
      state.lastFailureTime = Date.now();

      if (state.failures >= threshold) {
        state.state = "OPEN";
      }

      throw error;
    }
  }
}

// 使用示例
async function robustAsyncOperation() {
  try {
    const result = await AsyncErrorHandler.withRetry(
      () => AsyncErrorHandler.withTimeout(() => fetchDataFromAPI(), 3000),
      3
    );

    return result;
  } catch (error) {
    console.error("All retry attempts failed:", error);
    return null;
  }
}
```

### 基础：TypeScript 中的 Interface

**问题**：TypeScript Interface 的特性和高级用法？

**回答**：

TypeScript Interface 定义了对象的结构，提供了强类型检查和代码提示。

**1. 基本 Interface 定义**

```typescript
// 基本接口定义
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // 可选属性
  readonly createdAt: Date; // 只读属性
}

// 使用接口
const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
};

// 函数接口
interface Calculator {
  (a: number, b: number): number;
}

const add: Calculator = (a, b) => a + b;
const multiply: Calculator = (a, b) => a * b;

// 索引签名
interface StringDictionary {
  [key: string]: string;
}

const dict: StringDictionary = {
  name: "John",
  city: "New York",
};
```

**2. 接口继承和组合**

```typescript
// 接口继承
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

interface Cat extends Animal {
  meow(): void;
}

// 多重继承
interface Pet extends Animal {
  owner: string;
}

interface ServiceDog extends Dog, Pet {
  serviceType: string;
}

// 接口合并
interface MergeExample {
  prop1: string;
}

interface MergeExample {
  prop2: number;
}

// 合并后的接口包含 prop1 和 prop2
const merged: MergeExample = {
  prop1: "hello",
  prop2: 42,
};
```

**3. 泛型接口**

```typescript
// 泛型接口
interface Repository<T> {
  find(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// 实现泛型接口
class UserRepository implements Repository<User> {
  private users: User[] = [];

  async find(id: string): Promise<User | null> {
    return this.users.find((user) => user.id.toString() === id) || null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async create(userData: Omit<User, "id">): Promise<User> {
    const newUser: User = {
      id: Date.now(),
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id.toString() === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id.toString() === id);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
    }
  }
}

// 约束泛型
interface Identifiable {
  id: string | number;
}

interface CRUDService<T extends Identifiable> {
  getById(id: T["id"]): Promise<T>;
  save(entity: T): Promise<T>;
}
```

**4. 高级类型操作**

```typescript
// 映射类型
interface APIResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 条件类型
type APIResult<T> = T extends string
  ? APIResponse<string>
  : T extends number
  ? APIResponse<number>
  : APIResponse<T>;

// 实用工具类型
interface CompleteUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

// Pick - 选择特定属性
type PublicUser = Pick<CompleteUser, "id" | "name" | "email">;

// Omit - 排除特定属性
type CreateUserRequest = Omit<CompleteUser, "id">;

// Partial - 所有属性变为可选
type UpdateUserRequest = Partial<CompleteUser>;

// Required - 所有属性变为必需
type RequiredUser = Required<CompleteUser>;

// Record - 创建键值对类型
type UserRoles = Record<string, CompleteUser[]>;

// 自定义映射类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type OptionalUser = Nullable<PublicUser>;
```

**5. 接口与类的关系**

```typescript
// 接口约束类的实现
interface Flyable {
  fly(): void;
  altitude: number;
}

interface Swimmable {
  swim(): void;
  depth: number;
}

// 类实现多个接口
class Duck implements Flyable, Swimmable {
  altitude = 0;
  depth = 0;

  fly(): void {
    this.altitude = 100;
    console.log(`Flying at altitude ${this.altitude}`);
  }

  swim(): void {
    this.depth = 5;
    console.log(`Swimming at depth ${this.depth}`);
  }
}

// 抽象类与接口结合
abstract class Vehicle {
  abstract start(): void;
  abstract stop(): void;

  protected isRunning = false;
}

interface Electric {
  batteryLevel: number;
  charge(): void;
}

class ElectricCar extends Vehicle implements Electric {
  batteryLevel = 100;

  start(): void {
    if (this.batteryLevel > 0) {
      this.isRunning = true;
      console.log("Electric car started");
    }
  }

  stop(): void {
    this.isRunning = false;
    console.log("Electric car stopped");
  }

  charge(): void {
    this.batteryLevel = 100;
    console.log("Battery charged to 100%");
  }
}
```

**6. 接口的高级模式**

```typescript
// 函数重载接口
interface EventEmitter {
  on(event: "data", callback: (data: any) => void): void;
  on(event: "error", callback: (error: Error) => void): void;
  on(event: "end", callback: () => void): void;
  on(event: string, callback: Function): void;
}

// 构造函数接口
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface;
}

interface ClockInterface {
  tick(): void;
}

class DigitalClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tick() {
    console.log("beep beep");
  }
}

// 工厂函数
function createClock(
  ctor: ClockConstructor,
  hour: number,
  minute: number
): ClockInterface {
  return new ctor(hour, minute);
}

// 混合类型接口
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

function getCounter(): Counter {
  let counter = function (start: number) {
    return `Started at ${start}`;
  } as Counter;

  counter.interval = 123;
  counter.reset = function () {
    console.log("Counter reset");
  };

  return counter;
}

// 模块化接口
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  export class EmailValidator implements StringValidator {
    isAcceptable(s: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    }
  }

  export class PhoneValidator implements StringValidator {
    isAcceptable(s: string): boolean {
      return /^\d{10}$/.test(s);
    }
  }
}

// 声明合并用于扩展第三方库
declare global {
  interface Window {
    myCustomProperty: string;
  }
}

// 现在可以使用
window.myCustomProperty = "Hello World";
```

## 🎨 样式相关

### 样式：移动端适配常见手段

**问题**：移动端适配有哪些常见的解决方案？

**回答**：

移动端适配主要解决不同设备屏幕尺寸和分辨率差异问题，确保在各种设备上都有良好的用户体验。

**1. viewport 元标签配置**

```html
<!-- 标准移动端viewport配置 -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>

<!-- 各参数说明 -->
<meta
  name="viewport"
  content="
  width=device-width,     // 宽度等于设备宽度
  initial-scale=1.0,      // 初始缩放比例
  maximum-scale=1.0,      // 最大缩放比例  
  minimum-scale=1.0,      // 最小缩放比例
  user-scalable=no,       // 禁止用户缩放
  viewport-fit=cover      // 适配刘海屏
"
/>
```

**2. 响应式布局方案**

```css
/* 1. 媒体查询 */
/* 移动优先策略 */
.container {
  width: 100%;
  padding: 0 15px;
}

/* 平板 */
@media screen and (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* 桌面 */
@media screen and (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}

/* 大屏桌面 */
@media screen and (min-width: 1200px) {
  .container {
    max-width: 1400px;
  }
}

/* 2. Flexbox 布局 */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.flex-item {
  flex: 1 1 300px; /* 最小宽度300px，可伸缩 */
  margin: 10px;
}

/* 3. CSS Grid 布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* 4. Container Queries (现代方案) */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    align-items: center;
  }
}
```

**3. 单位适配方案**

```css
/* rem 方案 */
html {
  font-size: 16px; /* 基准字体大小 */
}

/* 动态设置根字体大小 */
@media screen and (max-width: 375px) {
  html {
    font-size: 14px;
  }
}

@media screen and (min-width: 414px) {
  html {
    font-size: 18px;
  }
}

.title {
  font-size: 1.5rem; /* 相对于根字体大小 */
  margin: 1rem 0;
}

/* vw/vh 方案 */
.hero-section {
  width: 100vw;
  height: 100vh;
  font-size: 4vw; /* 视口宽度的4% */
}

/* 限制最大最小值 */
.responsive-text {
  font-size: clamp(16px, 4vw, 24px);
  /* 最小16px，最大24px，理想值4vw */
}

/* 混合方案 */
.mixed-layout {
  width: calc(100vw - 2rem);
  max-width: 1200px;
  margin: 0 auto;
  padding: min(5vw, 2rem);
}
```

**4. JavaScript 动态适配**

```javascript
// rem 动态适配方案
class RemAdapter {
  constructor(designWidth = 375, baseFontSize = 16) {
    this.designWidth = designWidth;
    this.baseFontSize = baseFontSize;
    this.init();
  }

  init() {
    this.setRootFontSize();

    // 监听窗口大小变化
    window.addEventListener(
      "resize",
      this.debounce(() => {
        this.setRootFontSize();
      }, 300)
    );

    // 监听设备方向变化
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.setRootFontSize();
      }, 300);
    });
  }

  setRootFontSize() {
    const deviceWidth = document.documentElement.clientWidth;
    const scale = deviceWidth / this.designWidth;
    const rootFontSize = this.baseFontSize * scale;

    // 限制字体大小范围
    const minFontSize = 12;
    const maxFontSize = 24;
    const finalFontSize = Math.max(
      minFontSize,
      Math.min(maxFontSize, rootFontSize)
    );

    document.documentElement.style.fontSize = `${finalFontSize}px`;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// 使用
new RemAdapter(375, 16);

// vw 适配方案
class VwAdapter {
  constructor(designWidth = 375) {
    this.designWidth = designWidth;
    this.init();
  }

  init() {
    this.addVwRule();
  }

  // px 转 vw
  px2vw(px) {
    return ((px / this.designWidth) * 100).toFixed(2);
  }

  // 动态添加 CSS 规则
  addVwRule() {
    const style = document.createElement("style");
    style.innerHTML = `
      .vw-text-sm { font-size: ${this.px2vw(14)}vw; }
      .vw-text-md { font-size: ${this.px2vw(16)}vw; }
      .vw-text-lg { font-size: ${this.px2vw(18)}vw; }
      .vw-spacing-sm { margin: ${this.px2vw(8)}vw; }
      .vw-spacing-md { margin: ${this.px2vw(16)}vw; }
      .vw-spacing-lg { margin: ${this.px2vw(24)}vw; }
    `;
    document.head.appendChild(style);
  }
}

// 设备检测适配
class DeviceAdapter {
  constructor() {
    this.device = this.detectDevice();
    this.init();
  }

  detectDevice() {
    const userAgent = navigator.userAgent;
    const isIPhone = /iPhone/i.test(userAgent);
    const isIPad = /iPad/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = /Mobile/i.test(userAgent);

    return {
      isIOS: isIPhone || isIPad,
      isAndroid,
      isMobile: isMobile && !isIPad,
      isTablet: isIPad || (isAndroid && !isMobile),
      isDesktop: !isMobile && !isIPad,
    };
  }

  init() {
    // 添加设备类名
    const deviceClasses = [];

    if (this.device.isIOS) deviceClasses.push("ios");
    if (this.device.isAndroid) deviceClasses.push("android");
    if (this.device.isMobile) deviceClasses.push("mobile");
    if (this.device.isTablet) deviceClasses.push("tablet");
    if (this.device.isDesktop) deviceClasses.push("desktop");

    document.documentElement.className += ` ${deviceClasses.join(" ")}`;

    // 处理特殊设备适配
    this.handleSpecialDevices();
  }

  handleSpecialDevices() {
    // iPhone X 系列刘海屏适配
    if (this.isIPhoneX()) {
      document.documentElement.classList.add("iphone-x");
      this.addSafeAreaSupport();
    }

    // Android 刘海屏适配
    if (this.hasNotch()) {
      document.documentElement.classList.add("has-notch");
    }
  }

  isIPhoneX() {
    const { screen } = window;
    const ratio = screen.width / screen.height;

    return (
      this.device.isIOS &&
      ((screen.width === 375 && screen.height === 812) || // iPhone X/XS
        (screen.width === 414 && screen.height === 896) || // iPhone XR/XS Max
        (screen.width === 390 && screen.height === 844) || // iPhone 12/13 mini
        (screen.width === 393 && screen.height === 852)) // iPhone 14
    );
  }

  hasNotch() {
    // 检测 CSS env() 支持
    return CSS.supports("padding-top: env(safe-area-inset-top)");
  }

  addSafeAreaSupport() {
    const style = document.createElement("style");
    style.innerHTML = `
      .safe-area-top {
        padding-top: env(safe-area-inset-top);
      }
      
      .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
      
      .safe-area-left {
        padding-left: env(safe-area-inset-left);
      }
      
      .safe-area-right {
        padding-right: env(safe-area-inset-right);
      }
      
      .safe-area-inset {
        padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
      }
    `;
    document.head.appendChild(style);
  }
}

// 使用
new DeviceAdapter();
```

**5. 图片适配方案**

```html
<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 1024px)" srcset="large.jpg 1x, large@2x.jpg 2x" />
  <source media="(min-width: 768px)" srcset="medium.jpg 1x, medium@2x.jpg 2x" />
  <img src="small.jpg" srcset="small@2x.jpg 2x" alt="响应式图片" />
</picture>

<!-- 使用 sizes 属性 -->
<img
  src="default.jpg"
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 33vw"
  alt="自适应图片"
/>
```

```javascript
// JavaScript 图片适配
class ImageAdapter {
  constructor() {
    this.pixelRatio = window.devicePixelRatio || 1;
    this.init();
  }

  init() {
    this.lazyLoadImages();
    this.handleRetinaImages();
  }

  // 懒加载图片
  lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  loadImage(img) {
    const src = this.getOptimalImageSrc(img);

    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.add("loaded");
    };
    tempImg.src = src;
  }

  getOptimalImageSrc(img) {
    const baseSrc = img.dataset.src;
    const width = img.offsetWidth;
    const optimalWidth = Math.ceil(width * this.pixelRatio);

    // 根据宽度选择合适的图片
    if (optimalWidth <= 480) {
      return baseSrc.replace(".jpg", "_small.jpg");
    } else if (optimalWidth <= 800) {
      return baseSrc.replace(".jpg", "_medium.jpg");
    } else {
      return baseSrc.replace(".jpg", "_large.jpg");
    }
  }

  // 处理高分辨率屏幕
  handleRetinaImages() {
    if (this.pixelRatio > 1) {
      const retinaImages = document.querySelectorAll("img[data-retina]");

      retinaImages.forEach((img) => {
        const retinaSrc = img.dataset.retina;
        if (retinaSrc) {
          img.src = retinaSrc;
        }
      });
    }
  }
}

new ImageAdapter();
```

**6. 触摸事件适配**

```javascript
// 触摸事件处理
class TouchAdapter {
  constructor() {
    this.init();
  }

  init() {
    this.preventZoom();
    this.handleTouchEvents();
    this.optimizeScrolling();
  }

  // 防止双击缩放
  preventZoom() {
    let lastTouchEnd = 0;

    document.addEventListener(
      "touchend",
      (event) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      false
    );
  }

  // 统一触摸和鼠标事件
  handleTouchEvents() {
    const elements = document.querySelectorAll(".touch-element");

    elements.forEach((element) => {
      let startX,
        startY,
        isMoving = false;

      // 触摸开始
      const handleStart = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        isMoving = false;

        element.classList.add("touching");
      };

      // 触摸移动
      const handleMove = (e) => {
        if (!startX || !startY) return;

        const touch = e.touches ? e.touches[0] : e;
        const deltaX = Math.abs(touch.clientX - startX);
        const deltaY = Math.abs(touch.clientY - startY);

        if (deltaX > 10 || deltaY > 10) {
          isMoving = true;
          element.classList.remove("touching");
        }
      };

      // 触摸结束
      const handleEnd = (e) => {
        element.classList.remove("touching");

        if (!isMoving) {
          // 执行点击逻辑
          this.handleTap(element, e);
        }

        startX = startY = null;
        isMoving = false;
      };

      // 绑定事件
      element.addEventListener("touchstart", handleStart, { passive: false });
      element.addEventListener("touchmove", handleMove, { passive: false });
      element.addEventListener("touchend", handleEnd);

      // 兼容鼠标事件
      element.addEventListener("mousedown", handleStart);
      element.addEventListener("mousemove", handleMove);
      element.addEventListener("mouseup", handleEnd);
    });
  }

  handleTap(element, event) {
    // 自定义点击处理
    const customEvent = new CustomEvent("tap", {
      detail: { originalEvent: event },
    });
    element.dispatchEvent(customEvent);
  }

  // 优化滚动性能
  optimizeScrolling() {
    // 开启硬件加速
    document.body.style.webkitTransform = "translate3d(0,0,0)";

    // 平滑滚动
    if ("scrollBehavior" in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = "smooth";
    }

    // 优化滚动容器
    const scrollContainers = document.querySelectorAll(".scroll-container");
    scrollContainers.forEach((container) => {
      container.style.webkitOverflowScrolling = "touch";
      container.style.overflowScrolling = "touch";
    });
  }
}

new TouchAdapter();
```

## 🌐 网络相关

### 网络：HTTP2 和 HTTP1.1 的对比

**问题**：HTTP/2 相比 HTTP/1.1 有什么优势和改进？

**回答**：

HTTP/2 是 HTTP 协议的重大升级，解决了 HTTP/1.1 的性能瓶颈问题。

**主要区别对比**：

| 特性       | HTTP/1.1             | HTTP/2           |
| ---------- | -------------------- | ---------------- |
| 连接方式   | 每个请求需要单独连接 | 单连接多路复用   |
| 数据格式   | 文本协议             | 二进制协议       |
| 头部压缩   | 无压缩，重复发送     | HPACK 压缩算法   |
| 服务器推送 | 不支持               | 支持 Server Push |
| 流控制     | 无                   | 支持流级别控制   |
| 优先级     | 无                   | 支持请求优先级   |

**1. 多路复用 (Multiplexing)**

```javascript
// HTTP/1.1 的问题：队头阻塞
class HTTP1Connection {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
  }

  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // HTTP/1.1 必须等待前一个请求完成
    while (this.requestQueue.length > 0) {
      const { request, resolve, reject } = this.requestQueue.shift();

      try {
        const response = await this.makeRequest(request);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  async makeRequest(request) {
    // 模拟网络请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Response for ${request.url}`);
      }, Math.random() * 1000);
    });
  }
}

// HTTP/2 多路复用实现模拟
class HTTP2Connection {
  constructor() {
    this.streams = new Map();
    this.nextStreamId = 1;
  }

  async sendRequest(request) {
    const streamId = this.nextStreamId;
    this.nextStreamId += 2; // 客户端使用奇数流ID

    const stream = {
      id: streamId,
      request,
      state: "open",
      priority: request.priority || 0,
    };

    this.streams.set(streamId, stream);

    // HTTP/2 可以并发处理多个请求
    return this.processStream(stream);
  }

  async processStream(stream) {
    try {
      // 并发处理，不阻塞其他流
      const response = await this.makeRequest(stream.request);
      stream.state = "closed";
      this.streams.delete(stream.id);
      return response;
    } catch (error) {
      stream.state = "error";
      this.streams.delete(stream.id);
      throw error;
    }
  }

  async makeRequest(request) {
    // 模拟并发请求处理
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`HTTP/2 Response for ${request.url}`);
      }, Math.random() * 1000);
    });
  }
}

// 性能对比测试
async function compareProtocols() {
  const requests = [
    { url: "/api/users" },
    { url: "/api/posts" },
    { url: "/api/comments" },
    { url: "/api/notifications" },
  ];

  console.time("HTTP/1.1");
  const http1 = new HTTP1Connection();
  const http1Results = await Promise.all(
    requests.map((req) => http1.sendRequest(req))
  );
  console.timeEnd("HTTP/1.1");

  console.time("HTTP/2");
  const http2 = new HTTP2Connection();
  const http2Results = await Promise.all(
    requests.map((req) => http2.sendRequest(req))
  );
  console.timeEnd("HTTP/2");
}
```

**2. 头部压缩 (HPACK)**

```javascript
// HPACK 压缩算法模拟
class HPACKCompressor {
  constructor() {
    // 静态表（RFC 7541 定义的常用头部）
    this.staticTable = [
      [":authority", ""],
      [":method", "GET"],
      [":method", "POST"],
      [":path", "/"],
      [":path", "/index.html"],
      [":scheme", "http"],
      [":scheme", "https"],
      [":status", "200"],
      [":status", "204"],
      [":status", "206"],
      ["accept-charset", ""],
      ["accept-encoding", "gzip, deflate"],
      ["accept-language", ""],
      ["accept-ranges", ""],
      ["accept", ""],
      ["access-control-allow-origin", ""],
      ["cache-control", ""],
      ["content-disposition", ""],
      ["content-encoding", ""],
      ["content-language", ""],
      ["content-length", ""],
      ["content-location", ""],
      ["content-range", ""],
      ["content-type", ""],
      ["cookie", ""],
      ["date", ""],
      ["etag", ""],
      ["expect", ""],
      ["expires", ""],
      ["from", ""],
      ["host", ""],
      ["if-match", ""],
      ["if-modified-since", ""],
      ["if-none-match", ""],
      ["if-range", ""],
      ["if-unmodified-since", ""],
      ["last-modified", ""],
      ["link", ""],
      ["location", ""],
      ["max-forwards", ""],
      ["proxy-authenticate", ""],
      ["proxy-authorization", ""],
      ["range", ""],
      ["referer", ""],
      ["refresh", ""],
      ["retry-after", ""],
      ["server", ""],
      ["set-cookie", ""],
      ["strict-transport-security", ""],
      ["transfer-encoding", ""],
      ["user-agent", ""],
      ["vary", ""],
      ["via", ""],
      ["www-authenticate", ""],
    ];

    // 动态表
    this.dynamicTable = [];
    this.dynamicTableSize = 0;
    this.maxDynamicTableSize = 4096;
  }

  // 压缩头部
  compressHeaders(headers) {
    const compressed = [];

    for (const [name, value] of Object.entries(headers)) {
      const entry = [name.toLowerCase(), value];

      // 查找静态表
      const staticIndex = this.findInStaticTable(entry);
      if (staticIndex !== -1) {
        // 完全匹配静态表条目
        compressed.push({
          type: "indexed",
          index: staticIndex + 1,
        });
        continue;
      }

      // 查找动态表
      const dynamicIndex = this.findInDynamicTable(entry);
      if (dynamicIndex !== -1) {
        // 完全匹配动态表条目
        compressed.push({
          type: "indexed",
          index: this.staticTable.length + dynamicIndex + 1,
        });
        continue;
      }

      // 查找名称匹配
      const nameIndex = this.findNameMatch(entry[0]);
      if (nameIndex !== -1) {
        // 名称匹配，值需要编码
        compressed.push({
          type: "literal_with_incremental_indexing",
          nameIndex: nameIndex + 1,
          value: this.huffmanEncode(entry[1]),
        });
      } else {
        // 完全新的头部
        compressed.push({
          type: "literal_with_incremental_indexing",
          name: this.huffmanEncode(entry[0]),
          value: this.huffmanEncode(entry[1]),
        });
      }

      // 添加到动态表
      this.addToDynamicTable(entry);
    }

    return compressed;
  }

  findInStaticTable([name, value]) {
    return this.staticTable.findIndex(([n, v]) => n === name && v === value);
  }

  findInDynamicTable([name, value]) {
    return this.dynamicTable.findIndex(([n, v]) => n === name && v === value);
  }

  findNameMatch(name) {
    // 先查静态表
    const staticIndex = this.staticTable.findIndex(([n]) => n === name);
    if (staticIndex !== -1) return staticIndex;

    // 再查动态表
    const dynamicIndex = this.dynamicTable.findIndex(([n]) => n === name);
    if (dynamicIndex !== -1) return this.staticTable.length + dynamicIndex;

    return -1;
  }

  addToDynamicTable([name, value]) {
    const entrySize = name.length + value.length + 32; // RFC 7541 定义的开销

    // 检查是否超过最大表大小
    while (
      this.dynamicTableSize + entrySize > this.maxDynamicTableSize &&
      this.dynamicTable.length > 0
    ) {
      const removed = this.dynamicTable.pop();
      this.dynamicTableSize -= removed[0].length + removed[1].length + 32;
    }

    // 添加新条目到表头
    this.dynamicTable.unshift([name, value]);
    this.dynamicTableSize += entrySize;
  }

  // 简化的 Huffman 编码
  huffmanEncode(str) {
    // 实际实现会使用 RFC 7541 定义的 Huffman 表
    // 这里简化为模拟压缩
    return {
      encoded: str,
      originalLength: str.length,
      compressedLength: Math.floor(str.length * 0.7), // 模拟70%压缩率
    };
  }
}

// 使用示例
const compressor = new HPACKCompressor();

const headers1 = {
  ":method": "GET",
  ":path": "/index.html",
  ":scheme": "https",
  ":authority": "example.com",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

const headers2 = {
  ":method": "GET",
  ":path": "/style.css",
  ":scheme": "https",
  ":authority": "example.com", // 相同的头部可以被压缩
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", // 相同
};

console.log("第一个请求压缩结果:", compressor.compressHeaders(headers1));
console.log("第二个请求压缩结果:", compressor.compressHeaders(headers2));
```

**3. 服务器推送 (Server Push)**

```javascript
// 服务器推送实现
class HTTP2Server {
  constructor() {
    this.pushCache = new Map();
  }

  // 处理请求并推送相关资源
  async handleRequest(request, response) {
    const { url, headers } = request;

    // 根据请求URL判断需要推送的资源
    const pushResources = this.getPushResources(url);

    // 检查客户端缓存状态
    const clientCacheControl = headers["cache-control"] || "";
    const shouldPush = !clientCacheControl.includes("no-cache");

    if (shouldPush && pushResources.length > 0) {
      // 并行推送资源
      const pushPromises = pushResources.map((resource) =>
        this.pushResource(response, resource)
      );

      // 等待推送完成
      await Promise.all(pushPromises);
    }

    // 返回主要响应
    return this.generateResponse(url);
  }

  getPushResources(url) {
    const pushMap = {
      "/": [
        { url: "/css/main.css", type: "text/css" },
        { url: "/js/app.js", type: "application/javascript" },
        { url: "/images/logo.png", type: "image/png" },
      ],
      "/product": [
        { url: "/css/product.css", type: "text/css" },
        { url: "/js/product.js", type: "application/javascript" },
        { url: "/api/product/recommendations", type: "application/json" },
      ],
    };

    return pushMap[url] || [];
  }

  async pushResource(response, resource) {
    const { url, type } = resource;

    // 检查是否已经推送过
    if (this.pushCache.has(url)) {
      console.log(`Resource ${url} already pushed, skipping`);
      return;
    }

    try {
      // 模拟推送资源
      const pushResponse = await this.generatePushResponse(url, type);

      // 添加推送头部
      response.push(
        {
          ":method": "GET",
          ":path": url,
          ":scheme": "https",
          ":authority": "example.com",
        },
        {
          ":status": "200",
          "content-type": type,
          "cache-control": "max-age=3600",
        }
      );

      // 发送推送内容
      response.write(pushResponse.body);

      // 记录推送缓存
      this.pushCache.set(url, {
        timestamp: Date.now(),
        type,
        size: pushResponse.body.length,
      });

      console.log(`Pushed resource: ${url}`);
    } catch (error) {
      console.error(`Failed to push resource ${url}:`, error);
    }
  }

  async generatePushResponse(url, type) {
    // 模拟生成推送资源内容
    const responses = {
      "/css/main.css": "body { margin: 0; padding: 0; }",
      "/js/app.js": 'console.log("App loaded");',
      "/images/logo.png": "PNG_BINARY_DATA",
      "/api/product/recommendations": JSON.stringify([
        { id: 1, name: "Product 1" },
        { id: 2, name: "Product 2" },
      ]),
    };

    return {
      body: responses[url] || "",
      headers: {
        "content-type": type,
        "cache-control": "max-age=3600",
      },
    };
  }

  generateResponse(url) {
    const responses = {
      "/": '<html><head><link rel="stylesheet" href="/css/main.css"></head><body>Home</body></html>',
      "/product":
        '<html><head><link rel="stylesheet" href="/css/product.css"></head><body>Product</body></html>',
    };

    return {
      status: 200,
      headers: {
        "content-type": "text/html",
        "cache-control": "max-age=300",
      },
      body: responses[url] || "Not Found",
    };
  }
}

// 客户端推送处理
class HTTP2Client {
  constructor() {
    this.pushCache = new Map();
    this.pendingPushes = new Map();
  }

  // 处理服务器推送
  handleServerPush(stream, headers) {
    const url = headers[":path"];
    const method = headers[":method"];

    console.log(`Received server push for: ${method} ${url}`);

    // 检查是否需要这个资源
    if (this.shouldAcceptPush(url)) {
      // 接受推送
      this.acceptPush(stream, url);
    } else {
      // 拒绝推送
      this.rejectPush(stream, url);
    }
  }

  shouldAcceptPush(url) {
    // 检查缓存中是否已有该资源
    if (this.pushCache.has(url)) {
      const cached = this.pushCache.get(url);
      const isExpired = Date.now() - cached.timestamp > cached.maxAge * 1000;

      if (!isExpired) {
        return false; // 缓存未过期，拒绝推送
      }
    }

    // 检查是否正在等待该资源
    if (this.pendingPushes.has(url)) {
      return true;
    }

    // 根据资源类型判断是否需要
    const resourceType = this.getResourceType(url);
    const acceptTypes = [
      "text/css",
      "application/javascript",
      "image/png",
      "application/json",
    ];

    return acceptTypes.includes(resourceType);
  }

  acceptPush(stream, url) {
    console.log(`Accepting push for: ${url}`);

    stream.on("data", (chunk) => {
      // 接收推送数据
      if (!this.pushCache.has(url)) {
        this.pushCache.set(url, {
          data: chunk,
          timestamp: Date.now(),
          maxAge: 3600,
        });
      } else {
        const cached = this.pushCache.get(url);
        cached.data = Buffer.concat([cached.data, chunk]);
      }
    });

    stream.on("end", () => {
      console.log(`Push completed for: ${url}`);

      // 如果有等待该资源的请求，直接返回
      if (this.pendingPushes.has(url)) {
        const resolve = this.pendingPushes.get(url);
        resolve(this.pushCache.get(url));
        this.pendingPushes.delete(url);
      }
    });
  }

  rejectPush(stream, url) {
    console.log(`Rejecting push for: ${url}`);
    stream.rstStream(); // 发送 RST_STREAM 帧
  }

  getResourceType(url) {
    const ext = url.split(".").pop();
    const typeMap = {
      css: "text/css",
      js: "application/javascript",
      png: "image/png",
      json: "application/json",
    };

    return typeMap[ext] || "application/octet-stream";
  }

  // 请求资源（可能使用推送的缓存）
  async requestResource(url) {
    // 检查推送缓存
    if (this.pushCache.has(url)) {
      const cached = this.pushCache.get(url);
      const isExpired = Date.now() - cached.timestamp > cached.maxAge * 1000;

      if (!isExpired) {
        console.log(`Using pushed cache for: ${url}`);
        return cached.data;
      }
    }

    // 检查是否有待处理的推送
    if (this.pendingPushes.has(url)) {
      console.log(`Waiting for server push: ${url}`);
      return this.pendingPushes.get(url);
    }

    // 正常请求
    console.log(`Making normal request for: ${url}`);
    return this.makeNormalRequest(url);
  }

  async makeNormalRequest(url) {
    // 模拟正常HTTP请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Normal response for ${url}`);
      }, 100);
    });
  }
}
```

**4. 流优先级和流控制**

```javascript
// HTTP/2 流优先级管理
class HTTP2StreamPriority {
  constructor() {
    this.streams = new Map();
    this.dependencyTree = new Map();
  }

  // 创建流
  createStream(streamId, priority = {}) {
    const stream = {
      id: streamId,
      state: "idle",
      weight: priority.weight || 16,
      dependency: priority.dependency || 0,
      exclusive: priority.exclusive || false,
      children: new Set(),
      parent: null,
      data: [],
    };

    this.streams.set(streamId, stream);
    this.updateDependency(streamId, priority);

    return stream;
  }

  // 更新流依赖关系
  updateDependency(streamId, priority) {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    const { dependency, exclusive, weight } = priority;

    // 移除旧的依赖关系
    if (stream.parent) {
      stream.parent.children.delete(streamId);
    }

    // 建立新的依赖关系
    if (dependency && dependency !== streamId) {
      const parentStream = this.streams.get(dependency);
      if (parentStream) {
        if (exclusive) {
          // 独占依赖：将父流的所有子流变为当前流的子流
          parentStream.children.forEach((childId) => {
            const childStream = this.streams.get(childId);
            childStream.parent = stream;
            stream.children.add(childId);
          });
          parentStream.children.clear();
        }

        parentStream.children.add(streamId);
        stream.parent = parentStream;
      }
    }

    stream.weight = weight || 16;
  }

  // 计算流优先级权重
  calculatePriority(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) return 0;

    let totalWeight = 0;
    let streamWeight = stream.weight;

    // 计算同级流的总权重
    if (stream.parent) {
      stream.parent.children.forEach((siblingId) => {
        const sibling = this.streams.get(siblingId);
        totalWeight += sibling.weight;
      });
    } else {
      // 根级流
      this.streams.forEach((s) => {
        if (!s.parent) {
          totalWeight += s.weight;
        }
      });
    }

    // 返回相对优先级（0-1之间）
    return streamWeight / totalWeight;
  }

  // 获取按优先级排序的流列表
  getPrioritizedStreams() {
    const activeStreams = Array.from(this.streams.values()).filter(
      (stream) => stream.state === "open" && stream.data.length > 0
    );

    // 按优先级排序
    return activeStreams.sort((a, b) => {
      const priorityA = this.calculatePriority(a.id);
      const priorityB = this.calculatePriority(b.id);
      return priorityB - priorityA; // 降序排列
    });
  }
}

// HTTP/2 流控制
class HTTP2FlowControl {
  constructor() {
    this.connectionWindowSize = 65535; // 连接级窗口大小
    this.streamWindows = new Map(); // 流级窗口大小
    this.defaultStreamWindow = 65535;
  }

  // 初始化流窗口
  initStreamWindow(streamId, windowSize = this.defaultStreamWindow) {
    this.streamWindows.set(streamId, windowSize);
  }

  // 检查是否可以发送数据
  canSendData(streamId, dataSize) {
    const streamWindow = this.streamWindows.get(streamId) || 0;

    return dataSize <= streamWindow && dataSize <= this.connectionWindowSize;
  }

  // 发送数据并更新窗口
  sendData(streamId, dataSize) {
    if (!this.canSendData(streamId, dataSize)) {
      throw new Error("Flow control window exceeded");
    }

    // 更新流窗口
    const currentStreamWindow = this.streamWindows.get(streamId);
    this.streamWindows.set(streamId, currentStreamWindow - dataSize);

    // 更新连接窗口
    this.connectionWindowSize -= dataSize;

    console.log(`Sent ${dataSize} bytes on stream ${streamId}`);
    console.log(
      `Stream window: ${this.streamWindows.get(streamId)}, Connection window: ${
        this.connectionWindowSize
      }`
    );
  }

  // 接收 WINDOW_UPDATE 帧
  receiveWindowUpdate(streamId, increment) {
    if (streamId === 0) {
      // 连接级窗口更新
      this.connectionWindowSize += increment;
      console.log(
        `Connection window updated: +${increment}, total: ${this.connectionWindowSize}`
      );
    } else {
      // 流级窗口更新
      const currentWindow = this.streamWindows.get(streamId) || 0;
      this.streamWindows.set(streamId, currentWindow + increment);
      console.log(
        `Stream ${streamId} window updated: +${increment}, total: ${this.streamWindows.get(
          streamId
        )}`
      );
    }
  }

  // 自动发送 WINDOW_UPDATE
  autoUpdateWindow(streamId, processedBytes) {
    const threshold = this.defaultStreamWindow / 2;

    if (streamId === 0) {
      // 连接级自动更新
      if (this.connectionWindowSize <= threshold) {
        const increment = this.defaultStreamWindow - this.connectionWindowSize;
        this.receiveWindowUpdate(0, increment);
        return { type: "connection", increment };
      }
    } else {
      // 流级自动更新
      const streamWindow = this.streamWindows.get(streamId) || 0;
      if (streamWindow <= threshold) {
        const increment = this.defaultStreamWindow - streamWindow;
        this.receiveWindowUpdate(streamId, increment);
        return { type: "stream", streamId, increment };
      }
    }

    return null;
  }
}

// 使用示例
const priorityManager = new HTTP2StreamPriority();
const flowControl = new HTTP2FlowControl();

// 创建流并设置优先级
const stream1 = priorityManager.createStream(1, { weight: 32 });
const stream2 = priorityManager.createStream(3, { weight: 16, dependency: 1 });
const stream3 = priorityManager.createStream(5, {
  weight: 8,
  dependency: 1,
  exclusive: true,
});

// 初始化流控制窗口
flowControl.initStreamWindow(1);
flowControl.initStreamWindow(3);
flowControl.initStreamWindow(5);

// 模拟数据发送
try {
  flowControl.sendData(1, 1024);
  flowControl.sendData(3, 2048);

  // 接收窗口更新
  flowControl.receiveWindowUpdate(1, 1024);
  flowControl.receiveWindowUpdate(0, 3072);
} catch (error) {
  console.error("Flow control error:", error.message);
}
```

## 🧮 算法相关

### 算法：将列表还原为树状结构

**问题**：如何将扁平的列表数据还原为树状结构？

**回答**：

将扁平列表转换为树状结构是常见的数据处理问题，主要通过建立父子关系映射来实现。

**1. 基本树结构转换**

```javascript
// 扁平数据结构
const flatData = [
  { id: 1, name: "根节点", parentId: null },
  { id: 2, name: "子节点1", parentId: 1 },
  { id: 3, name: "子节点2", parentId: 1 },
  { id: 4, name: "子子节点1", parentId: 2 },
  { id: 5, name: "子子节点2", parentId: 2 },
  { id: 6, name: "子子节点3", parentId: 3 },
];

// 方法1：递归构建树
function buildTreeRecursive(data, parentId = null) {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTreeRecursive(data, item.id),
    }));
}

// 方法2：Map映射优化（推荐）
function buildTreeOptimized(data) {
  const tree = [];
  const map = new Map();

  // 第一轮：创建所有节点的映射
  data.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  // 第二轮：建立父子关系
  data.forEach((item) => {
    const node = map.get(item.id);

    if (item.parentId === null) {
      // 根节点
      tree.push(node);
    } else {
      // 子节点
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return tree;
}

// 使用示例
console.log("递归方法:", JSON.stringify(buildTreeRecursive(flatData), null, 2));
console.log("优化方法:", JSON.stringify(buildTreeOptimized(flatData), null, 2));
```

**2. 通用树构建器**

```javascript
class TreeBuilder {
  constructor(options = {}) {
    this.idField = options.idField || "id";
    this.parentIdField = options.parentIdField || "parentId";
    this.childrenField = options.childrenField || "children";
    this.rootValue = options.rootValue || null;
  }

  // 构建树结构
  buildTree(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const tree = [];
    const map = new Map();

    // 创建节点映射
    data.forEach((item) => {
      const node = { ...item };
      node[this.childrenField] = [];
      map.set(item[this.idField], node);
    });

    // 建立父子关系
    data.forEach((item) => {
      const node = map.get(item[this.idField]);
      const parentId = item[this.parentIdField];

      if (parentId === this.rootValue || parentId === undefined) {
        tree.push(node);
      } else {
        const parent = map.get(parentId);
        if (parent) {
          parent[this.childrenField].push(node);
        } else {
          // 父节点不存在，作为根节点处理
          tree.push(node);
        }
      }
    });

    return tree;
  }

  // 树转扁平列表
  flattenTree(tree, result = []) {
    tree.forEach((node) => {
      const { [this.childrenField]: children, ...nodeData } = node;
      result.push(nodeData);

      if (children && children.length > 0) {
        this.flattenTree(children, result);
      }
    });

    return result;
  }

  // 查找节点
  findNode(tree, predicate) {
    for (const node of tree) {
      if (predicate(node)) {
        return node;
      }

      if (node[this.childrenField] && node[this.childrenField].length > 0) {
        const found = this.findNode(node[this.childrenField], predicate);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  // 获取节点路径
  getNodePath(tree, targetId, path = []) {
    for (const node of tree) {
      const currentPath = [...path, node];

      if (node[this.idField] === targetId) {
        return currentPath;
      }

      if (node[this.childrenField] && node[this.childrenField].length > 0) {
        const found = this.getNodePath(
          node[this.childrenField],
          targetId,
          currentPath
        );
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  // 树遍历
  traverse(tree, callback, mode = "dfs") {
    if (mode === "dfs") {
      this.dfsTraverse(tree, callback);
    } else if (mode === "bfs") {
      this.bfsTraverse(tree, callback);
    }
  }

  // 深度优先遍历
  dfsTraverse(tree, callback) {
    tree.forEach((node) => {
      callback(node);
      if (node[this.childrenField] && node[this.childrenField].length > 0) {
        this.dfsTraverse(node[this.childrenField], callback);
      }
    });
  }

  // 广度优先遍历
  bfsTraverse(tree, callback) {
    const queue = [...tree];

    while (queue.length > 0) {
      const node = queue.shift();
      callback(node);

      if (node[this.childrenField] && node[this.childrenField].length > 0) {
        queue.push(...node[this.childrenField]);
      }
    }
  }
}

// 使用示例
const treeBuilder = new TreeBuilder({
  idField: "id",
  parentIdField: "parentId",
  childrenField: "children",
});

const tree = treeBuilder.buildTree(flatData);
console.log("构建的树:", tree);

// 查找节点
const foundNode = treeBuilder.findNode(
  tree,
  (node) => node.name === "子子节点1"
);
console.log("找到的节点:", foundNode);

// 获取节点路径
const path = treeBuilder.getNodePath(tree, 4);
console.log(
  "节点路径:",
  path.map((node) => node.name)
);

// 遍历树
console.log("深度优先遍历:");
treeBuilder.traverse(tree, (node) => console.log(node.name), "dfs");

console.log("广度优先遍历:");
treeBuilder.traverse(tree, (node) => console.log(node.name), "bfs");
```

**3. 多根树和森林处理**

```javascript
// 处理多根树（森林）
class ForestBuilder extends TreeBuilder {
  // 构建森林（多个根节点的树）
  buildForest(data) {
    const forest = [];
    const processedIds = new Set();

    // 找出所有可能的根节点
    const potentialRoots = data.filter((item) => {
      const parentExists = data.some(
        (parent) => parent[this.idField] === item[this.parentIdField]
      );
      return !parentExists || item[this.parentIdField] === this.rootValue;
    });

    // 为每个根节点构建子树
    potentialRoots.forEach((root) => {
      if (!processedIds.has(root[this.idField])) {
        const subtree = this.buildSubtree(
          data,
          root[this.idField],
          processedIds
        );
        if (subtree) {
          forest.push(subtree);
        }
      }
    });

    return forest;
  }

  buildSubtree(data, rootId, processedIds) {
    const root = data.find((item) => item[this.idField] === rootId);
    if (!root || processedIds.has(rootId)) {
      return null;
    }

    processedIds.add(rootId);

    const node = { ...root };
    node[this.childrenField] = [];

    // 找到所有子节点
    const children = data.filter((item) => item[this.parentIdField] === rootId);

    children.forEach((child) => {
      const childNode = this.buildSubtree(
        data,
        child[this.idField],
        processedIds
      );
      if (childNode) {
        node[this.childrenField].push(childNode);
      }
    });

    return node;
  }

  // 合并多个森林
  mergeForests(...forests) {
    const merged = [];
    const idSet = new Set();

    forests.forEach((forest) => {
      forest.forEach((tree) => {
        if (!idSet.has(tree[this.idField])) {
          merged.push(tree);
          idSet.add(tree[this.idField]);
        }
      });
    });

    return merged;
  }
}

// 使用示例
const forestData = [
  { id: 1, name: "树1根节点", parentId: null },
  { id: 2, name: "树1子节点", parentId: 1 },
  { id: 3, name: "树2根节点", parentId: null },
  { id: 4, name: "树2子节点", parentId: 3 },
  { id: 5, name: "孤立节点", parentId: 999 }, // 父节点不存在
];

const forestBuilder = new ForestBuilder();
const forest = forestBuilder.buildForest(forestData);
console.log("构建的森林:", JSON.stringify(forest, null, 2));
```

### 算法：二叉搜索树的第 k 个结点

**问题**：如何找到二叉搜索树中第 k 小的元素？

**回答**：

在二叉搜索树中找第 k 小的元素，可以利用中序遍历的特性（中序遍历 BST 得到有序序列）。

**1. 基本 BST 实现**

```javascript
// 二叉搜索树节点
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 二叉搜索树类
class BST {
  constructor() {
    this.root = null;
  }

  // 插入节点
  insert(val) {
    this.root = this.insertNode(this.root, val);
  }

  insertNode(node, val) {
    if (node === null) {
      return new TreeNode(val);
    }

    if (val < node.val) {
      node.left = this.insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertNode(node.right, val);
    }

    return node;
  }

  // 查找节点
  search(val) {
    return this.searchNode(this.root, val);
  }

  searchNode(node, val) {
    if (node === null || node.val === val) {
      return node;
    }

    if (val < node.val) {
      return this.searchNode(node.left, val);
    } else {
      return this.searchNode(node.right, val);
    }
  }

  // 删除节点
  delete(val) {
    this.root = this.deleteNode(this.root, val);
  }

  deleteNode(node, val) {
    if (node === null) {
      return null;
    }

    if (val < node.val) {
      node.left = this.deleteNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.deleteNode(node.right, val);
    } else {
      // 找到要删除的节点
      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      } else {
        // 有两个子节点，找到右子树的最小值
        const minNode = this.findMin(node.right);
        node.val = minNode.val;
        node.right = this.deleteNode(node.right, minNode.val);
      }
    }

    return node;
  }

  findMin(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  findMax(node) {
    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }
}
```

**2. 找第 k 小元素的多种方法**

```javascript
class BST_WithKthElement extends BST {
  // 方法1：中序遍历（递归）
  kthSmallest(k) {
    const result = [];
    this.inorderTraversal(this.root, result);
    return result[k - 1];
  }

  inorderTraversal(node, result) {
    if (node !== null) {
      this.inorderTraversal(node.left, result);
      result.push(node.val);
      this.inorderTraversal(node.right, result);
    }
  }

  // 方法2：中序遍历优化（提前终止）
  kthSmallestOptimized(k) {
    let count = 0;
    let result = null;

    const inorder = (node) => {
      if (node === null || result !== null) {
        return;
      }

      inorder(node.left);

      count++;
      if (count === k) {
        result = node.val;
        return;
      }

      inorder(node.right);
    };

    inorder(this.root);
    return result;
  }

  // 方法3：迭代中序遍历
  kthSmallestIterative(k) {
    const stack = [];
    let current = this.root;
    let count = 0;

    while (current !== null || stack.length > 0) {
      // 走到最左边
      while (current !== null) {
        stack.push(current);
        current = current.left;
      }

      // 处理当前节点
      current = stack.pop();
      count++;

      if (count === k) {
        return current.val;
      }

      // 转向右子树
      current = current.right;
    }

    return null;
  }

  // 方法4：Morris遍历（O(1)空间复杂度）
  kthSmallestMorris(k) {
    let current = this.root;
    let count = 0;

    while (current !== null) {
      if (current.left === null) {
        // 没有左子树，访问当前节点
        count++;
        if (count === k) {
          return current.val;
        }
        current = current.right;
      } else {
        // 有左子树，找到前驱节点
        let predecessor = current.left;
        while (predecessor.right !== null && predecessor.right !== current) {
          predecessor = predecessor.right;
        }

        if (predecessor.right === null) {
          // 建立线索
          predecessor.right = current;
          current = current.left;
        } else {
          // 恢复树结构
          predecessor.right = null;
          count++;
          if (count === k) {
            return current.val;
          }
          current = current.right;
        }
      }
    }

    return null;
  }
}
```

**3. 支持动态查询的 BST**

```javascript
// 增强版BST，支持快速第k小查询
class EnhancedBST {
  constructor() {
    this.root = null;
  }

  // 增强的树节点，包含子树大小信息
  createNode(val) {
    return {
      val: val,
      left: null,
      right: null,
      size: 1, // 子树节点数量
    };
  }

  // 获取节点的子树大小
  getSize(node) {
    return node ? node.size : 0;
  }

  // 更新节点的子树大小
  updateSize(node) {
    if (node) {
      node.size = 1 + this.getSize(node.left) + this.getSize(node.right);
    }
  }

  // 插入节点
  insert(val) {
    this.root = this.insertNode(this.root, val);
  }

  insertNode(node, val) {
    if (node === null) {
      return this.createNode(val);
    }

    if (val < node.val) {
      node.left = this.insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertNode(node.right, val);
    }

    this.updateSize(node);
    return node;
  }

  // O(log n)时间复杂度找第k小元素
  kthSmallest(k) {
    return this.kthSmallestNode(this.root, k);
  }

  kthSmallestNode(node, k) {
    if (node === null) {
      return null;
    }

    const leftSize = this.getSize(node.left);

    if (k <= leftSize) {
      // 第k小在左子树
      return this.kthSmallestNode(node.left, k);
    } else if (k === leftSize + 1) {
      // 当前节点就是第k小
      return node.val;
    } else {
      // 第k小在右子树
      return this.kthSmallestNode(node.right, k - leftSize - 1);
    }
  }

  // 找第k大元素
  kthLargest(k) {
    const totalSize = this.getSize(this.root);
    return this.kthSmallest(totalSize - k + 1);
  }

  // 查找排名（该值是第几小的）
  getRank(val) {
    return this.getRankNode(this.root, val);
  }

  getRankNode(node, val) {
    if (node === null) {
      return 0;
    }

    if (val < node.val) {
      return this.getRankNode(node.left, val);
    } else if (val > node.val) {
      return 1 + this.getSize(node.left) + this.getRankNode(node.right, val);
    } else {
      return this.getSize(node.left) + 1;
    }
  }

  // 删除节点
  delete(val) {
    this.root = this.deleteNode(this.root, val);
  }

  deleteNode(node, val) {
    if (node === null) {
      return null;
    }

    if (val < node.val) {
      node.left = this.deleteNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.deleteNode(node.right, val);
    } else {
      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      } else {
        const successor = this.findMin(node.right);
        node.val = successor.val;
        node.right = this.deleteNode(node.right, successor.val);
      }
    }

    this.updateSize(node);
    return node;
  }

  findMin(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }
}

// 使用示例和测试
function testBST() {
  // 创建BST
  const bst = new EnhancedBST();
  const values = [5, 3, 7, 2, 4, 6, 8, 1, 9];

  // 插入节点
  values.forEach((val) => bst.insert(val));

  console.log("BST构建完成，节点值:", values);

  // 测试第k小元素
  for (let k = 1; k <= values.length; k++) {
    const kthSmall = bst.kthSmallest(k);
    const kthLarge = bst.kthLargest(k);
    console.log(`第${k}小: ${kthSmall}, 第${k}大: ${kthLarge}`);
  }

  // 测试排名
  values.forEach((val) => {
    const rank = bst.getRank(val);
    console.log(`值${val}的排名: ${rank}`);
  });

  // 性能测试
  console.time("查找第5小元素");
  const fifth = bst.kthSmallest(5);
  console.timeEnd("查找第5小元素");
  console.log("第5小元素:", fifth);
}

testBST();
```

**4. 平衡 BST 实现（AVL 树）**

```javascript
// AVL树实现（自平衡BST）
class AVLTree extends EnhancedBST {
  createNode(val) {
    return {
      val: val,
      left: null,
      right: null,
      size: 1,
      height: 1,
    };
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height =
        1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  // 右旋转
  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateSize(y);
    this.updateHeight(x);
    this.updateSize(x);

    return x;
  }

  // 左旋转
  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateSize(x);
    this.updateHeight(y);
    this.updateSize(y);

    return y;
  }

  insertNode(node, val) {
    // 1. 正常BST插入
    if (node === null) {
      return this.createNode(val);
    }

    if (val < node.val) {
      node.left = this.insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertNode(node.right, val);
    } else {
      return node; // 重复值不插入
    }

    // 2. 更新高度和大小
    this.updateHeight(node);
    this.updateSize(node);

    // 3. 获取平衡因子
    const balance = this.getBalance(node);

    // 4. 如果不平衡，进行旋转
    // Left Left Case
    if (balance > 1 && val < node.left.val) {
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && val > node.right.val) {
      return this.rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && val > node.left.val) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && val < node.right.val) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }
}

// 使用AVL树测试
const avlTree = new AVLTree();
[10, 20, 30, 40, 50, 25].forEach((val) => avlTree.insert(val));

console.log("AVL树第3小元素:", avlTree.kthSmallest(3));
console.log("AVL树第3大元素:", avlTree.kthLargest(3));
```

## 🔄 综合应用

### 综合：如何减少白屏时间

**问题**：如何优化前端应用，减少用户看到白屏的时间？

**回答**：

白屏时间是影响用户体验的关键指标，需要从多个维度进行优化。

**1. 关键渲染路径优化**

```javascript
// 关键资源优先级管理
class CriticalResourceLoader {
  constructor() {
    this.criticalResources = new Set();
    this.loadedResources = new Set();
    this.loadingPromises = new Map();
  }

  // 标记关键资源
  markAsCritical(url) {
    this.criticalResources.add(url);
  }

  // 预加载关键资源
  async preloadCriticalResources() {
    const promises = Array.from(this.criticalResources).map((url) =>
      this.loadResource(url, "high")
    );

    return Promise.all(promises);
  }

  // 加载资源
  async loadResource(url, priority = "auto") {
    if (this.loadedResources.has(url)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    const promise = this.createResourceLoader(url, priority);
    this.loadingPromises.set(url, promise);

    try {
      await promise;
      this.loadedResources.add(url);
    } finally {
      this.loadingPromises.delete(url);
    }

    return promise;
  }

  createResourceLoader(url, priority) {
    return new Promise((resolve, reject) => {
      const fileType = this.getFileType(url);
      let element;

      switch (fileType) {
        case "css":
          element = document.createElement("link");
          element.rel = "stylesheet";
          element.href = url;
          break;

        case "js":
          element = document.createElement("script");
          element.src = url;
          element.async = true;
          break;

        case "font":
          element = document.createElement("link");
          element.rel = "preload";
          element.as = "font";
          element.type = "font/woff2";
          element.href = url;
          element.crossOrigin = "anonymous";
          break;

        default:
          element = document.createElement("link");
          element.rel = "preload";
          element.href = url;
      }

      // 设置优先级
      if (element.fetchPriority) {
        element.fetchPriority = priority;
      }

      element.onload = resolve;
      element.onerror = reject;

      document.head.appendChild(element);
    });
  }

  getFileType(url) {
    const extension = url.split(".").pop().toLowerCase();
    const typeMap = {
      css: "css",
      js: "js",
      woff: "font",
      woff2: "font",
      ttf: "font",
      otf: "font",
    };

    return typeMap[extension] || "unknown";
  }
}

// 使用示例
const resourceLoader = new CriticalResourceLoader();

// 标记关键资源
resourceLoader.markAsCritical("/css/critical.css");
resourceLoader.markAsCritical("/js/core.js");
resourceLoader.markAsCritical("/fonts/main.woff2");

// 页面加载时预加载关键资源
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await resourceLoader.preloadCriticalResources();
    console.log("关键资源加载完成");
  } catch (error) {
    console.error("关键资源加载失败:", error);
  }
});
```

**2. 首屏内容优化**

```html
<!-- 内联关键CSS -->
<style>
  /* 首屏关键样式内联 */
  .header {
    background: #fff;
    height: 60px;
  }
  .hero {
    min-height: 400px;
    background: #f5f5f5;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<!-- 预连接到重要域名 -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="preconnect" href="https://cdn.example.com" />

<!-- 预加载关键资源 -->
<link
  rel="preload"
  href="/fonts/main.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link rel="preload" href="/images/hero.jpg" as="image" />

<!-- 异步加载非关键CSS -->
<link
  rel="preload"
  href="/css/non-critical.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

```javascript
// 首屏内容渲染优化
class FirstScreenRenderer {
  constructor() {
    this.criticalData = null;
    this.renderStartTime = performance.now();
  }

  // 获取首屏关键数据
  async getCriticalData() {
    if (this.criticalData) {
      return this.criticalData;
    }

    try {
      // 并行请求关键数据
      const [userData, configData] = await Promise.all([
        this.fetchWithTimeout("/api/user", 1000),
        this.fetchWithTimeout("/api/config", 1000),
      ]);

      this.criticalData = { userData, configData };
      return this.criticalData;
    } catch (error) {
      console.warn("获取关键数据失败，使用默认数据:", error);

      // 使用缓存或默认数据
      this.criticalData = this.getDefaultData();
      return this.criticalData;
    }
  }

  // 带超时的fetch
  async fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "max-age=60",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  getDefaultData() {
    return {
      userData: { name: "用户", avatar: "/images/default-avatar.png" },
      configData: { theme: "light", language: "zh-CN" },
    };
  }

  // 渲染首屏内容
  async renderFirstScreen() {
    const startTime = performance.now();

    try {
      // 显示加载状态
      this.showLoadingState();

      // 获取关键数据
      const data = await this.getCriticalData();

      // 渲染首屏
      this.renderContent(data);

      // 记录性能指标
      const renderTime = performance.now() - startTime;
      this.recordMetrics("first-screen-render", renderTime);
    } catch (error) {
      console.error("首屏渲染失败:", error);
      this.renderErrorState();
    }
  }

  showLoadingState() {
    const loadingHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载...</p>
      </div>
    `;

    document.getElementById("app").innerHTML = loadingHTML;
  }

  renderContent(data) {
    const { userData, configData } = data;

    const contentHTML = `
      <header class="header">
        <img src="${userData.avatar}" alt="用户头像" class="avatar">
        <span class="username">${userData.name}</span>
      </header>
      <main class="hero">
        <h1>欢迎回来，${userData.name}！</h1>
        <p>主题: ${configData.theme}</p>
      </main>
    `;

    document.getElementById("app").innerHTML = contentHTML;

    // 触发首屏渲染完成事件
    this.dispatchFirstScreenReady();
  }

  renderErrorState() {
    const errorHTML = `
      <div class="error-container">
        <h2>加载失败</h2>
        <button onclick="location.reload()">重试</button>
      </div>
    `;

    document.getElementById("app").innerHTML = errorHTML;
  }

  dispatchFirstScreenReady() {
    const event = new CustomEvent("firstScreenReady", {
      detail: {
        renderTime: performance.now() - this.renderStartTime,
      },
    });

    window.dispatchEvent(event);
  }

  recordMetrics(name, value) {
    // 发送性能指标
    if ("sendBeacon" in navigator) {
      const data = JSON.stringify({
        metric: name,
        value: value,
        timestamp: Date.now(),
        url: location.href,
      });

      navigator.sendBeacon("/api/metrics", data);
    }
  }
}

// 使用首屏渲染器
const renderer = new FirstScreenRenderer();
renderer.renderFirstScreen();
```

**3. 代码分割和懒加载**

```javascript
// 动态导入和代码分割
class ModuleLoader {
  constructor() {
    this.loadedModules = new Map();
    this.loadingModules = new Map();
  }

  // 懒加载模块
  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    if (this.loadingModules.has(moduleName)) {
      return this.loadingModules.get(moduleName);
    }

    const loadPromise = this.dynamicImport(moduleName);
    this.loadingModules.set(moduleName, loadPromise);

    try {
      const module = await loadPromise;
      this.loadedModules.set(moduleName, module);
      return module;
    } finally {
      this.loadingModules.delete(moduleName);
    }
  }

  async dynamicImport(moduleName) {
    const moduleMap = {
      dashboard: () => import("./pages/Dashboard.js"),
      profile: () => import("./pages/Profile.js"),
      settings: () => import("./pages/Settings.js"),
      chart: () => import("./components/Chart.js"),
      editor: () => import("./components/Editor.js"),
    };

    const importFn = moduleMap[moduleName];
    if (!importFn) {
      throw new Error(`Unknown module: ${moduleName}`);
    }

    return await importFn();
  }

  // 预加载模块（在空闲时）
  preloadModule(moduleName) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        this.loadModule(moduleName).catch(console.error);
      });
    } else {
      setTimeout(() => {
        this.loadModule(moduleName).catch(console.error);
      }, 0);
    }
  }

  // 批量预加载
  preloadModules(moduleNames, priority = "low") {
    const loadPromises = moduleNames.map(
      (name) =>
        new Promise((resolve) => {
          if (priority === "high") {
            this.loadModule(name).then(resolve).catch(resolve);
          } else {
            this.preloadModule(name);
            resolve();
          }
        })
    );

    return Promise.all(loadPromises);
  }
}

// 路由级别的代码分割
class LazyRouter {
  constructor() {
    this.moduleLoader = new ModuleLoader();
    this.routes = new Map();
    this.currentRoute = null;
  }

  // 注册路由
  register(path, moduleName, preload = false) {
    this.routes.set(path, { moduleName, preload });

    if (preload) {
      this.moduleLoader.preloadModule(moduleName);
    }
  }

  // 导航到路由
  async navigate(path) {
    const route = this.routes.get(path);
    if (!route) {
      throw new Error(`Route not found: ${path}`);
    }

    try {
      // 显示加载状态
      this.showRouteLoading();

      // 加载模块
      const module = await this.moduleLoader.loadModule(route.moduleName);

      // 渲染页面
      await this.renderRoute(module, path);

      this.currentRoute = path;
    } catch (error) {
      console.error("路由导航失败:", error);
      this.showRouteError(error);
    }
  }

  showRouteLoading() {
    const loadingElement = document.createElement("div");
    loadingElement.className = "route-loading";
    loadingElement.innerHTML = '<div class="spinner">加载中...</div>';

    document.getElementById("router-outlet").innerHTML = "";
    document.getElementById("router-outlet").appendChild(loadingElement);
  }

  async renderRoute(module, path) {
    const outlet = document.getElementById("router-outlet");

    if (module.default && typeof module.default.render === "function") {
      await module.default.render(outlet);
    } else {
      outlet.innerHTML = "<div>页面渲染失败</div>";
    }
  }

  showRouteError(error) {
    const errorElement = document.createElement("div");
    errorElement.className = "route-error";
    errorElement.innerHTML = `
      <h2>页面加载失败</h2>
      <p>${error.message}</p>
      <button onclick="location.reload()">重试</button>
    `;

    document.getElementById("router-outlet").innerHTML = "";
    document.getElementById("router-outlet").appendChild(errorElement);
  }
}

// 使用示例
const router = new LazyRouter();

// 注册路由
router.register("/", "dashboard", true); // 首页预加载
router.register("/profile", "profile");
router.register("/settings", "settings");

// 监听路由变化
window.addEventListener("popstate", () => {
  router.navigate(location.pathname);
});

// 初始路由
router.navigate(location.pathname);
```

**4. 服务端渲染（SSR）优化**

```javascript
// SSR渲染优化
class SSROptimizer {
  constructor() {
    this.isSSR = typeof window === "undefined";
    this.hydrationData = null;
  }

  // 服务端数据预取
  async prefetchData(route, params) {
    if (!this.isSSR) {
      return null;
    }

    const dataFetchers = {
      "/": this.fetchHomeData,
      "/product/:id": this.fetchProductData,
      "/user/:id": this.fetchUserData,
    };

    const fetcher = dataFetchers[route];
    if (fetcher) {
      return await fetcher.call(this, params);
    }

    return null;
  }

  async fetchHomeData() {
    // 模拟服务端数据获取
    return {
      posts: await this.fetchPosts(),
      user: await this.fetchCurrentUser(),
    };
  }

  async fetchProductData(params) {
    return {
      product: await this.fetchProduct(params.id),
      reviews: await this.fetchProductReviews(params.id),
    };
  }

  // 客户端水合
  hydrate(ssrData) {
    if (this.isSSR) {
      return;
    }

    this.hydrationData = ssrData;

    // 恢复应用状态
    this.restoreAppState(ssrData);

    // 绑定事件监听器
    this.attachEventListeners();

    // 标记水合完成
    document.documentElement.setAttribute("data-hydrated", "true");

    // 触发水合完成事件
    window.dispatchEvent(new CustomEvent("hydrationComplete"));
  }

  restoreAppState(data) {
    // 恢复全局状态
    if (window.APP_STATE) {
      Object.assign(window.APP_STATE, data);
    }

    // 恢复表单状态
    this.restoreFormState();

    // 恢复滚动位置
    this.restoreScrollPosition();
  }

  attachEventListeners() {
    // 重新绑定事件监听器
    document.querySelectorAll("[data-action]").forEach((element) => {
      const action = element.getAttribute("data-action");
      element.addEventListener("click", this.handleAction.bind(this, action));
    });
  }

  handleAction(action, event) {
    // 处理用户交互
    console.log("Action:", action, event.target);
  }

  // 渐进式增强
  enhanceProgressively() {
    // 检查是否支持现代特性
    const supportsIntersectionObserver = "IntersectionObserver" in window;
    const supportsServiceWorker = "serviceWorker" in navigator;

    if (supportsIntersectionObserver) {
      this.enableLazyLoading();
    }

    if (supportsServiceWorker) {
      this.registerServiceWorker();
    }

    // 启用离线功能
    this.enableOfflineSupport();
  }

  enableLazyLoading() {
    const images = document.querySelectorAll("img[data-src]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => observer.observe(img));
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker注册成功:", registration);
    } catch (error) {
      console.error("Service Worker注册失败:", error);
    }
  }

  enableOfflineSupport() {
    window.addEventListener("online", () => {
      document.body.classList.remove("offline");
      this.syncOfflineData();
    });

    window.addEventListener("offline", () => {
      document.body.classList.add("offline");
      this.showOfflineMessage();
    });
  }

  showOfflineMessage() {
    const message = document.createElement("div");
    message.className = "offline-message";
    message.textContent = "您当前处于离线状态";
    document.body.appendChild(message);
  }
}

// 使用SSR优化器
const ssrOptimizer = new SSROptimizer();

// 如果是客户端，进行水合
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // 获取服务端渲染的数据
    const ssrData = window.__SSR_DATA__ || {};

    // 执行水合
    ssrOptimizer.hydrate(ssrData);

    // 渐进式增强
    ssrOptimizer.enhanceProgressively();
  });
}
```

**5. 性能监控和优化**

```javascript
// 白屏时间监控
class WhiteScreenMonitor {
  constructor() {
    this.metrics = {
      navigationStart: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstScreenComplete: 0,
    };

    this.init();
  }

  init() {
    // 监控导航开始时间
    this.metrics.navigationStart = performance.timing.navigationStart;

    // 监控FP和FCP
    this.observePaintTimings();

    // 监控LCP
    this.observeLCP();

    // 监控首屏完成时间
    this.observeFirstScreen();

    // 页面卸载时发送数据
    this.setupBeforeUnload();
  }

  observePaintTimings() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === "first-paint") {
          this.metrics.firstPaint = entry.startTime;
        }
        if (entry.name === "first-contentful-paint") {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    });

    observer.observe({ entryTypes: ["paint"] });
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  }

  observeFirstScreen() {
    // 监听首屏渲染完成事件
    window.addEventListener("firstScreenReady", (event) => {
      this.metrics.firstScreenComplete = event.detail.renderTime;
      this.calculateWhiteScreenTime();
    });
  }

  calculateWhiteScreenTime() {
    const whiteScreenTime = this.metrics.firstContentfulPaint;
    const firstScreenTime = this.metrics.firstScreenComplete;

    console.log("性能指标:", {
      "First Paint": `${this.metrics.firstPaint}ms`,
      "First Contentful Paint": `${this.metrics.firstContentfulPaint}ms`,
      "Largest Contentful Paint": `${this.metrics.largestContentfulPaint}ms`,
      "First Screen Complete": `${this.metrics.firstScreenComplete}ms`,
      "White Screen Time": `${whiteScreenTime}ms`,
    });

    // 发送监控数据
    this.sendMetrics({
      whiteScreenTime,
      firstScreenTime,
      ...this.metrics,
    });
  }

  sendMetrics(data) {
    const metricsData = {
      ...data,
      url: location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/performance", JSON.stringify(metricsData));
    } else {
      fetch("/api/performance", {
        method: "POST",
        body: JSON.stringify(metricsData),
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(console.error);
    }
  }

  setupBeforeUnload() {
    window.addEventListener("beforeunload", () => {
      // 发送最终的性能数据
      this.sendMetrics(this.metrics);
    });
  }
}

// 启动白屏监控
const monitor = new WhiteScreenMonitor();
```

---

## 📚 总结

这套模拟面试三涵盖了前端开发的核心技术栈：

### 🎯 **知识点覆盖**

1. **浏览器机制**：事件循环、内存泄漏定位
2. **工程化工具**：webpack loader 原理和实现
3. **框架深度**：React Hooks 实现、Diff 算法原理
4. **语言基础**：JavaScript 异步编程、TypeScript Interface
5. **移动开发**：移动端适配解决方案
6. **网络协议**：HTTP/2 vs HTTP/1.1 详细对比
7. **算法实现**：树结构转换、BST 第 k 小元素
8. **性能优化**：白屏时间优化综合方案

### 💡 **回答特色**

- **深度技术分析**：从原理到实现的完整讲解
- **实战代码示例**：可运行的完整代码实现
- **性能优化导向**：关注实际项目中的性能问题
- **工程化思维**：结合现代前端开发的最佳实践
- **系统性解决方案**：不仅知道怎么做，更知道为什么这么做

### 🚀 **适用场景**

- **高级前端工程师面试**：涵盖各个技术领域的深度问题
- **技术架构师面试**：系统性的解决方案和优化策略
- **技术分享和学习**：完整的知识体系和实现细节
- **项目实践参考**：可直接应用到实际项目中的代码

这些知识点构成了现代前端开发的核心技能栈，能够全面考察候选人的技术深度、实战能力和工程化思维。
