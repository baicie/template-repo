# 粉笔一面面试题详解

## 📋 面试题列表

- 最近在做什么 vite-plugin-faker
- 前端请求有哪些 怎么拦截的
- 说了一下 alien-signals
- vue2 与 vue3 的区别
- vue3 中 ref 的实现原理
- vue2 中为什么重写数组方法 重写了哪些
- vite 的核心思想
- url 从输入到展示发生了什么
- 性能优化能做哪些
- 哪些标签能够跨域
- jsonp 的原理
- 反向代理有哪些方案
- dockerfile 有写过吗
- 前端性能优化方案 cdn 加速 cdn 预解析 http2/1 的区别
- 前端数组方法哪些是改变原数组哪些不改原数组
- 如何做的拖拽方案
- promise all/race 是什么 实现一个 promise all
- git 常用命令 撤回命令暂存呢

---

## 1. 最近在做什么 vite-plugin-faker

### 项目背景

最近在开发一个 Vite 插件 `vite-plugin-faker`，用于在开发环境中生成模拟数据。

### 核心功能

```javascript
// vite.config.js
import { defineConfig } from "vite";
import fakerPlugin from "vite-plugin-faker";

export default defineConfig({
  plugins: [
    fakerPlugin({
      // 配置模拟数据
      schemas: {
        "/api/users": {
          method: "GET",
          response: () => ({
            users: Array.from({ length: 10 }, (_, i) => ({
              id: i + 1,
              name: faker.name.findName(),
              email: faker.internet.email(),
              avatar: faker.image.avatar(),
            })),
          }),
        },
      },
    }),
  ],
});
```

### 技术实现

```javascript
// 插件核心逻辑
function fakerPlugin(options = {}) {
  return {
    name: "vite-plugin-faker",

    configureServer(server) {
      // 拦截 API 请求
      server.middlewares.use("/api", (req, res, next) => {
        const schema = options.schemas[req.url];

        if (schema && req.method === schema.method) {
          // 生成模拟数据
          const mockData = schema.response(req);

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(mockData));
        } else {
          next();
        }
      });
    },
  };
}
```

---

## 2. 前端请求有哪些 怎么拦截的

### 前端请求方式

#### 1. XMLHttpRequest

```javascript
// 原生 XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/users", true);
xhr.setRequestHeader("Content-Type", "application/json");

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      console.log(data);
    }
  }
};

xhr.send();
```

#### 2. Fetch API

```javascript
// 现代 Fetch API
fetch("/api/users", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

#### 3. Axios

```javascript
// Axios 库
import axios from "axios";

