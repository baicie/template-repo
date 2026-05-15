# 小程序底层实现原理

小程序作为一种轻量级应用形态，其底层实现涉及多个技术层面。本文深入解析小程序的架构设计、运行机制和核心原理。

## 🏗️ 整体架构设计

### 双线程架构

小程序采用双线程架构，将逻辑层和渲染层分离：

```javascript
// 小程序双线程架构
const MiniProgramArchitecture = {
  // 逻辑层 (App Service)
  logicThread: {
    environment: "JavaScript Core (iOS) / V8 (Android)",
    responsibilities: ["业务逻辑处理", "数据管理", "API 调用", "事件处理"],

    // 逻辑层核心
    appService: {
      // 页面管理器
      pageManager: {
        pageStack: [], // 页面栈
        currentPage: null,

        // 页面生命周期管理
        lifecycle: {
          onLoad: "page.onLoad",
          onShow: "page.onShow",
          onReady: "page.onReady",
          onHide: "page.onHide",
          onUnload: "page.onUnload",
        },
      },

      // 数据管理器
      dataManager: {
        // 页面数据
        pageData: new Map(),

        // 全局数据
        globalData: {},

        // 数据更新机制
        setData(path, data, callback) {
          // 1. 数据diff算法
          const diff = this.computeDiff(path, data);

          // 2. 序列化数据
          const serializedData = JSON.stringify(diff);

          // 3. 通过JSBridge发送到渲染层
          JSBridge.publish("setData", {
            path,
            data: serializedData,
            callback: callback && callback.toString(),
          });
        },
      },

      // API管理器
      apiManager: {
        // 原生API调用
        invokeNativeAPI(api, params) {
          return new Promise((resolve, reject) => {
            JSBridge.invoke(api, params, (result) => {
              if (result.errCode === 0) {
                resolve(result.data);
              } else {
                reject(result.errMsg);
              }
            });
          });
        },
      },
    },
  },

  // 渲染层 (Web View)
  renderThread: {
    environment: "WebView (iOS/Android)",
    responsibilities: ["页面渲染", "用户交互", "组件管理", "样式计算"],

    // 渲染引擎
    renderEngine: {
      // 虚拟DOM管理
      virtualDOM: {
        // WXML编译后的虚拟节点树
        vNodeTree: null,

        // 创建虚拟节点
        createVNode(tag, props, children) {
          return {
            tag,
            props: props || {},
            children: children || [],
            key: props && props.key,
            ref: null,
          };
        },

        // 差异化更新
        patch(oldVNode, newVNode) {
          if (!oldVNode) {
            return this.mount(newVNode);
          }

          if (oldVNode.tag !== newVNode.tag) {
            return this.replace(oldVNode, newVNode);
          }

          // 更新属性
          this.updateProps(oldVNode, newVNode);

          // 更新子节点
          this.updateChildren(oldVNode, newVNode);
        },
      },

      // 组件系统
      componentSystem: {
        // 内置组件注册表
        builtinComponents: {
          view: ViewComponent,
          text: TextComponent,
          button: ButtonComponent,
          input: InputComponent,
          "scroll-view": ScrollViewComponent,
        },

        // 自定义组件注册表
        customComponents: new Map(),

        // 组件实例化
        createComponent(componentName, props) {
          const ComponentClass =
            this.builtinComponents[componentName] ||
            this.customComponents.get(componentName);

          if (!ComponentClass) {
            throw new Error(`Component ${componentName} not found`);
          }

          return new ComponentClass(props);
        },
      },
    },
  },

  // 通信桥梁
  communicationBridge: {
    // JSBridge实现
    jsBridge: {
      // 消息队列
      messageQueue: [],

      // 回调函数映射
      callbackMap: new Map(),

      // 发布消息到另一个线程
      publish(event, data) {
        const message = {
          id: this.generateId(),
          event,
          data,
          timestamp: Date.now(),
        };

        // 序列化消息
        const serializedMessage = JSON.stringify(message);

        // 通过WebView的postMessage发送
        if (typeof webkit !== "undefined") {
          // iOS
          webkit.messageHandlers.miniProgram.postMessage(serializedMessage);
        } else if (typeof WeixinJSBridge !== "undefined") {
          // Android
          WeixinJSBridge.publish(event, serializedMessage);
        }
      },

      // 调用原生能力
      invoke(api, params, callback) {
        const callbackId = this.generateId();
        this.callbackMap.set(callbackId, callback);

        this.publish("invokeAPI", {
          api,
          params,
          callbackId,
        });
      },
    },
  },
};
```

### 架构层次图

```javascript
// 小程序架构层次
const ArchitectureLayers = {
  // 应用层
  applicationLayer: {
    description: "开发者编写的业务代码",
    components: ["Page页面", "Component组件", "App应用实例", "业务逻辑代码"],
  },

  // 框架层
  frameworkLayer: {
    description: "小程序框架核心",
    components: [
      "Page/Component构造器",
      "生命周期管理",
      "数据绑定系统",
      "事件系统",
      "API封装",
    ],
  },

  // 运行时层
  runtimeLayer: {
    description: "运行时环境",
    components: [
      "JavaScript引擎",
      "WebView渲染引擎",
      "JSBridge通信",
      "原生组件容器",
    ],
  },

  // 系统层
  systemLayer: {
    description: "宿主应用和操作系统",
    components: ["微信/支付宝客户端", "原生API", "系统权限", "硬件访问"],
  },
};
```

