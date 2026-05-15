# Symbol 类型详解

## 核心概念

Symbol 是 ES6 新增的**基本数据类型**，每个 Symbol 值都是**唯一的**，主要用于创建对象的唯一属性名。

## 面试回答框架

### 1. 基本定义 (30 秒)

```javascript
// Symbol 是什么
const sym1 = Symbol();
const sym2 = Symbol("description");
const sym3 = Symbol("description");

console.log(sym2 === sym3); // false - 每个都是唯一的
console.log(typeof sym1); // "symbol"
```

**要点：**

- ES6 新增的第 7 种基本数据类型
- 每个 Symbol 都是独一无二的
- 可以有描述符，但不影响唯一性

### 2. 主要作用 (1 分钟)

#### 作用 1：创建唯一的对象属性

```javascript
const id = Symbol("id");
const user = {
  name: "Alice",
  [id]: 123,
};

// Symbol 属性不会被意外访问或覆盖
console.log(user[id]); // 123
console.log(Object.keys(user)); // ['name'] - 不包含 Symbol 属性
```

#### 作用 2：避免属性名冲突

```javascript
// 第三方库的属性
const libProperty = Symbol("lib.property");

// 你的代码
const myObject = {
  name: "test",
  [libProperty]: "library value",
};

// 不会与其他字符串属性冲突
```

### 3. Symbol.for() 全局注册 (30 秒)

```javascript
// 普通 Symbol - 每次都是新的
const sym1 = Symbol("key");
const sym2 = Symbol("key");
console.log(sym1 === sym2); // false

// 全局 Symbol - 相同 key 返回同一个
const global1 = Symbol.for("global");
const global2 = Symbol.for("global");
console.log(global1 === global2); // true

// 获取全局 Symbol 的 key
console.log(Symbol.keyFor(global1)); // 'global'
```

### 4. 内置 Symbol (1 分钟)

#### Symbol.iterator - 定义可迭代对象

```javascript
const myIterable = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.data.length) {
          return { value: this.data[index++], done: false };
        }
        return { done: true };
      },
    };
  },
};

// 现在可以使用 for...of
for (const item of myIterable) {
  console.log(item); // 1, 2, 3
}
```

#### Symbol.toStringTag - 自定义类型标识

```javascript
class MyClass {
  get [Symbol.toStringTag]() {
    return "MyClass";
  }
}

const obj = new MyClass();
console.log(Object.prototype.toString.call(obj)); // "[object MyClass]"
```

### 5. 实际应用场景 (30 秒)

#### 私有属性模拟

```javascript
const _private = Symbol("private");

class User {
  constructor(name) {
    this.name = name;
    this[_private] = "secret data";
  }

  getPrivate() {
    return this[_private];
  }
}

const user = new User("Alice");
console.log(user.name); // 'Alice'
console.log(user[_private]); // undefined - 外部无法直接访问
```

#### 状态常量

```javascript
const States = {
  LOADING: Symbol("loading"),
  SUCCESS: Symbol("success"),
  ERROR: Symbol("error"),
};

// 避免字符串常量的拼写错误
function handleState(state) {
  switch (state) {
    case States.LOADING:
      return "Loading...";
    case States.SUCCESS:
      return "Success!";
    case States.ERROR:
      return "Error occurred";
  }
}
```

## 面试高频问题

### Q1: Symbol 和字符串属性的区别？

**回答：**

1. **唯一性**：Symbol 绝对唯一，字符串可能重复
2. **枚举性**：Symbol 属性不会被 `Object.keys()`、`for...in` 枚举
3. **访问方式**：Symbol 必须通过原始引用访问，无法通过字符串访问

### Q2: 如何获取对象的 Symbol 属性？

```javascript
const sym = Symbol("test");
const obj = { [sym]: "value", name: "test" };

// 获取 Symbol 属性
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(test)]

// 获取所有属性（包括 Symbol）
console.log(Reflect.ownKeys(obj)); // ['name', Symbol(test)]
```

### Q3: Symbol 能被序列化吗？

```javascript
const sym = Symbol("test");
const obj = { [sym]: "value", name: "test" };

console.log(JSON.stringify(obj)); // {"name":"test"} - Symbol 属性被忽略
```

**回答：** Symbol 属性不会被 `JSON.stringify()` 序列化，这是设计特性。

## 注意事项

1. **不能用 new**：`new Symbol()` 会报错
2. **类型转换**：Symbol 不能隐式转换为字符串或数字
3. **内存泄漏**：`Symbol.for()` 创建的全局 Symbol 不会被垃圾回收

## 回答总结模板

> "Symbol 是 ES6 新增的基本数据类型，主要特点是唯一性。它的核心作用是创建唯一的对象属性名，避免属性名冲突。
>
> 主要用法包括：
>
> 1. 创建唯一属性，Symbol 属性不会被枚举
> 2. Symbol.for() 可以创建全局共享的 Symbol
> 3. 内置 Symbol 如 Symbol.iterator 用于定义对象行为
> 4. 实际应用中常用于模拟私有属性和定义状态常量
>
> 需要注意的是 Symbol 不能被 JSON 序列化，也不能隐式类型转换。"

## 参考资料

- [MDN - Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [ES6 入门 - Symbol](https://es6.ruanyifeng.com/#docs/symbol)
