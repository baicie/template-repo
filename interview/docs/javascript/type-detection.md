# JavaScript 类型判断方法 - 精准识别

## 核心概念概述

**类型判断**：确定 JavaScript 变量的数据类型的过程，对于编写健壮的代码至关重要。

**准确性问题**：不同的类型检测方法有各自的局限性和适用场景。

**最佳实践**：根据具体需求选择最合适的类型检测方法。

## 1. typeof 操作符 🔍

### typeof 基础用法

```javascript
// typeof 基础类型检测
console.log("=== typeof 基础类型 ===");
console.log(typeof 42); // "number"
console.log(typeof "hello"); // "string"
console.log(typeof true); // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof Symbol("id")); // "symbol"
console.log(typeof 123n); // "bigint"

// typeof 引用类型检测
console.log("=== typeof 引用类型 ===");
console.log(typeof {}); // "object"
console.log(typeof []); // "object" ⚠️
console.log(typeof null); // "object" ⚠️
console.log(typeof new Date()); // "object"
console.log(typeof /regex/); // "object"
console.log(typeof function () {}); // "function"

// typeof 的特殊情况
console.log("=== typeof 特殊情况 ===");
console.log(typeof NaN); // "number" ⚠️
console.log(typeof Infinity); // "number"
console.log(typeof new Number(42)); // "object" ⚠️
console.log(typeof new String("hello")); // "object" ⚠️

// 未声明的变量
console.log(typeof undeclaredVariable); // "undefined" (不会报错)

// typeof 的实用函数
function isNumber(value) {
  return typeof value === "number" && !isNaN(value);
}

function isString(value) {
  return typeof value === "string";
}

function isFunction(value) {
  return typeof value === "function";
}

function isUndefined(value) {
  return typeof value === "undefined";
}

// 测试工具函数
console.log("isNumber(42):", isNumber(42)); // true
console.log("isNumber(NaN):", isNumber(NaN)); // false
console.log('isString("hi"):', isString("hi")); // true
console.log(
  "isFunction(()=>{}):",
  isFunction(() => {})
); // true

// typeof 的局限性示例
function demonstrateTypeof() {
  const values = [
    42,
    "string",
    true,
    null,
    undefined,
    [],
    {},
    new Date(),
    /regex/,
    function () {},
    Symbol("test"),
    123n,
  ];

  values.forEach((value) => {
    console.log(`${JSON.stringify(value)} -> ${typeof value}`);
  });
}

// demonstrateTypeof();
```

### typeof 的应用场景

```javascript
// 1. 参数类型检查
function processData(data, callback) {
  if (typeof data !== "object" || data === null) {
    throw new TypeError("data must be an object");
  }

  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function");
  }

  // 处理逻辑
  return callback(data);
}

// 2. 特性检测
function hasLocalStorage() {
  return typeof Storage !== "undefined" && typeof localStorage !== "undefined";
}

function hasPromise() {
  return typeof Promise !== "undefined";
}

// 3. 环境检测
function getEnvironment() {
  if (typeof window !== "undefined") {
    return "browser";
  } else if (typeof global !== "undefined") {
    return "node";
  } else if (typeof self !== "undefined") {
    return "webworker";
  } else {
    return "unknown";
  }
}

console.log("当前环境:", getEnvironment());

// 4. 安全的属性访问
function safePropertyAccess(obj, property) {
  if (typeof obj !== "object" || obj === null) {
    return undefined;
  }

  return obj[property];
}

// 5. 可选参数处理
function greet(name, greeting) {
  greeting = typeof greeting === "string" ? greeting : "Hello";
  name = typeof name === "string" ? name : "Guest";

  return `${greeting}, ${name}!`;
}

console.log(greet()); // "Hello, Guest!"
console.log(greet("Alice")); // "Hello, Alice!"
console.log(greet("Bob", "Hi")); // "Hi, Bob!"
```

## 2. instanceof 操作符 🏗️