## 🔄 启动流程详解

### 小程序启动过程

```javascript
// 小程序启动流程
class MiniProgramBootstrap {
  constructor() {
    this.state = "initializing";
    this.appInstance = null;
    this.pageStack = [];
  }

  // 启动流程
  async bootstrap() {
    try {
      // 1. 环境初始化
      await this.initializeEnvironment();

      // 2. 资源加载
      await this.loadResources();

      // 3. 框架初始化
      await this.initializeFramework();

      // 4. 应用启动
      await this.launchApplication();

      // 5. 首页渲染
      await this.renderFirstPage();

      this.state = "ready";
    } catch (error) {
      this.handleBootstrapError(error);
    }
  }

  // 1. 环境初始化
  async initializeEnvironment() {
    // JavaScript引擎初始化
    this.initJSEngine();

    // WebView初始化
    this.initWebView();

    // JSBridge建立
    this.setupJSBridge();

    // 原生API注册
    this.registerNativeAPIs();
  }

  // 2. 资源加载
  async loadResources() {
    // 下载小程序包
    const packageInfo = await this.downloadPackage();

    // 解压和验证
    const files = await this.extractAndVerify(packageInfo);

    // 加载app.json配置
    this.appConfig = await this.loadAppConfig(files["app.json"]);

    // 预加载关键资源
    await this.preloadCriticalResources(files);
  }

  // 3. 框架初始化
  async initializeFramework() {
    // 注册全局对象
    this.registerGlobalObjects();

    // 初始化页面管理器
    this.pageManager = new PageManager();

    // 初始化组件系统
    this.componentSystem = new ComponentSystem();

    // 初始化事件系统
    this.eventSystem = new EventSystem();
  }

  // 4. 应用启动
  async launchApplication() {
    // 执行app.js
    const appCode = await this.loadFile("app.js");
    this.executeAppCode(appCode);

    // 创建App实例
    this.appInstance = new App(this.appConfig);

    // 触发onLaunch生命周期
    if (this.appInstance.onLaunch) {
      this.appInstance.onLaunch(this.launchOptions);
    }

    // 触发onShow生命周期
    if (this.appInstance.onShow) {
      this.appInstance.onShow(this.launchOptions);
    }
  }

  // 5. 首页渲染
  async renderFirstPage() {
    const firstPagePath = this.appConfig.pages[0];
    await this.navigateToPage(firstPagePath, {}, "navigate");
  }

  // 页面导航
  async navigateToPage(pagePath, options, navigateType) {
    // 1. 加载页面资源
    const pageFiles = await this.loadPageFiles(pagePath);

    // 2. 创建页面实例
    const pageInstance = await this.createPageInstance(pageFiles, options);

    // 3. 页面栈管理
    this.managePageStack(pageInstance, navigateType);

    // 4. 渲染页面
    await this.renderPage(pageInstance);

    // 5. 触发生命周期
    this.triggerPageLifecycle(pageInstance, "onLoad", options);
    this.triggerPageLifecycle(pageInstance, "onShow");
  }

  // 创建页面实例
  async createPageInstance(pageFiles, options) {
    // 执行页面JS代码
    const pageCode = pageFiles["index.js"];
    const pageConfig = this.executePage(pageCode);

    // 创建页面对象
    const pageInstance = {
      route: pageFiles.path,
      data: pageConfig.data || {},
      options: options,

      // 绑定方法
      ...pageConfig,

      // 框架方法
      setData: this.createSetDataMethod(),
      selectComponent: this.createSelectComponentMethod(),
      createSelectorQuery: this.createSelectorQueryMethod(),
    };

    return pageInstance;
  }

  // setData实现
  createSetDataMethod() {
    return function (data, callback) {
      // 1. 数据验证
      if (!this.validateData(data)) {
        throw new Error("Invalid data format");
      }

      // 2. 数据合并
      const newData = this.mergeData(this.data, data);

      // 3. 计算差异
      const diff = this.computeDataDiff(this.data, newData);

      // 4. 更新页面数据
      this.data = newData;

      // 5. 通知渲染层更新
      JSBridge.publish("pageDataUpdate", {
        path: this.route,
        diff: diff,
      });

      // 6. 执行回调
      if (callback) {
        this.nextTick(callback);
      }
    };
  }
}
```

## 📊 数据绑定机制

### 数据流向分析

