# JavaScript 类型转换机制 - 深度剖析

## 核心概念概述

**类型转换**：JavaScript 中数据类型之间的相互转换过程。

**隐式转换**：JavaScript 引擎自动进行的类型转换。

**显式转换**：开发者主动调用方法进行的类型转换。

## 1. 基础类型转换规则 🔄

### 原始类型转换

```javascript
// String 转换
console.log(String(123)); // "123"
console.log(String(true)); // "true"
console.log(String(null)); // "null"
console.log(String(undefined)); // "undefined"
console.log(String(Symbol("id"))); // "Symbol(id)"

// Number 转换
console.log(Number("123")); // 123
console.log(Number("123.45")); // 123.45
console.log(Number("123abc")); // NaN
console.log(Number("")); // 0
console.log(Number(" ")); // 0
console.log(Number(true)); // 1
console.log(Number(false)); // 0
console.log(Number(null)); // 0
console.log(Number(undefined)); // NaN

// Boolean 转换
console.log(Boolean(1)); // true
console.log(Boolean(0)); // false
console.log(Boolean("")); // false
console.log(Boolean("hello")); // true
console.log(Boolean(null)); // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN)); // false
console.log(Boolean([])); // true (空数组是对象)
console.log(Boolean({})); // true (空对象)

// 假值 (Falsy values) 列表
const falsyValues = [
  false,
  0,
  -0,
  0n, // BigInt
  "",
  null,
  undefined,
  NaN,
];

falsyValues.forEach((value) => {
  console.log(`${value} is falsy:`, !value);
});
```

### 对象类型转换

```javascript
// 对象到原始类型的转换
const obj = {
  value: 42,

  // 自定义 toString 方法
  toString() {
    console.log("toString called");
    return "object string";
  },

  // 自定义 valueOf 方法
  valueOf() {
    console.log("valueOf called");
    return this.value;
  },
};

// 转换为字符串（优先调用 toString）
console.log(String(obj)); // "object string"
console.log(obj + ""); // "object string"

// 转换为数字（优先调用 valueOf）
console.log(Number(obj)); // 42
console.log(+obj); // 42

// 转换为布尔值
console.log(Boolean(obj)); // true (所有对象都是真值)

// 特殊情况：Date 对象
const date = new Date();
console.log(String(date)); // 调用 toString()
console.log(Number(date)); // 调用 valueOf()，返回时间戳

// Symbol.toPrimitive 方法（优先级最高）
const customObj = {
  [Symbol.toPrimitive](hint) {
    console.log("toPrimitive called with hint:", hint);

    if (hint === "number") {
      return 100;
    }
    if (hint === "string") {
      return "custom string";
    }
    return "default";
  },
};

console.log(String(customObj)); // "custom string"
console.log(Number(customObj)); // 100
console.log(customObj + ""); // "default"
```

## 2. 隐式类型转换 🔄

### 字符串连接和数字运算

```javascript
// 字符串连接 (+) - 优先转换为字符串
console.log("5" + 3); // "53"
console.log("5" + true); // "5true"
console.log("5" + null); // "5null"
console.log("5" + undefined); // "5undefined"
console.log("5" + {}); // "5[object Object]"
console.log("5" + []); // "5"
console.log("5" + [1, 2]); // "51,2"

// 数字运算 (-, *, /, %) - 转换为数字
console.log("5" - 3); // 2
console.log("5" * "2"); // 10
console.log("10" / "2"); // 5
console.log("10" % "3"); // 1
console.log(true - false); // 1
console.log(null + 1); // 1
console.log(undefined + 1); // NaN

// 特殊的加法运算
console.log(1 + "2" + 3); // "123" (从左到右，1+"2"="12", "12"+3="123")
console.log(1 + 2 + "3"); // "33" (1+2=3, 3+"3"="33")
console.log("1" + 2 + 3); // "123" ("1"+2="12", "12"+3="123")
console.log(1 + 2 + 3); // 6 (纯数字运算)

// 复杂表达式
console.log([] + []); // "" (空字符串)
console.log([] + {}); // "[object Object]"
console.log({} + []); // "[object Object]" 或 0 (取决于上下文)
console.log([] - []); // 0
console.log({} - {}); // NaN
```

