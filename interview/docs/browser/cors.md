# 跨域问题解决方案

全面解析跨域问题的产生原因、常见场景和多种解决方案，帮助开发者彻底理解并解决跨域问题。

## 🔒 同源策略基础

### 同源定义

两个 URL 同源需要满足：

- **协议相同** (http/https)
- **域名相同** (example.com)
- **端口相同** (80/443/8080 等)

```javascript
// 同源判断示例
const urls = [
  "https://example.com/page1", // 基准URL
  "https://example.com/page2", // ✅ 同源
  "http://example.com/page1", // ❌ 协议不同
  "https://api.example.com/data", // ❌ 子域不同
  "https://example.com:8080/page1", // ❌ 端口不同
];

function isSameOrigin(url1, url2) {
  const a = new URL(url1);
  const b = new URL(url2);

  return (
    a.protocol === b.protocol && a.hostname === b.hostname && a.port === b.port
  );
}
```

### 同源策略限制

1. **Cookie、LocalStorage、SessionStorage** 无法读取
2. **DOM** 无法获取
3. **Ajax 请求** 无法发送

## 🌐 CORS 跨域资源共享

### 基本原理

CORS 通过 HTTP 头部信息来控制跨域访问权限。

### 简单请求

满足以下条件的请求为简单请求：

- 请求方法：`GET`、`POST`、`HEAD`
- 请求头仅包含：`Accept`、`Accept-Language`、`Content-Language`、`Content-Type`
- Content-Type 值仅限：`text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`

```javascript
// 简单请求示例
fetch("https://api.example.com/data", {
  method: "GET",
  headers: {
    Accept: "application/json",
  },
});
```

**服务端响应头设置**：

```javascript
// Express.js 示例
app.use((req, res, next) => {
  // 允许的源
  res.header("Access-Control-Allow-Origin", "https://frontend.com");
  // 或允许所有源（不安全）
  // res.header('Access-Control-Allow-Origin', '*');

  // 允许携带认证信息
  res.header("Access-Control-Allow-Credentials", "true");

  // 暴露的响应头
  res.header("Access-Control-Expose-Headers", "X-Total-Count");

  next();
});
```

### 预检请求 (Preflight)

非简单请求会先发送 OPTIONS 预检请求：

```javascript
// 触发预检的请求
fetch("https://api.example.com/users", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer token123",
  },
  body: JSON.stringify({ name: "John" }),
});
```

**预检请求处理**：

```javascript
// 处理预检请求
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://frontend.com");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With"
  );
  res.header("Access-Control-Max-Age", "86400"); // 预检缓存24小时
  res.sendStatus(200);
});
```

### 完整 CORS 配置

```javascript
// 完整的CORS中间件
function corsMiddleware(options = {}) {
  const {
    origins = ["http://localhost:3000"],
    methods = ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders = ["Content-Type", "Authorization"],
    credentials = true,
  } = options;

  return (req, res, next) => {
    const origin = req.headers.origin;

    // 检查origin是否在允许列表中
    if (origins.includes(origin) || origins.includes("*")) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Methods", methods.join(","));
    res.header("Access-Control-Allow-Headers", allowedHeaders.join(","));
    res.header("Access-Control-Allow-Credentials", credentials);

    // 处理预检请求
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  };
}

// 使用
app.use(
  corsMiddleware({
    origins: ["https://myapp.com", "https://admin.myapp.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  })
);
```

## 🔄 JSONP 跨域

### 原理

利用`<script>`标签不受同源策略限制的特性。

