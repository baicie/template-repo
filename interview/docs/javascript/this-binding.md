# JavaScript this 指向详解 - 完全掌握

## 核心概念概述

**this**：JavaScript 中的关键字，指向函数执行时的上下文对象。

**绑定规则**：决定 this 指向的四种规则，按优先级排序。

**运行时绑定**：this 的值在函数调用时确定，而非定义时确定。

## 1. this 绑定的四大规则 🎯

### 规则优先级（从高到低）

1. **new 绑定** - 构造函数调用
2. **显式绑定** - call/apply/bind
3. **隐式绑定** - 对象方法调用
4. **默认绑定** - 独立函数调用

### 默认绑定（优先级最低）

```javascript
// 默认绑定 - 独立函数调用
function globalFunction() {
  console.log("默认绑定 this:", this);
}

// 在非严格模式下
globalFunction(); // this 指向 window（浏览器）或 global（Node.js）

// 在严格模式下
("use strict");
function strictFunction() {
  console.log("严格模式 this:", this); // undefined
}

strictFunction();

// 常见陷阱：对象方法赋值给变量
const obj = {
  name: "Object",
  method: function () {
    console.log("方法中的 this:", this);
  },
};

const methodRef = obj.method;
methodRef(); // this 指向 window/global，不是 obj！

// 回调函数中的默认绑定
function processCallback(callback) {
  callback(); // 默认绑定
}

const person = {
  name: "Alice",
  introduce: function () {
    console.log("我是", this.name); // this 指向 window，不是 person
  },
};

processCallback(person.introduce); // 输出: "我是 undefined"
```

### 隐式绑定

```javascript
// 隐式绑定 - 对象方法调用
const person = {
  name: "Alice",
  age: 25,

  greet: function () {
    console.log(`Hello, I'm ${this.name}`); // this 指向 person
  },

  getInfo: function () {
    return {
      name: this.name,
      age: this.age,
    };
  },
};

person.greet(); // "Hello, I'm Alice"

// 链式调用中的隐式绑定
const user = {
  profile: {
    name: "Bob",
    show: function () {
      console.log("Profile name:", this.name); // this 指向 profile
    },
  },
};

user.profile.show(); // "Profile name: Bob"

// 隐式绑定丢失 - 常见陷阱
const greetFunc = person.greet;
greetFunc(); // this 指向 window，输出: "Hello, I'm undefined"

// setTimeout 中的隐式绑定丢失
setTimeout(person.greet, 1000); // this 指向 window

// 解决方案：箭头函数或bind
setTimeout(() => person.greet(), 1000); // 正确
setTimeout(person.greet.bind(person), 1000); // 正确
```

### 显式绑定

```javascript
// call 方法 - 立即执行
function introduce(city, hobby) {
  console.log(`我是 ${this.name}，来自 ${city}，喜欢 ${hobby}`);
}

const person1 = { name: "Alice" };
const person2 = { name: "Bob" };

introduce.call(person1, "Beijing", "coding");
// "我是 Alice，来自 Beijing，喜欢 coding"

introduce.call(person2, "Shanghai", "reading");
// "我是 Bob，来自 Shanghai，喜欢 reading"

// apply 方法 - 参数以数组形式传递
introduce.apply(person1, ["Beijing", "coding"]);

// bind 方法 - 创建新函数，不立即执行
const boundIntroduce = introduce.bind(person1);
boundIntroduce("Beijing", "coding"); // 稍后执行

// bind 的高级用法：部分应用（柯里化）
const introduceFromBeijing = introduce.bind(person1, "Beijing");
introduceFromBeijing("coding"); // 只需要传入 hobby 参数

// 手写 call 实现
Function.prototype.myCall = function (context, ...args) {
  // 处理 context 为 null 或 undefined 的情况
  context = context || window;

  // 创建唯一的属性名，避免覆盖原有属性
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;

  // 执行函数
  const result = context[fnSymbol](...args);

  // 删除临时属性
  delete context[fnSymbol];

  return result;
};