### 比较运算中的类型转换

```javascript
// == 相等比较（会进行类型转换）
console.log(1 == "1"); // true
console.log(true == 1); // true
console.log(false == 0); // true
console.log(null == undefined); // true
console.log("" == 0); // true
console.log([] == 0); // true
console.log([] == ""); // true
console.log([1] == 1); // true
console.log([1, 2] == "1,2"); // true

// === 严格相等比较（不进行类型转换）
console.log(1 === "1"); // false
console.log(true === 1); // false
console.log(null === undefined); // false

// 关系比较 (<, >, <=, >=)
console.log("2" > "10"); // true (字符串比较)
console.log("2" > 10); // false (转换为数字比较)
console.log("abc" > 10); // false (abc 转换为 NaN)

// 特殊比较规则
console.log(NaN == NaN); // false
console.log(NaN === NaN); // false
console.log(Object.is(NaN, NaN)); // true

console.log(+0 == -0); // true
console.log(+0 === -0); // true
console.log(Object.is(+0, -0)); // false
```

### 条件语句中的类型转换

```javascript
// if 语句中的布尔转换
if ("") {
  console.log("不会执行");
}

if ("0") {
  console.log("会执行"); // 非空字符串是真值
}

if ([]) {
  console.log("会执行"); // 空数组是真值
}

if ({}) {
  console.log("会执行"); // 空对象是真值
}

// 三元运算符
const result = 0 ? "真值" : "假值"; // "假值"

// 逻辑运算符的短路求值
console.log(false && "不会输出"); // false
console.log(true && "会输出"); // "会输出"
console.log(false || "默认值"); // "默认值"
console.log(true || "不会输出"); // true

// 空值合并操作符 (??)
console.log(null ?? "默认值"); // "默认值"
console.log(undefined ?? "默认值"); // "默认值"
console.log(0 ?? "默认值"); // 0
console.log("" ?? "默认值"); // ""
```

## 3. 显式类型转换 💫

### 字符串转换方法

```javascript
// String() 构造函数
console.log(String(123)); // "123"
console.log(String(true)); // "true"

// toString() 方法
console.log((123).toString()); // "123"
console.log(true.toString()); // "true"
console.log([1, 2, 3].toString()); // "1,2,3"

// 进制转换
console.log((255).toString(16)); // "ff" (十六进制)
console.log((255).toString(2)); // "11111111" (二进制)
console.log((255).toString(8)); // "377" (八进制)

// 模板字符串
const num = 42;
console.log(`The number is ${num}`); // "The number is 42"

// JSON.stringify()
const obj = { name: "Alice", age: 25 };
console.log(JSON.stringify(obj)); // '{"name":"Alice","age":25}'
```

### 数字转换方法

```javascript
// Number() 构造函数
console.log(Number("123")); // 123
console.log(Number("123.45")); // 123.45
console.log(Number("123abc")); // NaN

// parseInt() - 解析整数
console.log(parseInt("123")); // 123
console.log(parseInt("123.45")); // 123
console.log(parseInt("123abc")); // 123
console.log(parseInt("abc123")); // NaN
console.log(parseInt("0x10")); // 16 (十六进制)
console.log(parseInt("10", 2)); // 2 (指定进制)

// parseFloat() - 解析浮点数
console.log(parseFloat("123.45")); // 123.45
console.log(parseFloat("123.45abc")); // 123.45
console.log(parseFloat("abc123.45")); // NaN

// 一元加号操作符
console.log(+"123"); // 123
console.log(+"123.45"); // 123.45
console.log(+"123abc"); // NaN

// Math 对象方法
console.log(Math.floor(123.8)); // 123 (向下取整)
console.log(Math.ceil(123.2)); // 124 (向上取整)
console.log(Math.round(123.6)); // 124 (四舍五入)
console.log(Math.trunc(123.8)); // 123 (截断小数部分)

// 位运算转换
console.log(123.8 | 0); // 123 (转换为32位整数)
console.log(~~123.8); // 123 (双位非运算)
```