```javascript
// 数据绑定系统
class DataBindingSystem {
  constructor() {
    this.watchers = new Map();
    this.computedCache = new Map();
    this.updateQueue = [];
    this.isUpdating = false;
  }

  // 数据绑定核心
  bindData(pageInstance) {
    // 1. 解析WXML中的数据绑定
    const bindings = this.parseDataBindings(pageInstance.wxml);

    // 2. 建立数据依赖关系
    this.establishDependencies(pageInstance, bindings);

    // 3. 创建响应式数据
    this.createReactiveData(pageInstance);
  }

  // 解析数据绑定
  parseDataBindings(wxml) {
    const bindings = [];

    // 匹配 {{}} 表达式
    const bindingRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = bindingRegex.exec(wxml)) !== null) {
      const expression = match[1].trim();
      bindings.push({
        expression,
        dependencies: this.extractDependencies(expression),
      });
    }

    return bindings;
  }

  // 提取依赖
  extractDependencies(expression) {
    const dependencies = [];

    // 简单变量引用
    const simpleVarRegex =
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\b/g;
    let match;

    while ((match = simpleVarRegex.exec(expression)) !== null) {
      const path = match[1];
      if (!this.isKeyword(path)) {
        dependencies.push(path);
      }
    }

    return dependencies;
  }

  // 创建响应式数据
  createReactiveData(pageInstance) {
    const originalData = pageInstance.data;
    const reactiveData = {};

    // 递归处理数据对象
    this.makeReactive(reactiveData, originalData, pageInstance, "");

    // 替换原始数据
    pageInstance.data = reactiveData;
  }

  // 使数据响应式
  makeReactive(target, source, pageInstance, basePath) {
    for (const key in source) {
      const value = source[key];
      const fullPath = basePath ? `${basePath}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        // 对象类型递归处理
        target[key] = {};
        this.makeReactive(target[key], value, pageInstance, fullPath);
      } else {
        // 基本类型添加getter/setter
        this.defineReactive(target, key, value, pageInstance, fullPath);
      }
    }
  }

  // 定义响应式属性
  defineReactive(obj, key, value, pageInstance, fullPath) {
    const watchers = [];

    Object.defineProperty(obj, key, {
      get() {
        // 依赖收集
        if (this.currentWatcher) {
          watchers.push(this.currentWatcher);
        }
        return value;
      },

      set(newValue) {
        if (newValue === value) return;

        const oldValue = value;
        value = newValue;

        // 通知所有观察者
        watchers.forEach((watcher) => {
          watcher.update(fullPath, newValue, oldValue);
        });

        // 触发页面更新
        this.scheduleUpdate(pageInstance, fullPath, newValue);
      },
    });
  }

  // 调度更新
  scheduleUpdate(pageInstance, path, value) {
    this.updateQueue.push({
      pageInstance,
      path,
      value,
      timestamp: Date.now(),
    });

    if (!this.isUpdating) {
      this.isUpdating = true;
      this.nextTick(() => {
        this.flushUpdateQueue();
        this.isUpdating = false;
      });
    }
  }

  // 刷新更新队列
  flushUpdateQueue() {
    // 按页面分组更新
    const updatesByPage = new Map();

    this.updateQueue.forEach((update) => {
      const { pageInstance, path, value } = update;

      if (!updatesByPage.has(pageInstance)) {
        updatesByPage.set(pageInstance, {});
      }

      updatesByPage.get(pageInstance)[path] = value;
    });

    // 批量更新每个页面
    updatesByPage.forEach((updates, pageInstance) => {
      this.updatePageView(pageInstance, updates);
    });

    this.updateQueue = [];
  }

  // 更新页面视图
  updatePageView(pageInstance, updates) {
    // 1. 重新编译WXML
    const newVDOM = this.compileWXML(pageInstance.wxml, pageInstance.data);

    // 2. 计算差异
    const patches = this.diff(pageInstance.vdom, newVDOM);

    // 3. 应用补丁
    this.patch(pageInstance.vdom, patches);

    // 4. 更新缓存
    pageInstance.vdom = newVDOM;

    // 5. 通知渲染层
    JSBridge.publish("updateView", {
      route: pageInstance.route,
      patches: patches,
    });
  }
}
```

## 🎨 渲染机制详解

### WXML 编译过程

```javascript
// WXML编译器
class WXMLCompiler {
  constructor() {
    this.componentRegistry = new Map();
    this.directiveHandlers = new Map();
    this.setupBuiltinDirectives();
  }

  // 编译WXML到虚拟DOM
  compile(wxml, data) {
    // 1. 词法分析
    const tokens = this.tokenize(wxml);

    // 2. 语法分析
    const ast = this.parse(tokens);

    // 3. 语义分析
    const semanticAST = this.analyze(ast);

    // 4. 代码生成
    const vdom = this.generate(semanticAST, data);

    return vdom;
  }

  // 词法分析
  tokenize(wxml) {
    const tokens = [];
    let current = 0;

    while (current < wxml.length) {
      let char = wxml[current];

      // 处理标签开始
      if (char === "<") {
        if (wxml[current + 1] === "/") {
          // 结束标签
          const endTag = this.parseEndTag(wxml, current);
          tokens.push(endTag);
          current = endTag.end;
        } else {
          // 开始标签
          const startTag = this.parseStartTag(wxml, current);
          tokens.push(startTag);
          current = startTag.end;
        }
        continue;
      }

      // 处理文本内容
      if (char !== "<") {
        const text = this.parseText(wxml, current);
        if (text.value.trim()) {
          tokens.push(text);
        }
        current = text.end;
        continue;
      }

      current++;
    }

    return tokens;
  }

