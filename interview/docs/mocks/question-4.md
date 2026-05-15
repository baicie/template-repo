# 模拟面试四 - 详细回答

## 浏览器相关

### 前端路由实现

前端路由是单页应用(SPA)的核心技术，主要有两种实现方式：

#### 1. Hash 路由

**原理：** 利用 URL 中的 hash(#)部分，hash 值的变化不会导致页面刷新，但会触发`hashchange`事件。

```javascript
class HashRouter {
  constructor() {
    this.routes = {};
    this.currentUrl = "";

    // 监听hash变化
    window.addEventListener("hashchange", this.refresh.bind(this));
    window.addEventListener("load", this.refresh.bind(this));
  }

  // 注册路由
  route(path, callback) {
    this.routes[path] = callback || function () {};
  }

  // 刷新路由
  refresh() {
    this.currentUrl = location.hash.slice(1) || "/";
    this.routes[this.currentUrl] && this.routes[this.currentUrl]();
  }

  // 导航到指定路由
  push(path) {
    location.hash = path;
  }
}

// 使用示例
const router = new HashRouter();
router.route("/", () => console.log("首页"));
router.route("/about", () => console.log("关于页"));
router.push("/about");
```

#### 2. History 路由

**原理：** 利用 HTML5 的 History API，通过`pushState`和`replaceState`改变 URL 而不刷新页面。

```javascript
class HistoryRouter {
  constructor() {
    this.routes = {};
    this.currentUrl = "";

    // 监听popstate事件（浏览器前进后退）
    window.addEventListener("popstate", this.refresh.bind(this));
    this.refresh();
  }

  // 注册路由
  route(path, callback) {
    this.routes[path] = callback || function () {};
  }

  // 刷新路由
  refresh() {
    this.currentUrl = location.pathname;
    this.routes[this.currentUrl] && this.routes[this.currentUrl]();
  }

  // 导航到指定路由
  push(path) {
    history.pushState(null, null, path);
    this.currentUrl = path;
    this.routes[path] && this.routes[path]();
  }

  // 替换当前路由
  replace(path) {
    history.replaceState(null, null, path);
    this.currentUrl = path;
    this.routes[path] && this.routes[path]();
  }
}
```

### 本地存储方式及场景

#### 1. localStorage

**特点：**

- 持久化存储，除非主动删除否则一直存在
- 同域下所有页面共享
- 存储容量约 5-10MB
- 同步 API

**适用场景：**

```javascript
// 用户偏好设置
const userPreferences = {
  theme: "dark",
  language: "zh-CN",
  fontSize: 16,
};
localStorage.setItem("userPreferences", JSON.stringify(userPreferences));

// 购物车数据
const cart = [
  { id: 1, name: "商品1", price: 100, quantity: 2 },
  { id: 2, name: "商品2", price: 200, quantity: 1 },
];
localStorage.setItem("cart", JSON.stringify(cart));
```

#### 2. sessionStorage

**特点：**

- 会话级存储，页面关闭后清除
- 同一标签页内共享
- 存储容量约 5-10MB
- 同步 API

**适用场景：**

```javascript
// 页面状态
sessionStorage.setItem("currentStep", "2");
sessionStorage.setItem(
  "formData",
  JSON.stringify({
    step1: { name: "John", email: "john@example.com" },
    step2: { address: "123 Main St", city: "New York" },
  })
);

// 临时缓存
const apiResponse = await fetch("/api/data");
const data = await apiResponse.json();
sessionStorage.setItem("tempData", JSON.stringify(data));
```

#### 3. IndexedDB

**特点：**

- 异步 API
- 支持事务
- 存储容量大（通常几百 MB 到几 GB）
- 支持复杂数据类型

**实现封装：**

```javascript
class IndexedDBHelper {
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
            const objectStore = db.createObjectStore(store.name, store.options);

            // 创建索引
            if (store.indexes) {
              store.indexes.forEach((index) => {
                objectStore.createIndex(
                  index.name,
                  index.keyPath,
                  index.options
                );
              });
            }
          }
        });
      };
    });
  }

  // 添加数据
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取数据
  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

## 工程化相关

### 如何对前端代码实施测试

前端测试是保证代码质量的重要手段，主要包括单元测试、集成测试和端到端测试。

#### 1. 单元测试实现

**Jest + Testing Library 示例：**

```javascript
// utils/math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;
export const divide = (a, b) => {
  if (b === 0) throw new Error("除数不能为零");
  return a / b;
};

// __tests__/utils.test.js
import { add, multiply, divide } from "../utils/math";

describe("Math Utils", () => {
  describe("add", () => {
    test("should add two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    test("should add negative numbers", () => {
      expect(add(-2, -3)).toBe(-5);
    });

    test("should handle zero", () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe("divide", () => {
    test("should divide two numbers", () => {
      expect(divide(10, 2)).toBe(5);
    });

    test("should throw error when dividing by zero", () => {
      expect(() => divide(10, 0)).toThrow("除数不能为零");
    });
  });
});
```

**React 组件测试：**

```javascript
// components/Button.jsx
import React from "react";
import PropTypes from "prop-types";

const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "medium",
}) => {
  const baseClasses = "btn";
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  );
};