### 布尔转换方法

```javascript
// Boolean() 构造函数
console.log(Boolean(1)); // true
console.log(Boolean(0)); // false
console.log(Boolean("")); // false
console.log(Boolean("hello")); // true

// 双重逻辑非操作符
console.log(!!1); // true
console.log(!!0); // false
console.log(!!""); // false
console.log(!!"hello"); // true

// 实际应用：检查变量是否有值
function hasValue(value) {
  return Boolean(value);
}

console.log(hasValue("")); // false
console.log(hasValue("hello")); // true
console.log(hasValue(0)); // false
console.log(hasValue([])); // true
```

## 4. 复杂转换场景 🎪

### 数组的类型转换

```javascript
// 数组转换规则
const arr = [1, 2, 3];

// toString() 方法
console.log(arr.toString()); // "1,2,3"
console.log([].toString()); // ""
console.log([1].toString()); // "1"

// valueOf() 方法（返回数组本身）
console.log(arr.valueOf()); // [1, 2, 3]

// 隐式转换
console.log(arr + ""); // "1,2,3"
console.log(+arr); // NaN
console.log(+[]); // 0
console.log(+[1]); // 1
console.log(+[1, 2]); // NaN

// 特殊情况
console.log([] == 0); // true
console.log([0] == 0); // true
console.log([1] == 1); // true
console.log([1, 2] == "1,2"); // true

// 数组在布尔上下文中
if ([]) {
  console.log("空数组是真值"); // 会执行
}

if ([].length) {
  console.log("不会执行");
} else {
  console.log("空数组长度为0，是假值"); // 会执行
}
```

### 对象的类型转换

```javascript
// 普通对象转换
const obj = { a: 1, b: 2 };

console.log(obj.toString()); // "[object Object]"
console.log(obj.valueOf()); // { a: 1, b: 2 }
console.log(obj + ""); // "[object Object]"
console.log(+obj); // NaN

// 自定义 toString 和 valueOf
const customObj = {
  value: 100,

  toString() {
    return "Custom String";
  },

  valueOf() {
    return this.value;
  },
};

console.log(customObj + ""); // "Custom String"
console.log(+customObj); // 100

// Date 对象的特殊转换
const date = new Date("2023-01-01");

console.log(date.toString()); // 日期字符串
console.log(date.valueOf()); // 时间戳
console.log(+date); // 时间戳
console.log(date + ""); // 日期字符串

// 函数的类型转换
function myFunction() {
  return "Hello";
}

console.log(myFunction.toString()); // 函数源代码
console.log(+myFunction); // NaN
console.log(myFunction + ""); // 函数源代码
```

### 特殊值的转换

```javascript
// null 和 undefined
console.log(null + 1); // 1 (null 转换为 0)
console.log(undefined + 1); // NaN (undefined 转换为 NaN)
console.log(null == 0); // false (特殊规则)
console.log(undefined == 0); // false

// NaN 的转换
console.log(NaN + 1); // NaN
console.log(NaN == NaN); // false
console.log(isNaN(NaN)); // true
console.log(Number.isNaN(NaN)); // true

// Infinity 的转换
console.log(Infinity + 1); // Infinity
console.log(-Infinity + 1); // -Infinity
console.log(Infinity == Infinity); // true
console.log(String(Infinity)); // "Infinity"

// Symbol 的转换
const sym = Symbol("test");
console.log(String(sym)); // "Symbol(test)"
// console.log(Number(sym)); // TypeError: Cannot convert a Symbol value to a number
// console.log(sym + ""); // TypeError: Cannot convert a Symbol value to a string
```

## 5. 面试高频题目 💡

### 经典类型转换题目