  // 解析开始标签
  parseStartTag(wxml, start) {
    let current = start + 1; // 跳过 <
    let tagName = "";
    let attributes = [];

    // 解析标签名
    while (current < wxml.length && /[a-zA-Z0-9-]/.test(wxml[current])) {
      tagName += wxml[current];
      current++;
    }

    // 跳过空白字符
    while (current < wxml.length && /\s/.test(wxml[current])) {
      current++;
    }

    // 解析属性
    while (current < wxml.length && wxml[current] !== ">") {
      const attr = this.parseAttribute(wxml, current);
      attributes.push(attr);
      current = attr.end;

      // 跳过空白字符
      while (current < wxml.length && /\s/.test(wxml[current])) {
        current++;
      }
    }

    // 跳过 >
    if (wxml[current] === ">") {
      current++;
    }

    return {
      type: "startTag",
      tagName,
      attributes,
      selfClosing: wxml[current - 2] === "/",
      start,
      end: current,
    };
  }

  // 解析属性
  parseAttribute(wxml, start) {
    let current = start;
    let name = "";
    let value = "";

    // 解析属性名
    while (current < wxml.length && /[a-zA-Z0-9:-]/.test(wxml[current])) {
      name += wxml[current];
      current++;
    }

    // 跳过空白字符和等号
    while (current < wxml.length && /[\s=]/.test(wxml[current])) {
      current++;
    }

    // 解析属性值
    if (wxml[current] === '"' || wxml[current] === "'") {
      const quote = wxml[current];
      current++; // 跳过开始引号

      while (current < wxml.length && wxml[current] !== quote) {
        value += wxml[current];
        current++;
      }

      current++; // 跳过结束引号
    }

    return {
      name,
      value,
      start,
      end: current,
    };
  }

  // 语法分析
  parse(tokens) {
    const stack = [];
    const root = {
      type: "root",
      children: [],
    };

    let current = root;

    tokens.forEach((token) => {
      switch (token.type) {
        case "startTag":
          const element = {
            type: "element",
            tagName: token.tagName,
            attributes: token.attributes,
            children: [],
            parent: current,
          };

          current.children.push(element);

          if (!token.selfClosing) {
            stack.push(current);
            current = element;
          }
          break;

        case "endTag":
          if (stack.length > 0) {
            current = stack.pop();
          }
          break;

        case "text":
          current.children.push({
            type: "text",
            content: token.value,
            parent: current,
          });
          break;
      }
    });

    return root;
  }

  // 生成虚拟DOM
  generate(ast, data) {
    return this.transformNode(ast, data);
  }

  // 转换节点
  transformNode(node, data) {
    switch (node.type) {
      case "root":
        return {
          type: "fragment",
          children: node.children.map((child) =>
            this.transformNode(child, data)
          ),
        };

      case "element":
        return this.transformElement(node, data);

      case "text":
        return this.transformText(node, data);

      default:
        return null;
    }
  }

  // 转换元素节点
  transformElement(node, data) {
    const vnode = {
      type: "element",
      tag: node.tagName,
      props: {},
      children: [],
      key: null,
    };

    // 处理属性
    node.attributes.forEach((attr) => {
      const { name, value } = attr;

      // 处理指令
      if (name.startsWith("wx:")) {
        this.handleDirective(vnode, name, value, data);
      }
      // 处理事件绑定
      else if (name.startsWith("bind:") || name.startsWith("catch:")) {
        this.handleEventBinding(vnode, name, value);
      }
      // 处理数据绑定
      else if (value.includes("{{") && value.includes("}}")) {
        vnode.props[name] = this.evaluateExpression(value, data);
      }
      // 普通属性
      else {
        vnode.props[name] = value;
      }
    });

    // 处理子节点
    vnode.children = node.children.map((child) =>
      this.transformNode(child, data)
    );

    return vnode;
  }

  // 处理指令
  handleDirective(vnode, directive, value, data) {
    switch (directive) {
      case "wx:if":
        if (!this.evaluateExpression(`{{${value}}}`, data)) {
          return null; // 不渲染该节点
        }
        break;

      case "wx:for":
        return this.handleForDirective(vnode, value, data);

      case "wx:key":
        vnode.key = value;
        break;
    }
  }

  // 处理wx:for指令
  handleForDirective(vnode, expression, data) {
    const items = this.evaluateExpression(`{{${expression}}}`, data);
    const forNodes = [];

    if (Array.isArray(items)) {
      items.forEach((item, index) => {
        const itemData = {
          ...data,
          item,
          index,
        };

        const itemNode = {
          ...vnode,
          children: vnode.children.map((child) =>
            this.transformNode(child, itemData)
          ),
        };

        forNodes.push(itemNode);
      });
    }

    return forNodes;
  }

  // 表达式求值
  evaluateExpression(expression, data) {
    // 提取表达式内容
    const match = expression.match(/\{\{(.+?)\}\}/);
    if (!match) return expression;

    const expr = match[1].trim();

    try {
      // 创建安全的执行环境
      const context = this.createSafeContext(data);

      // 使用Function构造器执行表达式
      const func = new Function(...Object.keys(context), `return ${expr}`);
      return func(...Object.values(context));
    } catch (error) {
      console.warn(`Expression evaluation error: ${expr}`, error);
      return "";
    }
  }