### instanceof 基础用法

```javascript
// instanceof 基础检测
console.log("=== instanceof 基础用法 ===");

// 内置对象检测
console.log([] instanceof Array); // true
console.log({} instanceof Object); // true
console.log(new Date() instanceof Date); // true
console.log(/regex/ instanceof RegExp); // true
console.log(function () {} instanceof Function); // true

// 原型链检测
console.log([] instanceof Object); // true (Array继承自Object)
console.log(new Date() instanceof Object); // true

// 基本类型检测
console.log(42 instanceof Number); // false
console.log("hello" instanceof String); // false
console.log(true instanceof Boolean); // false

// 包装对象检测
console.log(new Number(42) instanceof Number); // true
console.log(new String("hello") instanceof String); // true
console.log(new Boolean(true) instanceof Boolean); // true

// 自定义构造函数
function Person(name) {
  this.name = name;
}

function Student(name, grade) {
  Person.call(this, name);
  this.grade = grade;
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

const alice = new Person("Alice");
const bob = new Student("Bob", "A");

console.log("=== 自定义构造函数 ===");
console.log(alice instanceof Person); // true
console.log(alice instanceof Student); // false
console.log(bob instanceof Student); // true
console.log(bob instanceof Person); // true (继承关系)
console.log(bob instanceof Object); // true
```

### instanceof 的工作原理

```javascript
// 手写 instanceof 实现
function myInstanceof(left, right) {
  // 基本类型直接返回 false
  if (typeof left !== "object" || left === null) {
    return false;
  }

  // 获取右侧构造函数的 prototype
  const prototype = right.prototype;

  // 获取左侧对象的原型链
  let leftProto = Object.getPrototypeOf(left);

  // 沿着原型链查找
  while (leftProto !== null) {
    if (leftProto === prototype) {
      return true;
    }
    leftProto = Object.getPrototypeOf(leftProto);
  }

  return false;
}

// 测试手写 instanceof
console.log("=== 手写 instanceof 测试 ===");
const testArray = [1, 2, 3];
const testDate = new Date();

console.log("testArray instanceof Array:", testArray instanceof Array);
console.log("myInstanceof(testArray, Array):", myInstanceof(testArray, Array));

console.log("testDate instanceof Date:", testDate instanceof Date);
console.log("myInstanceof(testDate, Date):", myInstanceof(testDate, Date));

// instanceof 的陷阱
console.log("=== instanceof 陷阱 ===");

// 1. 跨框架/iframe 问题
// 不同的执行上下文有不同的 Array 构造函数
// window.frames[0].Array !== window.Array

// 2. 原型链被修改
function CustomArray() {}
const customArr = new CustomArray();
CustomArray.prototype = Array.prototype;

console.log(customArr instanceof CustomArray); // false (原型被改变)

// 3. null 原型对象
const nullProtoObj = Object.create(null);
console.log(nullProtoObj instanceof Object); // false
```

### instanceof 的应用场景