```javascript
// 题目1：经典加法运算
console.log(1 + "1"); // "11"
console.log(1 + +"1"); // 2
console.log(1 + +(+(+(+"1")))); // 2 (多个一元加号)

console.log("A" - "B"); // NaN
console.log("A" - "B" + 2); // NaN
console.log("A" - "B" + "2"); // "NaN2"

// 题目2：复杂比较
console.log([] == ![]); // true
/*
解析：
1. ![] -> false (空数组转布尔值为true，取反为false)
2. [] == false
3. [] 转换为原始值 -> "" (调用toString)
4. false 转换为数字 -> 0
5. "" 转换为数字 -> 0
6. 0 == 0 -> true
*/

console.log({} == !{}); // false
/*
解析：
1. !{} -> false
2. {} == false
3. {} 转换为原始值 -> "[object Object]"
4. false 转换为数字 -> 0
5. "[object Object]" 转换为数字 -> NaN
6. NaN == 0 -> false
*/

// 题目3：数组比较
console.log([1, 2] + [3, 4]); // "1,23,4"
console.log([1, 2] - [3, 4]); // NaN

// 题目4：特殊值比较
console.log(null == undefined); // true
console.log(null === undefined); // false
console.log(NaN == NaN); // false
console.log([] == []); // false (不同的对象引用)
console.log({} == {}); // false
```

### == vs === 详解

```javascript
// 相等比较算法 (==)
function abstractEquals(x, y) {
  // 1. 类型相同，使用严格相等
  if (typeof x === typeof y) {
    return x === y;
  }

  // 2. null 和 undefined
  if ((x === null && y === undefined) || (x === undefined && y === null)) {
    return true;
  }

  // 3. 数字和字符串
  if (typeof x === "number" && typeof y === "string") {
    return x === Number(y);
  }
  if (typeof x === "string" && typeof y === "number") {
    return Number(x) === y;
  }

  // 4. 布尔值转换为数字
  if (typeof x === "boolean") {
    return abstractEquals(Number(x), y);
  }
  if (typeof y === "boolean") {
    return abstractEquals(x, Number(y));
  }

  // 5. 对象和原始值
  if (
    (typeof x === "string" || typeof x === "number" || typeof x === "symbol") &&
    typeof y === "object"
  ) {
    return abstractEquals(
      x,
      y[Symbol.toPrimitive]?.() || y.valueOf() || y.toString()
    );
  }
  if (
    typeof x === "object" &&
    (typeof y === "string" || typeof y === "number" || typeof y === "symbol")
  ) {
    return abstractEquals(
      x[Symbol.toPrimitive]?.() || x.valueOf() || x.toString(),
      y
    );
  }

  return false;
}

// 测试用例
const testCases = [
  [1, "1"],
  [true, 1],
  [false, 0],
  [null, undefined],
  [[], 0],
  [[1], "1"],
];

testCases.forEach(([a, b]) => {
  console.log(`${a} == ${b}: ${a == b}`);
  console.log(`${a} === ${b}: ${a === b}`);
});
```

### 类型转换最佳实践

```javascript
// 1. 显式转换优于隐式转换
// 不好的做法
function addToString(value) {
  return value + ""; // 隐式转换
}

// 好的做法
function addToString(value) {
  return String(value); // 显式转换
}

// 2. 使用严格相等比较
// 不好的做法
if (userInput == 0) {
  // 可能匹配 "", false, []
}

// 好的做法
if (userInput === 0) {
  // 只匹配数字 0
}

// 3. 布尔转换的最佳实践
// 不好的做法
const hasValue = value ? true : false;

// 好的做法
const hasValue = Boolean(value);
// 或者
const hasValue = !!value;

// 4. 数字转换的安全方法
function safeParseInt(value, radix = 10) {
  const result = parseInt(value, radix);
  return isNaN(result) ? 0 : result;
}

function safeParseFloat(value) {
  const result = parseFloat(value);
  return isNaN(result) ? 0 : result;
}

// 5. 类型检查工具函数
function isString(value) {
  return typeof value === "string";
}

function isNumber(value) {
  return typeof value === "number" && !isNaN(value);
}

function isArray(value) {
  return Array.isArray(value);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
```