// 创建实例
const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加时间戳
    config.params = { ...config.params, _t: Date.now() };

    console.log("Request:", config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 请求拦截实现

#### 1. 全局拦截器

```javascript
// 全局请求拦截器
class RequestInterceptor {
  constructor() {
    this.interceptors = [];
    this.setupGlobalInterceptor();
  }

  // 添加拦截器
  addInterceptor(interceptor) {
    this.interceptors.push(interceptor);
  }

  // 设置全局拦截
  setupGlobalInterceptor() {
    // 拦截 XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      this._method = method;
      this._url = url;
      return originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (data) {
      // 执行请求拦截器
      this._data = data;
      this._intercepted = this.executeInterceptors("request", {
        method: this._method,
        url: this._url,
        data: data,
        headers: this.getAllResponseHeaders(),
      });

      return originalXHRSend.call(this, this._intercepted.data);
    };

    // 拦截 Fetch
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const interceptedOptions = await this.executeInterceptors("request", {
        url,
        ...options,
      });

      const response = await originalFetch(url, interceptedOptions);

      // 执行响应拦截器
      const interceptedResponse = await this.executeInterceptors(
        "response",
        response
      );
      return interceptedResponse;
    };
  }

  // 执行拦截器
  async executeInterceptors(type, data) {
    let result = data;

    for (const interceptor of this.interceptors) {
      if (interceptor[type]) {
        result = await interceptor[type](result);
      }
    }

    return result;
  }
}

// 使用示例
const interceptor = new RequestInterceptor();

// 添加请求拦截器
interceptor.addInterceptor({
  request: (config) => {
    console.log("Request intercepted:", config);

    // 添加认证头
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  response: (response) => {
    console.log("Response intercepted:", response);
    return response;
  },
});
```

#### 2. Service Worker 拦截

```javascript
// service-worker.js
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 拦截 API 请求
  if (request.url.includes("/api/")) {
    event.respondWith(handleApiRequest(request));
  }
});

async function handleApiRequest(request) {
  try {
    // 添加认证头
    const headers = new Headers(request.headers);
    const token = await getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const modifiedRequest = new Request(request.url, {
      method: request.method,
      headers: headers,
      body: request.body,
    });

    const response = await fetch(modifiedRequest);

    // 处理响应
    if (response.status === 401) {
      // 清除无效 token
      await clearToken();
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    return new Response(JSON.stringify({ error: "Network error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

#### 3. Proxy 代理拦截

```javascript
// 使用 Proxy 拦截 fetch
const originalFetch = window.fetch;

window.fetch = new Proxy(originalFetch, {
  apply: function (target, thisArg, argumentsList) {
    const [url, options = {}] = argumentsList;

    // 请求拦截
    const interceptedOptions = {
      ...options,
      headers: {
        ...options.headers,
        "X-Request-ID": generateRequestId(),
        "X-Timestamp": Date.now(),
      },
    };

    // 添加认证
    const token = localStorage.getItem("token");
    if (token) {
      interceptedOptions.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Intercepted request:", { url, options: interceptedOptions });

    // 执行原始请求
    return target
      .call(thisArg, url, interceptedOptions)
      .then((response) => {
        console.log("Intercepted response:", response);

        // 响应拦截
        if (response.status === 401) {
          handleUnauthorized();
        }

        return response;
      })
      .catch((error) => {
        console.error("Request failed:", error);
        throw error;
      });
  },
});

function generateRequestId() {
  return "req_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function handleUnauthorized() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
```

---

## 3. 说了一下 alien-signals

### 项目介绍

`alien-signals` 是一个基于 Vue3 的微前端框架，用于构建大型应用的模块化架构。

### 核心特性

```javascript
// 主应用配置
import { createAlienApp } from "alien-sigle";

const app = createAlienApp({
  // 应用注册
  apps: [
    {
      name: "user-app",
      entry: "http://localhost:3001",
      container: "#user-container",
      activeRule: "/user",
    },
    {
      name: "order-app",
      entry: "http://localhost:3002",
      container: "#order-container",
      activeRule: "/order",
    },
  ],

  // 共享依赖
  shared: {
    vue: "^3.0.0",
    vuex: "^4.0.0",
  },
});

app.start();
```

### 技术架构

- **沙箱隔离**：使用 Proxy 实现运行时隔离
- **模块联邦**：基于 Webpack 5 Module Federation
- **路由管理**：统一的路由控制和状态管理
- **通信机制**：基于 CustomEvent 的跨应用通信

---

## 3. vue2 与 vue3 的区别

### 架构层面对比

| 特性            | Vue 2                 | Vue 3    |
| --------------- | --------------------- | -------- |
| 响应式系统      | Object.defineProperty | Proxy    |
| 组合式 API      | 无                    | 有       |
| TypeScript 支持 | 有限                  | 原生支持 |
| 打包体积        | 较大                  | 更小     |
| 性能            | 一般                  | 显著提升 |

### 响应式系统差异

```javascript
// Vue 2 - Object.defineProperty
const data = {
  name: "Alice",
  age: 25,
};

Object.defineProperty(data, "name", {
  get() {
    return this._name;
  },
  set(value) {
    this._name = value;
    // 触发更新
  },
});

// Vue 3 - Proxy
const data = reactive({
  name: "Alice",
  age: 25,
});

// Proxy 可以监听数组变化和新增属性
```

### 组合式 API vs Options API

```javascript
// Vue 2 Options API
export default {
  data() {
    return {
      count: 0,
      name: 'Alice'
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  mounted() {
    console.log('mounted');
  }
};

// Vue 3 Composition API
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const name = ref('Alice');

    const increment = () => {
      count.value++;
    };

    onMounted(() => {
      console.log('mounted');
    });

    return {
      count,
      name,
      increment
    };
  }
};
```

---

## 4. vue3 中 ref 的实现原理

### 核心实现

```javascript
// ref 的简化实现
function ref(value) {
  // 如果是对象，使用 reactive
  if (isObject(value)) {
    return reactive(value);
  }

  // 创建 RefImpl 实例
  return new RefImpl(value);
}

class RefImpl {
  constructor(value) {
    this._value = value;
    this.__v_isRef = true;
  }

  get value() {
    // 依赖收集
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(this._value, newValue)) {
      this._value = newValue;
      // 触发更新
      triggerRefValue(this);
    }
  }
}

// 依赖收集
function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()));
  }
}

// 触发更新
function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}
```

### 响应式原理

1. **依赖收集**：在 getter 中收集当前活跃的 effect
2. **响应式更新**：在 setter 中触发所有相关的 effect
3. **类型检查**：通过 `__v_isRef` 标识判断是否为 ref

---

## 5. vue2 中为什么重写数组方法 重写了哪些

### 重写原因

Vue2 使用 `Object.defineProperty` 无法监听数组索引变化和 `length` 属性变化。

### 重写的数组方法

```javascript
// Vue2 重写的数组方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

methodsToPatch.forEach((method) => {
  const original = arrayProto[method];

  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;

    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }

    // 对新插入的元素进行响应式处理
    if (inserted) {
      ob.observeArray(inserted);
    }

    // 通知依赖更新
    ob.dep.notify();

    return result;
  });
});
```

### 实现原理

```javascript
// 数组响应式处理
function observeArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    observe(arr[i]);
  }
}

