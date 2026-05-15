# JavaScript ES6+ 新特性 - 全面指南

## 核心概念概述

**ES6+**：ECMAScript 2015 及之后版本引入的新特性，极大地改善了 JavaScript 的开发体验。

**重要版本**：ES6/ES2015、ES2016、ES2017、ES2018、ES2019、ES2020、ES2021、ES2022、ES2023

## 1. 箭头函数 ➡️

### 基础语法

```javascript
// 传统函数
function traditionalFunction(a, b) {
  return a + b;
}

// 箭头函数
const arrowFunction = (a, b) => a + b;

// 各种箭头函数写法
const singleParam = (x) => x * 2;
const noParams = () => "Hello World";
const multiLine = (x, y) => {
  const sum = x + y;
  return sum * 2;
};

// 返回对象字面量
const createObject = (name, age) => ({ name, age });

// 高阶函数
const multiply = (x) => (y) => x * y;
const double = multiply(2);
console.log(double(5)); // 10
```

### 箭头函数的特性

```javascript
// 1. 没有自己的 this 绑定
const obj = {
  name: "Object",

  traditionalMethod: function () {
    console.log("传统函数 this:", this.name); // 'Object'

    function innerFunction() {
      console.log("内部函数 this:", this.name); // undefined
    }
    innerFunction();

    const arrowFunction = () => {
      console.log("箭头函数 this:", this.name); // 'Object'
    };
    arrowFunction();
  },

  arrowMethod: () => {
    console.log("箭头方法 this:", this.name); // undefined
  },
};

obj.traditionalMethod();
obj.arrowMethod();

// 2. 不能用作构造函数
const ArrowConstructor = () => {};
// new ArrowConstructor(); // TypeError: ArrowConstructor is not a constructor

// 3. 没有 arguments 对象
function traditionalFunc() {
  console.log("传统函数 arguments:", arguments);
}

const arrowFunc = (...args) => {
  console.log("箭头函数 args:", args);
};

traditionalFunc(1, 2, 3);
arrowFunc(1, 2, 3);

// 4. 不能用 call、apply、bind 改变 this
const boundArrow = arrowFunc.bind({ name: "Bound" });
// this 仍然是定义时的上下文
```

### 箭头函数的最佳实践

```javascript
// 适合使用箭头函数的场景
const numbers = [1, 2, 3, 4, 5];

// 数组方法回调
const doubled = numbers.map((n) => n * 2);
const evens = numbers.filter((n) => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// 事件处理（当不需要动态 this 时）
class EventHandler {
  constructor() {
    this.count = 0;
  }

  setupListener() {
    button.addEventListener("click", () => {
      this.count++; // 正确访问实例的 this
      console.log("点击次数:", this.count);
    });
  }
}

// 不适合使用箭头函数的场景
const calculator = {
  value: 0,

  // 不要用箭头函数作为对象方法
  add: function (num) {
    this.value += num; // 需要访问对象的 this
    return this;
  },

  // 也不要用箭头函数
  multiply: function (num) {
    this.value *= num;
    return this;
  },
};
```

## 2. 解构赋值 📦

### 数组解构

```javascript
// 基础数组解构
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1, 2, 3

// 跳过元素
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1, 3

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

// 默认值
const [x = 10, y = 20] = [1];
console.log(x, y); // 1, 20

// 交换变量
let m = 1,
  n = 2;
[m, n] = [n, m];
console.log(m, n); // 2, 1

// 函数返回多个值
function getCoordinates() {
  return [10, 20];
}

const [x1, y1] = getCoordinates();

// 嵌套解构
const [p, [q, r]] = [1, [2, 3]];
console.log(p, q, r); // 1, 2, 3
```

### 对象解构