```javascript
// 1. 类型检查函数
function isArray(value) {
  return value instanceof Array;
}

function isDate(value) {
  return value instanceof Date;
}

function isRegExp(value) {
  return value instanceof RegExp;
}

function isError(value) {
  return value instanceof Error;
}

// 2. 多态处理
function processValue(value) {
  if (value instanceof Date) {
    return value.toISOString();
  } else if (value instanceof Array) {
    return value.join(", ");
  } else if (value instanceof RegExp) {
    return value.source;
  } else if (value instanceof Error) {
    return value.message;
  } else {
    return String(value);
  }
}

console.log(processValue(new Date())); // ISO 字符串
console.log(processValue([1, 2, 3])); // "1, 2, 3"
console.log(processValue(/test/g)); // "test"
console.log(processValue(new Error("oops"))); // "oops"

// 3. 继承关系检查
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
}

class Cat extends Animal {
  constructor(name, color) {
    super(name);
    this.color = color;
  }
}

const animals = [
  new Dog("Buddy", "Golden Retriever"),
  new Cat("Whiskers", "Orange"),
  new Animal("Generic Animal"),
];

animals.forEach((animal) => {
  console.log(`${animal.name}:`);
  console.log("  is Animal:", animal instanceof Animal);
  console.log("  is Dog:", animal instanceof Dog);
  console.log("  is Cat:", animal instanceof Cat);
});

// 4. 错误处理
function handleError(error) {
  if (error instanceof TypeError) {
    console.log("类型错误:", error.message);
  } else if (error instanceof ReferenceError) {
    console.log("引用错误:", error.message);
  } else if (error instanceof SyntaxError) {
    console.log("语法错误:", error.message);
  } else if (error instanceof Error) {
    console.log("通用错误:", error.message);
  } else {
    console.log("未知错误:", error);
  }
}

// 测试错误处理
try {
  throw new TypeError("This is a type error");
} catch (e) {
  handleError(e);
}
```

## 3. Object.prototype.toString 🎯

### toString 方法详解

```javascript
// Object.prototype.toString 是最可靠的类型检测方法
console.log("=== Object.prototype.toString ===");

const toString = Object.prototype.toString;

// 基本类型
console.log(toString.call(42)); // "[object Number]"
console.log(toString.call("hello")); // "[object String]"
console.log(toString.call(true)); // "[object Boolean]"
console.log(toString.call(undefined)); // "[object Undefined]"
console.log(toString.call(null)); // "[object Null]"
console.log(toString.call(Symbol("id"))); // "[object Symbol]"
console.log(toString.call(123n)); // "[object BigInt]"

// 引用类型
console.log(toString.call({})); // "[object Object]"
console.log(toString.call([])); // "[object Array]"
console.log(toString.call(new Date())); // "[object Date]"
console.log(toString.call(/regex/)); // "[object RegExp]"
console.log(toString.call(function () {})); // "[object Function]"
console.log(toString.call(new Error())); // "[object Error]"

// 特殊对象
console.log(toString.call(Math)); // "[object Math]"
console.log(toString.call(JSON)); // "[object JSON]"
console.log(toString.call(arguments)); // "[object Arguments]" (在函数内)

// 包装对象
console.log(toString.call(new Number(42))); // "[object Number]"
console.log(toString.call(new String("hi"))); // "[object String]"
console.log(toString.call(new Boolean(true))); // "[object Boolean]"

// 内置对象
console.log(toString.call(new Map())); // "[object Map]"
console.log(toString.call(new Set())); // "[object Set]"
console.log(toString.call(new WeakMap())); // "[object WeakMap]"
console.log(toString.call(new WeakSet())); // "[object WeakSet]"
console.log(toString.call(Promise.resolve())); // "[object Promise]"

// 类型提取函数
function getType(value) {
  return toString.call(value).slice(8, -1);
}

console.log("=== getType 函数测试 ===");
console.log(getType(42)); // "Number"
console.log(getType("hello")); // "String"
console.log(getType([])); // "Array"
console.log(getType({})); // "Object"
console.log(getType(null)); // "Null"
console.log(getType(undefined)); // "Undefined"
```

### 完整的类型检测工具