// 重写数组原型
function protoAugment(target, src) {
  target.__proto__ = src;
}

// 直接替换方法
function copyAugment(target, src, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}
```

---

## 6. vite 的核心思想

### 核心思想

Vite 的核心思想是**开发时按需编译**，利用浏览器原生 ES 模块能力。

### 开发模式原理

```javascript
// Vite 开发服务器核心逻辑
class ViteDevServer {
  constructor() {
    this.middleware = [];
    this.plugins = [];
  }

  // 处理模块请求
  async handleModuleRequest(req, res) {
    const url = req.url;

    if (url.endsWith(".vue")) {
      // 编译 Vue 单文件组件
      const code = await this.compileVue(url);
      res.setHeader("Content-Type", "application/javascript");
      res.end(code);
    } else if (url.endsWith(".ts")) {
      // 编译 TypeScript
      const code = await this.compileTS(url);
      res.setHeader("Content-Type", "application/javascript");
      res.end(code);
    } else if (url.includes("node_modules")) {
      // 预构建依赖
      const code = await this.preBundle(url);
      res.setHeader("Content-Type", "application/javascript");
      res.end(code);
    }
  }
}
```

### 构建模式

```javascript
// 生产构建
class ViteBuilder {
  async build() {
    // 1. 依赖预构建
    await this.preBundle();

    // 2. 代码分割
    const chunks = await this.splitChunks();

    // 3. 资源优化
    await this.optimizeAssets(chunks);

    // 4. 生成输出
    await this.generateOutput(chunks);
  }
}
```

---

## 7. url 从输入到展示发生了什么

### 完整流程

#### 1. DNS 解析

```javascript
// DNS 解析过程
const dnsLookup = async (domain) => {
  // 1. 检查浏览器缓存
  const browserCache = checkBrowserCache(domain);
  if (browserCache) return browserCache;

  // 2. 检查系统缓存
  const systemCache = checkSystemCache(domain);
  if (systemCache) return systemCache;

  // 3. 检查路由器缓存
  const routerCache = checkRouterCache(domain);
  if (routerCache) return routerCache;

  // 4. 检查 ISP DNS 服务器
  const ispDns = await queryISPDNS(domain);
  if (ispDns) return ispDns;

  // 5. 递归查询根域名服务器
  return await recursiveDNSQuery(domain);
};
```

#### 2. TCP 连接

```javascript
// TCP 三次握手
const tcpHandshake = async (ip, port) => {
  // 第一次握手：客户端发送 SYN
  const syn = await sendSYN(ip, port);

  // 第二次握手：服务器发送 SYN + ACK
  const synAck = await receiveSYNACK();

  // 第三次握手：客户端发送 ACK
  await sendACK();

  return "connection established";
};
```

#### 3. HTTP 请求

```javascript
// HTTP 请求构建
const buildHTTPRequest = (method, url, headers, body) => {
  const request = [
    `${method} ${url.pathname} HTTP/1.1`,
    `Host: ${url.hostname}`,
    `User-Agent: Mozilla/5.0...`,
    ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
    "",
    body || "",
  ].join("\r\n");

  return request;
};
```

#### 4. 服务器处理

```javascript
// 服务器处理流程
const serverProcess = async (request) => {
  // 1. 解析请求
  const parsedRequest = parseHTTPRequest(request);

  // 2. 路由匹配
  const handler = matchRoute(parsedRequest.path);

  // 3. 中间件处理
  const processedRequest = await applyMiddleware(parsedRequest);

  // 4. 业务逻辑处理
  const response = await handler(processedRequest);

  // 5. 响应构建
  return buildHTTPResponse(response);
};
```

#### 5. 浏览器渲染

```javascript
// 浏览器渲染流程
const browserRender = async (html, css, js) => {
  // 1. 解析 HTML 构建 DOM
  const dom = parseHTML(html);

  // 2. 解析 CSS 构建 CSSOM
  const cssom = parseCSS(css);

  // 3. 合并 DOM 和 CSSOM 构建渲染树
  const renderTree = buildRenderTree(dom, cssom);

  // 4. 布局计算
  const layout = calculateLayout(renderTree);

  // 5. 绘制
  await paint(layout);

  // 6. 执行 JavaScript
  await executeJavaScript(js);
};
```

---

## 8. 性能优化能做哪些

### 前端性能优化

#### 1. 资源优化

```javascript
// 代码分割
const routes = [
  {
    path: "/user",
    component: () => import("./views/User.vue"), // 懒加载
  },
];

// 图片优化
const optimizeImage = (src) => {
  return {
    src: src,
    loading: "lazy", // 懒加载
    sizes: "(max-width: 768px) 100vw, 50vw", // 响应式
    srcset: `${src} 1x, ${src}@2x 2x`, // 高分辨率
  };
};
```

#### 2. 渲染优化

```javascript
// 虚拟滚动
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.scrollTop = 0;
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleCount;

    const visibleItems = this.items.slice(startIndex, endIndex);
    this.renderItems(visibleItems, startIndex);
  }
}

