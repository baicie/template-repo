# JavaScript 引用类型常用方法 - 面试必备

## 核心概念回顾

**引用类型**：对象、数组、函数等复杂数据类型，存储在堆内存中，变量保存的是内存地址的引用。

```javascript
// 基本类型 vs 引用类型
let a = 1;
let b = a; // 值复制
b = 2; // a = 1, b = 2

let obj1 = { name: "Alice" };
let obj2 = obj1; // 引用复制
obj2.name = "Bob"; // obj1.name = 'Bob', obj2.name = 'Bob'
```

## 1. 对象保护方法 🔒

### Object.preventExtensions() - 禁止添加新属性

```javascript
const obj = { name: "Alice", age: 25 };

Object.preventExtensions(obj);

obj.name = "Bob"; // ✅ 可以修改现有属性
obj.email = "alice@example.com"; // ❌ 不能添加新属性

console.log(Object.isExtensible(obj)); // false
```

### Object.seal() - 密封对象

```javascript
const obj = { name: "Alice", age: 25 };

Object.seal(obj);

obj.name = "Bob"; // ✅ 可以修改现有属性
obj.email = "alice@example.com"; // ❌ 不能添加新属性
delete obj.age; // ❌ 不能删除属性

console.log(Object.isSealed(obj)); // true
```

### Object.freeze() - 冻结对象

```javascript
const obj = { name: "Alice", age: 25 };

Object.freeze(obj);

obj.name = "Bob"; // ❌ 不能修改
obj.email = "alice@example.com"; // ❌ 不能添加
delete obj.age; // ❌ 不能删除

console.log(Object.isFrozen(obj)); // true
```

### 深度冻结实现

```javascript
function deepFreeze(obj) {
  // 获取所有属性名
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const value = obj[name];

    // 如果属性值是对象，递归冻结
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  });

  return Object.freeze(obj);
}

const nestedObj = {
  user: { name: "Alice", profile: { age: 25 } },
  hobbies: ["reading", "coding"],
};

deepFreeze(nestedObj);
nestedObj.user.name = "Bob"; // ❌ 深层属性也不能修改
```

### 面试重点：三种保护方法的对比

| 方法                | 添加属性 | 删除属性 | 修改属性 | 检测方法       |
| ------------------- | -------- | -------- | -------- | -------------- |
| `preventExtensions` | ❌       | ✅       | ✅       | `isExtensible` |
| `seal`              | ❌       | ❌       | ✅       | `isSealed`     |
| `freeze`            | ❌       | ❌       | ❌       | `isFrozen`     |

## 2. 属性遍历和检测方法 🔍

### for...in 循环 + hasOwnProperty

```javascript
const parent = { parentProp: "parent" };
const child = Object.create(parent);
child.ownProp = "child";

// 问题：for...in 会遍历原型链上的属性
for (let key in child) {
  console.log(key); // 'ownProp', 'parentProp'
}

// 解决：使用 hasOwnProperty 过滤
for (let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key); // 只输出 'ownProp'
  }
}

// 更安全的写法（防止 hasOwnProperty 被重写）
for (let key in child) {
  if (Object.prototype.hasOwnProperty.call(child, key)) {
    console.log(key); // 只输出 'ownProp'
  }
}
```

### Object.keys() vs Object.getOwnPropertyNames()

```javascript
const obj = { name: "Alice" };
Object.defineProperty(obj, "age", {
  value: 25,
  enumerable: false, // 不可枚举
});

console.log(Object.keys(obj)); // ['name'] - 只返回可枚举的自有属性
console.log(Object.getOwnPropertyNames(obj)); // ['name', 'age'] - 返回所有自有属性
```

### 现代属性遍历方法

```javascript
const obj = { name: "Alice", age: 25 };

// 1. Object.keys() - 获取可枚举属性名
Object.keys(obj).forEach((key) => {
  console.log(key, obj[key]);
});

// 2. Object.values() - 获取可枚举属性值
Object.values(obj).forEach((value) => {
  console.log(value);
});

// 3. Object.entries() - 获取键值对数组
Object.entries(obj).forEach(([key, value]) => {
  console.log(key, value);
});

// 4. for...of 遍历 (ES6+)
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
```

### 属性检测方法对比

