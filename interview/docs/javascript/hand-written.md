# JavaScript 手写核心方法 - 面试必备

## 核心概念概述

**手写实现**：从底层理解 JavaScript 核心方法的工作原理，通过自己实现来掌握其内部机制。

**面试重点**：call/apply/bind、new 操作符、Promise 等是面试中的高频考察点。

**实现思路**：理解原理 → 分析步骤 → 编写代码 → 测试验证

## 1. 手写 call/apply/bind 📞

### call 方法实现

```javascript
// Function.prototype.call 的实现
Function.prototype.myCall = function (context, ...args) {
  // 1. 处理上下文对象
  // null 或 undefined 指向全局对象
  if (context == null) {
    context = typeof window !== "undefined" ? window : global;
  }

  // 原始值包装为对象
  if (typeof context !== "object") {
    context = Object(context);
  }

  // 2. 创建唯一的属性名，避免覆盖原有属性
  const fnSymbol = Symbol("fn");

  // 3. 将函数设置为对象的方法
  context[fnSymbol] = this;

  // 4. 调用方法
  const result = context[fnSymbol](...args);

  // 5. 删除临时属性
  delete context[fnSymbol];

  // 6. 返回结果
  return result;
};

// 测试用例
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: "Alice" };

console.log(greet.call(person, "Hello", "!")); // "Hello, Alice!"
console.log(greet.myCall(person, "Hello", "!")); // "Hello, Alice!"

// 边界情况测试
console.log(greet.myCall(null, "Hi", ".")); // 全局对象
console.log(greet.myCall(123, "Hey", "?")); // Number 对象
```

### apply 方法实现

```javascript
// Function.prototype.apply 的实现
Function.prototype.myApply = function (context, argsArray) {
  // 1. 处理上下文对象
  if (context == null) {
    context = typeof window !== "undefined" ? window : global;
  }

  if (typeof context !== "object") {
    context = Object(context);
  }

  // 2. 处理参数数组
  if (argsArray != null && !Array.isArray(argsArray)) {
    throw new TypeError("CreateListFromArrayLike called on non-object");
  }

  const args = argsArray || [];

  // 3. 创建唯一属性名
  const fnSymbol = Symbol("fn");

  // 4. 设置方法并调用
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);

  // 5. 清理
  delete context[fnSymbol];

  return result;
};

// 测试用例
function sum(a, b, c) {
  console.log(`this.name: ${this.name}`);
  return a + b + c;
}

const obj = { name: "Calculator" };

console.log(sum.apply(obj, [1, 2, 3])); // 6
console.log(sum.myApply(obj, [1, 2, 3])); // 6

// 错误情况测试
try {
  sum.myApply(obj, "not array"); // 抛出错误
} catch (e) {
  console.log(e.message);
}
```

### bind 方法实现

```javascript
// Function.prototype.bind 的实现
Function.prototype.myBind = function (context, ...bindArgs) {
  // 1. 保存原函数
  const fn = this;

  // 2. 检查调用者是否为函数
  if (typeof fn !== "function") {
    throw new TypeError(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }

  // 3. 返回绑定后的函数
  const boundFunction = function (...callArgs) {
    // 检查是否为构造函数调用
    if (new.target) {
      // 作为构造函数调用时，忽略 context，使用 new 创建的实例
      return fn.apply(this, [...bindArgs, ...callArgs]);
    } else {
      // 普通调用时，使用绑定的 context
      return fn.apply(context, [...bindArgs, ...callArgs]);
    }
  };

  // 4. 处理原型链（用于构造函数场景）
  if (fn.prototype) {
    boundFunction.prototype = Object.create(fn.prototype);
  }

  return boundFunction;
};

// 测试用例
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};

const context = { name: "Context" };

// 普通函数绑定
const boundGreet = Person.prototype.greet.myBind(context);
console.log(boundGreet()); // "Hello, I'm Context"

// 构造函数绑定
const BoundPerson = Person.myBind(null, "Alice");
const alice = new BoundPerson(25);
console.log(alice.name); // "Alice"
console.log(alice.age); // 25
console.log(alice.greet()); // "Hello, I'm Alice"

// 柯里化效果
function add(a, b, c, d) {
  return a + b + c + d;
}

const addTwo = add.myBind(null, 1, 2);
console.log(addTwo(3, 4)); // 10
```

## 2. 手写 new 操作符 🆕

### new 操作符的实现

```javascript
// 手写 new 操作符
function myNew(constructor, ...args) {
  // 1. 检查构造函数
  if (typeof constructor !== "function") {
    throw new TypeError("constructor must be a function");
  }

  // 2. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype);

  // 3. 执行构造函数，将 this 绑定到新对象
  const result = constructor.apply(obj, args);

  // 4. 判断构造函数的返回值
  // 如果返回对象，则返回该对象；否则返回新创建的对象
  return (result !== null && typeof result === "object") ||
    typeof result === "function"
    ? result
    : obj;
}

// 测试构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function () {
    return `Hello, I'm ${this.name}`;
  };
}

