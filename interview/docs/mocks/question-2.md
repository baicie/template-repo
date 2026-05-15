# 模拟面试二 - 详细回答

## 🌐 浏览器相关

### 浏览器：浏览器渲染机制

**问题**：描述浏览器的渲染机制和优化策略。

**回答**：

浏览器渲染机制是将 HTML、CSS、JavaScript 转换为用户可见页面的过程。

**渲染流程**：

1. **解析 HTML 构建 DOM 树**
2. **解析 CSS 构建 CSSOM 树**
3. **合并 DOM 和 CSSOM 生成渲染树**
4. **布局（Layout/Reflow）**：计算元素位置和大小
5. **绘制（Paint）**：绘制元素外观
6. **合成（Composite）**：处理层叠上下文

```javascript
// 关键渲染路径示例
const renderingProcess = {
  // 1. HTML解析
  parseHTML: function (html) {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
  },

  // 2. CSS解析
  parseCSS: function (css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  },

  // 3. 渲染树构建
  buildRenderTree: function (dom, cssom) {
    // 只包含可见元素
    return dom.filter((node) => {
      const style = getComputedStyle(node);
      return style.display !== "none";
    });
  },
};
```

**优化策略**：

1. **减少重排重绘**

```javascript
// 不好的做法 - 多次重排
element.style.width = "100px";
element.style.height = "100px";
element.style.background = "red";

// 好的做法 - 批量更新
element.style.cssText = "width: 100px; height: 100px; background: red;";
```

2. **使用 transform 和 opacity**

```css
/* 触发重排 */
.element {
  left: 100px;
  top: 100px;
}

/* 只触发合成 */
.element {
  transform: translate(100px, 100px);
}
```

### 浏览器：垃圾回收机制

**问题**：JavaScript 的垃圾回收机制是什么？

**回答**：

JavaScript 使用自动垃圾回收管理内存，主要有两种算法：

**1. 标记清除（Mark-and-Sweep）**

- 现代浏览器主要使用的算法
- 从根对象开始标记所有可达对象
- 清除未标记的对象

```javascript
// 标记清除示例
function createObjects() {
  const obj1 = { name: "object1" };
  const obj2 = { name: "object2" };

  obj1.ref = obj2;
  obj2.ref = obj1; // 循环引用

  return obj1;
}

let result = createObjects();
// obj1和obj2都被标记为可达
result = null;
// 现在obj1和obj2都不可达，会被回收
```

**2. 引用计数（Reference Counting）**

- 早期使用的算法
- 统计对象被引用的次数
- 引用次数为 0 时回收

```javascript
// 引用计数的问题 - 循环引用
function problematicCode() {
  const obj1 = {};
  const obj2 = {};

  obj1.ref = obj2;
  obj2.ref = obj1; // 循环引用

  // 即使函数结束，obj1和obj2的引用计数仍为1
  // 在引用计数算法下不会被回收
}
```

**内存泄漏防范**：

```javascript
// 1. 避免全局变量
// 不好
var globalVar = new Array(1000000);

// 好
function createData() {
  const localVar = new Array(1000000);
  return localVar;
}

// 2. 清理事件监听器
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener("click", this.handleClick);
  }

  destroy() {
    // 重要：清理事件监听器
    document.removeEventListener("click", this.handleClick);
  }

  handleClick() {
    console.log("clicked");
  }
}

// 3. 清理定时器
const timer = setInterval(() => {
  console.log("timer running");
}, 1000);

// 记得清理
clearInterval(timer);
```

## ⚙️ 工程化

### 工程化：Babel 的原理

**问题**：Babel 是如何工作的？

**回答**：

Babel 是一个 JavaScript 编译器，将 ES6+代码转换为向后兼容的 JavaScript 代码。

**工作流程**：

1. **解析（Parse）**：将代码转换为 AST
2. **转换（Transform）**：对 AST 进行修改
3. **生成（Generate）**：将 AST 转换回代码

```javascript
// Babel转换示例
// 输入代码
const arrowFunction = (a, b) => a + b;

// 经过Babel转换后
var arrowFunction = function arrowFunction(a, b) {
  return a + b;
};
```

**AST 转换过程**：

```javascript
// 简化的Babel插件示例
const babel = require("@babel/core");

const code = `const add = (a, b) => a + b;`;

const result = babel.transform(code, {
  plugins: [
    function () {
      return {
        visitor: {
          ArrowFunctionExpression(path) {
            // 将箭头函数转换为普通函数
            path.arrowFunctionToExpression();
          },
        },
      };
    },
  ],
});

console.log(result.code);
// 输出：const add = function(a, b) { return a + b; };
```