```javascript
// 完整的类型检测工具类
class TypeDetector {
  // 获取精确的类型字符串
  static getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  }

  // 基本类型检测
  static isString(value) {
    return typeof value === "string";
  }

  static isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  }

  static isBoolean(value) {
    return typeof value === "boolean";
  }

  static isUndefined(value) {
    return typeof value === "undefined";
  }

  static isNull(value) {
    return value === null;
  }

  static isSymbol(value) {
    return typeof value === "symbol";
  }

  static isBigInt(value) {
    return typeof value === "bigint";
  }

  // 引用类型检测
  static isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  static isArray(value) {
    return Array.isArray(value);
  }

  static isFunction(value) {
    return typeof value === "function";
  }

  static isDate(value) {
    return this.getType(value) === "Date";
  }

  static isRegExp(value) {
    return this.getType(value) === "RegExp";
  }

  static isError(value) {
    return value instanceof Error;
  }

  // 高级检测
  static isPromise(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      typeof value.then === "function"
    );
  }

  static isMap(value) {
    return this.getType(value) === "Map";
  }

  static isSet(value) {
    return this.getType(value) === "Set";
  }

  static isWeakMap(value) {
    return this.getType(value) === "WeakMap";
  }

  static isWeakSet(value) {
    return this.getType(value) === "WeakSet";
  }

  // 复合检测
  static isPrimitive(value) {
    return (
      value == null ||
      (typeof value !== "object" && typeof value !== "function")
    );
  }

  static isReference(value) {
    return !this.isPrimitive(value);
  }

  static isEmpty(value) {
    if (this.isNull(value) || this.isUndefined(value)) {
      return true;
    }

    if (this.isString(value) || this.isArray(value)) {
      return value.length === 0;
    }

    if (this.isObject(value)) {
      return Object.keys(value).length === 0;
    }

    if (this.isMap(value) || this.isSet(value)) {
      return value.size === 0;
    }

    return false;
  }

  static isEqual(a, b) {
    // 基本类型比较
    if (a === b) return true;

    // NaN 特殊处理
    if (this.isNumber(a) && this.isNumber(b) && isNaN(a) && isNaN(b)) {
      return true;
    }

    // 不同类型
    if (this.getType(a) !== this.getType(b)) return false;

    // 数组比较
    if (this.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.isEqual(item, b[index]));
    }

    // 对象比较
    if (this.isObject(a)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every(
        (key) => keysB.includes(key) && this.isEqual(a[key], b[key])
      );
    }

    // 日期比较
    if (this.isDate(a)) {
      return a.getTime() === b.getTime();
    }

    // 正则比较
    if (this.isRegExp(a)) {
      return a.source === b.source && a.flags === b.flags;
    }

    return false;
  }

  // 类型断言
  static assert(condition, message = "Assertion failed") {
    if (!condition) {
      throw new Error(message);
    }
  }

  static assertType(value, expectedType, paramName = "value") {
    const actualType = this.getType(value);
    if (actualType !== expectedType) {
      throw new TypeError(
        `Expected ${paramName} to be ${expectedType}, but got ${actualType}`
      );
    }
  }
}

// 测试类型检测工具
console.log("=== TypeDetector 测试 ===");

const testValues = [
  42,
  "hello",
  true,
  null,
  undefined,
  [],
  {},
  new Date(),
  /regex/,
  function () {},
  Symbol("test"),
  123n,
  new Map(),
  new Set(),
  Promise.resolve(),
];

testValues.forEach((value) => {
  console.log(`${JSON.stringify(value)} -> ${TypeDetector.getType(value)}`);
});

// 测试 isEmpty
console.log("=== isEmpty 测试 ===");
console.log("isEmpty(null):", TypeDetector.isEmpty(null));
console.log('isEmpty(""):', TypeDetector.isEmpty(""));
console.log("isEmpty([]):", TypeDetector.isEmpty([]));
console.log("isEmpty({}):", TypeDetector.isEmpty({}));
console.log("isEmpty(new Map()):", TypeDetector.isEmpty(new Map()));

// 测试 isEqual
console.log("=== isEqual 测试 ===");
console.log("isEqual([1,2], [1,2]):", TypeDetector.isEqual([1, 2], [1, 2]));
console.log("isEqual({a:1}, {a:1}):", TypeDetector.isEqual({ a: 1 }, { a: 1 }));
console.log("isEqual(NaN, NaN):", TypeDetector.isEqual(NaN, NaN));
```

## 4. 特殊类型检测方法 🔬

### 数组检测