```javascript
// 基础对象解构
const person = { name: "Alice", age: 25, city: "Beijing" };
const { name, age, city } = person;
console.log(name, age, city); // 'Alice', 25, 'Beijing'

// 重命名变量
const { name: personName, age: personAge } = person;
console.log(personName, personAge); // 'Alice', 25

// 默认值
const { name: n, age: a, country = "China" } = person;
console.log(n, a, country); // 'Alice', 25, 'China'

// 嵌套解构
const user = {
  id: 1,
  profile: {
    name: "Bob",
    contact: {
      email: "bob@example.com",
      phone: "123456789",
    },
  },
};

const {
  profile: {
    name: userName,
    contact: { email },
  },
} = user;

console.log(userName, email); // 'Bob', 'bob@example.com'

// 剩余属性
const { name: nm, ...rest } = person;
console.log(nm); // 'Alice'
console.log(rest); // { age: 25, city: 'Beijing' }
```

### 函数参数解构

```javascript
// 对象参数解构
function createUser({ name, age, email = "unknown" }) {
  return {
    id: Math.random(),
    name,
    age,
    email,
    createdAt: new Date(),
  };
}

const newUser = createUser({
  name: "Charlie",
  age: 30,
});

// 数组参数解构
function processCoordinates([x, y, z = 0]) {
  return { x, y, z };
}

const point = processCoordinates([10, 20]);

// 复杂参数解构
function apiRequest({
  url,
  method = "GET",
  headers = {},
  data = null,
  timeout = 5000,
} = {}) {
  console.log("请求配置:", { url, method, headers, data, timeout });
}

apiRequest({
  url: "https://api.example.com",
  method: "POST",
  data: { name: "test" },
});

// 解构在循环中的使用
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 35 },
];

users.forEach(({ name, age }) => {
  console.log(`${name} is ${age} years old`);
});

// 解构与数组方法结合
const userNames = users.map(({ name }) => name);
console.log(userNames); // ['Alice', 'Bob', 'Charlie']
```

## 3. 模块化 📁

### ES6 模块语法

```javascript
// math.js - 导出模块
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export class Calculator {
  constructor() {
    this.result = 0;
  }

  add(num) {
    this.result += num;
    return this;
  }

  multiply(num) {
    this.result *= num;
    return this;
  }

  getResult() {
    return this.result;
  }
}

// 默认导出
export default function subtract(a, b) {
  return a - b;
}

// 或者统一导出
// export { PI, add, multiply, Calculator, subtract as default };
```

```javascript
// main.js - 导入模块
// 命名导入
import { add, multiply, PI } from "./math.js";

// 默认导入
import subtract from "./math.js";

// 重命名导入
import { Calculator as Calc } from "./math.js";

// 导入所有
import * as MathUtils from "./math.js";

// 混合导入
import subtract, { add, multiply } from "./math.js";

// 使用导入的功能
console.log(add(5, 3)); // 8
console.log(subtract(5, 3)); // 2
console.log(PI); // 3.14159

const calc = new Calc();
const result = calc.add(10).multiply(2).getResult();
console.log(result); // 20

// 动态导入
async function loadModule() {
  const mathModule = await import("./math.js");
  console.log(mathModule.add(1, 2));
}

// 条件导入
if (someCondition) {
  import("./conditionalModule.js").then((module) => {
    module.doSomething();
  });
}
```

### 模块的最佳实践

```javascript
// utils/string.js - 字符串工具模块
export const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const camelCase = (str) =>
  str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

export const kebabCase = (str) =>
  str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");

// utils/array.js - 数组工具模块
export const unique = (arr) => [...new Set(arr)];

export const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const groupBy = (arr, key) =>
  arr.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});

// utils/index.js - 统一入口
export * as StringUtils from "./string.js";
export * as ArrayUtils from "./array.js";

// 或者重新导出
export { capitalize, camelCase, kebabCase } from "./string.js";
export { unique, chunk, groupBy } from "./array.js";

// app.js - 使用工具模块
import { StringUtils, ArrayUtils } from "./utils/index.js";
// 或者
import { capitalize, unique } from "./utils/index.js";

console.log(StringUtils.capitalize("hello world"));
console.log(ArrayUtils.unique([1, 1, 2, 3, 3]));
```

## 4. 新数据类型 🆕

### Symbol