**常用配置**：

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions"],
        },
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-runtime",
  ],
};
```

## 📚 框架相关

### 框架：React Fiber 的作用和原理

**问题**：React Fiber 是什么？解决了什么问题？

**回答**：

React Fiber 是 React 16 引入的新的协调算法，解决了大型应用中的性能问题。

**解决的问题**：

1. **长时间阻塞主线程**
2. **无法中断渲染过程**
3. **无法设置任务优先级**

**Fiber 架构特点**：

```javascript
// Fiber节点结构（简化）
const FiberNode = {
  // 节点类型
  tag: "div",

  // 属性
  props: { className: "container" },

  // 状态
  state: null,

  // 关系指针
  child: null, // 第一个子节点
  sibling: null, // 兄弟节点
  return: null, // 父节点

  // 调度相关
  expirationTime: 0,
  effectTag: "UPDATE",
};
```

**时间切片机制**：

```javascript
// 模拟Fiber的工作循环
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (nextUnitOfWork) {
    // 还有工作要做，继续调度
    requestIdleCallback(workLoop);
  }
}

function performUnitOfWork(fiber) {
  // 1. 处理当前fiber
  if (fiber.tag === "div") {
    updateHostComponent(fiber);
  }

  // 2. 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }

  while (fiber) {
    if (fiber.sibling) {
      return fiber.sibling;
    }
    fiber = fiber.return;
  }
}

// 启动工作循环
requestIdleCallback(workLoop);
```

**优先级调度**：

```javascript
// React优先级系统
const Priority = {
  Immediate: 1, // 立即执行（用户输入）
  UserBlocking: 2, // 用户阻塞（hover、滚动）
  Normal: 3, // 正常优先级（网络请求结果）
  Low: 4, // 低优先级（分析统计）
  Idle: 5, // 空闲时执行
};

function scheduleWork(fiber, priority) {
  // 根据优先级调度工作
  if (priority === Priority.Immediate) {
    // 同步执行
    performSyncWork(fiber);
  } else {
    // 异步调度
    scheduleCallback(priority, () => performWork(fiber));
  }
}
```

### 框架：HOC vs Render Props vs Hooks

**问题**：比较 React 中的代码复用方式。

**回答**：

React 中有三种主要的代码复用模式，各有优缺点。

**1. HOC（Higher-Order Components）**

```javascript
// HOC实现
function withLoading(WrappedComponent) {
  return function WithLoadingComponent(props) {
    if (props.isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// 使用HOC
const UserListWithLoading = withLoading(UserList);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  return <UserListWithLoading isLoading={isLoading} users={users} />;
}
```

**HOC 的问题**：

- Props 命名冲突
- 包装地狱
- 静态方法丢失

**2. Render Props**

```javascript
// Render Props实现
class Mouse extends Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY,
    });
  };

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

// 使用Render Props
function App() {
  return (
    <Mouse
      render={({ x, y }) => (
        <h1>
          鼠标位置: ({x}, {y})
        </h1>
      )}
    />
  );
}
```

**3. Hooks（推荐）**

```javascript
// 自定义Hook
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return position;
}

// 使用Hooks
function App() {
  const { x, y } = useMouse();

  return (
    <h1>
      鼠标位置: ({x}, {y})
    </h1>
  );
}
```

**对比总结**：

| 特性     | HOC  | Render Props | Hooks |
| -------- | ---- | ------------ | ----- |
| 复用性   | 好   | 好           | 最好  |
| 可读性   | 一般 | 好           | 最好  |
| 性能     | 一般 | 一般         | 好    |
| 灵活性   | 一般 | 好           | 最好  |
| 学习成本 | 高   | 中           | 中    |

## 🔧 基础知识

### 基础：ES5、ES6 如何实现继承

**问题**：ES5 和 ES6 中如何实现继承？

**回答**：

**ES5 继承实现**：

1. **原型链继承**

```javascript
function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

Parent.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

function Child(name, age) {
  this.age = age;
}

// 设置原型链
Child.prototype = new Parent();
Child.prototype.constructor = Child;

const child = new Child("Tom", 10);
child.sayHello(); // Hello, I'm undefined

// 问题：无法向父构造函数传参，共享引用类型属性
```

2. **构造函数继承**

```javascript
function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

function Child(name, age) {
  Parent.call(this, name); // 调用父构造函数
  this.age = age;
}