```javascript
// 数组检测的多种方法
console.log("=== 数组检测方法对比 ===");

const testArray = [1, 2, 3];
const fakePArray = { 0: 1, 1: 2, 2: 3, length: 3 }; // 类数组对象

// 1. Array.isArray() - 推荐方法
console.log("Array.isArray(testArray):", Array.isArray(testArray)); // true
console.log("Array.isArray(fakeArray):", Array.isArray(fakePArray)); // false

// 2. instanceof Array
console.log("testArray instanceof Array:", testArray instanceof Array); // true
console.log("fakeArray instanceof Array:", fakePArray instanceof Array); // false

// 3. Object.prototype.toString
console.log(
  "toString.call(testArray):",
  Object.prototype.toString.call(testArray)
); // "[object Array]"
console.log(
  "toString.call(fakeArray):",
  Object.prototype.toString.call(fakePArray)
); // "[object Object]"

// 4. constructor 属性 (不可靠)
console.log(
  "testArray.constructor === Array:",
  testArray.constructor === Array
); // true

// 手写 Array 检测
function isArray(value) {
  // 首选 Array.isArray
  if (Array.isArray) {
    return Array.isArray(value);
  }

  // 降级方案
  return Object.prototype.toString.call(value) === "[object Array]";
}

// 类数组对象检测
function isArrayLike(value) {
  return (
    value != null &&
    typeof value === "object" &&
    typeof value.length === "number" &&
    value.length >= 0 &&
    value.length === Math.floor(value.length) &&
    value.length < 4294967296
  ); // 2^32
}

console.log("=== 类数组检测 ===");
console.log("isArrayLike([1,2,3]):", isArrayLike([1, 2, 3])); // true
console.log("isArrayLike(fakeArray):", isArrayLike(fakePArray)); // true
console.log('isArrayLike("hello"):', isArrayLike("hello")); // true
console.log("isArrayLike({}):", isArrayLike({})); // false
console.log("isArrayLike(arguments):", isArrayLike(arguments)); // true (在函数内)
```

### NaN 检测

```javascript
// NaN 检测的问题和解决方案
console.log("=== NaN 检测 ===");

const testNaN = NaN;
const testNumber = 42;
const testString = "hello";

// 1. isNaN() - 有类型转换问题
console.log("isNaN(NaN):", isNaN(testNaN)); // true
console.log("isNaN(42):", isNaN(testNumber)); // false
console.log('isNaN("hello"):', isNaN(testString)); // true ⚠️ (字符串被转换为NaN)

// 2. Number.isNaN() - ES6，更严格
console.log("Number.isNaN(NaN):", Number.isNaN(testNaN)); // true
console.log("Number.isNaN(42):", Number.isNaN(testNumber)); // false
console.log('Number.isNaN("hello"):', Number.isNaN(testString)); // false

// 3. 利用 NaN 不等于自身的特性
console.log("NaN !== NaN:", testNaN !== testNaN); // true
console.log("42 !== 42:", testNumber !== testNumber); // false

// 手写 NaN 检测
function isNaN_Custom(value) {
  return value !== value;
}

function isRealNaN(value) {
  return typeof value === "number" && value !== value;
}

console.log("isNaN_Custom(NaN):", isNaN_Custom(testNaN)); // true
console.log('isNaN_Custom("hello"):', isNaN_Custom(testString)); // false
console.log("isRealNaN(NaN):", isRealNaN(testNaN)); // true
console.log('isRealNaN("hello"):', isRealNaN(testString)); // false

// 数字有效性检测
function isValidNumber(value) {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

console.log("=== 数字有效性检测 ===");
console.log("isValidNumber(42):", isValidNumber(42)); // true
console.log("isValidNumber(NaN):", isValidNumber(NaN)); // false
console.log("isValidNumber(Infinity):", isValidNumber(Infinity)); // false
console.log('isValidNumber("42"):', isValidNumber("42")); // false
```

### Promise 检测