// 防抖节流
const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

const throttle = (fn, delay) => {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      fn.apply(this, args);
      last = now;
    }
  };
};
```

#### 3. 缓存策略

```javascript
// Service Worker 缓存
const cacheStrategy = {
  // 缓存优先
  cacheFirst: async (request) => {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    const cache = await caches.open("v1");
    cache.put(request, response.clone());
    return response;
  },

  // 网络优先
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      const cache = await caches.open("v1");
      cache.put(request, response.clone());
      return response;
    } catch {
      return await caches.match(request);
    }
  },
};
```

---

## 9. 哪些标签能够跨域

### 支持跨域的标签

#### 1. `<script>` 标签

```html
<!-- JSONP 跨域 -->
<script src="https://api.example.com/data?callback=handleResponse"></script>
<script>
  function handleResponse(data) {
    console.log(data);
  }
</script>
```

#### 2. `<img>` 标签

```html
<!-- 图片跨域 -->
<img src="https://cdn.example.com/image.jpg" crossorigin="anonymous" />
```

#### 3. `<link>` 标签

```html
<!-- CSS 跨域 -->
<link rel="stylesheet" href="https://cdn.example.com/style.css" />
```

#### 4. `<video>` 和 `<audio>` 标签

```html
<!-- 媒体文件跨域 -->
<video src="https://cdn.example.com/video.mp4" crossorigin="anonymous"></video>
<audio src="https://cdn.example.com/audio.mp3" crossorigin="anonymous"></audio>
```

#### 5. `<iframe>` 标签

```html
<!-- iframe 跨域 -->
<iframe src="https://example.com" sandbox="allow-scripts"></iframe>
```

### 跨域限制

```javascript
// 同源策略检查
const isSameOrigin = (url1, url2) => {
  const origin1 = new URL(url1).origin;
  const origin2 = new URL(url2).origin;
  return origin1 === origin2;
};

// CORS 预检请求
const corsPreflight = async (url, method, headers) => {
  const response = await fetch(url, {
    method: "OPTIONS",
    headers: {
      Origin: window.location.origin,
      "Access-Control-Request-Method": method,
      "Access-Control-Request-Headers": Object.keys(headers).join(", "),
    },
  });

  return response.headers.get("Access-Control-Allow-Origin");
};
```

---

## 10. jsonp 的原理

### JSONP 实现原理

JSONP 利用 `<script>` 标签不受同源策略限制的特性实现跨域。

### 核心实现

```javascript
// JSONP 封装
function jsonp(url, callback) {
  // 生成唯一的回调函数名
  const callbackName =
    "jsonp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

  // 创建全局回调函数
  window[callbackName] = function (data) {
    callback(data);
    // 清理
    document.head.removeChild(script);
    delete window[callbackName];
  };

  // 构建 URL
  const fullUrl =
    url + (url.includes("?") ? "&" : "?") + "callback=" + callbackName;

  // 创建 script 标签
  const script = document.createElement("script");
  script.src = fullUrl;
  script.onerror = () => {
    callback(new Error("JSONP request failed"));
    document.head.removeChild(script);
    delete window[callbackName];
  };

  // 添加到页面
  document.head.appendChild(script);
}

// 使用示例
jsonp("https://api.example.com/data", function (data) {
  console.log("Received data:", data);
});
```

### Promise 封装

```javascript
// Promise 版本的 JSONP
function jsonpPromise(url) {
  return new Promise((resolve, reject) => {
    jsonp(url, (data) => {
      if (data instanceof Error) {
        reject(data);
      } else {
        resolve(data);
      }
    });
  });
}

// 使用示例
jsonpPromise("https://api.example.com/data")
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

---

## 11. 反向代理有哪些方案

### 常见反向代理方案

#### 1. Nginx

```nginx
# nginx.conf
server {
    listen 80;
    server_name example.com;

    location /api/ {
        proxy_pass http://backend-server:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

#### 2. Node.js 代理

```javascript
// Express 代理中间件
const { createProxyMiddleware } = require("http-proxy-middleware");

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log("Proxying:", req.method, req.url);
    },
  })
);
```

#### 3. Vite 开发代理

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

#### 4. Webpack 代理

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
};
```

---

## 12. dockerfile 有写过吗

### 前端 Dockerfile 示例

```dockerfile
# 多阶段构建
# 构建阶段
FROM node:16-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Node.js 后端 Dockerfile

```dockerfile
# Node.js 应用
FROM node:16-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 更改文件权限
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["npm", "start"]
```

### Docker Compose 配置

```yaml
# docker-compose.yml
version: "3.8"

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - API_URL=http://backend:3000

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 13. 前端性能优化方案 cdn 加速 cdn 预解析 http2/1 的区别

### CDN 加速