// 测试手写 call
introduce.myCall(person1, "Beijing", "coding");
```

### new 绑定（优先级最高）

```javascript
// 构造函数中的 this
function Person(name, age) {
  this.name = name;
  this.age = age;

  this.greet = function () {
    console.log(`Hello, I'm ${this.name}`);
  };

  // 如果构造函数显式返回对象，new 操作会返回该对象
  // return { customName: 'Custom' }; // 会覆盖新创建的实例
}

const alice = new Person("Alice", 25);
alice.greet(); // this 指向新创建的实例

// new 操作符的工作原理
function myNew(constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype);

  // 2. 执行构造函数，将 this 绑定到新对象
  const result = constructor.apply(obj, args);

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新创建的对象
  return result instanceof Object ? result : obj;
}

const bob = myNew(Person, "Bob", 30);
bob.greet(); // 正常工作

// ES6 类中的 this
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }

  // 箭头函数方法，this 永远指向实例
  arrowGreet = () => {
    console.log(`Arrow: Hello, I'm ${this.name}`);
  };
}

const user = new User("Charlie");
user.greet(); // this 指向实例

// 方法赋值问题
const greetMethod = user.greet;
greetMethod(); // this 可能丢失

const arrowGreetMethod = user.arrowGreet;
arrowGreetMethod(); // this 仍然指向实例
```

## 2. 箭头函数的 this 特性 ➡️

### 箭头函数不绑定 this

```javascript
// 箭头函数没有自己的 this，继承外层作用域的 this
const obj = {
  name: "Object",

  regularMethod: function () {
    console.log("Regular method this:", this.name); // 'Object'

    // 普通函数作为回调
    setTimeout(function () {
      console.log("Regular callback this:", this.name); // undefined
    }, 100);

    // 箭头函数作为回调
    setTimeout(() => {
      console.log("Arrow callback this:", this.name); // 'Object'
    }, 200);
  },

  arrowMethod: () => {
    console.log("Arrow method this:", this.name); // undefined
  },
};

obj.regularMethod();
obj.arrowMethod();

// 实际应用：事件处理
class Button {
  constructor(element) {
    this.element = element;
    this.clickCount = 0;

    // 使用箭头函数确保 this 指向实例
    this.element.addEventListener("click", () => {
      this.clickCount++;
      console.log(`Button clicked ${this.clickCount} times`);
    });
  }
}

// React 组件中的常见用法
class Component {
  constructor() {
    this.state = { count: 0 };
  }

  // 箭头函数方法，不需要 bind
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };

  // 普通方法需要 bind
  handleClick2() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return `
      <button onclick="${this.handleClick}">Click me</button>
      <button onclick="${this.handleClick2.bind(this)}">Click me 2</button>
    `;
  }
}
```

### 箭头函数的限制

```javascript
// 箭头函数不能作为构造函数
const ArrowConstructor = () => {};
// new ArrowConstructor(); // TypeError

// 箭头函数没有 arguments 对象
const regularFunction = function () {
  console.log("Arguments:", arguments);
};

const arrowFunction = (...args) => {
  console.log("Rest parameters:", args);
};

regularFunction(1, 2, 3); // Arguments: [1, 2, 3]
arrowFunction(1, 2, 3); // Rest parameters: [1, 2, 3]

// 箭头函数无法使用 call/apply/bind 改变 this
const obj1 = { name: "obj1" };
const obj2 = { name: "obj2" };

const regularFunc = function () {
  console.log(this.name);
};

const arrowFunc = () => {
  console.log(this.name);
};

regularFunc.call(obj1); // 'obj1'
arrowFunc.call(obj1); // undefined（取决于定义时的上下文）
```

## 3. 复杂场景下的 this 指向 🎪

### 嵌套函数中的 this

```javascript
const complexObj = {
  name: "Complex",

  outerMethod: function () {
    console.log("Outer method this:", this.name); // 'Complex'

    function innerFunction() {
      console.log("Inner function this:", this.name); // undefined
    }

    const innerArrow = () => {
      console.log("Inner arrow this:", this.name); // 'Complex'
    };

    innerFunction();
    innerArrow();

    // 解决方案1：保存 this 引用
    const self = this;
    function innerWithSelf() {
      console.log("Inner with self:", self.name); // 'Complex'
    }
    innerWithSelf();

    // 解决方案2：使用 bind
    function innerWithBind() {
      console.log("Inner with bind:", this.name); // 'Complex'
    }
    innerWithBind.call(this);
  },
};