Person.prototype.sayAge = function () {
  return `I'm ${this.age} years old`;
};

// 测试用例
const person1 = new Person("Alice", 25);
const person2 = myNew(Person, "Bob", 30);

console.log(person1.name); // "Alice"
console.log(person2.name); // "Bob"
console.log(person1.greet()); // "Hello, I'm Alice"
console.log(person2.greet()); // "Hello, I'm Bob"
console.log(person1.sayAge()); // "I'm 25 years old"
console.log(person2.sayAge()); // "I'm 30 years old"

console.log(person1 instanceof Person); // true
console.log(person2 instanceof Person); // true

// 构造函数返回对象的情况
function PersonWithReturn(name) {
  this.name = name;
  return { customName: "custom" };
}

const person3 = new PersonWithReturn("Charlie");
const person4 = myNew(PersonWithReturn, "David");

console.log(person3.customName); // "custom"
console.log(person4.customName); // "custom"
console.log(person3.name); // undefined
console.log(person4.name); // undefined

// 箭头函数不能作为构造函数
const ArrowFunction = () => {};
try {
  myNew(ArrowFunction); // 抛出错误
} catch (e) {
  console.log(e.message);
}
```

### 完整的 new 操作符实现

```javascript
// 更完整的 new 操作符实现，包含更多边界情况
function completeNew(constructor, ...args) {
  // 1. 类型检查
  if (typeof constructor !== "function") {
    throw new TypeError(`${constructor} is not a constructor`);
  }

  // 2. 检查是否为箭头函数或内置函数
  if (!constructor.prototype) {
    throw new TypeError(`${constructor.name} is not a constructor`);
  }

  // 3. 创建新对象
  const obj = Object.create(constructor.prototype);

  // 4. 设置 new.target
  const originalNewTarget = constructor[Symbol.for("newTarget")];
  constructor[Symbol.for("newTarget")] = constructor;

  try {
    // 5. 执行构造函数
    const result = constructor.apply(obj, args);

    // 6. 处理返回值
    if (
      result != null &&
      (typeof result === "object" || typeof result === "function")
    ) {
      return result;
    }

    return obj;
  } finally {
    // 7. 恢复 new.target
    if (originalNewTarget === undefined) {
      delete constructor[Symbol.for("newTarget")];
    } else {
      constructor[Symbol.for("newTarget")] = originalNewTarget;
    }
  }
}

// 测试 new.target
function TestConstructor() {
  console.log("new.target:", new.target);
  console.log("Symbol check:", this.constructor[Symbol.for("newTarget")]);
}

new TestConstructor(); // new.target: TestConstructor
completeNew(TestConstructor); // 模拟的 new.target
```

## 3. 手写 instanceof 操作符 🔍

### instanceof 的实现

```javascript
// 手写 instanceof 操作符
function myInstanceof(obj, constructor) {
  // 1. 基本类型直接返回 false
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  // 2. 检查构造函数
  if (typeof constructor !== "function") {
    throw new TypeError("Right-hand side of instanceof is not callable");
  }

  // 3. 获取构造函数的 prototype
  const prototype = constructor.prototype;

  // 4. 获取对象的原型链
  let objProto = Object.getPrototypeOf(obj);

  // 5. 沿着原型链查找
  while (objProto !== null) {
    if (objProto === prototype) {
      return true;
    }
    objProto = Object.getPrototypeOf(objProto);
  }

  return false;
}

// 测试用例
function Person() {}
function Animal() {}

const person = new Person();
const animal = new Animal();

console.log(person instanceof Person); // true
console.log(myInstanceof(person, Person)); // true

console.log(person instanceof Animal); // false
console.log(myInstanceof(person, Animal)); // false

console.log(person instanceof Object); // true
console.log(myInstanceof(person, Object)); // true

// 基本类型测试
console.log(myInstanceof(123, Number)); // false
console.log(myInstanceof("hello", String)); // false
console.log(myInstanceof(null, Object)); // false

// 数组测试
const arr = [];
console.log(arr instanceof Array); // true
console.log(myInstanceof(arr, Array)); // true
console.log(arr instanceof Object); // true
console.log(myInstanceof(arr, Object)); // true
```

## 4. 手写 Promise 🤝

### 基础 Promise 实现

```javascript
// 手写 Promise 实现
class MyPromise {
  // Promise 状态常量
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    // 初始状态
    this.state = MyPromise.PENDING;
    this.value = undefined;
    this.reason = undefined;