```html
<!-- CDN 资源引用 -->
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css"
/>

<!-- 多 CDN 备用 -->
<script>
  // 检测 CDN 可用性
  function loadScript(src, fallback) {
    const script = document.createElement("script");
    script.src = src;
    script.onerror = () => {
      console.log("CDN failed, loading fallback");
      const fallbackScript = document.createElement("script");
      fallbackScript.src = fallback;
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  }

  loadScript(
    "https://cdn1.example.com/vue.js",
    "https://cdn2.example.com/vue.js"
  );
</script>
```

### DNS 预解析

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com" />
<link rel="dns-prefetch" href="//api.example.com" />

<!-- 预连接 -->
<link rel="preconnect" href="https://cdn.example.com" />
<link rel="preconnect" href="https://api.example.com" crossorigin />

<!-- 预加载 -->
<link
  rel="preload"
  href="https://cdn.example.com/font.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link rel="preload" href="https://cdn.example.com/critical.css" as="style" />
```

### HTTP/1.1 vs HTTP/2 对比

#### HTTP/1.1 限制

```javascript
// HTTP/1.1 的并发连接限制
const http1Limits = {
  maxConnections: 6, // 浏览器限制
  headOfLineBlocking: true, // 队头阻塞
  noCompression: false, // 支持压缩
  noServerPush: true, // 不支持服务器推送
};

// HTTP/1.1 优化策略
const http1Optimization = {
  // 域名分片
  domainSharding: ["cdn1.example.com", "cdn2.example.com", "cdn3.example.com"],

  // 资源合并
  resourceConcatenation: {
    css: ["style1.css", "style2.css", "style3.css"],
    js: ["app1.js", "app2.js", "app3.js"],
  },

  // 图片精灵
  imageSprites: "sprite.png",
};
```

··················

#### HTTP/2 优势

```javascript
// HTTP/2 特性
const http2Features = {
  multiplexing: true, // 多路复用
  serverPush: true, // 服务器推送
  headerCompression: true, // 头部压缩
  binaryProtocol: true, // 二进制协议
  streamPrioritization: true, // 流优先级
};

// HTTP/2 服务器推送配置
const http2ServerPush = {
  "/index.html": ["/css/critical.css", "/js/app.js", "/fonts/main.woff2"],
};
```

### 性能优化策略

```javascript
// 资源加载优化
const resourceOptimization = {
  // 关键资源内联
  inlineCriticalCSS: (css) => `<style>${css}</style>`,

  // 异步加载非关键资源
  asyncLoad: (src) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = src;
    link.media = "print";
    link.onload = () => (link.media = "all");
    document.head.appendChild(link);
  },

  // 图片懒加载
  lazyLoadImages: () => {
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  },
};
```

---

## 14. 前端数组方法哪些是改变原数组哪些不改原数组

### 改变原数组的方法

```javascript
// 会改变原数组的方法
const mutatingMethods = [
  "push", // 添加元素到末尾
  "pop", // 删除末尾元素
  "shift", // 删除开头元素
  "unshift", // 添加元素到开头
  "splice", // 删除/插入元素
  "sort", // 排序
  "reverse", // 反转
  "fill", // 填充
  "copyWithin", // 复制元素
];

// 示例
const arr = [1, 2, 3, 4, 5];

arr.push(6); // [1, 2, 3, 4, 5, 6]
arr.pop(); // [1, 2, 3, 4, 5]
arr.splice(1, 2); // [1, 4, 5]
arr.sort((a, b) => b - a); // [5, 4, 1]
```

### 不改变原数组的方法

```javascript
// 不会改变原数组的方法
const nonMutatingMethods = [
  "concat", // 连接数组
  "slice", // 截取数组
  "join", // 连接为字符串
  "indexOf", // 查找索引
  "lastIndexOf", // 从后查找索引
  "includes", // 包含检查
  "find", // 查找元素
  "findIndex", // 查找索引
  "filter", // 过滤
  "map", // 映射
  "reduce", // 归约
  "reduceRight", // 从右归约
  "some", // 存在检查
  "every", // 全部检查
  "flat", // 扁平化
  "flatMap", // 扁平映射
];

// 示例
const arr = [1, 2, 3, 4, 5];

const doubled = arr.map((x) => x * 2); // [2, 4, 6, 8, 10]
const filtered = arr.filter((x) => x > 2); // [3, 4, 5]
const sliced = arr.slice(1, 3); // [2, 3]

console.log(arr); // [1, 2, 3, 4, 5] - 原数组未改变
```

### 实用工具函数

```javascript
// 创建不可变数组操作
const immutableArray = {
  // 添加元素
  add: (arr, ...items) => [...arr, ...items],

  // 删除元素
  remove: (arr, index) => arr.filter((_, i) => i !== index),

  // 更新元素
  update: (arr, index, newValue) =>
    arr.map((item, i) => (i === index ? newValue : item)),

  // 插入元素
  insert: (arr, index, ...items) => [
    ...arr.slice(0, index),
    ...items,
    ...arr.slice(index),
  ],

  // 排序（不改变原数组）
  sort: (arr, compareFn) => [...arr].sort(compareFn),

  // 反转（不改变原数组）
  reverse: (arr) => [...arr].reverse(),
};

