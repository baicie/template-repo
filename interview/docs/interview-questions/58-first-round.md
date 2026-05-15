# 58 同城一面面试题详解

## 📋 面试题列表

- 说一下对原型链的理解
- 实现继承的方式有几种具体点
- es6 中继承是如何实现的
- 说一下事件循环的理解
- 说一下 vue2/vue3 的区别
- 现在有个属性结构 ts 实现一下
- vue3 中的 diff 算法说一下
- qiankun/wujie 的原理说一下
- vite 的核心思想说一下
- 实现一个并发控制/promise.all
- 你说在 ci/cd 中使用了 nodejs 怎么用的说一下
- 对应的 nodejs 后端框架用了什么介绍一下
- 高性能 table 组件怎么去实现的

---

## 1. 说一下对原型链的理解

### 基本概念

原型链是 JavaScript 实现继承的核心机制，每个对象都有一个内部属性 `[[Prototype]]`。

### 工作原理

```javascript
// 原型链示例
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person("Alice");
person.sayHello(); // 通过原型链查找方法

// 原型链查找过程
console.log(person.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

### 关键特点

- **属性查找**：对象 → 原型 → 原型的原型 → ... → null
- **原型链终点**：Object.prototype
- **hasOwnProperty**：区分自身属性和继承属性

---

## 2. 实现继承的方式有几种具体点

### 方式一：原型链继承

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(`${this.name} makes a sound`);
};

function Dog(name) {
  this.name = name;
}

Dog.prototype = new Animal();
Dog.prototype.constructor = Dog;

const dog = new Dog("Buddy");
dog.speak(); // Buddy makes a sound
```

**缺点：** 所有实例共享引用类型属性

### 方式二：构造函数继承

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

function Dog(name) {
  Animal.call(this, name); // 借用构造函数
}

const dog1 = new Dog("Buddy");
const dog2 = new Dog("Max");
dog1.colors.push("green");
console.log(dog2.colors); // ['red', 'blue'] - 不共享
```

**缺点：** 无法继承原型上的方法

### 方式三：组合继承

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

Animal.prototype.speak = function () {
  console.log(`${this.name} makes a sound`);
};

function Dog(name) {
  Animal.call(this, name); // 继承属性
}

Dog.prototype = new Animal(); // 继承方法
Dog.prototype.constructor = Dog;
```

### 方式四：寄生组合继承（推荐）

```javascript
function inheritPrototype(subType, superType) {
  const prototype = Object.create(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}

function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(`${this.name} makes a sound`);
};

function Dog(name) {
  Animal.call(this, name);
}

inheritPrototype(Dog, Animal);
```

---

## 3. ES6 中继承是如何实现的

