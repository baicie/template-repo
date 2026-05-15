# 数据类型

## 相关问题

- JavaScript 有哪些数据类型？
- 如何判断数据类型？
- 基本类型和引用类型的区别？

## 回答关键点

JavaScript 有 **8 种数据类型**，分为基本类型和引用类型：

**基本类型（7 种）：**

- `undefined`、`null`、`boolean`、`number`、`string`、`symbol`、`bigint`

**引用类型（1 种）：**

- `object`（包括普通对象、数组、函数等）

**主要区别：**

- 基本类型存储在栈中，引用类型存储在堆中
- 基本类型按值传递，引用类型按引用传递

## 知识点深入

### 1. 类型判断方法

```javascript
// typeof 操作符
typeof 42          // "number"
typeof 'hello'     // "string"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object" (历史遗留问题)
typeof {}          // "object"
typeof []          // "object"
typeof function(){} // "function"

// instanceof 操作符
[] instanceof Array        // true
{} instanceof Object       // true

// Object.prototype.toString
Object.prototype.toString.call([])    // "[object Array]"
Object.prototype.toString.call({})    // "[object Object]"
Object.prototype.toString.call(null)  // "[object Null]"
```

### 2. 类型转换

**隐式转换：**

```javascript
"5" + 3; // '53' (字符串拼接)
"5" - 3; // 2 (数值运算)
!!"hello"; // true (转布尔值)
```

**显式转换：**

```javascript
Number("123"); // 123
String(123); // '123'
Boolean(0); // false
```

### 3. 特殊值判断

```javascript
// 判断 NaN
Number.isNaN(NaN); // true
isNaN("hello"); // true (不推荐)

// 判断 null
value === null;

// 判断 undefined
value === undefined;
typeof value === "undefined";
```

## 面试要点

1. **准确回答类型数量**: 8 种数据类型，7 种基本类型 + 1 种引用类型
2. **理解 typeof null**: 历史遗留问题，返回 "object"
3. **掌握类型判断**: typeof、instanceof、Object.prototype.toString 的使用场景
4. **理解存储机制**: 栈存储 vs 堆存储的区别

## 参考资料

- [MDN - JavaScript 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)
- [ECMAScript 规范](https://tc39.es/ecma262/)