// 使用示例
const original = [1, 2, 3, 4, 5];
const updated = immutableArray.update(original, 2, 10);
console.log(original); // [1, 2, 3, 4, 5]
console.log(updated); // [1, 2, 10, 4, 5]
```

---

## 15. 如何做的拖拽方案

### 原生拖拽实现

```javascript
// 拖拽管理器
class DragManager {
  constructor() {
    this.draggedElement = null;
    this.dropZones = new Set();
    this.isDragging = false;

    this.init();
  }

  init() {
    document.addEventListener("dragstart", this.handleDragStart.bind(this));
    document.addEventListener("dragend", this.handleDragEnd.bind(this));
    document.addEventListener("dragover", this.handleDragOver.bind(this));
    document.addEventListener("drop", this.handleDrop.bind(this));
  }

  // 注册拖拽元素
  registerDraggable(element, data) {
    element.draggable = true;
    element.dataset.dragData = JSON.stringify(data);

    element.addEventListener("dragstart", (e) => {
      this.draggedElement = element;
      this.isDragging = true;
      element.classList.add("dragging");

      // 设置拖拽数据
      e.dataTransfer.setData("text/plain", JSON.stringify(data));
      e.dataTransfer.effectAllowed = "move";
    });
  }

  // 注册放置区域
  registerDropZone(element, onDrop) {
    this.dropZones.add(element);

    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      element.classList.add("drag-over");
    });

    element.addEventListener("dragleave", (e) => {
      if (!element.contains(e.relatedTarget)) {
        element.classList.remove("drag-over");
      }
    });

    element.addEventListener("drop", (e) => {
      e.preventDefault();
      element.classList.remove("drag-over");

      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      onDrop(data, element);
    });
  }

  handleDragStart(e) {
    this.draggedElement = e.target;
    this.isDragging = true;
  }

  handleDragEnd(e) {
    this.isDragging = false;
    this.draggedElement?.classList.remove("dragging");
    this.draggedElement = null;

    // 清理所有拖拽样式
    document.querySelectorAll(".drag-over").forEach((el) => {
      el.classList.remove("drag-over");
    });
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e) {
    e.preventDefault();
  }
}
```

### 鼠标拖拽实现

```javascript
// 鼠标拖拽实现
class MouseDragManager {
  constructor() {
    this.draggedElement = null;
    this.initialPosition = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.isDragging = false;

    this.init();
  }

  init() {
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  // 注册拖拽元素
  registerDraggable(element, options = {}) {
    element.addEventListener("mousedown", (e) => {
      this.startDrag(e, element, options);
    });
  }

  startDrag(e, element, options) {
    e.preventDefault();

    this.draggedElement = element;
    this.isDragging = true;

    const rect = element.getBoundingClientRect();
    this.offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    this.initialPosition = {
      x: rect.left,
      y: rect.top,
    };

    element.classList.add("dragging");

    // 调用开始拖拽回调
    if (options.onDragStart) {
      options.onDragStart(element, e);
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging || !this.draggedElement) return;

    const x = e.clientX - this.offset.x;
    const y = e.clientY - this.offset.y;

    // 应用约束
    const constrained = this.applyConstraints({ x, y });

    this.draggedElement.style.position = "fixed";
    this.draggedElement.style.left = constrained.x + "px";
    this.draggedElement.style.top = constrained.y + "px";
    this.draggedElement.style.zIndex = "1000";
  }

  handleMouseUp(e) {
    if (!this.isDragging || !this.draggedElement) return;

    this.isDragging = false;
    this.draggedElement.classList.remove("dragging");

    // 检查是否在放置区域内
    const dropZone = this.findDropZone(e.clientX, e.clientY);
    if (dropZone) {
      this.handleDrop(dropZone);
    }

    this.draggedElement = null;
  }

  applyConstraints(position) {
    // 边界约束
    const maxX = window.innerWidth - this.draggedElement.offsetWidth;
    const maxY = window.innerHeight - this.draggedElement.offsetHeight;

    return {
      x: Math.max(0, Math.min(position.x, maxX)),
      y: Math.max(0, Math.min(position.y, maxY)),
    };
  }

  findDropZone(x, y) {
    // 查找放置区域
    const dropZones = document.querySelectorAll(".drop-zone");
    for (const zone of dropZones) {
      const rect = zone.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return zone;
      }
    }
    return null;
  }