### class 语法糖

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }

  static create(name) {
    return new Animal(name);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }

  speak() {
    super.speak(); // 调用父类方法
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog("Buddy", "Golden");
dog.speak();
```

### 底层实现原理

```javascript
// ES6 class 的底层实现
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(`${this.name} makes a sound`);
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

// 设置原型链
Object.setPrototypeOf(Dog.prototype, Animal.prototype);
// 或者
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
```

---

## 4. 说一下事件循环的理解

### 事件循环机制

JavaScript 是单线程的，通过事件循环实现异步操作。

### 执行顺序

```javascript
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

### 任务分类

- **同步任务**：立即执行
- **微任务**：Promise.then, process.nextTick, MutationObserver
- **宏任务**：setTimeout, setInterval, setImmediate, I/O, UI 渲染

### 执行流程

1. 执行同步代码
2. 执行微任务队列
3. 执行宏任务队列
4. 重复步骤 2-3

---

## 5. 说一下 vue2/vue3 的区别

### 架构层面

| 特性            | Vue 2                 | Vue 3    |
| --------------- | --------------------- | -------- |
| 响应式系统      | Object.defineProperty | Proxy    |
| 组合式 API      | 无                    | 有       |
| TypeScript 支持 | 有限                  | 原生支持 |
| 打包体积        | 较大                  | 更小     |

### 响应式系统

```javascript
// Vue 2
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

// Vue 3
const data = reactive({
  name: "Alice",
  age: 25,
});

// Proxy 可以监听数组变化和新增属性
```

### 组合式 API

```javascript
// Vue 2 Options API
export default {
    data() {
        return {
            count: 0
        };
    },
    methods: {
        increment() {
            this.count++;
        }
    }
};

// Vue 3 Composition API
import { ref, onMounted } from 'vue';

export default {
    setup() {
        const count = ref(0);

        const increment = () => {
            count.value++;
        };

        onMounted(() => {
            console.log('mounted');
        });

        return {
            count,
            increment
        };
    }
};
```

---

## 6. 现在有个属性结构 ts 实现一下

### 题目：实现一个树形结构

```typescript
// 定义树节点接口
interface TreeNode<T> {
  id: string | number;
  name: string;
  children?: TreeNode<T>[];
  parent?: TreeNode<T>;
  data?: T;
}

// 树形结构类
class Tree<T> {
  private root: TreeNode<T> | null = null;
  private nodeMap = new Map<string | number, TreeNode<T>>();

  // 添加节点
  addNode(node: TreeNode<T>, parentId?: string | number): void {
    if (parentId) {
      const parent = this.nodeMap.get(parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
        node.parent = parent;
      }
    } else {
      this.root = node;
    }
    this.nodeMap.set(node.id, node);
  }

  // 查找节点
  findNode(id: string | number): TreeNode<T> | null {
    return this.nodeMap.get(id) || null;
  }

  // 遍历树
  traverse(callback: (node: TreeNode<T>) => void): void {
    const traverseNode = (node: TreeNode<T>) => {
      callback(node);
      if (node.children) {
        node.children.forEach(traverseNode);
      }
    };

    if (this.root) {
      traverseNode(this.root);
    }
  }

  // 获取所有叶子节点
  getLeafNodes(): TreeNode<T>[] {
    const leaves: TreeNode<T>[] = [];
    this.traverse((node) => {
      if (!node.children || node.children.length === 0) {
        leaves.push(node);
      }
    });
    return leaves;
  }
}

// 使用示例
interface UserData {
  email: string;
  role: string;
}

const tree = new Tree<UserData>();

const user1: TreeNode<UserData> = {
  id: 1,
  name: "Alice",
  data: { email: "alice@example.com", role: "admin" },
};

const user2: TreeNode<UserData> = {
  id: 2,
  name: "Bob",
  data: { email: "bob@example.com", role: "user" },
};

tree.addNode(user1);
tree.addNode(user2, 1);

console.log(tree.getLeafNodes()); // [user2]
```

---

## 7. Vue3 中的 diff 算法说一下

### 核心优化

Vue3 的 diff 算法相比 Vue2 有显著优化：

### 1. 静态标记

```javascript
// Vue3 在编译时标记静态节点
const hoisted = createVNode("div", null, "static content");

// 静态节点不会参与 diff
function patch(n1, n2, container) {
  if (n2.patchFlag & PatchFlags.STABLE_FRAGMENT) {
    // 跳过静态节点
    return;
  }
}
```

### 2. 最长递增子序列

```javascript
// 优化数组 diff
function patchKeyedChildren(c1, c2, container) {
  // 1. 从头部开始比较
  let i = 0;
  while (i < c1.length && i < c2.length && isSameVNode(c1[i], c2[i])) {
    patch(c1[i], c2[i], container);
    i++;
  }

  // 2. 从尾部开始比较
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;
  while (e1 >= i && e2 >= i && isSameVNode(c1[e1], c2[e2])) {
    patch(c1[e1], c2[e2], container);
    e1--;
    e2--;
  }

  // 3. 处理新增和删除
  if (i > e1) {
    // 新增节点
    while (i <= e2) {
      mount(c2[i], container);
      i++;
    }
  } else if (i > e2) {
    // 删除节点
    while (i <= e1) {
      unmount(c1[i]);
      i++;
    }
  } else {
    // 4. 使用最长递增子序列优化移动
    const keyToNewIndexMap = new Map();
    for (let j = i; j <= e2; j++) {
      keyToNewIndexMap.set(c2[j].key, j);
    }

    const newIndexToOldIndexMap = new Array(e2 - i + 1);
    for (let j = 0; j < newIndexToOldIndexMap.length; j++) {
      newIndexToOldIndexMap[j] = 0;
    }

    // 构建映射关系
    for (let j = i; j <= e1; j++) {
      const oldChild = c1[j];
      const newIndex = keyToNewIndexMap.get(oldChild.key);
      if (newIndex === undefined) {
        unmount(oldChild);
      } else {
        newIndexToOldIndexMap[newIndex - i] = j + 1;
        patch(oldChild, c2[newIndex], container);
      }
    }

    // 使用最长递增子序列优化移动
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
    let j = increasingNewIndexSequence.length - 1;
    for (let k = e2 - i; k >= 0; k--) {
      const nextIndex = k + i;
      const nextChild = c2[nextIndex];
      const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;

      if (newIndexToOldIndexMap[k] === 0) {
        mount(nextChild, container, anchor);
      } else if (k !== increasingNewIndexSequence[j]) {
        move(nextChild, container, anchor);
      } else {
        j--;
      }
    }
  }
}
```

### 3. Fragment 支持

```javascript
// Vue3 支持多根节点
function render() {
    return (
        <div>Header</div>
        <div>Content</div>
        <div>Footer</div>
    );
}
```

---

## 8. qiankun/wujie 的原理说一下

### 微前端架构

微前端是一种将多个独立应用组合成一个应用的架构模式。

### qiankun 原理

```javascript
// qiankun 核心原理
class QiankunApp {
  constructor() {
    this.apps = new Map();
    this.currentApp = null;
  }

  // 注册微应用
  registerMicroApp(name, entry, container, activeRule) {
    this.apps.set(name, {
      name,
      entry,
      container,
      activeRule,
      status: "unmounted",
    });
  }

  // 启动微应用
  async loadMicroApp(name) {
    const app = this.apps.get(name);
    if (!app) return;

    // 1. 加载应用资源
    const appConfig = await this.loadAppResources(app.entry);

    // 2. 创建沙箱环境
    const sandbox = this.createSandbox();

    // 3. 执行应用代码
    const appInstance = await this.executeApp(appConfig, sandbox);

    // 4. 挂载到容器
    this.mountApp(appInstance, app.container);

    app.status = "mounted";
    this.currentApp = app;
  }

  // 创建沙箱
  createSandbox() {
    const fakeWindow = {};
    const proxy = new Proxy(window, {
      get(target, key) {
        return fakeWindow[key] || target[key];
      },
      set(target, key, value) {
        fakeWindow[key] = value;
        return true;
      },
    });

    return {
      window: proxy,
      document: proxy.document,
    };
  }
}
```

### wujie 原理

```javascript
// wujie 基于 Web Components
class WujieApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const name = this.getAttribute("name");
    const url = this.getAttribute("url");

    // 1. 创建 iframe
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.height = "100%";

    // 2. 注入通信脚本
    const script = document.createElement("script");
    script.textContent = `
            window.parent.postMessage({
                type: 'wujie-ready',
                name: '${name}'
            }, '*');
        `;

    // 3. 挂载到 Shadow DOM
    this.shadowRoot.appendChild(iframe);

    // 4. 等待应用就绪
    await this.waitForAppReady(name);
  }

  waitForAppReady(name) {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data.type === "wujie-ready" && event.data.name === name) {
          window.removeEventListener("message", handler);
          resolve();
        }
      };
      window.addEventListener("message", handler);
    });
  }
}

customElements.define("wujie-app", WujieApp);
```

---

## 9. vite 的核心思想说一下

### 核心思想

Vite 的核心思想是**开发时按需编译**，利用浏览器原生 ES 模块能力。

### 开发模式原理

```javascript
// vite 开发服务器
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

  // 编译 Vue 组件
  async compileVue(url) {
    const content = await this.readFile(url);
    const { script, template, style } = this.parseVue(content);

    return `
            import { createApp } from 'vue';
            import { render } from '${template}';
            
            const component = {
                setup() {
                    ${script}
                },
                render
            };
            
            export default component;
        `;
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

  async preBundle() {
    // 使用 esbuild 预构建依赖
    const result = await esbuild.build({
      entryPoints: ["src/main.js"],
      bundle: true,
      format: "esm",
      outdir: "dist",
    });
  }
}
```

---

## 10. 实现一个并发控制/promise.all

### Promise.all 实现

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((result) => {
          results[index] = result;
          completed++;

          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

// 使用示例
const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];

promiseAll(promises).then((results) => {
  console.log(results); // [1, 2, 3]
});
```

### 并发控制实现

```javascript
class ConcurrencyController {
  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
      });
      this.run();
    });
  }

  async run() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.run();
    }
  }
}

