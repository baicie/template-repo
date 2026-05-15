# JavaScript 作用域与闭包 - 核心原理深度解析

## 核心概念概述

**作用域（Scope）**：变量的可访问范围，决定了变量在哪里可以被访问。

**执行上下文（Execution Context）**：JavaScript 代码执行时的环境，包含变量、函数声明等信息。

**闭包（Closure）**：函数及其词法环境的组合，内部函数可以访问外部函数的变量。

## 1. 执行上下文详解 🎯

### 执行上下文的类型

```javascript
// 1. 全局执行上下文 (Global Execution Context)
var globalVar = "我是全局变量";

function createFunction() {
  // 2. 函数执行上下文 (Function Execution Context)
  var functionVar = "我是函数变量";

  return function () {
    // 3. 嵌套函数执行上下文
    console.log(globalVar, functionVar);
  };
}

// 4. eval执行上下文 (不推荐使用)
eval('var evalVar = "eval变量"');
```

### 执行上下文的创建阶段

```javascript
// 代码示例
console.log(a); // undefined (不是报错！)
console.log(b); // ReferenceError: Cannot access 'b' before initialization
console.log(c); // ReferenceError: Cannot access 'c' before initialization

var a = 1;
let b = 2;
const c = 3;

function foo() {
  console.log("foo被调用");
}

foo(); // "foo被调用"
```

**创建阶段发生什么？**

1. **创建变量对象（VO/AO）**

   - `var` 声明：变量提升，初始值 `undefined`
   - `let/const` 声明：变量提升，但处于"暂时性死区"
   - 函数声明：完整提升（函数名和函数体）

2. **建立作用域链**
3. **确定 this 指向**

### 执行上下文栈

```javascript
// 模拟执行上下文栈的工作过程
function first() {
  console.log("进入 first()");
  second();
  console.log("退出 first()");
}

function second() {
  console.log("进入 second()");
  third();
  console.log("退出 second()");
}

function third() {
  console.log("进入 third()");
  console.log("退出 third()");
}

first();

// 执行栈变化过程：
// [Global Context]
// [Global Context, first()]
// [Global Context, first(), second()]
// [Global Context, first(), second(), third()]
// [Global Context, first(), second()]
// [Global Context, first()]
// [Global Context]
```

## 2. 作用域类型详解 🔍

### 全局作用域

```javascript
// 全局作用域中的变量
var globalVar = "全局变量";
let globalLet = "全局let";
const globalConst = "全局const";

// 隐式全局变量（严格模式下会报错）
function createImplicitGlobal() {
  implicitGlobal = "隐式全局"; // 没有声明关键字
}

createImplicitGlobal();
console.log(implicitGlobal); // "隐式全局"

// 严格模式下避免隐式全局
("use strict");
function strictFunction() {
  // strictVar = "这会报错"; // ReferenceError
}
```

### 函数作用域

```javascript
function functionScope() {
  var functionVar = "函数作用域变量";

  if (true) {
    var innerVar = "if块内的var"; // 仍然是函数作用域
    let blockLet = "if块内的let"; // 块作用域
    const blockConst = "if块内的const"; // 块作用域
  }

  console.log(innerVar); // "if块内的var" - 可以访问
  // console.log(blockLet); // ReferenceError
  // console.log(blockConst); // ReferenceError
}

functionScope();
```

### 块作用域（ES6+）

```javascript
// let 和 const 创建块作用域
{
  let blockVar = "块作用域";
  const blockConst = "块常量";
  var functionVar = "函数作用域";
}

// console.log(blockVar); // ReferenceError
// console.log(blockConst); // ReferenceError
console.log(functionVar); // "函数作用域" - var穿透块作用域

// 经典例子：循环中的块作用域
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 100); // 输出: 3, 3, 3
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 200); // 输出: 0, 1, 2
}
```

## 3. 作用域链原理 🔗

### 作用域链的形成

```javascript
var global = "全局变量";

function outer() {
  var outerVar = "外部函数变量";

  function middle() {
    var middleVar = "中间函数变量";

    function inner() {
      var innerVar = "内部函数变量";

      // 作用域链查找顺序：
      // 1. inner的作用域 -> innerVar
      // 2. middle的作用域 -> middleVar
      // 3. outer的作用域 -> outerVar
      // 4. 全局作用域 -> global

      console.log(innerVar); // "内部函数变量"
      console.log(middleVar); // "中间函数变量"
      console.log(outerVar); // "外部函数变量"
      console.log(global); // "全局变量"
    }

    return inner;
  }

  return middle;
}

const innerFunction = outer()();
innerFunction();
```