  handleDrop(dropZone) {
    // 处理放置逻辑
    dropZone.classList.add("dropped");
    setTimeout(() => {
      dropZone.classList.remove("dropped");
    }, 200);
  }
}
```

### Vue 3 拖拽组件

```vue
<!-- DragDrop.vue -->
<template>
  <div class="drag-drop-container">
    <!-- 拖拽列表 -->
    <div class="drag-list">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="drag-item"
        :class="{ dragging: draggedIndex === index }"
        draggable="true"
        @dragstart="handleDragStart($event, index)"
        @dragend="handleDragEnd"
      >
        {{ item.name }}
      </div>
    </div>

    <!-- 放置区域 -->
    <div
      class="drop-zone"
      :class="{ 'drag-over': isDragOver }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      放置区域
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const items = ref([
  { id: 1, name: "项目 1" },
  { id: 2, name: "项目 2" },
  { id: 3, name: "项目 3" },
]);

const draggedIndex = ref(-1);
const isDragOver = ref(false);

const handleDragStart = (e, index) => {
  draggedIndex.value = index;
  e.dataTransfer.setData("text/plain", index);
  e.dataTransfer.effectAllowed = "move";
};

const handleDragEnd = () => {
  draggedIndex.value = -1;
};

const handleDragOver = (e) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragOver.value = false;

  const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
  const item = items.value[fromIndex];

  // 移除拖拽的项目
  items.value.splice(fromIndex, 1);

  // 这里可以处理放置逻辑
  console.log("Dropped item:", item);
};
</script>

<style scoped>
.drag-drop-container {
  display: flex;
  gap: 20px;
}

.drag-list {
  border: 2px dashed #ccc;
  padding: 10px;
  min-height: 200px;
}

.drag-item {
  padding: 10px;
  margin: 5px 0;
  background: #f0f0f0;
  border: 1px solid #ddd;
  cursor: move;
  user-select: none;
}

.drag-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.drop-zone {
  border: 2px dashed #999;
  padding: 20px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.drop-zone.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
}
</style>
```

---

## 📝 总结

这些面试题涵盖了前端开发的核心知识点：

1. **项目经验**：vite-plugin-faker、alien-sigle 等实际项目
2. **框架原理**：Vue2/3 差异、响应式系统
3. **网络知识**：HTTP 协议、跨域、代理
4. **性能优化**：CDN、缓存、渲染优化
5. **工程化**：Docker、构建工具
6. **交互实现**：拖拽、数组操作

掌握这些知识点对于前端开发工程师来说非常重要，能够帮助构建高性能、可维护的现代 Web 应用。

---

## 16. promise all/race 是什么 实现一个 promise all

### Promise.all 和 Promise.race 的区别

#### Promise.all

- **等待所有 Promise 完成**：只有当所有 Promise 都成功时，才返回结果数组
- **任何一个失败就失败**：如果任何一个 Promise 失败，整个 Promise.all 就失败
- **返回结果顺序**：返回的结果数组顺序与输入的 Promise 数组顺序一致

#### Promise.race

- **第一个完成就返回**：只要有一个 Promise 完成（成功或失败），就立即返回该结果
- **竞态条件**：适用于超时控制、竞态场景

### Promise.all 实现

```javascript
// Promise.all 实现
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    // 处理空数组情况
    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      // 确保每个项都是 Promise
      Promise.resolve(promise)
        .then((result) => {
          results[index] = result;
          completed++;

          // 所有 Promise 都完成
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject); // 任何一个失败就失败
    });
  });
}

// 使用示例
const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];

promiseAll(promises)
  .then((results) => console.log(results)) // [1, 2, 3]
  .catch((error) => console.error(error));
```

### Promise.race 实现

```javascript
// Promise.race 实现
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((promise) => {
      Promise.resolve(promise)
        .then(resolve) // 第一个成功就成功
        .catch(reject); // 第一个失败就失败
    });
  });
}

// 使用示例
const promises = [
  new Promise((resolve) => setTimeout(() => resolve("fast"), 100)),
  new Promise((resolve) => setTimeout(() => resolve("slow"), 500)),
];

promiseRace(promises)
  .then((result) => console.log(result)) // 'fast'
  .catch((error) => console.error(error));
```

### 高级实现（带取消功能）

```javascript
// 带取消功能的 Promise.all
function cancellablePromiseAll(promises) {
  let cancelled = false;

  const promise = new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((result) => {
          if (cancelled) return;

          results[index] = result;
          completed++;

          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch((error) => {
          if (cancelled) return;
          reject(error);
        });
    });
  });

  // 添加取消方法
  promise.cancel = () => {
    cancelled = true;
  };

  return promise;
}

// 使用示例
const promises = [
  new Promise((resolve) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve) => setTimeout(() => resolve(2), 2000)),
  new Promise((resolve) => setTimeout(() => resolve(3), 3000)),
];

const cancellable = cancellablePromiseAll(promises);

cancellable
  .then((results) => console.log(results))
  .catch((error) => console.error(error));