```javascript
// Symbol 的基本使用
const sym1 = Symbol();
const sym2 = Symbol("description");
const sym3 = Symbol("description");

console.log(sym2 === sym3); // false - 每个 Symbol 都是唯一的
console.log(sym2.toString()); // 'Symbol(description)'

// Symbol 作为对象属性
const obj = {};
const symKey = Symbol("myKey");

obj[symKey] = "Symbol 属性值";
obj.normalKey = "普通属性值";

console.log(obj[symKey]); // 'Symbol 属性值'
console.log(Object.keys(obj)); // ['normalKey'] - 不包含 Symbol 属性

// Symbol.for() 和 Symbol.keyFor()
const globalSym1 = Symbol.for("global");
const globalSym2 = Symbol.for("global");

console.log(globalSym1 === globalSym2); // true - 全局 Symbol 注册表

console.log(Symbol.keyFor(globalSym1)); // 'global'
console.log(Symbol.keyFor(sym1)); // undefined

// 内置 Symbol
class MyClass {
  constructor(value) {
    this.value = value;
  }

  // 自定义迭代器
  *[Symbol.iterator]() {
    yield this.value;
    yield this.value * 2;
    yield this.value * 3;
  }

  // 自定义字符串转换
  [Symbol.toPrimitive](hint) {
    if (hint === "number") {
      return this.value;
    }
    if (hint === "string") {
      return `MyClass(${this.value})`;
    }
    return this.value;
  }

  // 自定义类型标签
  get [Symbol.toStringTag]() {
    return "MyClass";
  }
}

const instance = new MyClass(5);

// 使用迭代器
for (const value of instance) {
  console.log(value); // 5, 10, 15
}

// 使用 toPrimitive
console.log(+instance); // 5
console.log(`${instance}`); // 'MyClass(5)'

// 使用 toStringTag
console.log(Object.prototype.toString.call(instance)); // '[object MyClass]'
```

### Map

```javascript
// Map 的基本使用
const map = new Map();

// 设置键值对
map.set("string", "String key");
map.set(42, "Number key");
map.set(true, "Boolean key");

const objKey = { id: 1 };
map.set(objKey, "Object key");

// 获取值
console.log(map.get("string")); // 'String key'
console.log(map.get(objKey)); // 'Object key'

// Map 的方法和属性
console.log(map.size); // 4
console.log(map.has("string")); // true

map.delete(42);
console.log(map.size); // 3

// 迭代 Map
for (const [key, value] of map) {
  console.log(`${key} => ${value}`);
}

// Map 的实际应用
class Cache {
  constructor(maxSize = 10) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // LRU: 移到最后
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

const cache = new Cache(3);
cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3);
cache.set("d", 4); // 'a' 被移除

// WeakMap - 弱引用的 Map
const weakMap = new WeakMap();
let obj1 = { name: "obj1" };
let obj2 = { name: "obj2" };

weakMap.set(obj1, "value1");
weakMap.set(obj2, "value2");

console.log(weakMap.get(obj1)); // 'value1'

// 当对象被垃圾回收时，WeakMap 中的条目也会被自动清理
obj1 = null; // obj1 可以被垃圾回收

// WeakMap 的应用：私有数据存储
const privateData = new WeakMap();

class Person {
  constructor(name, age) {
    privateData.set(this, { name, age });
  }

  getName() {
    return privateData.get(this).name;
  }

  getAge() {
    return privateData.get(this).age;
  }

  setAge(age) {
    const data = privateData.get(this);
    data.age = age;
  }
}

const person = new Person("Alice", 25);
console.log(person.getName()); // 'Alice'
// 无法直接访问 name 和 age
```

### Set