### 词法作用域 vs 动态作用域

```javascript
var value = 1;

function foo() {
  console.log(value);
}

function bar() {
  var value = 2;
  foo(); // JavaScript使用词法作用域，输出1而不是2
}

bar(); // 输出: 1

// 词法作用域：函数的作用域在定义时确定
// 动态作用域：函数的作用域在调用时确定（JavaScript不使用）
```

### 作用域链的性能考虑

```javascript
// 深层嵌套影响性能
function level1() {
  var var1 = 1;

  function level2() {
    var var2 = 2;

    function level3() {
      var var3 = 3;

      function level4() {
        // 访问var1需要向上查找3层
        console.log(var1); // 性能相对较低
        console.log(var3); // 性能较高
      }

      return level4;
    }

    return level3;
  }

  return level2;
}

// 优化：将频繁访问的外部变量缓存到本地
function optimized() {
  var expensive = window.expensiveGlobalVar;

  return function () {
    // 使用本地缓存而不是每次查找全局变量
    return expensive;
  };
}
```

## 4. 闭包原理与机制 🔒

### 闭包的基本概念

```javascript
// 经典闭包示例
function createCounter() {
  let count = 0; // 私有变量

  return function () {
    count++; // 访问外部函数的变量
    return count;
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 - 独立的计数器
console.log(counter1()); // 3

// 每个闭包都有自己的词法环境
```

### 闭包的内存模型

```javascript
// 闭包如何保持变量活跃
function outerFunction(x) {
  // 这个变量在函数执行完后通常会被垃圾回收
  // 但由于闭包的存在，它被保留了下来

  return function (y) {
    return x + y; // 引用外部变量x
  };
}

const addFive = outerFunction(5);
console.log(addFive(10)); // 15

// 内存中保留的结构类似：
// addFive.[[Scope]] = {
//   x: 5,
//   outerFunction的其他变量...
// }
```

### 闭包的几种形式

```javascript
// 1. 返回函数的闭包
function returnFunction() {
  var private = "私有变量";
  return function () {
    return private;
  };
}

// 2. 回调函数中的闭包
function attachListeners() {
  var message = "Hello";

  document.getElementById("button").addEventListener("click", function () {
    alert(message); // 闭包访问外部变量
  });
}

// 3. 立即执行函数表达式(IIFE)中的闭包
const module = (function () {
  var privateVar = "私有";

  return {
    getPrivate: function () {
      return privateVar;
    },
    setPrivate: function (value) {
      privateVar = value;
    },
  };
})();

// 4. 循环中的闭包（经典面试题）
// 问题版本
for (var i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i); // 输出: 4, 4, 4
  }, 1000);
}

// 解决方案1：使用闭包
for (var i = 1; i <= 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j); // 输出: 1, 2, 3
    }, 1000);
  })(i);
}

// 解决方案2：使用let（块作用域）
for (let i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i); // 输出: 1, 2, 3
  }, 1000);
}

// 解决方案3：使用bind
for (var i = 1; i <= 3; i++) {
  setTimeout(
    function (j) {
      console.log(j); // 输出: 1, 2, 3
    }.bind(null, i),
    1000
  );
}
```

## 5. 闭包的实际应用 🚀

### 模块模式

```javascript
// 经典模块模式
const Calculator = (function () {
  // 私有变量和方法
  let result = 0;

  function add(a, b) {
    return a + b;
  }

  function subtract(a, b) {
    return a - b;
  }

  // 公开接口
  return {
    plus: function (num) {
      result = add(result, num);
      return this;
    },

    minus: function (num) {
      result = subtract(result, num);
      return this;
    },

    equals: function () {
      return result;
    },

    reset: function () {
      result = 0;
      return this;
    },
  };
})();

// 使用链式调用
const finalResult = Calculator.plus(10).minus(3).plus(5).equals(); // 12

console.log(finalResult); // 12
```

### 数据私有化