  // 创建安全的执行上下文
  createSafeContext(data) {
    // 只暴露数据，不暴露危险的全局对象
    return {
      ...data,
      // 辅助函数
      Math,
      Date,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };
  }
}
```

## 🔗 通信机制

### JSBridge 实现原理

```javascript
// JSBridge通信机制
class JSBridge {
  constructor() {
    this.messageQueue = [];
    this.callbackMap = new Map();
    this.eventListeners = new Map();
    this.isReady = false;

    this.setupNativeBridge();
  }

  // 建立原生桥接
  setupNativeBridge() {
    // iOS环境
    if (typeof webkit !== "undefined" && webkit.messageHandlers) {
      this.nativeBridge = webkit.messageHandlers.miniProgram;
      this.platform = "ios";
    }
    // Android环境
    else if (typeof WeixinJSBridge !== "undefined") {
      this.nativeBridge = WeixinJSBridge;
      this.platform = "android";
    }
    // 开发环境模拟
    else {
      this.setupMockBridge();
      this.platform = "mock";
    }

    this.isReady = true;
    this.flushMessageQueue();
  }

  // 调用原生API
  invoke(api, params = {}, callback) {
    const callbackId = this.generateCallbackId();

    if (callback) {
      this.callbackMap.set(callbackId, callback);
    }

    const message = {
      type: "invoke",
      api,
      params,
      callbackId,
      timestamp: Date.now(),
    };

    this.sendMessage(message);
  }

  // 发送消息到原生
  sendMessage(message) {
    if (!this.isReady) {
      this.messageQueue.push(message);
      return;
    }

    const serializedMessage = JSON.stringify(message);

    switch (this.platform) {
      case "ios":
        this.nativeBridge.postMessage(serializedMessage);
        break;

      case "android":
        this.nativeBridge.invoke("sendMessage", serializedMessage);
        break;

      case "mock":
        this.handleMockMessage(message);
        break;
    }
  }

  // 接收原生消息
  receiveMessage(messageStr) {
    try {
      const message = JSON.parse(messageStr);
      this.handleMessage(message);
    } catch (error) {
      console.error("Failed to parse native message:", error);
    }
  }

  // 处理消息
  handleMessage(message) {
    switch (message.type) {
      case "callback":
        this.handleCallback(message);
        break;

      case "event":
        this.handleEvent(message);
        break;

      case "apiResult":
        this.handleAPIResult(message);
        break;
    }
  }

  // 处理回调
  handleCallback(message) {
    const { callbackId, result, error } = message;
    const callback = this.callbackMap.get(callbackId);

    if (callback) {
      this.callbackMap.delete(callbackId);

      if (error) {
        callback(null, error);
      } else {
        callback(result);
      }
    }
  }

  // 处理事件
  handleEvent(message) {
    const { eventName, data } = message;
    const listeners = this.eventListeners.get(eventName) || [];

    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Event listener error for ${eventName}:`, error);
      }
    });
  }

  // API调用封装
  createAPIWrapper() {
    return {
      // 网络请求
      request: (options) => {
        return new Promise((resolve, reject) => {
          this.invoke("request", options, (result, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      },

      // 显示Toast
      showToast: (options) => {
        this.invoke("showToast", options);
      },

      // 页面导航
      navigateTo: (options) => {
        return new Promise((resolve, reject) => {
          this.invoke("navigateTo", options, (result, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      },

      // 获取系统信息
      getSystemInfo: () => {
        return new Promise((resolve, reject) => {
          this.invoke("getSystemInfo", {}, (result, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      },

      // 本地存储
      setStorage: (options) => {
        return new Promise((resolve, reject) => {
          this.invoke("setStorage", options, (result, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      },

      getStorage: (options) => {
        return new Promise((resolve, reject) => {
          this.invoke("getStorage", options, (result, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      },
    };
  }

  // 刷新消息队列
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  // 生成回调ID
  generateCallbackId() {
    return `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 开发环境模拟桥接
  setupMockBridge() {
    this.nativeBridge = {
      invoke: (api, params, callback) => {
        // 模拟异步API调用
        setTimeout(() => {
          const mockResult = this.generateMockResult(api, params);
          if (callback) {
            callback(mockResult);
          }
        }, 100);
      },
    };
  }

  // 生成模拟结果
  generateMockResult(api, params) {
    const mockResults = {
      getSystemInfo: {
        platform: "devtools",
        system: "mock",
        version: "1.0.0",
        screenWidth: 375,
        screenHeight: 667,
      },
      request: {
        statusCode: 200,
        data: { message: "Mock response" },
      },
      setStorage: { errMsg: "setStorage:ok" },
      getStorage: {
        data: "mock data",
        errMsg: "getStorage:ok",
      },
    };

    return mockResults[api] || { errMsg: `${api}:ok` };
  }
}

// 全局JSBridge实例
const jsBridge = new JSBridge();

// 暴露给小程序的API
const wx = jsBridge.createAPIWrapper();
```

## 🎯 性能优化机制

### 渲染性能优化

```javascript
// 渲染性能优化器
class RenderOptimizer {
  constructor() {
    this.updateQueue = [];
    this.isUpdating = false;
    this.frameId = null;
  }