```javascript
// Set 的基本使用
const set = new Set();

// 添加值
set.add(1);
set.add(2);
set.add(2); // 重复值会被忽略
set.add("2"); // 不同类型被视为不同值

console.log(set.size); // 3
console.log(set.has(2)); // true

// 删除值
set.delete(1);
console.log(set.size); // 2

// 迭代 Set
for (const value of set) {
  console.log(value); // 2, '2'
}

// Set 的实际应用
// 1. 数组去重
const numbers = [1, 2, 2, 3, 3, 4, 5];
const uniqueNumbers = [...new Set(numbers)];
console.log(uniqueNumbers); // [1, 2, 3, 4, 5]

// 2. 交集、并集、差集
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// 并集
const union = new Set([...setA, ...setB]);
console.log(union); // Set {1, 2, 3, 4, 5, 6}

// 交集
const intersection = new Set([...setA].filter((x) => setB.has(x)));
console.log(intersection); // Set {3, 4}

// 差集
const difference = new Set([...setA].filter((x) => !setB.has(x)));
console.log(difference); // Set {1, 2}

// WeakSet
const weakSet = new WeakSet();
let objA = { id: 1 };
let objB = { id: 2 };

weakSet.add(objA);
weakSet.add(objB);

console.log(weakSet.has(objA)); // true

// WeakSet 的应用：跟踪对象
const processedObjects = new WeakSet();

function processObject(obj) {
  if (processedObjects.has(obj)) {
    console.log("对象已处理过");
    return;
  }

  // 处理对象
  console.log("处理对象:", obj);
  processedObjects.add(obj);
}

const obj = { data: "test" };
processObject(obj); // 处理对象
processObject(obj); // 对象已处理过
```

## 5. ES6+ 其他重要特性 ✨

### 模板字符串

```javascript
// 基础模板字符串
const name = "Alice";
const age = 25;

const message = `Hello, my name is ${name} and I'm ${age} years old.`;
console.log(message);

// 多行字符串
const multiline = `
  This is a
  multiline
  string
`;

// 表达式计算
const a = 5;
const b = 3;
const result = `${a} + ${b} = ${a + b}`;

// 嵌套模板
const user = { name: "Bob", hobbies: ["reading", "coding"] };
const profile = `
  User: ${user.name}
  Hobbies: ${user.hobbies.map((hobby) => `- ${hobby}`).join("\n  ")}
`;

// 标签模板字符串
function highlight(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] ? `<mark>${values[i]}</mark>` : "";
    return result + string + value;
  }, "");
}

const searchTerm = "JavaScript";
const text = highlight`Learn ${searchTerm} programming with ${name}`;
console.log(text); // 'Learn <mark>JavaScript</mark> programming with <mark>Alice</mark>'

// 国际化标签函数
function i18n(strings, ...values) {
  const translations = {
    Hello: "你好",
    world: "世界",
  };

  return strings.reduce((result, string, i) => {
    const value = values[i];
    const translated = translations[value] || value;
    return result + string + (translated || "");
  }, "");
}

const greeting = i18n`${"Hello"} ${"world"}!`;
console.log(greeting); // '你好 世界!'
```

### 展开运算符和剩余参数

```javascript
// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(combined); // [1, 2, 3, 4, 5, 6]

// 对象展开
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };
console.log(merged); // { a: 1, b: 2, c: 3, d: 4 }

// 对象属性覆盖
const original = { name: "Alice", age: 25 };
const updated = { ...original, age: 26, city: "Beijing" };
console.log(updated); // { name: 'Alice', age: 26, city: 'Beijing' }

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4, 5)); // 15

// 解构中的剩余元素
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(rest); // [3, 4, 5]

const { name, ...otherProps } = { name: "Bob", age: 30, city: "Shanghai" };
console.log(otherProps); // { age: 30, city: 'Shanghai' }

// 函数参数展开
function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const args = ["Hello", "World", "!"];
console.log(greet(...args)); // 'Hello, World!'

// 数组复制（浅拷贝）
const originalArray = [1, 2, 3];
const copiedArray = [...originalArray];

// 数组转换
const nodeList = document.querySelectorAll("div");
const arrayFromNodeList = [...nodeList];

// 字符串转数组
const chars = [..."hello"];
console.log(chars); // ['h', 'e', 'l', 'l', 'o']
```

### 默认参数

```javascript
// 基础默认参数
function greet(name = "World", greeting = "Hello") {
  return `${greeting}, ${name}!`;
}

console.log(greet()); // 'Hello, World!'
console.log(greet("Alice")); // 'Hello, Alice!'

// 表达式作为默认值
function createId(prefix = "id", suffix = Date.now()) {
  return `${prefix}-${suffix}`;
}

// 函数调用作为默认值
function getDefaultConfig() {
  return { theme: "dark", lang: "en" };
}

function setupApp(config = getDefaultConfig()) {
  console.log("配置:", config);
}