// __tests__/Button.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "../Button";

describe("Button Component", () => {
  test("renders button with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("disables button when disabled prop is true", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );

    const button = screen.getByText("Disabled Button");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

#### 2. 端到端测试

**Cypress 示例：**

```javascript
// cypress/e2e/todo-app.cy.js
describe("Todo App E2E", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("should allow users to manage todos", () => {
    // 添加新的todo
    cy.get('[data-testid="todo-input"]').type("学习Cypress");
    cy.get('[data-testid="add-button"]').click();

    // 验证todo已添加
    cy.contains("学习Cypress").should("be.visible");

    // 完成第一个todo
    cy.get('[data-testid="todo-item"]')
      .first()
      .find('[data-testid="toggle-checkbox"]')
      .click();

    // 验证todo状态
    cy.get('[data-testid="todo-item"]')
      .first()
      .should("have.class", "completed");
  });
});
```

### 谈谈微前端

微前端是一种将前端应用分解为更小、更简单的独立部分的架构模式。

#### 1. 微前端架构原理

```javascript
class MicroFrontendFramework {
  constructor() {
    this.apps = new Map();
    this.currentApp = null;
  }

  // 注册子应用
  registerApp(name, config) {
    this.apps.set(name, {
      name,
      entry: config.entry,
      container: config.container,
      activeRule: config.activeRule,
      loader: config.loader,
      props: config.props || {},
    });
  }

  // 启动框架
  start() {
    this.setupRouting();
    this.loadInitialApp();
  }

  // 设置路由监听
  setupRouting() {
    window.addEventListener("popstate", this.handleRouteChange.bind(this));

    // 拦截pushState和replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleRouteChange();
    };
  }

  // 处理路由变化
  handleRouteChange() {
    const currentPath = window.location.pathname;
    const targetApp = this.findMatchingApp(currentPath);

    if (targetApp && targetApp !== this.currentApp) {
      this.switchApp(targetApp);
    }
  }

  // 查找匹配的应用
  findMatchingApp(path) {
    for (const [name, app] of this.apps) {
      if (typeof app.activeRule === "function") {
        if (app.activeRule(path)) return name;
      } else if (typeof app.activeRule === "string") {
        if (path.startsWith(app.activeRule)) return name;
      }
    }
    return null;
  }

  // 切换应用
  async switchApp(appName) {
    // 卸载当前应用
    if (this.currentApp) {
      await this.unmountApp(this.currentApp);
    }

    // 加载新应用
    if (appName) {
      await this.mountApp(appName);
      this.currentApp = appName;
    }
  }

  // 挂载应用
  async mountApp(appName) {
    const app = this.apps.get(appName);
    if (!app) return;

    try {
      // 加载应用资源
      const appModule = await this.loadApp(app);

      // 创建容器
      const container = document.querySelector(app.container);
      if (!container) {
        throw new Error(`Container ${app.container} not found`);
      }

      // 挂载应用
      if (appModule.mount) {
        await appModule.mount(container, app.props);
      }

      app.instance = appModule;
      console.log(`应用 ${appName} 挂载成功`);
    } catch (error) {
      console.error(`应用 ${appName} 挂载失败:`, error);
    }
  }

  // 卸载应用
  async unmountApp(appName) {
    const app = this.apps.get(appName);
    if (!app || !app.instance) return;

    try {
      if (app.instance.unmount) {
        await app.instance.unmount();
      }

      // 清理DOM
      const container = document.querySelector(app.container);
      if (container) {
        container.innerHTML = "";
      }

      app.instance = null;
      console.log(`应用 ${appName} 卸载成功`);
    } catch (error) {
      console.error(`应用 ${appName} 卸载失败:`, error);
    }
  }

  // 加载应用
  async loadApp(app) {
    if (app.loader) {
      return await app.loader();
    }

    // 默认加载方式
    return await this.loadAppByEntry(app.entry);
  }

  // 通过入口加载应用
  async loadAppByEntry(entry) {
    if (typeof entry === "string") {
      // 动态导入
      return await import(entry);
    } else if (typeof entry === "object") {
      // 加载JS和CSS资源
      const { scripts = [], styles = [] } = entry;

      // 加载样式
      await Promise.all(styles.map(this.loadCSS));

      // 加载脚本
      const modules = await Promise.all(scripts.map(this.loadJS));

      // 返回最后一个模块（通常是主模块）
      return modules[modules.length - 1];
    }
  }

  // 加载CSS
  loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // 加载JS
  loadJS(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        // 假设脚本导出到全局变量
        resolve(window[this.getGlobalVarName(src)]);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 获取全局变量名
  getGlobalVarName(src) {
    const filename = src.split("/").pop().replace(".js", "");
    return filename.replace(/[-_]/g, "");
  }

  // 加载初始应用
  loadInitialApp() {
    this.handleRouteChange();
  }
}
```

#### 2. qiankun 实现示例

```javascript
// 主应用配置
import { registerMicroApps, start, setDefaultMountApp } from "qiankun";

// 注册子应用
registerMicroApps([
  {
    name: "react-app",
    entry: "//localhost:3001",
    container: "#react-container",
    activeRule: "/react",
    props: {
      routerBase: "/react",
    },
  },
  {
    name: "vue-app",
    entry: "//localhost:3002",
    container: "#vue-container",
    activeRule: "/vue",
    props: {
      routerBase: "/vue",
    },
  },
]);

// 设置默认子应用
setDefaultMountApp("/react");

// 启动qiankun
start({
  sandbox: {
    strictStyleIsolation: true,
    experimentalStyleIsolation: true,
  },
  prefetch: true,
});

// 子应用配置 (React)
// src/index.js
import "./public-path";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

function render(props = {}) {
  const { container } = props;
  const dom = container
    ? container.querySelector("#root")
    : document.querySelector("#root");

  ReactDOM.render(<App />, dom);
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 导出qiankun生命周期
export async function bootstrap() {
  console.log("React应用启动");
}

export async function mount(props) {
  console.log("React应用挂载", props);
  render(props);
}

export async function unmount(props) {
  console.log("React应用卸载", props);
  const { container } = props;
  const dom = container
    ? container.querySelector("#root")
    : document.querySelector("#root");
  ReactDOM.unmountComponentAtNode(dom);
}
```

## 框架相关

### React 事件机制原理

React 的事件机制是一个复杂而精妙的系统，通过事件委托、合成事件等技术提供统一的事件处理体验。

#### 1. 合成事件(SyntheticEvent)

React 创建了自己的事件系统来包装原生 DOM 事件，提供跨浏览器的一致性体验。

```javascript
// 合成事件的基本实现
class SyntheticEvent {
  constructor(nativeEvent) {
    this.nativeEvent = nativeEvent;
    this.type = nativeEvent.type;
    this.target = nativeEvent.target;
    this.currentTarget = nativeEvent.currentTarget;
    this.timeStamp = nativeEvent.timeStamp;
    this._stopPropagation = false;
    this._preventDefault = false;
  }

  // 阻止冒泡
  stopPropagation() {
    this._stopPropagation = true;
    if (this.nativeEvent.stopPropagation) {
      this.nativeEvent.stopPropagation();
    }
  }

  // 阻止默认行为
  preventDefault() {
    this._preventDefault = true;
    if (this.nativeEvent.preventDefault) {
      this.nativeEvent.preventDefault();
    }
  }

  // 检查是否阻止了默认行为
  isDefaultPrevented() {
    return this._preventDefault;
  }

  // 检查是否阻止了冒泡
  isPropagationStopped() {
    return this._stopPropagation;
  }
}

// 不同类型的合成事件
class SyntheticMouseEvent extends SyntheticEvent {
  constructor(nativeEvent) {
    super(nativeEvent);
    this.button = nativeEvent.button;
    this.buttons = nativeEvent.buttons;
    this.clientX = nativeEvent.clientX;
    this.clientY = nativeEvent.clientY;
    this.pageX = nativeEvent.pageX;
    this.pageY = nativeEvent.pageY;
    this.screenX = nativeEvent.screenX;
    this.screenY = nativeEvent.screenY;
    this.shiftKey = nativeEvent.shiftKey;
    this.ctrlKey = nativeEvent.ctrlKey;
    this.altKey = nativeEvent.altKey;
    this.metaKey = nativeEvent.metaKey;
  }
}
```

#### 2. 事件委托机制

React 使用事件委托将所有事件监听器绑定到文档根节点，而不是每个元素。

```javascript
// 事件委托系统的简化实现
class EventDelegationSystem {
  constructor() {
    this.listenerBank = new Map(); // 存储所有事件监听器
    this.documentListeners = new Set(); // 已绑定到document的事件类型
  }

  // 注册事件监听器
  addListener(element, eventType, listener, capture = false) {
    const elementId = this.getElementId(element);

    // 存储监听器
    if (!this.listenerBank.has(elementId)) {
      this.listenerBank.set(elementId, new Map());
    }

    const elementListeners = this.listenerBank.get(elementId);
    if (!elementListeners.has(eventType)) {
      elementListeners.set(eventType, []);
    }

    elementListeners.get(eventType).push({
      listener,
      capture,
    });

    // 如果是第一次注册此类型事件，绑定到document
    if (!this.documentListeners.has(eventType)) {
      this.bindToDocument(eventType);
      this.documentListeners.add(eventType);
    }
  }

  // 绑定事件到document
  bindToDocument(eventType) {
    const handler = (nativeEvent) => {
      this.handleEvent(nativeEvent);
    };

    // 绑定捕获阶段和冒泡阶段
    document.addEventListener(eventType, handler, true); // 捕获
    document.addEventListener(eventType, handler, false); // 冒泡
  }

  // 处理事件
  handleEvent(nativeEvent) {
    const { type, target } = nativeEvent;

    // 构建事件路径（从target到document）
    const eventPath = this.buildEventPath(target);

    // 创建合成事件
    const syntheticEvent = this.createSyntheticEvent(nativeEvent);

    // 捕获阶段
    if (nativeEvent.eventPhase === Event.CAPTURING_PHASE) {
      this.processEventPath(eventPath.reverse(), syntheticEvent, true);
    }
    // 冒泡阶段
    else if (nativeEvent.eventPhase === Event.BUBBLING_PHASE) {
      this.processEventPath(eventPath, syntheticEvent, false);
    }
  }

  // 构建事件路径
  buildEventPath(target) {
    const path = [];
    let current = target;

    while (current && current !== document) {
      if (this.isReactElement(current)) {
        path.push(current);
      }
      current = current.parentNode;
    }

    return path;
  }

  // 处理事件路径
  processEventPath(path, syntheticEvent, isCapture) {
    for (const element of path) {
      if (syntheticEvent.isPropagationStopped()) {
        break;
      }

      const elementId = this.getElementId(element);
      const elementListeners = this.listenerBank.get(elementId);

      if (elementListeners && elementListeners.has(syntheticEvent.type)) {
        const listeners = elementListeners.get(syntheticEvent.type);

        for (const { listener, capture } of listeners) {
          if (capture === isCapture) {
            syntheticEvent.currentTarget = element;

            try {
              listener(syntheticEvent);
            } catch (error) {
              console.error("事件处理器执行出错:", error);
            }
          }
        }
      }
    }
  }

  // 创建合成事件
  createSyntheticEvent(nativeEvent) {
    const { type } = nativeEvent;

    switch (type) {
      case "click":
      case "mousedown":
      case "mouseup":
      case "mousemove":
        return new SyntheticMouseEvent(nativeEvent);

      default:
        return new SyntheticEvent(nativeEvent);
    }
  }

  // 获取元素ID
  getElementId(element) {
    if (!element._reactInternalId) {
      element._reactInternalId = Math.random().toString(36).substr(2, 9);
    }
    return element._reactInternalId;
  }

  // 检查是否是React元素
  isReactElement(element) {
    return element && element._reactInternalId;
  }
}
```

### React 和 Vue 的区别

React 和 Vue 是目前最流行的两个前端框架，它们在设计理念、实现方式和使用体验上都有显著差异。

#### 1. 设计理念对比

```javascript
// React: 函数式编程思维，数据不可变
// React组件示例
import React, { useState, useEffect } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // 不可变更新
  const addTodo = () => {
    setTodos((prevTodos) => [
      ...prevTodos,
      {
        id: Date.now(),
        text: inputValue,
        completed: false,
      },
    ]);
    setInputValue("");
  };

  const toggleTodo = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="添加待办事项"
      />
      <button onClick={addTodo}>添加</button>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{
              textDecoration: todo.completed ? "line-through" : "none",
            }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 2. 响应式系统对比

```javascript
// React的响应式：基于状态变化重新渲染
class ReactResponsiveSystem {
  constructor() {
    this.state = {};
    this.subscribers = [];
  }

  // useState的简化实现
  useState(initialValue) {
    let value = initialValue;

    const setState = (newValue) => {
      if (typeof newValue === "function") {
        value = newValue(value);
      } else {
        value = newValue;
      }

      // 触发重新渲染
      this.scheduleUpdate();
    };

    return [value, setState];
  }

  // 调度更新
  scheduleUpdate() {
    // React的调度器会批处理更新
    Promise.resolve().then(() => {
      this.subscribers.forEach((subscriber) => subscriber());
    });
  }
}

// Vue的响应式：基于数据劫持和依赖收集
class VueResponsiveSystem {
  constructor() {
    this.targetMap = new WeakMap();
    this.activeEffect = null;
  }

  // reactive的简化实现
  reactive(target) {
    if (typeof target !== "object" || target === null) {
      return target;
    }

    return new Proxy(target, {
      get: (obj, key) => {
        // 依赖收集
        this.track(obj, key);

        const result = obj[key];

        // 深度响应式
        if (typeof result === "object" && result !== null) {
          return this.reactive(result);
        }

        return result;
      },

      set: (obj, key, value) => {
        const oldValue = obj[key];
        obj[key] = value;

        // 触发更新
        if (oldValue !== value) {
          this.trigger(obj, key);
        }

        return true;
      },
    });
  }

  // 依赖收集
  track(target, key) {
    if (!this.activeEffect) return;

    let depsMap = this.targetMap.get(target);
    if (!depsMap) {
      this.targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }

    dep.add(this.activeEffect);
  }

  // 触发更新
  trigger(target, key) {
    const depsMap = this.targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (dep) {
      dep.forEach((effect) => effect());
    }
  }
}
```

#### 3. 生命周期对比

```javascript
// React生命周期（Hooks）
function ReactLifecycle() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // componentDidMount + componentDidUpdate
  useEffect(() => {
    console.log("组件挂载或更新后");

    // cleanup function (componentWillUnmount)
    return () => {
      console.log("组件即将卸载或依赖变化前");
    };
  });

  // 仅在挂载时执行
  useEffect(() => {
    console.log("组件挂载后");
    fetchData();

    return () => {
      console.log("组件卸载时");
    };
  }, []); // 空依赖数组

  // 依赖变化时执行
  useEffect(() => {
    console.log("data变化了:", data);
  }, [data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1>数据展示</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

#### 4. 性能优化对比

```javascript
// React性能优化
import React, { memo, useMemo, useCallback } from "react";

// React.memo - 组件级别的优化
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  console.log("ExpensiveComponent渲染");

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          {item.name}
          <button onClick={() => onUpdate(item.id)}>更新</button>
        </div>
      ))}
    </div>
  );
});

function OptimizedReactApp() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");

  // useMemo - 计算结果缓存
  const filteredItems = useMemo(() => {
    console.log("计算过滤结果");
    return items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // useCallback - 函数缓存
  const handleUpdate = useCallback((id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, updated: Date.now() } : item
      )
    );
  }, []);

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="过滤项目"
      />

      <ExpensiveComponent data={filteredItems} onUpdate={handleUpdate} />
    </div>
  );
}
```

#### 5. 适用场景对比

```javascript
// 学习曲线和使用场景
const ComparisonSummary = {
  react: {
    优势: [
      "灵活性高，可定制性强",
      "生态系统丰富",
      "函数式编程思维",
      "适合大型复杂应用",
      "移动端支持好(React Native)",
    ],
    劣势: ["学习曲线陡峭", "需要更多架构决策", "状态管理复杂"],
    适合场景: [
      "大型企业级应用",
      "需要高度定制的项目",
      "团队有函数式编程经验",
      "需要服务端渲染",
    ],
  },

  vue: {
    优势: [
      "学习曲线平缓",
      "模板语法直观",
      "官方解决方案完整",
      "渐进式框架",
      "开发体验好",
    ],
    劣势: ["灵活性相对较低", "大型项目架构挑战", "TypeScript支持较晚"],
    适合场景: [
      "中小型项目",
      "快速开发需求",
      "团队JavaScript基础一般",
      "需要渐进式迁移",
    ],
  },
};
```

## 基础相关

### 什么是 TypeScript 泛型

TypeScript 泛型是一种创建可重用组件的工具，它允许我们创建能够适用于多种类型的组件。

#### 1. 泛型基础概念

```typescript
// 基本泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 使用方式
let output1 = identity<string>("hello"); // 显式指定类型
let output2 = identity("hello"); // 类型推断
let output3 = identity<number>(42);

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;

  constructor(zeroValue: T, addFn: (x: T, y: T) => T) {
    this.zeroValue = zeroValue;
    this.add = addFn;
  }
}
```

#### 2. 泛型约束

```typescript
// 基本约束
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // 现在我们知道它有length属性
  return arg;
}

// 在泛型约束中使用类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let person = { name: "Alice", age: 30 };
let name = getProperty(person, "name"); // string
let age = getProperty(person, "age"); // number
```

#### 3. 实用工具类型

```typescript
// 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type UserPartial = Partial<User>; // 所有属性可选
type UserReadonly = Readonly<User>; // 所有属性只读
type UserPick = Pick<User, "id" | "name">; // 选择特定属性
```

## 样式相关

### 水平垂直居中方案

#### 1. Flexbox 方案（推荐）

```css
/* 使用justify-content和align-items */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 使用margin: auto */
.flex-center-auto {
  display: flex;
  height: 100vh;
}

.flex-center-auto .child {
  margin: auto;
}
```

#### 2. Grid 方案

```css
/* 使用place-items */
.grid-center {
  display: grid;
  place-items: center;
  height: 100vh;
}

/* 使用justify-content和align-content */
.grid-center-content {
  display: grid;
  justify-content: center;
  align-content: center;
  height: 100vh;
}
```

#### 3. 定位方案

```css
/* 绝对定位 + transform */
.position-center {
  position: relative;
  height: 100vh;
}

.position-center .child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## 编码相关

### 实现 apply/call/bind

这三个方法都是用来改变函数执行时的 this 指向。

#### 1. call 方法实现

```javascript
Function.prototype.myCall = function (context, ...args) {
  // 如果context是null或undefined，则指向全局对象
  context = context || globalThis;

  // 为context创建一个唯一的属性名，避免覆盖原有属性
  const fnSymbol = Symbol("fn");

  // 将当前函数作为context的方法
  context[fnSymbol] = this;

  // 调用函数并获取结果
  const result = context[fnSymbol](...args);

  // 删除临时属性
  delete context[fnSymbol];

  return result;
};

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const person = { name: "Alice" };
console.log(greet.myCall(person, "Hello", "!")); // "Hello, I'm Alice!"
```

#### 2. apply 方法实现

```javascript
Function.prototype.myApply = function (context, argsArray) {
  // 如果context是null或undefined，则指向全局对象
  context = context || globalThis;

  // 如果argsArray不是数组，则转换为空数组
  argsArray = Array.isArray(argsArray) ? argsArray : [];

  // 为context创建一个唯一的属性名
  const fnSymbol = Symbol("fn");

  // 将当前函数作为context的方法
  context[fnSymbol] = this;

  // 调用函数并获取结果
  const result = context[fnSymbol](...argsArray);

  // 删除临时属性
  delete context[fnSymbol];

  return result;
};

// 测试
console.log(greet.myApply(person, ["Hi", "?"])); // "Hi, I'm Alice?"
```

#### 3. bind 方法实现

```javascript
Function.prototype.myBind = function (context, ...bindArgs) {
  const fn = this;

  // 返回一个新函数
  const boundFunction = function (...callArgs) {
    // 如果是通过new调用，this指向新创建的对象
    if (new.target) {
      return new fn(...bindArgs, ...callArgs);
    }

    // 否则使用指定的context
    return fn.myCall(context, ...bindArgs, ...callArgs);
  };

  // 维护原型链
  if (fn.prototype) {
    boundFunction.prototype = Object.create(fn.prototype);
  }

  return boundFunction;
};

// 测试
const boundGreet = greet.myBind(person, "Hey");
console.log(boundGreet(".")); // "Hey, I'm Alice."

// 测试构造函数情况
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const BoundPerson = Person.myBind(null, "Bob");
const bob = new BoundPerson(25);
console.log(bob); // Person { name: "Bob", age: 25 }
```

## 算法相关

### 找到数组中重复的数字

有多种方法可以找到数组中的重复数字，每种方法都有不同的时间和空间复杂度。

#### 1. 使用哈希表（推荐）

```javascript
function findDuplicates(nums) {
  const seen = new Set();
  const duplicates = new Set();

  for (const num of nums) {
    if (seen.has(num)) {
      duplicates.add(num);
    } else {
      seen.add(num);
    }
  }

  return Array.from(duplicates);
}

// 测试
console.log(findDuplicates([1, 2, 3, 2, 4, 5, 1])); // [2, 1]
console.log(findDuplicates([1, 2, 3, 4, 5])); // []
```

#### 2. 排序后查找

```javascript
function findDuplicatesSort(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const duplicates = [];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] && !duplicates.includes(sorted[i])) {
      duplicates.push(sorted[i]);
    }
  }

  return duplicates;
}

// 测试
console.log(findDuplicatesSort([4, 3, 2, 7, 8, 2, 3, 1])); // [2, 3]
```

#### 3. 使用 Map 计数

```javascript
function findDuplicatesWithCount(nums) {
  const countMap = new Map();

  // 统计每个数字的出现次数
  for (const num of nums) {
    countMap.set(num, (countMap.get(num) || 0) + 1);
  }

  // 找出出现次数大于1的数字
  const duplicates = [];
  for (const [num, count] of countMap) {
    if (count > 1) {
      duplicates.push(num);
    }
  }

  return duplicates;
}

// 测试
console.log(findDuplicatesWithCount([1, 2, 3, 2, 4, 5, 1, 1])); // [2, 1]
```

#### 4. 原地标记法（特殊情况）

```javascript
// 适用于数组元素都在[1, n]范围内的情况
function findDuplicatesInPlace(nums) {
  const duplicates = [];

  for (let i = 0; i < nums.length; i++) {
    const index = Math.abs(nums[i]) - 1;

    if (nums[index] < 0) {
      // 如果对应位置的数字已经是负数，说明之前见过
      duplicates.push(Math.abs(nums[i]));
    } else {
      // 将对应位置的数字标记为负数
      nums[index] = -nums[index];
    }
  }

  // 恢复原数组（可选）
  for (let i = 0; i < nums.length; i++) {
    nums[i] = Math.abs(nums[i]);
  }

  return duplicates;
}

// 测试
console.log(findDuplicatesInPlace([4, 3, 2, 7, 8, 2, 3, 1])); // [2, 3]
```

这样我们就完成了模拟面试四的所有题目回答！