  // 批量更新优化
  batchUpdate(updates) {
    this.updateQueue.push(...updates);

    if (!this.isUpdating) {
      this.isUpdating = true;
      this.scheduleUpdate();
    }
  }

  // 调度更新
  scheduleUpdate() {
    // 使用requestAnimationFrame优化更新时机
    this.frameId = requestAnimationFrame(() => {
      this.flushUpdates();
      this.isUpdating = false;
    });
  }

  // 刷新更新队列
  flushUpdates() {
    // 1. 去重相同路径的更新
    const deduplicatedUpdates = this.deduplicateUpdates(this.updateQueue);

    // 2. 按优先级排序
    const sortedUpdates = this.sortByPriority(deduplicatedUpdates);

    // 3. 批量应用更新
    this.applyUpdates(sortedUpdates);

    // 4. 清空队列
    this.updateQueue = [];
  }

  // 去重更新
  deduplicateUpdates(updates) {
    const updateMap = new Map();

    updates.forEach((update) => {
      const key = `${update.path}:${update.type}`;
      updateMap.set(key, update);
    });

    return Array.from(updateMap.values());
  }

  // 虚拟列表优化
  createVirtualList(options) {
    const {
      container,
      items,
      itemHeight,
      renderItem,
      bufferSize = 5,
    } = options;

    return {
      visibleItems: [],
      startIndex: 0,
      endIndex: 0,
      scrollTop: 0,

      // 更新可见区域
      updateVisibleRange(scrollTop) {
        this.scrollTop = scrollTop;

        const containerHeight = container.clientHeight;
        const totalHeight = items.length * itemHeight;

        // 计算可见范围
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
          items.length - 1,
          start + Math.ceil(containerHeight / itemHeight) + bufferSize
        );

        this.startIndex = Math.max(0, start - bufferSize);
        this.endIndex = end;

        // 更新可见项
        this.visibleItems = items.slice(this.startIndex, this.endIndex + 1);

        // 渲染优化
        this.renderVisibleItems();
      },

      // 渲染可见项
      renderVisibleItems() {
        const fragment = document.createDocumentFragment();

        this.visibleItems.forEach((item, index) => {
          const actualIndex = this.startIndex + index;
          const itemElement = renderItem(item, actualIndex);

          // 设置位置
          itemElement.style.position = "absolute";
          itemElement.style.top = `${actualIndex * itemHeight}px`;
          itemElement.style.height = `${itemHeight}px`;

          fragment.appendChild(itemElement);
        });

        // 更新容器
        container.innerHTML = "";
        container.appendChild(fragment);

        // 设置容器高度
        container.style.height = `${items.length * itemHeight}px`;
      },
    };
  }

  // 图片懒加载
  createImageLazyLoader() {
    let observer;

    // 使用IntersectionObserver
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.dataset.src;

              if (src) {
                // 预加载图片
                const tempImg = new Image();
                tempImg.onload = () => {
                  img.src = src;
                  img.classList.add("loaded");
                  observer.unobserve(img);
                };
                tempImg.onerror = () => {
                  img.classList.add("error");
                  observer.unobserve(img);
                };
                tempImg.src = src;
              }
            }
          });
        },
        {
          rootMargin: "50px", // 提前50px开始加载
        }
      );
    }

    return {
      observe(img) {
        if (observer) {
          observer.observe(img);
        } else {
          // 降级方案
          this.fallbackLazyLoad(img);
        }
      },

      // 降级方案
      fallbackLazyLoad(img) {
        const checkInView = () => {
          const rect = img.getBoundingClientRect();
          const inView =
            rect.top < window.innerHeight + 50 && rect.bottom > -50;

          if (inView) {
            const src = img.dataset.src;
            if (src) {
              img.src = src;
            }
          }
        };

        window.addEventListener("scroll", checkInView);
        window.addEventListener("resize", checkInView);
        checkInView();
      },
    };
  }

  // 防抖优化
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

  // 节流优化
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}
```

## 📱 平台差异处理

### 多端适配机制

```javascript
// 平台适配器
class PlatformAdapter {
  constructor() {
    this.platform = this.detectPlatform();
    this.apiMap = this.createAPIMap();
    this.componentMap = this.createComponentMap();
  }

  // 平台检测
  detectPlatform() {
    // 微信小程序
    if (typeof wx !== "undefined" && wx.getSystemInfoSync) {
      return "wechat";
    }

    // 支付宝小程序
    if (typeof my !== "undefined" && my.getSystemInfoSync) {
      return "alipay";
    }

    // 百度小程序
    if (typeof swan !== "undefined" && swan.getSystemInfoSync) {
      return "baidu";
    }

    // 字节跳动小程序
    if (typeof tt !== "undefined" && tt.getSystemInfoSync) {
      return "toutiao";
    }

    // QQ小程序
    if (typeof qq !== "undefined" && qq.getSystemInfoSync) {
      return "qq";
    }

    return "unknown";
  }