complexObj.outerMethod();
```

### 事件处理中的 this

```javascript
// DOM 事件处理
class EventHandler {
  constructor() {
    this.name = "EventHandler";
    this.clickCount = 0;
  }

  // 方法1：箭头函数（推荐）
  handleClickArrow = (event) => {
    this.clickCount++;
    console.log(`${this.name} clicked ${this.clickCount} times`);
    console.log("Event target:", event.target);
  };

  // 方法2：普通函数 + bind
  handleClickBind(event) {
    this.clickCount++;
    console.log(`${this.name} clicked ${this.clickCount} times`);
  }

  // 方法3：普通函数（this 指向 DOM 元素）
  handleClickNormal(event) {
    console.log("DOM element:", this); // 指向触发事件的 DOM 元素
    console.log("Event type:", event.type);
  }

  init(buttonElement) {
    // 不同的绑定方式
    buttonElement.addEventListener("click", this.handleClickArrow);
    buttonElement.addEventListener("click", this.handleClickBind.bind(this));
    buttonElement.addEventListener("click", this.handleClickNormal);
  }
}

// 使用示例
const handler = new EventHandler();
const button = document.querySelector("#myButton");
handler.init(button);
```

### 定时器中的 this

```javascript
class Timer {
  constructor(name) {
    this.name = name;
    this.count = 0;
  }

  startTimer() {
    // 错误方式：this 丢失
    setTimeout(function () {
      console.log("Timer:", this.name); // undefined
    }, 1000);

    // 正确方式1：箭头函数
    setTimeout(() => {
      this.count++;
      console.log(`${this.name} count: ${this.count}`);
    }, 1000);

    // 正确方式2：bind
    setTimeout(
      function () {
        this.count++;
        console.log(`${this.name} count: ${this.count}`);
      }.bind(this),
      2000
    );

    // 正确方式3：保存 this 引用
    const self = this;
    setTimeout(function () {
      self.count++;
      console.log(`${self.name} count: ${self.count}`);
    }, 3000);
  }
}

const timer = new Timer("MyTimer");
timer.startTimer();
```

## 4. 面试常考题目 💡

### 经典 this 指向题目

```javascript
// 题目1：对象方法调用
var name = "global";

const obj = {
  name: "obj",
  getName: function () {
    return this.name;
  },
};

console.log(obj.getName()); // 'obj'
const getName = obj.getName;
console.log(getName()); // 'global'

// 题目2：链式调用
const calculator = {
  value: 0,

  add: function (num) {
    this.value += num;
    return this; // 返回 this 实现链式调用
  },

  multiply: function (num) {
    this.value *= num;
    return this;
  },

  getValue: function () {
    return this.value;
  },
};

const result = calculator.add(5).multiply(2).getValue();
console.log(result); // 10

// 题目3：构造函数返回值
function Person(name) {
  this.name = name;

  // 返回原始值，被忽略
  return "ignored";
}

function PersonWithObject(name) {
  this.name = name;

  // 返回对象，覆盖 this
  return { customName: "custom" };
}

const p1 = new Person("Alice");
console.log(p1.name); // 'Alice'

const p2 = new PersonWithObject("Bob");
console.log(p2.name); // undefined
console.log(p2.customName); // 'custom'

// 题目4：箭头函数与普通函数
const arrowObj = {
  name: "arrow",

  regularMethod: function () {
    console.log("Regular:", this.name);

    const inner = () => {
      console.log("Arrow inner:", this.name);
    };

    function innerRegular() {
      console.log("Regular inner:", this.name);
    }

    inner(); // 'arrow'
    innerRegular(); // undefined
  },

  arrowMethod: () => {
    console.log("Arrow method:", this.name); // undefined
  },
};

arrowObj.regularMethod();
arrowObj.arrowMethod();
```

### call/apply/bind 面试题

```javascript
// 题目1：改变 this 指向
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: "Alice" };

console.log(greet.call(person, "Hello", "!")); // "Hello, Alice!"
console.log(greet.apply(person, ["Hi", "."])); // "Hi, Alice."