```javascript
// Promise 检测
console.log("=== Promise 检测 ===");

function isPromise(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}

function isNativePromise(value) {
  return value instanceof Promise;
}

// 测试不同的 Promise 实现
const nativePromise = Promise.resolve(42);
const thenableObject = {
  then: function (onResolve) {
    setTimeout(() => onResolve(42), 0);
  },
};

console.log("isPromise(nativePromise):", isPromise(nativePromise)); // true
console.log("isPromise(thenableObject):", isPromise(thenableObject)); // true
console.log("isNativePromise(nativePromise):", isNativePromise(nativePromise)); // true
console.log(
  "isNativePromise(thenableObject):",
  isNativePromise(thenableObject)
); // false

// async 函数检测
function isAsyncFunction(value) {
  return Object.prototype.toString.call(value) === "[object AsyncFunction]";
}

async function testAsync() {}
function testSync() {}

console.log("isAsyncFunction(testAsync):", isAsyncFunction(testAsync)); // true
console.log("isAsyncFunction(testSync):", isAsyncFunction(testSync)); // false
```

### 自定义类型检测

```javascript
// 自定义类型检测
class CustomClass {
  constructor(value) {
    this.value = value;
  }

  // 自定义 Symbol.toStringTag
  get [Symbol.toStringTag]() {
    return "CustomClass";
  }
}

// 检测自定义类
function isCustomClass(value) {
  return value instanceof CustomClass;
}

function getCustomType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

const customInstance = new CustomClass(42);

console.log("=== 自定义类型检测 ===");
console.log("isCustomClass(customInstance):", isCustomClass(customInstance)); // true
console.log("getCustomType(customInstance):", getCustomType(customInstance)); // "CustomClass"

// 工厂函数模式检测
function createPoint(x, y) {
  return {
    x,
    y,
    type: "Point",
  };
}

function isPoint(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    value.type === "Point" &&
    typeof value.x === "number" &&
    typeof value.y === "number"
  );
}

const point = createPoint(10, 20);
console.log("isPoint(point):", isPoint(point)); // true
console.log("isPoint({x:1, y:2}):", isPoint({ x: 1, y: 2 })); // false
```

## 5. 实际应用场景 🎯

### 通用验证框架

```javascript
// 通用验证框架
class Validator {
  constructor() {
    this.rules = new Map();
  }

  // 注册验证规则
  addRule(name, validator) {
    this.rules.set(name, validator);
    return this;
  }

  // 验证单个值
  validate(value, ruleName, ...args) {
    const rule = this.rules.get(ruleName);
    if (!rule) {
      throw new Error(`Unknown validation rule: ${ruleName}`);
    }

    return rule(value, ...args);
  }

  // 验证对象
  validateObject(obj, schema) {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = obj[field];

      for (const rule of rules) {
        const { name, args = [], message } = rule;

        if (!this.validate(value, name, ...args)) {
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(message || `${field} failed ${name} validation`);
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// 创建验证器实例并添加规则
const validator = new Validator()
  .addRule("required", (value) => {
    return value !== null && value !== undefined && value !== "";
  })
  .addRule("string", (value) => {
    return typeof value === "string";
  })
  .addRule("number", (value) => {
    return typeof value === "number" && !isNaN(value);
  })
  .addRule("email", (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  })
  .addRule("minLength", (value, min) => {
    return typeof value === "string" && value.length >= min;
  })
  .addRule("maxLength", (value, max) => {
    return typeof value === "string" && value.length <= max;
  })
  .addRule("range", (value, min, max) => {
    return typeof value === "number" && value >= min && value <= max;
  })
  .addRule("array", (value) => {
    return Array.isArray(value);
  })
  .addRule("object", (value) => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  });

// 验证示例
const userSchema = {
  name: [
    { name: "required", message: "姓名是必填项" },
    { name: "string", message: "姓名必须是字符串" },
    { name: "minLength", args: [2], message: "姓名至少2个字符" },
  ],
  email: [
    { name: "required", message: "邮箱是必填项" },
    { name: "string", message: "邮箱必须是字符串" },
    { name: "email", message: "邮箱格式不正确" },
  ],
  age: [
    { name: "required", message: "年龄是必填项" },
    { name: "number", message: "年龄必须是数字" },
    { name: "range", args: [0, 120], message: "年龄必须在0-120之间" },
  ],
};

const userData = {
  name: "Alice",
  email: "alice@example.com",
  age: 25,
};

const validationResult = validator.validateObject(userData, userSchema);
console.log("验证结果:", validationResult);
```