  // 创建API映射
  createAPIMap() {
    const commonAPIs = {
      // 网络请求
      request: {
        wechat: "wx.request",
        alipay: "my.request",
        baidu: "swan.request",
        toutiao: "tt.request",
        qq: "qq.request",
      },

      // 本地存储
      setStorage: {
        wechat: "wx.setStorageSync",
        alipay: "my.setStorageSync",
        baidu: "swan.setStorageSync",
        toutiao: "tt.setStorageSync",
        qq: "qq.setStorageSync",
      },

      // 显示提示
      showToast: {
        wechat: "wx.showToast",
        alipay: "my.showToast",
        baidu: "swan.showToast",
        toutiao: "tt.showToast",
        qq: "qq.showToast",
      },

      // 页面导航
      navigateTo: {
        wechat: "wx.navigateTo",
        alipay: "my.navigateTo",
        baidu: "swan.navigateTo",
        toutiao: "tt.navigateTo",
        qq: "qq.navigateTo",
      },
    };

    return commonAPIs;
  }

  // 创建组件映射
  createComponentMap() {
    return {
      // 基础组件
      view: {
        wechat: "view",
        alipay: "view",
        baidu: "view",
        toutiao: "view",
        qq: "view",
      },

      // 表单组件
      input: {
        wechat: "input",
        alipay: "input",
        baidu: "input",
        toutiao: "input",
        qq: "input",
      },

      // 媒体组件
      image: {
        wechat: "image",
        alipay: "image",
        baidu: "image",
        toutiao: "image",
        qq: "image",
      },

      // 地图组件
      map: {
        wechat: "map",
        alipay: "map",
        baidu: "map",
        toutiao: "map",
        qq: "map",
      },
    };
  }

  // 统一API调用
  invokeAPI(apiName, params = {}) {
    const apiMapping = this.apiMap[apiName];
    if (!apiMapping) {
      throw new Error(`API ${apiName} not supported`);
    }

    const platformAPI = apiMapping[this.platform];
    if (!platformAPI) {
      throw new Error(`API ${apiName} not supported on ${this.platform}`);
    }

    // 参数适配
    const adaptedParams = this.adaptAPIParams(apiName, params);

    // 调用平台API
    const [namespace, method] = platformAPI.split(".");
    const api = window[namespace][method];

    return api(adaptedParams);
  }

  // 参数适配
  adaptAPIParams(apiName, params) {
    const adapters = {
      // 支付宝小程序参数适配
      alipay: {
        setStorage: (params) => ({
          key: params.key,
          data: params.data,
        }),

        showToast: (params) => ({
          content: params.title,
          type: params.icon === "success" ? "success" : "none",
          duration: params.duration || 1500,
        }),
      },

      // 百度小程序参数适配
      baidu: {
        showToast: (params) => ({
          title: params.title,
          icon: params.icon || "none",
          duration: params.duration || 1500,
        }),
      },
    };

    const platformAdapter = adapters[this.platform];
    if (platformAdapter && platformAdapter[apiName]) {
      return platformAdapter[apiName](params);
    }

    return params;
  }

  // 生命周期适配
  adaptLifecycle(lifecycle) {
    const lifecycleMap = {
      wechat: {
        onLoad: "onLoad",
        onShow: "onShow",
        onReady: "onReady",
        onHide: "onHide",
        onUnload: "onUnload",
      },

      alipay: {
        onLoad: "onLoad",
        onShow: "onShow",
        onReady: "onReady",
        onHide: "onHide",
        onUnload: "onUnload",
      },
    };

    return lifecycleMap[this.platform] || lifecycle;
  }

  // 事件适配
  adaptEvent(eventName) {
    const eventMap = {
      // 点击事件
      tap: {
        wechat: "bindtap",
        alipay: "onTap",
        baidu: "bindtap",
        toutiao: "bindtap",
        qq: "bindtap",
      },

      // 输入事件
      input: {
        wechat: "bindinput",
        alipay: "onInput",
        baidu: "bindinput",
        toutiao: "bindinput",
        qq: "bindinput",
      },
    };

    const mapping = eventMap[eventName];
    return mapping ? mapping[this.platform] : eventName;
  }
}
```

## 🔒 安全机制

### 安全沙箱实现

```javascript
// 安全沙箱
class SecuritySandbox {
  constructor() {
    this.whitelist = this.createWhitelist();
    this.blacklist = this.createBlacklist();
    this.cspRules = this.createCSPRules();
  }

  // 创建白名单
  createWhitelist() {
    return {
      // 允许的全局对象
      globals: [
        "console",
        "setTimeout",
        "setInterval",
        "clearTimeout",
        "clearInterval",
        "Date",
        "Math",
        "JSON",
        "parseInt",
        "parseFloat",
        "isNaN",
        "isFinite",
        "encodeURIComponent",
        "decodeURIComponent",
      ],

      // 允许的API
      apis: [
        "wx.request",
        "wx.setData",
        "wx.showToast",
        "wx.navigateTo",
        "wx.getSystemInfo",
        "wx.setStorage",
        "wx.getStorage",
      ],

      // 允许的域名
      domains: [
        "https://api.weixin.qq.com",
        "https://developers.weixin.qq.com",
      ],
    };
  }

