# 模拟面试一 - 详细回答

## 🌐 浏览器相关

### 浏览器：浏览器跨域

**问题**：什么是跨域？如何解决跨域问题？

**回答**：

跨域是指浏览器出于安全考虑，限制从一个域的网页去访问另一个域的资源。这是由同源策略（Same-Origin Policy）造成的。

**同源的定义**：协议、域名、端口三者完全相同。

**常见跨域场景**：

```javascript
// 当前页面：https://example.com:8080
https://api.example.com:8080  // 不同域名
http://example.com:8080       // 不同协议
https://example.com:3000      // 不同端口
```

**解决方案**：

1. **CORS（Cross-Origin Resource Sharing）**

```javascript
// 服务端设置响应头
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
```

2. **JSONP（仅支持 GET 请求）**

```javascript
function jsonp(url, callback) {
  const script = document.createElement("script");
  const callbackName = "jsonp_" + Date.now();

  window[callbackName] = function (data) {
    callback(data);
    document.body.removeChild(script);
    delete window[callbackName];
  };

  script.src = url + "?callback=" + callbackName;
  document.body.appendChild(script);
}
```

3. **代理服务器**

```javascript
// webpack.config.js
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
```

### 浏览器：浏览器的重排重绘

**问题**：什么是重排和重绘？如何优化？

**回答**：

**重排（Reflow）**：元素的几何属性发生变化，浏览器需要重新计算元素的位置和大小。

**重绘（Repaint）**：元素的外观发生变化，但几何属性没有变化，浏览器只需要重新绘制元素。

**触发重排的操作**：

- 添加/删除 DOM 元素
- 改变元素的宽高、位置
- 改变字体大小
- 浏览器窗口尺寸变化
- 获取某些属性：offsetWidth、scrollTop 等

**触发重绘的操作**：

- 改变颜色、背景色
- 改变 visibility
- 改变 outline

**优化策略**：

1. **批量修改样式**

```javascript
// 不好的做法
element.style.width = "100px";
element.style.height = "100px";
element.style.background = "red";

// 好的做法
element.style.cssText = "width: 100px; height: 100px; background: red;";
// 或者使用类名
element.className = "new-style";
```

2. **使用文档片段**

```javascript
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement("div");
  div.textContent = i;
  fragment.appendChild(div);
}
container.appendChild(fragment);
```

3. **使用 transform 和 opacity**

```css
/* 触发重排 */
.element {
  left: 100px;
  top: 100px;
}

/* 只触发合成，性能更好 */
.element {
  transform: translate(100px, 100px);
}
```

## ⚙️ 工程化

### 工程化：webpack 工作流程

**问题**：描述 webpack 的工作原理和流程。

**回答**：

Webpack 是一个模块打包器，它的核心工作流程如下：

**1. 初始化阶段**

```javascript
// webpack.config.js
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
      },
    ],
  },
};
```

**2. 编译阶段**

- 从 entry 开始，递归解析依赖
- 使用对应的 loader 处理不同类型的文件
- 将处理后的模块存储在内存中

**3. 输出阶段**

- 根据依赖关系生成 chunk
- 使用 plugin 进行优化处理
- 输出最终的 bundle 文件

**核心概念**：

1. **Entry（入口）**：构建的起点
2. **Output（输出）**：指定打包后的文件位置
3. **Loader（加载器）**：处理非 JavaScript 文件
4. **Plugin（插件）**：扩展 webpack 功能

**自定义 Loader 示例**：

```javascript
// my-loader.js
module.exports = function (source) {
  // 处理源码
  const result = source.replace(/console\.log/g, "// console.log");
  return result;
};
```

**自定义 Plugin 示例**：

```javascript
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync("MyPlugin", (compilation, callback) => {
      // 在生成文件时执行
      console.log("webpack构建过程开始！");
      callback();
    });
  }
}
```

## 📚 框架相关

### 框架：Vue 的数据绑定机制

**问题**：Vue 的响应式原理是什么？

**回答**：

Vue 的响应式系统基于**数据劫持**和**发布订阅模式**实现。

**Vue 2.x 实现原理**：

1. **数据劫持**：使用 Object.defineProperty()