// 使用示例
const controller = new ConcurrencyController(2);

const tasks = [
  () => new Promise((resolve) => setTimeout(() => resolve(1), 1000)),
  () => new Promise((resolve) => setTimeout(() => resolve(2), 500)),
  () => new Promise((resolve) => setTimeout(() => resolve(3), 800)),
  () => new Promise((resolve) => setTimeout(() => resolve(4), 300)),
];

tasks.forEach((task) => {
  controller.add(task).then((result) => {
    console.log(`Task completed: ${result}`);
  });
});
```

---

## 11. 你说在 ci/cd 中使用了 nodejs 怎么用的说一下

### CI/CD 流程

```javascript
// .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build

    - name: Deploy to server
      run: |
        npm run deploy
```

### Node.js 脚本示例

```javascript
// scripts/deploy.js
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

class Deployer {
  constructor() {
    this.config = this.loadConfig();
  }

  async deploy() {
    try {
      // 1. 构建应用
      await this.build();

      // 2. 运行测试
      await this.runTests();

      // 3. 上传文件
      await this.uploadFiles();

      // 4. 重启服务
      await this.restartService();

      console.log("Deployment completed successfully");
    } catch (error) {
      console.error("Deployment failed:", error);
      process.exit(1);
    }
  }

  async build() {
    return new Promise((resolve, reject) => {
      exec("npm run build", (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          console.log("Build completed");
          resolve();
        }
      });
    });
  }

  async uploadFiles() {
    // 使用 rsync 或 scp 上传文件
    const command = `rsync -avz --delete dist/ ${this.config.server.user}@${this.config.server.host}:${this.config.server.path}`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          console.log("Files uploaded");
          resolve();
        }
      });
    });
  }
}