```javascript
const obj = { name: "Alice" };
const proto = { age: 25 };
Object.setPrototypeOf(obj, proto);

// 检测自有属性
console.log(obj.hasOwnProperty("name")); // true
console.log(obj.hasOwnProperty("age")); // false

// 检测属性是否存在（包括原型链）
console.log("name" in obj); // true
console.log("age" in obj); // true

// 更安全的检测方法
console.log(Object.hasOwnProperty.call(obj, "name")); // true
console.log(Object.prototype.hasOwnProperty.call(obj, "name")); // true
```

## 3. 数组常用方法 📋

### 变更原数组的方法

```javascript
let arr = [1, 2, 3, 4, 5];

// 添加/删除元素
arr.push(6); // [1, 2, 3, 4, 5, 6] - 末尾添加
arr.pop(); // [1, 2, 3, 4, 5] - 末尾删除
arr.unshift(0); // [0, 1, 2, 3, 4, 5] - 开头添加
arr.shift(); // [1, 2, 3, 4, 5] - 开头删除

// splice - 万能方法
arr.splice(2, 1, "a", "b"); // [1, 2, 'a', 'b', 4, 5] - 从索引2删除1个，插入'a','b'

// 排序
arr.sort((a, b) => a - b); // 升序排序
arr.reverse(); // 反转数组
```

### 不变更原数组的方法

```javascript
const arr = [1, 2, 3, 4, 5];

// 转换方法
const doubled = arr.map((x) => x * 2); // [2, 4, 6, 8, 10]
const evens = arr.filter((x) => x % 2 === 0); // [2, 4]
const sum = arr.reduce((acc, x) => acc + x, 0); // 15

// 查找方法
const found = arr.find((x) => x > 3); // 4
const index = arr.findIndex((x) => x > 3); // 3
const includes = arr.includes(3); // true

// 连接和截取
const sliced = arr.slice(1, 3); // [2, 3]
const joined = arr.join("-"); // '1-2-3-4-5'
const concat = arr.concat([6, 7]); // [1, 2, 3, 4, 5, 6, 7]

// ES6+ 展开运算符
const spread = [...arr, 6, 7]; // [1, 2, 3, 4, 5, 6, 7]
```

### 高阶函数链式调用

```javascript
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Charlie", age: 35, active: true },
];

// 链式调用示例
const result = users
  .filter((user) => user.active) // 筛选活跃用户
  .map((user) => ({ ...user, ageGroup: user.age >= 30 ? "senior" : "junior" })) // 添加年龄组
  .sort((a, b) => a.age - b.age); // 按年龄排序

console.log(result);
// [
//   { name: 'Alice', age: 25, active: true, ageGroup: 'junior' },
//   { name: 'Charlie', age: 35, active: true, ageGroup: 'senior' }
// ]
```

## 4. 函数相关方法 🔧

### call, apply, bind 的区别

```javascript
const obj = { name: "Alice" };

function greet(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

// call - 立即调用，参数逐个传入
const result1 = greet.call(obj, "Hello", "!"); // "Hello, I'm Alice!"

// apply - 立即调用，参数以数组形式传入
const result2 = greet.apply(obj, ["Hi", "."]); // "Hi, I'm Alice."

// bind - 返回新函数，不立即调用
const boundGreet = greet.bind(obj, "Hey");
const result3 = boundGreet("?"); // "Hey, I'm Alice?"
```

### 手写实现 call, apply, bind

```javascript
// 手写 call
Function.prototype.myCall = function (context, ...args) {
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 apply
Function.prototype.myApply = function (context, args = []) {
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 bind
Function.prototype.myBind = function (context, ...args1) {
  const fn = this;
  return function (...args2) {
    return fn.apply(context, [...args1, ...args2]);
  };
};
```

### 函数属性和方法

```javascript
function example(a, b, c) {
  console.log(arguments); // 类数组对象
  console.log(arguments.length); // 实际传入的参数个数
}

console.log(example.length); // 3 - 函数定义的参数个数
console.log(example.name); // 'example' - 函数名

// 箭头函数没有 arguments 和 this 绑定
const arrow = (...args) => {
  console.log(args); // 使用剩余参数代替 arguments
};
```

## 5. 类型检测方法 🔍

### 准确的类型检测