// 参数间的依赖
function calculateArea(width, height = width) {
  return width * height;
}

console.log(calculateArea(5)); // 25 (正方形)
console.log(calculateArea(5, 3)); // 15 (矩形)

// 使用解构的默认参数
function createUser({
  name = "Anonymous",
  age = 0,
  email = `${name.toLowerCase()}@example.com`,
} = {}) {
  return { name, age, email };
}

console.log(createUser()); // { name: 'Anonymous', age: 0, email: 'anonymous@example.com' }
console.log(createUser({ name: "Alice", age: 25 })); // { name: 'Alice', age: 25, email: 'alice@example.com' }

// 默认参数与 arguments
function testArguments(a = 1, b = 2) {
  console.log("参数:", a, b);
  console.log("arguments 长度:", arguments.length);
  console.log("arguments:", [...arguments]);
}

testArguments(); // 参数: 1 2, arguments 长度: 0
testArguments(10); // 参数: 10 2, arguments 长度: 1
```

### for...of 循环

```javascript
// 遍历数组
const numbers = [1, 2, 3, 4, 5];

for (const num of numbers) {
  console.log(num);
}

// 遍历字符串
for (const char of "hello") {
  console.log(char); // h, e, l, l, o
}

// 遍历 Map
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);

for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}

// 遍历 Set
const set = new Set([1, 2, 3]);

for (const value of set) {
  console.log(value);
}

// 自定义可迭代对象
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}

const range = new Range(1, 5);

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// 与数组解构结合
const pairs = [
  ["a", 1],
  ["b", 2],
  ["c", 3],
];

for (const [key, value] of pairs) {
  console.log(`${key} = ${value}`);
}

// 遍历对象的键值对
const obj = { x: 1, y: 2, z: 3 };

// 遍历键
for (const key of Object.keys(obj)) {
  console.log(key);
}

// 遍历值
for (const value of Object.values(obj)) {
  console.log(value);
}

// 遍历键值对
for (const [key, value] of Object.entries(obj)) {
  console.log(`${key}: ${value}`);
}
```

## 6. ES2016+ 新特性 🚀

### 指数运算符 (ES2016)

```javascript
// 指数运算符 **
console.log(2 ** 3); // 8
console.log(2 ** 10); // 1024

// 等价于 Math.pow()
console.log(Math.pow(2, 3)); // 8

// 结合赋值
let x = 2;
x **= 3; // x = x ** 3
console.log(x); // 8

// 负指数
console.log(2 ** -2); // 0.25

// 在表达式中使用
const result = 3 + 2 ** 2; // 3 + 4 = 7
```

### Array.includes() (ES2016)

```javascript
const fruits = ["apple", "banana", "orange"];

// 检查数组是否包含某个元素
console.log(fruits.includes("banana")); // true
console.log(fruits.includes("grape")); // false

// 指定搜索起始位置
console.log(fruits.includes("apple", 1)); // false

// 与 indexOf 的区别
const numbers = [1, 2, NaN, 4];

console.log(numbers.indexOf(NaN)); // -1 (找不到)
console.log(numbers.includes(NaN)); // true (能找到)
```

### Object.values() 和 Object.entries() (ES2017)

```javascript
const person = {
  name: "Alice",
  age: 25,
  city: "Beijing",
};

// Object.values()
console.log(Object.values(person)); // ['Alice', 25, 'Beijing']

// Object.entries()
console.log(Object.entries(person));
// [['name', 'Alice'], ['age', 25], ['city', 'Beijing']]

// 实际应用
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
};

// 验证所有配置值都已设置
const allConfigured = Object.values(config).every((value) => value != null);

// 转换对象
const uppercasedConfig = Object.fromEntries(
  Object.entries(config).map(([key, value]) => [key.toUpperCase(), value])
);
```

### String padding (ES2017)

```javascript
// padStart() - 在字符串开头填充
console.log("5".padStart(3, "0")); // '005'
console.log("hello".padStart(10, "*")); // '*****hello'

// padEnd() - 在字符串末尾填充
console.log("5".padEnd(3, "0")); // '500'
console.log("hello".padEnd(10, "*")); // 'hello*****'