    // 回调函数队列
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    // resolve 函数
    const resolve = (value) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.FULFILLED;
        this.value = value;
        // 执行所有成功回调
        this.onFulfilledCallbacks.forEach((callback) => callback());
      }
    };

    // reject 函数
    const reject = (reason) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.REJECTED;
        this.reason = reason;
        // 执行所有失败回调
        this.onRejectedCallbacks.forEach((callback) => callback());
      }
    };

    // 执行 executor
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  // then 方法
  then(onFulfilled, onRejected) {
    // 参数处理
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    // 返回新的 Promise
    return new MyPromise((resolve, reject) => {
      // 处理 fulfilled 状态
      const handleFulfilled = () => {
        // 异步执行
        setTimeout(() => {
          try {
            const result = onFulfilled(this.value);
            this.resolvePromise(result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      // 处理 rejected 状态
      const handleRejected = () => {
        setTimeout(() => {
          try {
            const result = onRejected(this.reason);
            this.resolvePromise(result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      // 根据当前状态执行不同逻辑
      if (this.state === MyPromise.FULFILLED) {
        handleFulfilled();
      } else if (this.state === MyPromise.REJECTED) {
        handleRejected();
      } else {
        // pending 状态，添加到回调队列
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }

  // Promise 解析过程
  resolvePromise(result, resolve, reject) {
    // 如果返回的是 Promise 实例
    if (result instanceof MyPromise) {
      result.then(resolve, reject);
    } else {
      resolve(result);
    }
  }

  // catch 方法
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // finally 方法
  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value),
      (reason) =>
        MyPromise.resolve(callback()).then(() => {
          throw reason;
        })
    );
  }

  // 静态方法 resolve
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise((resolve) => resolve(value));
  }

  // 静态方法 reject
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  // 静态方法 all
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        throw new TypeError("Promises must be an array");
      }

      const results = [];
      let completedCount = 0;

      if (promises.length === 0) {
        resolve(results);
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (value) => {
            results[index] = value;
            completedCount++;
            if (completedCount === promises.length) {
              resolve(results);
            }
          },
          (reason) => reject(reason)
        );
      });
    });
  }

  // 静态方法 race
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        throw new TypeError("Promises must be an array");
      }

      promises.forEach((promise) => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 测试用例
const promise1 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve("成功"), 1000);
});

promise1
  .then((value) => {
    console.log("第一个 then:", value);
    return "处理后的值";
  })
  .then((value) => {
    console.log("第二个 then:", value);
  })
  .catch((error) => {
    console.log("错误:", error);
  });

// 测试 Promise.all
const promises = [
  MyPromise.resolve(1),
  MyPromise.resolve(2),
  MyPromise.resolve(3),
];

MyPromise.all(promises).then((values) => {
  console.log("All results:", values); // [1, 2, 3]
});

// 测试 Promise.race
const racePromises = [
  new MyPromise((resolve) => setTimeout(() => resolve("慢"), 1000)),
  new MyPromise((resolve) => setTimeout(() => resolve("快"), 100)),
];

MyPromise.race(racePromises).then((value) => {
  console.log("Race result:", value); // '快'
});
```

## 5. 手写深拷贝 📋

### 基础深拷贝实现

```javascript
// 基础深拷贝实现
function simpleDeepClone(obj) {
  // 基本类型直接返回
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 日期对象
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 数组
  if (Array.isArray(obj)) {
    return obj.map((item) => simpleDeepClone(item));
  }

  // 普通对象
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = simpleDeepClone(obj[key]);
    }
  }

  return cloned;
}

// 完整深拷贝实现（处理循环引用、特殊对象等）
function deepClone(obj, map = new WeakMap()) {
  // null 或基本类型
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }

  let cloned;

  // 处理各种对象类型
  if (obj instanceof Date) {
    cloned = new Date(obj);
  } else if (obj instanceof RegExp) {
    cloned = new RegExp(obj);
  } else if (obj instanceof Map) {
    cloned = new Map();
    map.set(obj, cloned);
    obj.forEach((value, key) => {
      cloned.set(deepClone(key, map), deepClone(value, map));
    });
  } else if (obj instanceof Set) {
    cloned = new Set();
    map.set(obj, cloned);
    obj.forEach((value) => {
      cloned.add(deepClone(value, map));
    });
  } else if (Array.isArray(obj)) {
    cloned = [];
    map.set(obj, cloned);
    obj.forEach((item, index) => {
      cloned[index] = deepClone(item, map);
    });
  } else if (obj.constructor === Object || !obj.constructor) {
    // 普通对象
    cloned = {};
    map.set(obj, cloned);
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key], map);
      }
    }
  } else {
    // 其他对象类型，保持引用
    cloned = obj;
  }

  return cloned;
}

// 测试用例
const original = {
  name: "Alice",
  age: 25,
  hobbies: ["reading", "coding"],
  address: {
    city: "Beijing",
    details: {
      street: "123 Main St",
    },
  },
  date: new Date(),
  regex: /test/g,
  map: new Map([["key1", "value1"]]),
  set: new Set([1, 2, 3]),
};