```javascript
// JSONP实现
function jsonp(url, callback, callbackName = "callback") {
  return new Promise((resolve, reject) => {
    // 生成唯一回调函数名
    const callbackFn = `jsonp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2)}`;

    // 创建script标签
    const script = document.createElement("script");
    script.src = `${url}?${callbackName}=${callbackFn}`;

    // 定义全局回调函数
    window[callbackFn] = function (data) {
      resolve(data);
      // 清理
      document.head.removeChild(script);
      delete window[callbackFn];
    };

    // 错误处理
    script.onerror = function () {
      reject(new Error("JSONP request failed"));
      document.head.removeChild(script);
      delete window[callbackFn];
    };

    // 添加到页面
    document.head.appendChild(script);
  });
}

// 使用示例
jsonp("https://api.example.com/data", "callback")
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

**服务端支持**：

```javascript
// Express.js JSONP支持
app.get("/api/data", (req, res) => {
  const callback = req.query.callback;
  const data = { message: "Hello JSONP" };

  if (callback) {
    // JSONP响应
    res.type("application/javascript");
    res.send(`${callback}(${JSON.stringify(data)})`);
  } else {
    // 普通JSON响应
    res.json(data);
  }
});
```

## 🌉 代理服务器

### 开发环境代理

```javascript
// webpack-dev-server 代理配置
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://api.example.com",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
};

// Vite 代理配置
export default {
  server: {
    proxy: {
      "/api": {
        target: "https://api.example.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
};
```

### Nginx 反向代理

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass https://api.example.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Node.js 代理服务器

```javascript
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// 静态文件服务
app.use(express.static("public"));

// API代理
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://api.example.com",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log("代理请求:", req.method, req.url);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("代理响应:", proxyRes.statusCode);
    },
  })
);

app.listen(3000, () => {
  console.log("代理服务器运行在 http://localhost:3000");
});
```

## 📝 document.domain

适用于**主域相同，子域不同**的场景：

```javascript
// 父页面: https://example.com/parent.html
document.domain = "example.com";

// 子页面: https://sub.example.com/child.html
document.domain = "example.com";

// 现在可以互相访问
// 父页面访问iframe
const iframe = document.getElementById("childFrame");
const childWindow = iframe.contentWindow;
childWindow.postMessage("Hello from parent", "*");

// 子页面访问父页面
parent.postMessage("Hello from child", "*");
```

## 📮 PostMessage 通信

### 基本用法

```javascript
// 发送消息
targetWindow.postMessage(message, targetOrigin);

// 接收消息
window.addEventListener("message", function (event) {
  // 验证来源
  if (event.origin !== "https://trusted-domain.com") {
    return;
  }

  console.log("收到消息:", event.data);

  // 回复消息
  event.source.postMessage("回复内容", event.origin);
});
```

### iframe 通信

```html
<!-- 父页面 -->
<iframe id="childFrame" src="https://child.example.com/page.html"></iframe>

<script>
  // 父页面向子页面发送消息
  function sendToChild(data) {
    const iframe = document.getElementById("childFrame");
    iframe.contentWindow.postMessage(data, "https://child.example.com");
  }

  // 接收子页面消息
  window.addEventListener("message", function (event) {
    if (event.origin !== "https://child.example.com") {
      return;
    }

    console.log("来自子页面:", event.data);
  });
</script>
```

```javascript
// 子页面 (https://child.example.com/page.html)
// 向父页面发送消息
parent.postMessage(
  {
    type: "greeting",
    message: "Hello from child",
  },
  "https://parent.example.com"
);

// 接收父页面消息
window.addEventListener("message", function (event) {
  if (event.origin !== "https://parent.example.com") {
    return;
  }

  console.log("来自父页面:", event.data);
});
```

### 安全的 PostMessage

```javascript
class SecureMessenger {
  constructor(targetOrigin, allowedOrigins = []) {
    this.targetOrigin = targetOrigin;
    this.allowedOrigins = allowedOrigins;
    this.messageHandlers = new Map();

    this.init();
  }

  init() {
    window.addEventListener("message", (event) => {
      // 验证来源
      if (!this.isOriginAllowed(event.origin)) {
        console.warn("拒绝来自未授权源的消息:", event.origin);
        return;
      }

      // 验证消息格式
      if (!this.isValidMessage(event.data)) {
        console.warn("无效的消息格式:", event.data);
        return;
      }

      // 处理消息
      this.handleMessage(event.data, event);
    });
  }

  isOriginAllowed(origin) {
    return (
      this.allowedOrigins.includes(origin) || this.allowedOrigins.includes("*")
    );
  }

  isValidMessage(data) {
    return data && typeof data === "object" && data.type;
  }