const boundGreet = greet.bind(person, "Hey");
console.log(boundGreet("?")); // "Hey, Alice?"

// 题目2：数组方法借用
const arrayLike = {
  0: "a",
  1: "b",
  2: "c",
  length: 3,
};

// 借用数组方法
const result1 = Array.prototype.slice.call(arrayLike);
console.log(result1); // ['a', 'b', 'c']

const result2 = Array.prototype.map.call(arrayLike, (x) => x.toUpperCase());
console.log(result2); // ['A', 'B', 'C']

// 题目3：函数柯里化
function add(a, b, c) {
  return a + b + c;
}

const addTen = add.bind(null, 10);
const addTenAndFive = addTen.bind(null, 5);

console.log(addTenAndFive(3)); // 18 (10 + 5 + 3)
```

## 5. 实际应用场景 🚀

### React 组件中的 this

```javascript
// 类组件中的 this 处理
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      inputValue: "",
    };

    // 方法绑定到实例
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // 箭头函数方法（推荐）
  handleAddTodo = () => {
    if (this.state.inputValue.trim()) {
      this.setState({
        todos: [...this.state.todos, this.state.inputValue],
        inputValue: "",
      });
    }
  };

  // 普通方法需要绑定
  handleInputChange(event) {
    this.setState({ inputValue: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.handleAddTodo();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          value={this.state.inputValue}
          onChange={this.handleInputChange}
        />
        <button type="button" onClick={this.handleAddTodo}>
          Add Todo
        </button>
      </form>
    );
  }
}
```

### Vue 组件中的 this

```javascript
// Vue 组件中的 this 指向
new Vue({
  data() {
    return {
      message: "Hello Vue",
      count: 0,
    };
  },

  methods: {
    increment() {
      // this 指向 Vue 实例
      this.count++;
    },

    asyncIncrement() {
      // 普通函数中需要保存 this
      const self = this;
      setTimeout(function () {
        self.count++; // 使用保存的 this
      }, 1000);

      // 或使用箭头函数
      setTimeout(() => {
        this.count++; // 箭头函数继承外层 this
      }, 1000);
    },
  },

  mounted() {
    // 生命周期钩子中的 this
    console.log("Component mounted:", this.message);
  },
});
```

### Node.js 中的 this

```javascript
// 全局作用域中的 this
console.log(this === global); // false（在模块中）
console.log(this === module.exports); // true

// 函数中的 this
function nodeFunction() {
  console.log(this === global); // true（非严格模式）
}

// 对象方法中的 this
const nodeObj = {
  name: "NodeObject",

  regularMethod: function () {
    console.log("Regular method:", this.name);
  },

  arrowMethod: () => {
    console.log("Arrow method:", this.name); // undefined
  },
};

nodeObj.regularMethod(); // 'NodeObject'
nodeObj.arrowMethod(); // undefined
```

## 面试重点总结 🎯

### 必须掌握的核心概念

1. **四种绑定规则**

   - 默认绑定、隐式绑定、显式绑定、new 绑定
   - 优先级顺序：new > 显式 > 隐式 > 默认

2. **箭头函数特性**

   - 不绑定 this，继承外层作用域
   - 不能作为构造函数
   - 无法使用 call/apply/bind 改变 this

3. **常见陷阱**
   - 隐式绑定丢失
   - 回调函数中的 this
   - 事件处理中的 this

### 常考面试题模板

```javascript
// 1. this 指向判断
// 分析调用方式，确定绑定规则

// 2. call/apply/bind 的区别
// call: 立即执行，参数列表
// apply: 立即执行，参数数组
// bind: 返回新函数，参数可分批传入

// 3. 手写实现
// 实现 call/apply/bind 方法

// 4. 箭头函数 vs 普通函数
// this 绑定的差异和适用场景

// 5. 实际应用场景
// React/Vue 组件中的 this 处理
```

### 记忆要点

- **this 四规则**：new > 显式 > 隐式 > 默认
- **箭头函数**：继承外层 this，无法改变
- **常见陷阱**：赋值丢失、回调丢失、事件处理
- **实际应用**：组件方法绑定、事件处理

掌握 this 指向是 JavaScript 进阶的关键一步！