```javascript
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 依赖收集器

  Object.defineProperty(obj, key, {
    get() {
      // 收集依赖
      if (Dep.target) {
        dep.addSub(Dep.target);
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 通知更新
      dep.notify();
    },
  });
}
```

2. **依赖收集**：

```javascript
class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}
```

3. **观察者模式**：

```javascript
class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get();
  }

  get() {
    Dep.target = this;
    const value = this.vm[this.exp];
    Dep.target = null;
    return value;
  }

  update() {
    const newVal = this.get();
    if (newVal !== this.value) {
      this.value = newVal;
      this.cb.call(this.vm, newVal);
    }
  }
}
```

**Vue 3.x 改进**：使用 Proxy 替代 Object.defineProperty

```javascript
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key); // 依赖收集
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      trigger(target, key); // 触发更新
      return true;
    },
  });
}
```

### 框架：Vue 的 computed 和 watch

**问题**：computed 和 watch 的区别是什么？

**回答**：

**Computed（计算属性）**：

- 基于响应式依赖进行缓存
- 只有依赖发生变化时才重新计算
- 必须有返回值
- 适合复杂的数据计算

```javascript
// Vue 2
computed: {
  fullName() {
    return this.firstName + ' ' + this.lastName;
  },
  // 完整写法
  reversedMessage: {
    get() {
      return this.message.split('').reverse().join('');
    },
    set(value) {
      this.message = value.split('').reverse().join('');
    }
  }
}

// Vue 3
import { computed, ref } from 'vue';

setup() {
  const firstName = ref('张');
  const lastName = ref('三');

  const fullName = computed(() => {
    return firstName.value + ' ' + lastName.value;
  });

  return { fullName };
}
```

**Watch（侦听器）**：

- 观察数据变化并执行回调
- 无返回值要求
- 适合异步操作或复杂逻辑

```javascript
// Vue 2
watch: {
  message(newVal, oldVal) {
    console.log('message changed:', newVal, oldVal);
  },
  // 深度监听
  user: {
    handler(newVal, oldVal) {
      console.log('user changed');
    },
    deep: true,
    immediate: true
  }
}

// Vue 3
import { watch, watchEffect, ref } from 'vue';

setup() {
  const message = ref('hello');

  // watch
  watch(message, (newVal, oldVal) => {
    console.log('message changed:', newVal, oldVal);
  });

  // watchEffect - 自动收集依赖
  watchEffect(() => {
    console.log('message is:', message.value);
  });
}
```

**主要区别**：

1. **缓存**：computed 有缓存，watch 没有
2. **返回值**：computed 必须返回值，watch 不需要
3. **使用场景**：computed 用于计算，watch 用于副作用

## 🔧 基础知识

### 基础：闭包的作用和原理

**问题**：什么是闭包？有什么作用？

**回答**：

**闭包定义**：函数和其词法环境的组合，使得函数可以访问其外部作用域的变量。

**形成条件**：

1. 函数嵌套
2. 内部函数引用外部函数的变量
3. 内部函数被外部调用

**基本示例**：

```javascript
function outerFunction(x) {
  // 外部函数的变量
  const outerVariable = x;

  // 内部函数
  function innerFunction(y) {
    // 访问外部函数的变量
    return outerVariable + y;
  }

  return innerFunction;
}

const closure = outerFunction(10);
console.log(closure(5)); // 15
```

**实际应用**：

1. **数据私有化**：

```javascript
function createCounter() {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    },
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.getCount()); // 1
// count变量无法直接访问，实现了私有化
```

2. **模块化**：

```javascript
const myModule = (function () {
  let privateVar = 0;

  function privateFunction() {
    console.log("私有函数");
  }

  return {
    publicMethod() {
      privateVar++;
      privateFunction();
      return privateVar;
    },
    getPrivateVar() {
      return privateVar;
    },
  };
})();
```

3. **函数柯里化**：

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
```

**注意事项**：

- 闭包会保持对外部变量的引用，可能导致内存泄漏
- 在循环中创建闭包需要特别注意

```javascript
// 问题示例
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 3, 3, 3
  }, 100);
}

// 解决方案1：使用let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2
  }, 100);
}