  send(type, payload = {}) {
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    window.parent.postMessage(message, this.targetOrigin);
  }

  on(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  handleMessage(data, event) {
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data.payload, event);
    }
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2)}`;
  }
}

// 使用示例
const messenger = new SecureMessenger("https://parent.example.com", [
  "https://parent.example.com",
  "https://admin.example.com",
]);

// 注册消息处理器
messenger.on("getData", (payload, event) => {
  console.log("收到getData请求:", payload);
  // 发送响应
  messenger.send("dataResponse", { data: [1, 2, 3] });
});

// 发送消息
messenger.send("ready", { version: "1.0.0" });
```

## 🍪 Cookie 跨域

### SameSite 属性

```javascript
// 设置Cookie的SameSite属性
document.cookie = "token=abc123; SameSite=None; Secure";

// SameSite选项:
// - Strict: 严格模式，不允许跨站发送
// - Lax: 宽松模式，导航到目标网址的GET请求允许发送
// - None: 无限制，但必须配合Secure使用
```

### 跨域 Cookie 配置

```javascript
// 服务端设置允许跨域Cookie
app.use(
  session({
    cookie: {
      sameSite: "none",
      secure: true, // 仅在HTTPS下工作
      httpOnly: true, // 防止XSS
      maxAge: 24 * 60 * 60 * 1000, // 24小时
    },
  })
);

// 客户端发送跨域请求时携带Cookie
fetch("https://api.example.com/data", {
  method: "GET",
  credentials: "include", // 携带Cookie
});
```

## 🔧 解决方案对比

| 方案                | 适用场景            | 优点             | 缺点                 |
| ------------------- | ------------------- | ---------------- | -------------------- |
| **CORS**            | 现代浏览器 API 调用 | 标准化、安全性高 | 需要服务端支持       |
| **JSONP**           | 兼容老浏览器        | 兼容性好         | 只支持 GET、安全性低 |
| **代理**            | 开发环境            | 简单易用         | 需要额外服务         |
| **PostMessage**     | iframe/window 通信  | 灵活性高         | 仅限页面间通信       |
| **document.domain** | 子域跨域            | 简单             | 仅限主域相同场景     |

## ⚡ 最佳实践

### 1. 安全配置

```javascript
// 生产环境CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名白名单
    const allowedOrigins = ["https://myapp.com", "https://admin.myapp.com"];

    // 允许移动端应用(无origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // 兼容IE
};

app.use(cors(corsOptions));
```

### 2. 错误处理

```javascript
// 跨域请求错误处理
async function secureRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("CORS")) {
      console.error("跨域请求失败:", error);
      throw new Error("网络请求被阻止，请检查跨域配置");
    }
    throw error;
  }
}
```

### 3. 开发环境配置

```javascript
// package.json 代理配置
{
    "name": "my-app",
    "proxy": "http://localhost:8080",
    "scripts": {
        "start": "react-scripts start"
    }
}

// 或者使用环境变量
// .env.development
REACT_APP_API_URL=http://localhost:8080
```

## 📋 面试要点

### 常见问题

1. **什么是同源策略？为什么需要同源策略？**

   - 保护用户数据安全
   - 防止恶意网站获取敏感信息
   - 限制不同源之间的交互

2. **CORS 预检请求什么时候触发？**

   - 非简单请求方法(PUT、DELETE 等)
   - 自定义请求头
   - Content-Type 为 application/json

3. **如何解决开发环境跨域问题？**
   - webpack-dev-server 代理
   - 浏览器禁用安全策略(仅开发)
   - 本地代理服务器

### 解决思路

```javascript
// 跨域问题排查清单
const crossOriginDebugging = {
  1: "检查控制台错误信息",
  2: "确认请求URL和当前页面是否同源",
  3: "检查服务端CORS配置",
  4: "验证预检请求响应",
  5: "确认Cookie设置(credentials)",
  6: "检查浏览器网络面板",
};
```

---

_跨域问题是前端开发中的常见问题，理解其原理和多种解决方案有助于灵活应对不同场景的需求。_