```javascript
// 创建私有变量的工厂函数
function createPerson(name, age) {
  // 私有变量
  let _name = name;
  let _age = age;
  let _id = Math.random().toString(36).substr(2, 9);

  // 返回公开接口
  return {
    getName: function () {
      return _name;
    },

    setName: function (newName) {
      if (typeof newName === "string" && newName.length > 0) {
        _name = newName;
      }
    },

    getAge: function () {
      return _age;
    },

    setAge: function (newAge) {
      if (typeof newAge === "number" && newAge > 0 && newAge < 150) {
        _age = newAge;
      }
    },

    getId: function () {
      return _id; // 只读属性
    },

    toString: function () {
      return `Person(name: ${_name}, age: ${_age}, id: ${_id})`;
    },
  };
}

const person = createPerson("Alice", 25);
console.log(person.getName()); // "Alice"
console.log(person.getId()); // 随机ID
// person._name = "Hacker"; // 无法直接访问私有变量
```

### 函数缓存/记忆化

```javascript
// 记忆化函数（缓存计算结果）
function memoize(fn) {
  const cache = {};

  return function (...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      console.log("从缓存获取:", key);
      return cache[key];
    }

    console.log("计算并缓存:", key);
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

// 斐波那契数列的记忆化版本
const fibonacci = memoize(function (n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(10)); // 计算并缓存
console.log(fibonacci(10)); // 从缓存获取

// 防抖函数
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 使用示例
const debouncedSearch = debounce(function (query) {
  console.log("搜索:", query);
}, 300);

const throttledScroll = throttle(function () {
  console.log("滚动事件");
}, 100);
```

### 柯里化（Currying）

```javascript
// 手动实现柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function (...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

// 使用示例
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6

// 实际应用：创建特定配置的函数
const multiply = curry(function (a, b, c) {
  return a * b * c;
});

const double = multiply(2);
const doubleAndTriple = double(3);

console.log(doubleAndTriple(4)); // 2 * 3 * 4 = 24
```

## 6. 常见面试题和陷阱 💡

### 经典循环闭包问题

```javascript
// 问题：为什么都输出5？
for (var i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i); // 5, 5, 5, 5, 5
  }, 100);
}

// 原因分析：
// 1. var声明的i是函数作用域，所有setTimeout共享同一个i
// 2. 当setTimeout执行时，循环已经结束，i的值为5
// 3. 所有回调函数都引用同一个i变量

// 解决方案对比
console.log("=== 解决方案对比 ===");

// 方案1：IIFE闭包
for (var i = 0; i < 5; i++) {
  (function (j) {
    setTimeout(function () {
      console.log("IIFE:", j);
    }, 100);
  })(i);
}

// 方案2：let块作用域
for (let i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log("let:", i);
  }, 100);
}

// 方案3：bind方法
for (var i = 0; i < 5; i++) {
  setTimeout(
    function (j) {
      console.log("bind:", j);
    }.bind(null, i),
    100
  );
}

// 方案4：额外的参数
for (var i = 0; i < 5; i++) {
  setTimeout(
    (function (j) {
      return function () {
        console.log("param:", j);
      };
    })(i),
    100
  );
}
```

### 闭包与 this 绑定

```javascript
const obj = {
  name: "Object",

  regularFunction: function () {
    console.log("Regular function this:", this.name);

    // 内部函数的this指向问题
    function innerFunction() {
      console.log("Inner function this:", this.name); // undefined
    }
    innerFunction();

    // 解决方案1：保存this引用
    const self = this;
    function innerWithSelf() {
      console.log("Inner with self:", self.name); // "Object"
    }
    innerWithSelf();

    // 解决方案2：使用箭头函数
    const arrowFunction = () => {
      console.log("Arrow function this:", this.name); // "Object"
    };
    arrowFunction();
  },

  arrowFunction: () => {
    // 箭头函数没有自己的this，继承外层作用域的this
    console.log("Object arrow function this:", this.name); // undefined
  },
};

obj.regularFunction();
obj.arrowFunction();
```

### 内存泄漏与闭包

```javascript
// 可能导致内存泄漏的闭包
function createPotentialLeak() {
  const largeData = new Array(1000000).fill("data"); // 大量数据

  return function () {
    // 即使不使用largeData，它也会被保留在闭包中
    console.log("Function called");
  };
}

// 解决方案：显式清理不需要的变量
function createOptimized() {
  const largeData = new Array(1000000).fill("data");
  const importantData = largeData.slice(0, 10); // 只保留需要的数据

  return function () {
    console.log("Important data length:", importantData.length);
    // largeData不再被引用，可以被垃圾回收
  };
}

// DOM事件处理器中的内存泄漏
function attachBadListener() {
  const element = document.getElementById("myButton");
  const largeObject = { data: new Array(1000000).fill("data") };

  element.addEventListener("click", function () {
    // largeObject被闭包保持，可能导致内存泄漏
    console.log("Button clicked");
  });
}

// 优化版本
function attachGoodListener() {
  const element = document.getElementById("myButton");

  function handleClick() {
    console.log("Button clicked");
  }

  element.addEventListener("click", handleClick);

  // 清理函数
  return function cleanup() {
    element.removeEventListener("click", handleClick);
  };
}
```