const child = new Child("Tom", 10);
console.log(child.name); // Tom

// 问题：无法继承原型方法
```

3. **组合继承（推荐）**

```javascript
function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

Parent.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

function Child(name, age) {
  Parent.call(this, name); // 继承属性
  this.age = age;
}

Child.prototype = new Parent(); // 继承方法
Child.prototype.constructor = Child;

const child = new Child("Tom", 10);
child.sayHello(); // Hello, I'm Tom
```

4. **寄生组合继承（最佳）**

```javascript
function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

Parent.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

// 关键：使用Object.create避免调用两次父构造函数
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

const child = new Child("Tom", 10);
child.sayHello(); // Hello, I'm Tom
```

**ES6 继承实现**：

```javascript
class Parent {
  constructor(name) {
    this.name = name;
    this.hobbies = ["reading", "coding"];
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name); // 调用父类构造函数
    this.age = age;
  }

  sayAge() {
    console.log(`I'm ${this.age} years old`);
  }
}

const child = new Child("Tom", 10);
child.sayHello(); // Hello, I'm Tom
child.sayAge(); // I'm 10 years old
```

**ES6 继承的优势**：

- 语法简洁清晰
- 原生支持
- 更好的错误处理
- 支持继承内置对象

### 基础：New 操作符的原理

**问题**：new 操作符做了什么？如何手写实现？

**回答**：

**new 操作符的工作过程**：

1. 创建一个新的空对象
2. 将这个空对象的原型指向构造函数的 prototype
3. 将构造函数的 this 绑定到这个新对象
4. 执行构造函数
5. 如果构造函数返回对象，则返回该对象；否则返回新创建的对象

**手写实现 new**：

```javascript
function myNew(constructor, ...args) {
  // 1. 创建一个新对象
  const obj = {};

  // 2. 设置原型链
  obj.__proto__ = constructor.prototype;

  // 3. 执行构造函数，绑定this
  const result = constructor.apply(obj, args);

  // 4. 返回结果
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

// 使用原生new
const person1 = new Person("Alice", 25);

// 使用自定义myNew
const person2 = myNew(Person, "Bob", 30);

console.log(person1.name); // Alice
console.log(person2.name); // Bob
person2.sayHello(); // Hello, I'm Bob
```

**更完善的实现**：

```javascript
function myNew(constructor, ...args) {
  // 参数验证
  if (typeof constructor !== "function") {
    throw new TypeError("Constructor must be a function");
  }

  // 1. 创建新对象，设置原型
  const obj = Object.create(constructor.prototype);

  // 2. 执行构造函数
  const result = constructor.apply(obj, args);

  // 3. 返回结果
  return result !== null && typeof result === "object" ? result : obj;
}
```

**特殊情况处理**：

```javascript
// 构造函数返回对象的情况
function SpecialConstructor() {
  this.name = "original";

  // 返回一个新对象
  return {
    name: "returned object",
  };
}

const obj1 = new SpecialConstructor();
const obj2 = myNew(SpecialConstructor);

console.log(obj1.name); // returned object
console.log(obj2.name); // returned object

// 构造函数返回基本类型的情况
function NormalConstructor() {
  this.name = "normal";
  return "string"; // 基本类型会被忽略
}

const obj3 = new NormalConstructor();
const obj4 = myNew(NormalConstructor);

console.log(obj3.name); // normal
console.log(obj4.name); // normal
```

## 🎨 样式相关

### 样式：谈谈 CSS 预处理器

**问题**：CSS 预处理器有什么优势？如何选择？

**回答**：

CSS 预处理器扩展了 CSS 的功能，提供了变量、嵌套、混合等特性。

**主要预处理器对比**：

**1. Sass/SCSS**

```scss
// 变量
$primary-color: #3498db;
$font-size: 16px;

// 嵌套
.navbar {
  background: $primary-color;

  .nav-item {
    padding: 10px;

    &:hover {
      background: darken($primary-color, 10%);
    }
  }
}

// 混合（Mixin）
@mixin button-style($bg-color, $text-color) {
  background: $bg-color;
  color: $text-color;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
}

.primary-button {
  @include button-style($primary-color, white);
}
```

**优势总结**：

1. **变量管理**：统一管理颜色、尺寸等
2. **代码复用**：混合、继承减少重复代码
3. **嵌套语法**：更清晰的层级结构
4. **函数计算**：动态计算值
5. **模块化**：支持文件导入

## 🌐 网络相关

### 网络：HTTP 缓存机制

**问题**：HTTP 缓存是如何工作的？

**回答**：

HTTP 缓存通过存储响应副本来减少网络请求，提高页面加载速度。

**缓存类型**：

**1. 强缓存**

- 不需要向服务器确认，直接使用缓存
- 通过`Cache-Control`和`Expires`控制

```javascript
// 服务端设置强缓存
app.get("/api/data", (req, res) => {
  res.set({
    "Cache-Control": "max-age=3600", // 缓存1小时
    Expires: new Date(Date.now() + 3600000).toUTCString(),
  });
  res.json({ data: "some data" });
});
```

**2. 协商缓存**

- 需要向服务器确认缓存是否有效
- 通过`ETag`和`Last-Modified`实现

## 📝 编程实现

### 编程：实现节流防抖函数

**问题**：实现节流和防抖函数。

**回答**：

**防抖（Debounce）**：延迟执行，如果在延迟时间内再次触发，则重新计时。

```javascript
function debounce(func, delay, immediate = false) {
  let timer = null;

  return function debounced(...args) {
    const context = this;

    // 立即执行模式
    if (immediate && !timer) {
      func.apply(context, args);
    }

    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }

    // 设置新的定时器
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, delay);
  };
}
```

**节流（Throttle）**：限制执行频率，在指定时间间隔内最多执行一次。

```javascript
function throttle(func, delay) {
  let lastTime = 0;
  let timer = null;

  return function throttled(...args) {
    const context = this;
    const now = Date.now();

    // 如果距离上次执行的时间超过delay，立即执行
    if (now - lastTime >= delay) {
      func.apply(context, args);
      lastTime = now;
    } else {
      // 否则设置定时器，在剩余时间后执行
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        func.apply(context, args);
        lastTime = Date.now();
        timer = null;
      }, delay - (now - lastTime));
    }
  };
}
```

## 🧮 算法相关

### 算法：反转链表

**问题**：如何反转一个链表？

**回答**：

**链表节点定义**：

```javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}
```

**迭代方法**：

```javascript
function reverseList(head) {
  let prev = null;
  let current = head;

  while (current !== null) {
    // 保存下一个节点
    const next = current.next;

    // 反转当前节点的指针
    current.next = prev;

    // 移动指针
    prev = current;
    current = next;
  }

  return prev; // prev现在是新的头节点
}
```

## 🔄 综合应用

### 综合：多图站点性能优化

**问题**：如何优化多图片网站的性能？

**回答**：

多图片网站面临加载慢、带宽占用大等问题，需要综合优化策略。

**1. 图片格式优化**

```javascript
// 图片格式选择策略
const imageOptimization = {
  // WebP格式检测
  supportsWebP() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  },

  // 根据场景选择格式
  getOptimalFormat(imageType) {
    const formats = {
      photo: this.supportsWebP() ? "webp" : "jpg",
      icon: this.supportsWebP() ? "webp" : "png",
      animation: "webp", // 替代GIF
    };
    return formats[imageType] || "jpg";
  },
};
```

**2. 懒加载实现**

```javascript
class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  loadImage(img) {
    // 显示加载状态
    img.classList.add("loading");