// 解决方案2：使用闭包
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => {
      console.log(j); // 0, 1, 2
    }, 100);
  })(i);
}
```

### 基础：前端模块化规范

**问题**：介绍前端模块化的发展历程和各种规范。

**回答**：

**模块化的意义**：

- 避免全局污染
- 依赖管理
- 代码复用
- 维护性提升

**发展历程**：

**1. 全局函数模式（早期）**

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// 使用
add(1, 2);
```

_问题_：全局污染，命名冲突

**2. 命名空间模式**

```javascript
// Math模块
const MathModule = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};

// 使用
MathModule.add(1, 2);
```

**3. IIFE 模式**

```javascript
const MathModule = (function () {
  let privateVar = 0;

  function privateFunction() {
    // 私有方法
  }

  return {
    add(a, b) {
      return a + b;
    },
    subtract(a, b) {
      return a - b;
    },
  };
})();
```

**4. CommonJS（Node.js）**

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract,
};

// 使用
const { add, subtract } = require("./math");
```

**特点**：

- 同步加载
- 运行时加载
- 值的拷贝

**5. AMD（Asynchronous Module Definition）**

```javascript
// 定义模块
define(["jquery"], function ($) {
  return {
    init() {
      $("body").html("Hello AMD");
    },
  };
});

// 使用模块
require(["myModule"], function (myModule) {
  myModule.init();
});
```

**6. CMD（Common Module Definition）**

```javascript
// 定义模块
define(function (require, exports, module) {
  const $ = require("jquery");

  exports.init = function () {
    $("body").html("Hello CMD");
  };
});
```

**7. UMD（Universal Module Definition）**

```javascript
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD
    define(["jquery"], factory);
  } else if (typeof module === "object" && module.exports) {
    // CommonJS
    module.exports = factory(require("jquery"));
  } else {
    // 全局变量
    root.MyModule = factory(root.jQuery);
  }
})(typeof self !== "undefined" ? self : this, function ($) {
  return {
    init() {
      $("body").html("Hello UMD");
    },
  };
});
```

**8. ES6 Modules（现代标准）**

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export default {
  multiply(a, b) {
    return a * b;
  },
};

// 使用
import { add, subtract } from "./math.js";
import mathUtils from "./math.js";
```

**特点**：

- 编译时加载
- 引用的拷贝
- 支持 Tree Shaking

## 🎨 样式相关

### 样式：BFC 的形成和作用

**问题**：什么是 BFC？如何形成 BFC？有什么作用？

**回答**：

**BFC（Block Formatting Context）**：块级格式化上下文，是 CSS 中的一个重要概念，它是一个独立的渲染区域，内部元素的布局不会影响外部元素。

**形成 BFC 的条件**：

1. 根元素（html）
2. float 不为 none
3. position 为 absolute 或 fixed
4. display 为 inline-block、table-cell、table-caption、flex、grid 等
5. overflow 不为 visible

**BFC 的特性**：

1. **内部块级元素垂直排列**
2. **垂直方向的 margin 会发生重叠**
3. **BFC 区域不会与 float 元素重叠**
4. **计算 BFC 高度时，浮动元素也参与计算**

**实际应用**：

**1. 清除浮动**

```html
<div class="container">
  <div class="float-child">浮动元素</div>
  <div class="float-child">浮动元素</div>
</div>
```

```css
.float-child {
  float: left;
  width: 100px;
  height: 100px;
  background: red;
}

/* 方法1：overflow */
.container {
  overflow: hidden; /* 形成BFC */
}

/* 方法2：display */
.container {
  display: flow-root; /* 专门为BFC设计 */
}
```

**2. 防止 margin 重叠**

```html
<div class="bfc-container">
  <div class="child">第一个子元素</div>
</div>
<div class="bfc-container">
  <div class="child">第二个子元素</div>
</div>
```

```css
.child {
  margin: 20px 0;
  height: 50px;
  background: blue;
}

.bfc-container {
  overflow: hidden; /* 形成BFC，防止margin重叠 */
}
```

**3. 自适应两栏布局**

```html
<div class="container">
  <div class="sidebar">侧边栏</div>
  <div class="content">主内容</div>
</div>
```

```css
.sidebar {
  float: left;
  width: 200px;
  height: 300px;
  background: #f0f0f0;
}

.content {
  overflow: hidden; /* 形成BFC，不与浮动元素重叠 */
  height: 300px;
  background: #e0e0e0;
}
```

## 🌐 网络相关