  // 创建黑名单
  createBlacklist() {
    return {
      // 禁止的全局对象
      globals: [
        "window",
        "document",
        "location",
        "history",
        "navigator",
        "screen",
        "localStorage",
        "sessionStorage",
        "eval",
        "Function",
        "WebSocket",
        "XMLHttpRequest",
        "fetch",
      ],

      // 禁止的操作
      operations: [
        "eval",
        "new Function",
        "innerHTML",
        "outerHTML",
        "document.write",
        "document.writeln",
      ],
    };
  }

  // 创建CSP规则
  createCSPRules() {
    return {
      "default-src": "'self'",
      "script-src": "'self' 'unsafe-inline'",
      "style-src": "'self' 'unsafe-inline'",
      "img-src": "'self' data: https:",
      "connect-src": "'self' https:",
      "font-src": "'self' data:",
      "object-src": "'none'",
      "base-uri": "'self'",
      "form-action": "'self'",
    };
  }

  // 创建安全的执行环境
  createSafeContext(data) {
    const safeContext = {};

    // 只添加白名单中的全局对象
    this.whitelist.globals.forEach((name) => {
      if (typeof window[name] !== "undefined") {
        safeContext[name] = window[name];
      }
    });

    // 添加数据对象
    Object.keys(data).forEach((key) => {
      if (this.isValidDataKey(key)) {
        safeContext[key] = data[key];
      }
    });

    return safeContext;
  }

  // 验证数据键名
  isValidDataKey(key) {
    // 禁止以下划线开头的私有属性
    if (key.startsWith("_")) {
      return false;
    }

    // 禁止原型链相关属性
    const forbiddenKeys = [
      "constructor",
      "prototype",
      "__proto__",
      "valueOf",
      "toString",
    ];

    return !forbiddenKeys.includes(key);
  }

  // 安全的代码执行
  safeEval(code, context) {
    // 代码安全检查
    if (!this.isCodeSafe(code)) {
      throw new Error("Unsafe code detected");
    }

    try {
      // 创建安全的执行函数
      const func = new Function(
        ...Object.keys(context),
        `"use strict"; return (${code})`
      );

      // 在安全上下文中执行
      return func(...Object.values(context));
    } catch (error) {
      console.error("Code execution error:", error);
      return undefined;
    }
  }

  // 代码安全检查
  isCodeSafe(code) {
    // 检查是否包含黑名单操作
    const blacklistPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /window\./,
      /document\./,
      /location\./,
      /history\./,
      /navigator\./,
      /__proto__/,
      /constructor/,
      /prototype/,
    ];

    return !blacklistPatterns.some((pattern) => pattern.test(code));
  }

  // URL安全检查
  isURLSafe(url) {
    try {
      const urlObj = new URL(url);

      // 只允许HTTPS协议
      if (urlObj.protocol !== "https:") {
        return false;
      }

      // 检查域名白名单
      return this.whitelist.domains.some((domain) => {
        return url.startsWith(domain);
      });
    } catch (error) {
      return false;
    }
  }

  // API调用安全检查
  checkAPIPermission(api, params) {
    // 检查API是否在白名单中
    if (!this.whitelist.apis.includes(api)) {
      throw new Error(`API ${api} is not allowed`);
    }

    // 特定API的参数检查
    switch (api) {
      case "wx.request":
        if (!this.isURLSafe(params.url)) {
          throw new Error("Request URL is not allowed");
        }
        break;

      case "wx.navigateTo":
        if (!this.isValidPagePath(params.url)) {
          throw new Error("Navigation path is not valid");
        }
        break;
    }

    return true;
  }

  // 页面路径验证
  isValidPagePath(path) {
    // 只允许相对路径
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return false;
    }

    // 禁止目录遍历
    if (path.includes("../") || path.includes("..\\")) {
      return false;
    }

    return true;
  }

  // 应用CSP规则
  applyCSP() {
    const cspString = Object.entries(this.cspRules)
      .map(([directive, value]) => `${directive} ${value}`)
      .join("; ");

    // 设置CSP头
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = cspString;
    document.head.appendChild(meta);
  }
}
```

---

## 🎯 总结

小程序的底层实现涉及多个关键技术：

### 核心架构

- **双线程架构**：逻辑层和渲染层分离，通过 JSBridge 通信
- **沙箱环境**：安全的 JavaScript 执行环境
- **原生组件**：高性能的原生 UI 组件

### 关键机制

- **数据绑定**：响应式数据系统和虚拟 DOM
- **生命周期**：完整的页面和组件生命周期管理
- **事件系统**：统一的事件处理和传递机制

### 性能优化

- **批量更新**：减少 setData 调用次数
- **虚拟列表**：长列表性能优化
- **资源预加载**：提升用户体验

### 安全保障

- **代码沙箱**：限制危险操作
- **API 权限**：严格的 API 调用控制
- **CSP 规则**：内容安全策略

这些底层机制共同构成了小程序的技术基础，为开发者提供了高效、安全、跨平台的开发环境。

---

🎯 **下一步**: 了解底层原理后，建议学习 [小程序性能优化](./performance-optimization.md) 来应用这些知识！