### API 参数类型检查

```javascript
// API 参数类型检查装饰器
function typeCheck(types) {
  return function (target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args) {
      // 检查参数数量
      if (args.length < types.length) {
        throw new Error(
          `Expected ${types.length} arguments, got ${args.length}`
        );
      }

      // 检查每个参数的类型
      for (let i = 0; i < types.length; i++) {
        const arg = args[i];
        const expectedType = types[i];

        if (!checkType(arg, expectedType)) {
          throw new TypeError(
            `Argument ${
              i + 1
            } should be ${expectedType}, got ${TypeDetector.getType(arg)}`
          );
        }
      }

      return method.apply(this, args);
    };

    return descriptor;
  };
}

function checkType(value, expectedType) {
  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return (
        value !== null && typeof value === "object" && !Array.isArray(value)
      );
    case "function":
      return typeof value === "function";
    case "date":
      return value instanceof Date;
    default:
      return true;
  }
}

// 使用示例
class Calculator {
  @typeCheck(["number", "number"])
  add(a, b) {
    return a + b;
  }

  @typeCheck(["array", "function"])
  processArray(arr, callback) {
    return arr.map(callback);
  }

  @typeCheck(["object", "string"])
  getProperty(obj, key) {
    return obj[key];
  }
}

const calc = new Calculator();

try {
  console.log(calc.add(1, 2)); // 正常工作
  console.log(calc.add("1", 2)); // 抛出类型错误
} catch (error) {
  console.error(error.message);
}

// 函数式类型检查
function createTypedFunction(fn, types) {
  return function (...args) {
    if (args.length !== types.length) {
      throw new Error(`Expected ${types.length} arguments, got ${args.length}`);
    }

    for (let i = 0; i < types.length; i++) {
      if (!checkType(args[i], types[i])) {
        throw new TypeError(
          `Argument ${i + 1} should be ${types[i]}, got ${TypeDetector.getType(
            args[i]
          )}`
        );
      }
    }

    return fn.apply(this, args);
  };
}

// 创建类型化函数
const typedAdd = createTypedFunction((a, b) => a + b, ["number", "number"]);

const typedConcat = createTypedFunction(
  (str1, str2) => str1 + str2,
  ["string", "string"]
);

console.log(typedAdd(1, 2)); // 3
console.log(typedConcat("Hello", " World")); // "Hello World"
```

### 序列化和反序列化