```javascript
// Object.prototype.toString 最准确的类型检测
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType([])); // 'array'
console.log(getType({})); // 'object'
console.log(getType(null)); // 'null'
console.log(getType(undefined)); // 'undefined'
console.log(getType(new Date())); // 'date'
console.log(getType(/regex/)); // 'regexp'

// 常用类型判断函数
const isArray = Array.isArray || ((arr) => getType(arr) === "array");
const isObject = (obj) => getType(obj) === "object";
const isFunction = (fn) => typeof fn === "function";
const isString = (str) => typeof str === "string";
const isNumber = (num) => typeof num === "number" && !isNaN(num);
```

## 6. 对象复制方法 📋

### 浅拷贝

```javascript
const original = {
  name: "Alice",
  hobbies: ["reading", "coding"],
  address: { city: "Beijing" },
};

// 方法1: Object.assign()
const copy1 = Object.assign({}, original);

// 方法2: 展开运算符
const copy2 = { ...original };

// 方法3: 自定义浅拷贝
function shallowCopy(obj) {
  const result = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

// 注意：浅拷贝只复制第一层
copy1.hobbies.push("swimming"); // 原对象也会被影响
```

### 深拷贝

```javascript
// 简单深拷贝（有局限性）
const deepCopy1 = JSON.parse(JSON.stringify(original));

// 完整深拷贝实现
function deepCopy(obj, cache = new WeakMap()) {
  // 处理基本类型和 null
  if (obj === null || typeof obj !== "object") return obj;

  // 处理循环引用
  if (cache.has(obj)) return cache.get(obj);

  // 处理日期
  if (obj instanceof Date) return new Date(obj);

  // 处理正则
  if (obj instanceof RegExp) return new RegExp(obj);

  // 处理数组和对象
  const result = Array.isArray(obj) ? [] : {};
  cache.set(obj, result);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepCopy(obj[key], cache);
    }
  }

  return result;
}
```

## 面试常见问答 💡

### Q1: for...in 遍历对象时如何避免遍历到原型链上的属性？

```javascript
// 问题代码
for (let key in obj) {
  console.log(key, obj[key]); // 可能包含原型属性
}

// 解决方案
for (let key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log(key, obj[key]); // 只遍历自有属性
  }
}

// 更安全的写法
for (let key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    console.log(key, obj[key]);
  }
}

// 现代化写法
Object.keys(obj).forEach((key) => {
  console.log(key, obj[key]);
});
```

### Q2: 如何防止对象被修改？

```javascript
// 根据需求选择不同的保护级别

// 1. 只防止添加新属性
Object.preventExtensions(obj);

// 2. 防止添加和删除属性
Object.seal(obj);

// 3. 完全不可变
Object.freeze(obj);

// 4. 深度冻结（嵌套对象）
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const value = obj[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}
```

### Q3: call、apply、bind 的区别和使用场景？

```javascript
// call - 参数逐个传递，立即执行
func.call(thisArg, arg1, arg2, ...);

// apply - 参数数组传递，立即执行
func.apply(thisArg, [arg1, arg2, ...]);

// bind - 返回新函数，延迟执行
const newFunc = func.bind(thisArg, arg1, arg2);

// 使用场景
// 1. 数组最大值（apply）
const max = Math.max.apply(null, [1, 2, 3, 4, 5]);

// 2. 类数组转数组（call）
const arr = Array.prototype.slice.call(arguments);

// 3. 事件处理器绑定（bind）
button.addEventListener('click', this.handleClick.bind(this));
```

### Q4: 如何准确判断数据类型？

```javascript
// 通用类型判断
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

// 特定类型判断
const isArray = Array.isArray;
const isObject = (val) =>
  val !== null && typeof val === "object" && !Array.isArray(val);
const isPlainObject = (val) => getType(val) === "object";
const isEmptyObject = (obj) => Object.keys(obj).length === 0;
```

## 记忆口诀 🎯

**对象保护三兄弟**：

- `preventExtensions` - 不让长（不能添加）
- `seal` - 密封严（不能添删）
- `freeze` - 冰冻僵（完全不变）

**属性遍历安全法**：

- `for...in` 配 `hasOwnProperty`
- `Object.keys` 现代化
- 原型链要小心，自有属性才安心

**函数绑定记忆**：

- `call` - 立刻叫（立即执行，参数列表）
- `apply` - 立刻用（立即执行，参数数组）
- `bind` - 绑定等（返回函数，稍后调用）

这些方法在面试中出现频率极高，务必熟练掌握！