### 网络：前端安全

**问题**：前端有哪些常见的安全问题？如何防范？

**回答**：

**1. XSS（Cross-Site Scripting）跨站脚本攻击**

**攻击原理**：恶意用户在页面中注入恶意脚本

```html
<!-- 恶意输入 -->
<script>
  alert("XSS攻击");
</script>
<img src="x" onerror="alert('XSS')" />
```

**防范措施**：

```javascript
// 1. 输入验证和过滤
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 2. 使用安全的DOM操作
// 不安全
element.innerHTML = userInput;

// 安全
element.textContent = userInput;

// 3. CSP（Content Security Policy）
// 在HTTP头中设置
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

**2. CSRF（Cross-Site Request Forgery）跨站请求伪造**

**防范措施**：

```javascript
// 1. CSRF Token
function generateCSRFToken() {
  return Math.random().toString(36).substr(2);
}

// 在表单中添加token
const form = document.createElement("form");
const tokenInput = document.createElement("input");
tokenInput.type = "hidden";
tokenInput.name = "csrf_token";
tokenInput.value = generateCSRFToken();
form.appendChild(tokenInput);

// 2. SameSite Cookie
document.cookie = "sessionid=abc123; SameSite=Strict";

// 3. 验证Referer
app.use((req, res, next) => {
  const referer = req.get("Referer");
  if (referer && !referer.startsWith("https://trusted-domain.com")) {
    return res.status(403).send("Forbidden");
  }
  next();
});
```

**3. 点击劫持（Clickjacking）**

**防范措施**：

```javascript
// 1. X-Frame-Options
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// 2. Frame busting
if (top !== self) {
  top.location = self.location;
}

// 3. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'none'
```

**4. 前端数据安全**

```javascript
// 1. 敏感信息不要存储在前端
// 不安全
localStorage.setItem("password", userPassword);

// 安全 - 只存储token
localStorage.setItem("token", authToken);

// 2. HTTPS传输
// 确保所有敏感数据通过HTTPS传输

// 3. 数据加密
function encryptSensitiveData(data, key) {
  // 使用加密库如CryptoJS
  return CryptoJS.AES.encrypt(data, key).toString();
}
```

## 📝 编程实现

### 编程：实现一个符合 Promise A+ 规范的 Promise

**问题**：手写实现 Promise。

**回答**：

这个问题我已经在之前的文档中详细实现了，这里提供核心要点：

```javascript
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach((callback) => callback());
      }
    };

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((callback) => callback());
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

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      // ... 其他状态处理
    });

    return promise2;
  }
}
```

**关键点**：

1. 状态管理（pending → fulfilled/rejected）
2. 异步执行回调
3. 链式调用实现
4. Promise 解决过程

### 算法：平衡二叉树

**问题**：什么是平衡二叉树？如何判断？

**回答**：

**平衡二叉树定义**：任意节点的左右子树高度差不超过 1 的二叉树。

**判断算法**：

```javascript
// 二叉树节点定义
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 方法1：自顶向下（效率较低）
function isBalanced(root) {
  if (!root) return true;

  // 计算高度
  function getHeight(node) {
    if (!node) return 0;
    return Math.max(getHeight(node.left), getHeight(node.right)) + 1;
  }

  const leftHeight = getHeight(root.left);
  const rightHeight = getHeight(root.right);

  return (
    Math.abs(leftHeight - rightHeight) <= 1 &&
    isBalanced(root.left) &&
    isBalanced(root.right)
  );
}

// 方法2：自底向上（效率更高）
function isBalanced2(root) {
  function checkBalance(node) {
    if (!node) return 0;

    const leftHeight = checkBalance(node.left);
    if (leftHeight === -1) return -1; // 左子树不平衡

    const rightHeight = checkBalance(node.right);
    if (rightHeight === -1) return -1; // 右子树不平衡

    // 当前节点不平衡
    if (Math.abs(leftHeight - rightHeight) > 1) {
      return -1;
    }

    return Math.max(leftHeight, rightHeight) + 1;
  }

  return checkBalance(root) !== -1;
}

// 测试用例
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(2);
root.left.left = new TreeNode(3);
root.left.right = new TreeNode(3);
root.left.left.left = new TreeNode(4);
root.left.left.right = new TreeNode(4);