// 添加循环引用
original.self = original;

const cloned = deepClone(original);

console.log("原对象:", original);
console.log("克隆对象:", cloned);
console.log("地址引用相等?", original.address === cloned.address); // false
console.log("循环引用处理:", cloned.self === cloned); // true
```

## 6. 手写其他核心方法 🛠️

### 手写 Object.create

```javascript
// 手写 Object.create
function myObjectCreate(proto, propertiesObject) {
  // 检查原型参数
  if (
    typeof proto !== "object" &&
    typeof proto !== "function" &&
    proto !== null
  ) {
    throw new TypeError("Object prototype may only be an Object or null");
  }

  // 创建构造函数
  function F() {}

  // 设置原型
  F.prototype = proto;

  // 创建对象
  const obj = new F();

  // 处理属性描述符
  if (propertiesObject != null) {
    Object.defineProperties(obj, propertiesObject);
  }

  return obj;
}

// 测试用例
const proto = {
  greet: function () {
    return `Hello, ${this.name}`;
  },
};

const obj = myObjectCreate(proto, {
  name: {
    value: "Alice",
    writable: true,
    enumerable: true,
    configurable: true,
  },
});

console.log(obj.greet()); // "Hello, Alice"
console.log(Object.getPrototypeOf(obj) === proto); // true
```

### 手写 Array.prototype.reduce

```javascript
// 手写 Array.prototype.reduce
Array.prototype.myReduce = function (callback, initialValue) {
  // 检查回调函数
  if (typeof callback !== "function") {
    throw new TypeError("Callback must be a function");
  }

  // 检查数组
  if (this == null) {
    throw new TypeError("Array.prototype.reduce called on null or undefined");
  }

  const array = Object(this);
  const length = parseInt(array.length) || 0;

  let accumulator;
  let startIndex = 0;

  // 处理初始值
  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    // 没有初始值，使用数组第一个元素
    if (length === 0) {
      throw new TypeError("Reduce of empty array with no initial value");
    }

    // 找到第一个有效元素
    while (startIndex < length && !(startIndex in array)) {
      startIndex++;
    }

    if (startIndex >= length) {
      throw new TypeError("Reduce of empty array with no initial value");
    }

    accumulator = array[startIndex];
    startIndex++;
  }

  // 遍历数组
  for (let i = startIndex; i < length; i++) {
    if (i in array) {
      accumulator = callback(accumulator, array[i], i, array);
    }
  }

  return accumulator;
};

// 测试用例
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.myReduce((acc, num) => acc + num, 0);
console.log("Sum:", sum); // 15

const product = numbers.myReduce((acc, num) => acc * num);
console.log("Product:", product); // 120

// 稀疏数组测试
const sparse = [1, , 3, , 5];
const sparseSum = sparse.myReduce((acc, num) => acc + num, 0);
console.log("Sparse sum:", sparseSum); // 9
```

### 手写防抖和节流

```javascript
// 防抖函数实现
function debounce(func, wait, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  };
}

// 节流函数实现
function throttle(func, wait, options = {}) {
  let timeout;
  let previous = 0;

  return function throttledFunction(...args) {
    const now = Date.now();

    if (!previous && options.leading === false) {
      previous = now;
    }

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

// 测试用例
const debouncedFunction = debounce(() => {
  console.log("Debounced function called");
}, 300);

const throttledFunction = throttle(() => {
  console.log("Throttled function called");
}, 300);

// 模拟连续调用
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    debouncedFunction();
    throttledFunction();
  }, i * 50);
}
```

## 面试重点总结 🎯

### 必须掌握的手写实现

1. **call/apply/bind**

   - 理解 this 绑定机制
   - 处理边界情况（null、原始值）
   - bind 的构造函数调用场景

2. **new 操作符**

   - 创建对象、设置原型链
   - 执行构造函数、处理返回值
   - instanceof 检查

3. **Promise 实现**
   - 状态管理、回调队列
   - then 链式调用、错误处理
   - 静态方法实现

### 常考面试题类型

```javascript
// 1. 实现原理解释
// 说出 call 的实现步骤

// 2. 边界情况处理
// bind 在构造函数中如何表现？

// 3. 手写核心逻辑
// 现场实现 Promise.all

// 4. 测试用例编写
// 为手写方法编写测试用例

// 5. 性能优化
// 如何优化深拷贝性能？
```

### 记忆要点

- **实现步骤**：理解 → 分解 → 编码 → 测试
- **边界处理**：null/undefined、类型检查、错误处理
- **原理理解**：知其然更要知其所以然
- **测试验证**：编写完整的测试用例

掌握手写实现是深入理解 JavaScript 的必经之路！