// 实际应用：格式化数字
function formatNumber(num, width = 8) {
  return num.toString().padStart(width, "0");
}

console.log(formatNumber(42)); // '00000042'

// 表格对齐
const items = [
  { name: "Apple", price: 1.5 },
  { name: "Banana", price: 0.8 },
  { name: "Orange", price: 2.0 },
];

items.forEach((item) => {
  const name = item.name.padEnd(10);
  const price = item.price.toString().padStart(5);
  console.log(`${name} $${price}`);
});
```

### Optional Chaining (ES2020)

```javascript
// 可选链操作符 ?.
const user = {
  id: 1,
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "Beijing",
  },
};

// 安全访问嵌套属性
console.log(user?.address?.street); // '123 Main St'
console.log(user?.address?.zipcode); // undefined
console.log(user?.contact?.email); // undefined

// 数组的可选链
const users = [
  { name: "Alice", posts: [{ title: "Post 1" }] },
  { name: "Bob" },
];

console.log(users[0]?.posts?.[0]?.title); // 'Post 1'
console.log(users[1]?.posts?.[0]?.title); // undefined

// 函数调用的可选链
const api = {
  user: {
    getName: () => "Alice",
  },
};

console.log(api.user?.getName?.()); // 'Alice'
console.log(api.user?.getAge?.()); // undefined (不会报错)

// 实际应用：API 响应处理
function handleApiResponse(response) {
  const userName = response?.data?.user?.name ?? "Unknown User";
  const userPosts = response?.data?.user?.posts?.length ?? 0;

  console.log(`User: ${userName}, Posts: ${userPosts}`);
}
```

### Nullish Coalescing (ES2020)

```javascript
// 空值合并操作符 ??
const value1 = null ?? "default";
const value2 = undefined ?? "default";
const value3 = 0 ?? "default";
const value4 = "" ?? "default";
const value5 = false ?? "default";

console.log(value1); // 'default'
console.log(value2); // 'default'
console.log(value3); // 0
console.log(value4); // ''
console.log(value5); // false

// 与 || 的区别
console.log(0 || "default"); // 'default'
console.log(0 ?? "default"); // 0

console.log("" || "default"); // 'default'
console.log("" ?? "default"); // ''

// 实际应用：配置默认值
function createConfig(options = {}) {
  return {
    host: options.host ?? "localhost",
    port: options.port ?? 3000,
    debug: options.debug ?? false,
    maxConnections: options.maxConnections ?? 100,
  };
}

// 允许传入 0 或 false 作为有效值
const config = createConfig({
  port: 0, // 不会被替换为默认值
  debug: false, // 不会被替换为默认值
});
```

## 面试重点总结 🎯

### 必须掌握的核心特性

1. **箭头函数**

   - this 绑定差异
   - 不能作为构造函数
   - 没有 arguments 对象

2. **解构赋值**

   - 数组和对象解构
   - 默认值和重命名
   - 在函数参数中的应用

3. **模块化**

   - import/export 语法
   - 默认导出 vs 命名导出
   - 动态导入

4. **新数据类型**
   - Symbol 的唯一性和应用
   - Map/Set 与传统对象/数组的区别
   - WeakMap/WeakSet 的内存优势

### 常考面试题

```javascript
// 1. 箭头函数 this 指向
const obj = {
  name: "obj",
  method1: function () {
    return () => console.log(this.name);
  },
  method2: () => console.log(this.name),
};

// 2. 解构赋值陷阱
const { a, b } = { a: 1 };
console.log(b); // undefined

// 3. 模块化循环依赖问题
// a.js: import { b } from './b.js';
// b.js: import { a } from './a.js';

// 4. Map 与 Object 的选择
// 什么时候用 Map，什么时候用 Object？

// 5. Symbol 的实际应用场景
// 如何使用 Symbol 实现私有属性？
```

### 记忆要点

- **箭头函数**：简洁语法，但 this 绑定不同
- **解构赋值**：提取数据更方便，支持默认值
- **模块化**：代码组织更清晰，支持静态分析
- **新数据类型**：解决特定场景问题，性能更优

ES6+ 特性极大提升了 JavaScript 的开发效率和代码质量！