console.log(isBalanced2(root)); // false
```

**AVL 树的旋转操作**：

```javascript
// 右旋转
function rotateRight(node) {
  const newRoot = node.left;
  node.left = newRoot.right;
  newRoot.right = node;

  // 更新高度
  updateHeight(node);
  updateHeight(newRoot);

  return newRoot;
}

// 左旋转
function rotateLeft(node) {
  const newRoot = node.right;
  node.right = newRoot.left;
  newRoot.left = node;

  // 更新高度
  updateHeight(node);
  updateHeight(newRoot);

  return newRoot;
}
```

### 综合：浏览器输入网址到页面显示

**问题**：从输入 URL 到页面显示，发生了什么？

**回答**：

这是一个经典的前端综合题，涉及网络、浏览器、渲染等多个方面：

**1. URL 解析**

```javascript
// URL组成部分
const url = "https://www.example.com:8080/path?query=value#hash";
const urlObj = new URL(url);
console.log({
  protocol: urlObj.protocol, // https:
  hostname: urlObj.hostname, // www.example.com
  port: urlObj.port, // 8080
  pathname: urlObj.pathname, // /path
  search: urlObj.search, // ?query=value
  hash: urlObj.hash, // #hash
});
```

**2. DNS 解析**

- 浏览器缓存 → 系统缓存 → 路由器缓存 → ISP DNS → 根域名服务器
- 返回服务器 IP 地址

**3. TCP 连接**

```javascript
// 三次握手过程
// 1. 客户端发送SYN
// 2. 服务器响应SYN+ACK
// 3. 客户端发送ACK
```

**4. HTTP 请求**

```javascript
// 请求报文示例
const request = `
GET /path HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3
Accept-Encoding: gzip, deflate
Connection: keep-alive
`;
```

**5. 服务器处理**

- 解析请求
- 处理业务逻辑
- 返回响应

**6. 浏览器接收响应**

```javascript
// 响应报文示例
const response = `
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1234
Cache-Control: max-age=3600
Set-Cookie: sessionid=abc123; HttpOnly

<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World</h1>
  <script src="script.js"></script>
</body>
</html>
`;
```

**7. 浏览器渲染过程**

```javascript
// 渲染步骤
const renderingSteps = {
  1: "解析HTML，构建DOM树",
  2: "解析CSS，构建CSSOM树",
  3: "合并DOM和CSSOM，生成渲染树",
  4: "布局（Layout/Reflow）：计算元素位置和大小",
  5: "绘制（Paint）：绘制元素外观",
  6: "合成（Composite）：处理层叠上下文",
};

// 关键渲染路径优化
function optimizeRenderingPath() {
  // 1. 减少关键资源数量
  // 2. 减少关键字节数
  // 3. 减少关键路径长度

  return {
    html: "最小化HTML",
    css: "内联关键CSS，延迟非关键CSS",
    javascript: "异步加载非关键JS",
  };
}
```

**8. JavaScript 执行**

```javascript
// 事件循环和任务队列
console.log("1"); // 同步任务

setTimeout(() => {
  console.log("2"); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // 微任务
});

console.log("4"); // 同步任务

// 输出顺序：1, 4, 3, 2
```

**性能优化要点**：

1. **DNS 预解析**：`<link rel="dns-prefetch" href="//example.com">`
2. **HTTP/2**：多路复用，减少连接数
3. **缓存策略**：合理设置 Cache-Control
4. **资源压缩**：gzip、br 压缩
5. **关键渲染路径优化**：内联关键 CSS，延迟非关键资源

---

## 📚 总结

这套模拟面试题涵盖了前端开发的核心知识点：

1. **浏览器原理**：跨域、重排重绘、渲染机制
2. **工程化**：webpack 工作流程、模块化规范
3. **框架原理**：Vue 响应式系统、computed/watch
4. **基础知识**：闭包、BFC、前端安全
5. **算法实现**：Promise、平衡二叉树
6. **综合应用**：从 URL 到页面显示的完整流程

每个回答都包含了：

- 核心概念解释
- 实际代码示例
- 应用场景分析
- 最佳实践建议

这些知识点相互关联，形成了完整的前端技术体系。在面试中，不仅要能回答出基本概念，更要能够深入分析原理，提供实际的解决方案。