### 高阶函数与闭包组合

```javascript
// 函数组合
function compose(...functions) {
  return function (value) {
    return functions.reduceRight((acc, fn) => fn(acc), value);
  };
}

// 管道函数
function pipe(...functions) {
  return function (value) {
    return functions.reduce((acc, fn) => fn(acc), value);
  };
}

// 使用示例
const add1 = (x) => x + 1;
const multiply2 = (x) => x * 2;
const square = (x) => x * x;

const composedFunction = compose(square, multiply2, add1);
const pipedFunction = pipe(add1, multiply2, square);

console.log(composedFunction(3)); // square(multiply2(add1(3))) = square(8) = 64
console.log(pipedFunction(3)); // square(multiply2(add1(3))) = square(8) = 64

// 偏函数应用
function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, "Hello");
const sayHelloToJohn = partial(greet, "Hello", "John");

console.log(sayHello("Alice", "!")); // "Hello, Alice!"
console.log(sayHelloToJohn(".")); // "Hello, John."
```

## 7. 性能优化与最佳实践 ⚡

### 避免过度使用闭包

```javascript
// 不好的做法：不必要的闭包
function badExample() {
  return function (x) {
    return x * 2; // 不需要访问外部变量
  };
}

// 好的做法：简单函数
function goodExample(x) {
  return x * 2;
}

// 或者如果确实需要闭包功能
function createMultiplier(factor) {
  return function (x) {
    return x * factor; // 访问外部变量factor
  };
}
```

### 闭包的最佳实践

```javascript
// 1. 及时清理不需要的变量
function createHandler() {
  let tempData = fetchLargeData(); // 假设获取大量数据
  let processedData = process(tempData);

  tempData = null; // 显式清理，帮助垃圾回收

  return function () {
    return processedData;
  };
}

// 2. 避免循环中创建闭包
// 不好的做法
function badLoop() {
  const handlers = [];
  for (let i = 0; i < 1000; i++) {
    handlers.push(function () {
      console.log(i); // 创建1000个闭包
    });
  }
  return handlers;
}

// 好的做法
function goodLoop() {
  function createHandler(index) {
    return function () {
      console.log(index);
    };
  }

  const handlers = [];
  for (let i = 0; i < 1000; i++) {
    handlers.push(createHandler(i)); // 复用createHandler函数
  }
  return handlers;
}

// 3. 使用WeakMap避免内存泄漏
const privateData = new WeakMap();

function createSecureObject(name) {
  const obj = {};

  privateData.set(obj, { name, secret: Math.random() });

  obj.getName = function () {
    return privateData.get(this).name;
  };

  obj.getSecret = function () {
    return privateData.get(this).secret;
  };

  return obj;
}

// 当obj被垃圾回收时，WeakMap中的数据也会被自动清理
```

## 面试重点总结 🎯

### 必须掌握的概念

1. **执行上下文**

   - 全局执行上下文
   - 函数执行上下文
   - 执行上下文栈

2. **作用域链**

   - 词法作用域
   - 作用域链查找规则
   - 性能影响

3. **闭包原理**

   - 闭包的定义
   - 闭包的形成条件
   - 闭包的内存模型

4. **实际应用**
   - 模块模式
   - 数据私有化
   - 函数式编程

### 常考面试题

```javascript
// 1. 输出结果预测
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 答案：3, 3, 3

// 2. 实现私有变量
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

// 3. 实现函数缓存
function memoize(fn) {
  const cache = {};
  return function (...args) {
    const key = JSON.stringify(args);
    return key in cache ? cache[key] : (cache[key] = fn(...args));
  };
}

// 4. 实现防抖
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
```

### 记忆要点

- **作用域**：变量的访问范围
- **执行上下文**：代码执行的环境
- **闭包**：函数 + 词法环境
- **应用场景**：模块化、私有化、函数式编程

掌握这些概念和实践，你就能在面试中自信地回答作用域与闭包相关的所有问题！