// 1秒后取消
setTimeout(() => {
  cancellable.cancel();
  console.log("Cancelled");
}, 1000);
```

### 实际应用场景

```javascript
// 并发请求控制
class RequestController {
  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// 使用示例
const controller = new RequestController(2);

const requests = [
  () => fetch("/api/users"),
  () => fetch("/api/posts"),
  () => fetch("/api/comments"),
  () => fetch("/api/tags"),
];

// 使用 Promise.all 并发执行
Promise.all(requests.map((req) => controller.add(req)))
  .then((responses) => {
    console.log("All requests completed:", responses);
  })
  .catch((error) => {
    console.error("Some requests failed:", error);
  });
```

---

## 17. git 常用命令 撤回命令暂存呢

### Git 常用命令

#### 1. 基础操作

```bash
# 初始化仓库
git init

# 克隆仓库
git clone <repository-url>

# 添加文件到暂存区
git add <file>           # 添加指定文件
git add .                # 添加所有文件
git add *.js             # 添加所有 .js 文件

# 提交更改
git commit -m "commit message"
git commit -am "commit message"  # 添加并提交已跟踪的文件

# 查看状态
git status
git status -s            # 简短格式

# 查看提交历史
git log
git log --oneline        # 单行显示
git log --graph          # 图形化显示
```

#### 2. 分支操作

```bash
# 查看分支
git branch               # 本地分支
git branch -r            # 远程分支
git branch -a            # 所有分支

# 创建分支
git branch <branch-name>
git checkout -b <branch-name>  # 创建并切换

# 切换分支
git checkout <branch-name>
git switch <branch-name>       # Git 2.23+ 推荐

# 合并分支
git merge <branch-name>
git merge --no-ff <branch-name>  # 禁用快进合并

# 删除分支
git branch -d <branch-name>     # 安全删除
git branch -D <branch-name>     # 强制删除
```

#### 3. 远程操作

```bash
# 添加远程仓库
git remote add origin <repository-url>

# 推送到远程
git push origin <branch-name>
git push -u origin <branch-name>  # 设置上游分支

# 拉取更新
git pull origin <branch-name>
git fetch origin                  # 只获取不合并

# 查看远程信息
git remote -v
```

### Git 撤回命令

#### 1. 撤回工作区更改

```bash
# 撤回单个文件的更改
git checkout -- <file>
git restore <file>               # Git 2.23+ 推荐

# 撤回所有文件的更改
git checkout -- .
git restore .                    # Git 2.23+ 推荐

# 撤回特定文件的更改
git checkout HEAD -- <file>
```

#### 2. 撤回暂存区更改

```bash
# 撤回暂存区的单个文件
git reset HEAD <file>
git restore --staged <file>      # Git 2.23+ 推荐

# 撤回暂存区的所有文件
git reset HEAD
git restore --staged .           # Git 2.23+ 推荐
```

#### 3. 撤回提交

```bash
# 撤回最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤回最后一次提交（保留工作区，撤回暂存区）
git reset --mixed HEAD~1
git reset HEAD~1                 # 默认是 mixed

# 撤回最后一次提交（完全撤回）
git reset --hard HEAD~1

# 撤回指定提交
git reset --soft <commit-hash>
git reset --mixed <commit-hash>
git reset --hard <commit-hash>
```

#### 4. 撤回远程提交

```bash
# 撤回远程提交（危险操作）
git push origin <branch-name> --force
git push origin <branch-name> --force-with-lease  # 更安全
```

### Git 暂存操作

#### 1. 暂存当前工作

```bash
# 暂存当前更改
git stash
git stash push -m "stash message"

# 暂存特定文件
git stash push <file1> <file2>

# 暂存未跟踪的文件
git stash -u
git stash --include-untracked
```

#### 2. 查看暂存列表

```bash
# 查看所有暂存
git stash list

# 查看暂存内容
git stash show
git stash show -p               # 显示详细差异
git stash show stash@{1}        # 查看指定暂存
```

#### 3. 应用暂存

```bash
# 应用最新的暂存
git stash pop                   # 应用并删除
git stash apply                 # 应用但不删除

# 应用指定的暂存
git stash pop stash@{1}
git stash apply stash@{1}
```

#### 4. 删除暂存

```bash
# 删除最新的暂存
git stash drop

# 删除指定的暂存
git stash drop stash@{1}

# 删除所有暂存
git stash clear
```

### 实用 Git 工作流

```bash
# 1. 开始新功能开发
git checkout -b feature/new-feature

# 2. 开发过程中需要切换分支
git stash push -m "WIP: new feature development"

# 3. 切换回主分支处理紧急问题
git checkout main
git checkout -b hotfix/urgent-fix

# 4. 修复完成后
git add .
git commit -m "Fix urgent issue"
git checkout main
git merge hotfix/urgent-fix
git branch -d hotfix/urgent-fix

# 5. 回到功能分支继续开发
git checkout feature/new-feature
git stash pop

# 6. 完成功能开发
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 7. 创建 Pull Request 或合并
git checkout main
git merge feature/new-feature
git branch -d feature/new-feature
```

### Git 配置和别名

```bash
# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认编辑器
git config --global core.editor "code --wait"

# 创建别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'

# 使用别名
git co main          # git checkout main
git st               # git status
git unstage <file>   # git reset HEAD -- <file>
```