    const actualImg = new Image();

    actualImg.onload = () => {
      img.src = actualImg.src;
      img.classList.remove("loading");
      img.classList.add("loaded");
    };

    actualImg.onerror = () => {
      img.classList.add("error");
      // 加载默认图片
      img.src = "/images/placeholder.jpg";
    };

    actualImg.src = img.dataset.src;
  }

  observe(img) {
    this.observer.observe(img);
  }
}
```

---

## 📚 总结

这套模拟面试题二涵盖了前端开发的高级知识点：

### 🎯 **知识点覆盖**

1. **浏览器深度**：渲染机制、垃圾回收
2. **工程化进阶**：Babel 原理、构建优化
3. **框架原理**：React Fiber、代码复用模式
4. **基础进阶**：继承实现、new 操作符
5. **样式工程化**：CSS 预处理器
6. **网络优化**：HTTP 缓存机制
7. **算法实现**：节流防抖、链表操作
8. **性能优化**：多图站点优化实战

### 💡 **回答特色**

- **原理深入**：不仅知道怎么用，更理解为什么
- **代码实战**：每个概念都有完整的代码实现
- **性能导向**：关注实际项目中的性能优化
- **工程实践**：结合真实项目场景的解决方案

这些知识点构成了高级前端工程师的核心技能栈，在面试中能够体现候选人的技术深度和实战能力。