// 执行部署
const deployer = new Deployer();
deployer.deploy();
```

---

## 12. 对应的 nodejs 后端框架用了什么介绍一下

### Express.js

```javascript
const express = require("express");
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Koa.js

```javascript
const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

// 中间件
app.use(bodyParser());

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
  }
});

// 路由
router.get("/api/users", async (ctx) => {
  const users = await User.find();
  ctx.body = users;
});

router.post("/api/users", async (ctx) => {
  const user = new User(ctx.request.body);
  await user.save();
  ctx.status = 201;
  ctx.body = user;
});

app.use(router.routes());
app.listen(3000);
```

### NestJS

```typescript
import { Controller, Get, Post, Body } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}

@Injectable()
export class UserService {
  async findAll() {
    return await User.find();
  }

  async create(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);
    return await user.save();
  }
}
```

---

## 13. 高性能 table 组件怎么去实现的

### 虚拟滚动实现

```javascript
class VirtualTable {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.data = [];
    this.rowHeight = 40;
    this.visibleRows = Math.ceil(container.clientHeight / this.rowHeight);
    this.scrollTop = 0;

    this.init();
  }

  init() {
    this.createStructure();
    this.bindEvents();
    this.render();
  }

  createStructure() {
    this.container.innerHTML = `
            <div class="virtual-table-header">
                ${this.renderHeader()}
            </div>
            <div class="virtual-table-body">
                <div class="virtual-table-content" style="height: ${
                  this.data.length * this.rowHeight
                }px;">
                    <div class="virtual-table-rows"></div>
                </div>
            </div>
        `;

    this.header = this.container.querySelector(".virtual-table-header");
    this.body = this.container.querySelector(".virtual-table-body");
    this.content = this.container.querySelector(".virtual-table-content");
    this.rowsContainer = this.container.querySelector(".virtual-table-rows");
  }

  bindEvents() {
    this.body.addEventListener("scroll", this.handleScroll.bind(this));
  }

  handleScroll() {
    this.scrollTop = this.body.scrollTop;
    this.render();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.rowHeight);
    const endIndex = Math.min(
      startIndex + this.visibleRows + 2,
      this.data.length
    );

    const rows = [];
    for (let i = startIndex; i < endIndex; i++) {
      rows.push(this.renderRow(this.data[i], i));
    }

    this.rowsContainer.innerHTML = rows.join("");
    this.rowsContainer.style.transform = `translateY(${
      startIndex * this.rowHeight
    }px)`;
  }

  renderRow(data, index) {
    return `
            <div class="virtual-table-row" data-index="${index}">
                ${this.options.columns
                  .map(
                    (column) => `
                    <div class="virtual-table-cell">
                        ${
                          column.render
                            ? column.render(data[column.key], data)
                            : data[column.key]
                        }
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  setData(data) {
    this.data = data;
    this.content.style.height = `${data.length * this.rowHeight}px`;
    this.render();
  }
}

// 使用示例
const table = new VirtualTable(document.getElementById("table"), {
  columns: [
    { key: "id", title: "ID" },
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
  ],
});

// 设置大量数据
const data = Array.from({ length: 100000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

table.setData(data);
```

### 性能优化策略

```javascript
class OptimizedTable extends VirtualTable {
  constructor(container, options) {
    super(container, options);
    this.rowCache = new Map();
    this.debounceTimer = null;
  }

  // 防抖渲染
  handleScroll() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.scrollTop = this.body.scrollTop;
      this.render();
    }, 16); // 60fps
  }

  // 行缓存
  renderRow(data, index) {
    const cacheKey = `${index}-${JSON.stringify(data)}`;

    if (this.rowCache.has(cacheKey)) {
      return this.rowCache.get(cacheKey);
    }

    const rowHtml = super.renderRow(data, index);
    this.rowCache.set(cacheKey, rowHtml);

    // 限制缓存大小
    if (this.rowCache.size > 1000) {
      const firstKey = this.rowCache.keys().next().value;
      this.rowCache.delete(firstKey);
    }

    return rowHtml;
  }

  // 批量更新
  batchUpdate(updates) {
    const fragment = document.createDocumentFragment();

    updates.forEach((update) => {
      const row = this.renderRow(update.data, update.index);
      const div = document.createElement("div");
      div.innerHTML = row;
      fragment.appendChild(div.firstElementChild);
    });

    this.rowsContainer.appendChild(fragment);
  }
}
```

---

## 📝 总结

这些面试题涵盖了前端开发的核心知识点：

1. **JavaScript 基础**：原型链、继承、事件循环
2. **现代框架**：Vue2/3、TypeScript
3. **工程化**：Vite、CI/CD、Node.js
4. **性能优化**：虚拟滚动、diff 算法
5. **架构设计**：微前端、组件设计

掌握这些知识点对于前端开发工程师来说非常重要，能够帮助构建高性能、可维护的现代 Web 应用。