```javascript
// 智能序列化器
class SmartSerializer {
  static serialize(value) {
    return JSON.stringify(value, this.replacer);
  }

  static deserialize(json) {
    return JSON.parse(json, this.reviver);
  }

  static replacer(key, value) {
    const type = TypeDetector.getType(value);

    switch (type) {
      case "Date":
        return { __type: "Date", value: value.toISOString() };
      case "RegExp":
        return { __type: "RegExp", source: value.source, flags: value.flags };
      case "Map":
        return { __type: "Map", entries: Array.from(value.entries()) };
      case "Set":
        return { __type: "Set", values: Array.from(value.values()) };
      case "Undefined":
        return { __type: "Undefined" };
      case "Function":
        return { __type: "Function", code: value.toString() };
      default:
        if (value === Infinity) return { __type: "Infinity" };
        if (value === -Infinity) return { __type: "-Infinity" };
        if (Number.isNaN(value)) return { __type: "NaN" };
        return value;
    }
  }

  static reviver(key, value) {
    if (value && typeof value === "object" && value.__type) {
      switch (value.__type) {
        case "Date":
          return new Date(value.value);
        case "RegExp":
          return new RegExp(value.source, value.flags);
        case "Map":
          return new Map(value.entries);
        case "Set":
          return new Set(value.values);
        case "Undefined":
          return undefined;
        case "Infinity":
          return Infinity;
        case "-Infinity":
          return -Infinity;
        case "NaN":
          return NaN;
        case "Function":
          // 注意：eval 有安全风险，实际项目中需要更安全的方案
          return eval(`(${value.code})`);
        default:
          return value;
      }
    }
    return value;
  }
}

// 测试序列化
const complexData = {
  date: new Date(),
  regex: /test/gi,
  map: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
  set: new Set([1, 2, 3]),
  infinity: Infinity,
  nan: NaN,
  undef: undefined,
  func: function (x) {
    return x * 2;
  },
};

console.log("原始数据:", complexData);

const serialized = SmartSerializer.serialize(complexData);
console.log("序列化后:", serialized);

const deserialized = SmartSerializer.deserialize(serialized);
console.log("反序列化后:", deserialized);

// 验证反序列化的正确性
console.log("日期检查:", deserialized.date instanceof Date);
console.log("正则检查:", deserialized.regex instanceof RegExp);
console.log("Map检查:", deserialized.map instanceof Map);
console.log("Set检查:", deserialized.set instanceof Set);
console.log("函数检查:", typeof deserialized.func === "function");
console.log("函数调用:", deserialized.func(5)); // 10
```

## 面试重点总结 🎯

### 必须掌握的核心方法

1. **typeof 操作符**

   - 适用于基本类型检测
   - 注意特殊情况：typeof null === "object"
   - typeof NaN === "number"

2. **instanceof 操作符**

   - 检测对象的原型链
   - 跨 iframe 问题
   - 可能被原型修改影响

3. **Object.prototype.toString**

   - 最可靠的类型检测方法
   - 返回 [object Type] 格式
   - 可以检测所有内置类型

4. **专用方法**
   - Array.isArray() 检测数组
   - Number.isNaN() 检测 NaN
   - 自定义检测函数

### 常考面试题类型

```javascript
// 1. 类型检测方法对比
// typeof vs instanceof vs Object.prototype.toString

// 2. 特殊值检测
// 如何准确检测 null、NaN、数组？

// 3. 手写实现
// 手写 instanceof、Array.isArray

// 4. 实际应用
// 如何设计一个通用的类型检测工具？

// 5. 陷阱题
// typeof null 的结果？为什么？
```

### 类型检测速查表

| 值           | typeof      | instanceof  | toString             |
| ------------ | ----------- | ----------- | -------------------- |
| 42           | "number"    | ❌          | "[object Number]"    |
| "hello"      | "string"    | ❌          | "[object String]"    |
| true         | "boolean"   | ❌          | "[object Boolean]"   |
| null         | "object" ⚠️ | ❌          | "[object Null]"      |
| undefined    | "undefined" | ❌          | "[object Undefined]" |
| []           | "object" ⚠️ | Array ✅    | "[object Array]"     |
| {}           | "object"    | Object ✅   | "[object Object]"    |
| function(){} | "function"  | Function ✅ | "[object Function]"  |
| new Date()   | "object"    | Date ✅     | "[object Date]"      |
| /regex/      | "object"    | RegExp ✅   | "[object RegExp]"    |

### 最佳实践建议

1. **基本类型**：使用 `typeof`
2. **数组**：使用 `Array.isArray()`
3. **null**：使用 `=== null`
4. **NaN**：使用 `Number.isNaN()`
5. **复杂类型**：使用 `Object.prototype.toString`
6. **自定义类型**：使用 `instanceof` 或自定义检测函数

掌握类型检测是编写健壮 JavaScript 代码的基础！