## 6. 实际应用场景 🚀

### 表单数据处理

```javascript
// 表单数据转换
class FormDataProcessor {
  static process(formData) {
    const processed = {};

    for (const [key, value] of formData.entries()) {
      // 数字字段转换
      if (
        key.includes("_number") ||
        key.includes("_age") ||
        key.includes("_count")
      ) {
        processed[key] = this.toNumber(value);
      }
      // 布尔字段转换
      else if (key.includes("_bool") || key.includes("_enabled")) {
        processed[key] = this.toBoolean(value);
      }
      // 日期字段转换
      else if (key.includes("_date")) {
        processed[key] = this.toDate(value);
      }
      // 默认字符串
      else {
        processed[key] = this.toString(value);
      }
    }

    return processed;
  }

  static toNumber(value) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  static toBoolean(value) {
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1";
    }
    return Boolean(value);
  }

  static toDate(value) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  static toString(value) {
    return value == null ? "" : String(value);
  }
}

// 使用示例
const formData = new FormData();
formData.append("name", "Alice");
formData.append("age_number", "25");
formData.append("active_bool", "true");
formData.append("created_date", "2023-01-01");

const processed = FormDataProcessor.process(formData);
console.log(processed);
```

### API 数据转换

```javascript
// API 响应数据转换
class APIDataConverter {
  static convertUser(userData) {
    return {
      id: this.ensureNumber(userData.id),
      name: this.ensureString(userData.name),
      email: this.ensureString(userData.email),
      age: this.ensureNumber(userData.age),
      isActive: this.ensureBoolean(userData.is_active),
      registeredAt: this.ensureDate(userData.registered_at),
      profile: userData.profile ? this.convertProfile(userData.profile) : null,
    };
  }

  static convertProfile(profileData) {
    return {
      bio: this.ensureString(profileData.bio),
      avatar: this.ensureString(profileData.avatar),
      preferences: Array.isArray(profileData.preferences)
        ? profileData.preferences.map((p) => this.ensureString(p))
        : [],
    };
  }

  static ensureString(value) {
    return value == null ? "" : String(value);
  }

  static ensureNumber(value) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  static ensureBoolean(value) {
    if (typeof value === "string") {
      return ["true", "1", "yes"].includes(value.toLowerCase());
    }
    return Boolean(value);
  }

  static ensureDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
}

// 使用示例
const apiResponse = {
  id: "123",
  name: "Alice",
  age: "25",
  is_active: "true",
  registered_at: "2023-01-01T00:00:00Z",
  profile: {
    bio: "Software Developer",
    preferences: ["coding", "reading"],
  },
};

const convertedUser = APIDataConverter.convertUser(apiResponse);
console.log(convertedUser);
```

## 面试重点总结 🎯

### 必须掌握的核心概念

1. **转换规则优先级**

   - Symbol.toPrimitive > valueOf > toString
   - 字符串上下文优先 toString
   - 数字上下文优先 valueOf

2. **== vs === 的区别**

   - == 会进行类型转换
   - === 严格相等，不转换类型
   - 推荐使用 === 避免意外转换

3. **常见转换陷阱**
   - [] == ![] 为 true
   - 空数组/对象在布尔上下文为 true
   - null == undefined 为 true

### 常考面试题类型

```javascript
// 1. 运算符优先级和转换
console.log(1 + "2" + 3); // 结果和过程

// 2. 比较运算转换规则
console.log([] == 0); // true/false 及原因

// 3. 函数返回值转换
function getValue() {
  return "" + [];
}

// 4. 布尔上下文转换
if ([]) {
  /* 执行吗？ */
}

// 5. 手写转换函数
// 实现 parseInt、parseFloat 等
```

### 记忆要点

- **转换方向**：目标类型决定转换方法
- **隐式转换**：运算符和上下文触发
- **显式转换**：构造函数和方法调用
- **最佳实践**：显式转换 + 严格比较

掌握类型转换是避免 JavaScript 陷阱的关键！
