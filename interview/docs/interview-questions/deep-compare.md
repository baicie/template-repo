# 对象深度对比

## 题目描述

实现一个函数 `deepEqual(obj1, obj2)`，用于深度比较两个对象是否相等。

**要求：**

- 支持基本数据类型比较
- 支持对象和数组的递归比较
- 处理特殊值（null、undefined、NaN）
- 考虑循环引用问题

## 核心考察点

- 递归算法设计
- 类型判断和处理
- 边界条件考虑
- 性能优化思维

## 实现思路

### 1. 基础版本

```javascript
function deepEqual(obj1, obj2) {
  // 1. 严格相等检查
  if (obj1 === obj2) {
    return true;
  }

  // 2. 处理 null 和 undefined
  if (obj1 == null || obj2 == null) {
    return obj1 === obj2;
  }

  // 3. 处理 NaN
  if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
    return true;
  }

  // 4. 类型不同直接返回 false
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // 5. 基本类型已经在第1步处理了，这里处理对象类型
  if (typeof obj1 !== "object") {
    return false;
  }

  // 6. 处理数组
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return compareArrays(obj1, obj2);
  }

  // 7. 一个是数组一个不是
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return false;
  }

  // 8. 处理对象
  return compareObjects(obj1, obj2);
}

function compareArrays(arr1, arr2) {
  // 长度不同
  if (arr1.length !== arr2.length) {
    return false;
  }

  // 递归比较每个元素
  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
}

function compareObjects(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // 属性数量不同
  if (keys1.length !== keys2.length) {
    return false;
  }

  // 递归比较每个属性
  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key)) {
      return false;
    }

    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
```

### 2. 处理特殊对象类型

```javascript
function deepEqual(obj1, obj2, visited = new WeakMap()) {
  // 严格相等检查
  if (obj1 === obj2) {
    return true;
  }

  // 处理 null 和 undefined
  if (obj1 == null || obj2 == null) {
    return obj1 === obj2;
  }

  // 处理 NaN
  if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
    return true;
  }

  // 类型不同
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // 基本类型
  if (typeof obj1 !== "object") {
    return false;
  }

  // 循环引用检测
  if (visited.has(obj1)) {
    return visited.get(obj1) === obj2;
  }
  visited.set(obj1, obj2);

  // 获取对象类型
  const type1 = Object.prototype.toString.call(obj1);
  const type2 = Object.prototype.toString.call(obj2);

  if (type1 !== type2) {
    return false;
  }

  // 根据类型进行比较
  switch (type1) {
    case "[object Array]":
      return compareArrays(obj1, obj2, visited);

    case "[object Date]":
      return obj1.getTime() === obj2.getTime();

    case "[object RegExp]":
      return obj1.toString() === obj2.toString();

    case "[object Map]":
      return compareMaps(obj1, obj2, visited);

    case "[object Set]":
      return compareSets(obj1, obj2, visited);

    case "[object Object]":
      return compareObjects(obj1, obj2, visited);

    default:
      // 其他类型（如函数）直接比较引用
      return obj1 === obj2;
  }
}

function compareArrays(arr1, arr2, visited) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i], visited)) {
      return false;
    }
  }

  return true;
}

function compareObjects(obj1, obj2, visited) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key)) {
      return false;
    }

    if (!deepEqual(obj1[key], obj2[key], visited)) {
      return false;
    }
  }

  return true;
}

function compareMaps(map1, map2, visited) {
  if (map1.size !== map2.size) {
    return false;
  }

  for (let [key, value] of map1) {
    if (!map2.has(key) || !deepEqual(value, map2.get(key), visited)) {
      return false;
    }
  }

  return true;
}

function compareSets(set1, set2, visited) {
  if (set1.size !== set2.size) {
    return false;
  }

  for (let value of set1) {
    let found = false;
    for (let value2 of set2) {
      if (deepEqual(value, value2, visited)) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }

  return true;
}
```

### 3. 性能优化版本

```javascript
class DeepEqualComparator {
  constructor() {
    this.visited = new WeakMap();
  }

  compare(obj1, obj2) {
    // 重置访问记录
    this.visited = new WeakMap();
    return this._deepEqual(obj1, obj2);
  }

  _deepEqual(obj1, obj2) {
    // 快速路径：严格相等
    if (obj1 === obj2) {
      return true;
    }

    // 快速路径：类型检查
    const type1 = typeof obj1;
    const type2 = typeof obj2;

    if (type1 !== type2) {
      return false;
    }

    // 快速路径：基本类型
    if (type1 !== "object" || obj1 === null || obj2 === null) {
      return this._compareBasicTypes(obj1, obj2);
    }

    // 循环引用检测
    if (this.visited.has(obj1)) {
      return this.visited.get(obj1) === obj2;
    }

    // 标记为正在比较
    this.visited.set(obj1, obj2);

    // 构造函数检查
    if (obj1.constructor !== obj2.constructor) {
      return false;
    }

    // 根据类型分发
    const result = this._compareComplexTypes(obj1, obj2);

    return result;
  }

  _compareBasicTypes(obj1, obj2) {
    // 处理 NaN
    if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
      return true;
    }

    return obj1 === obj2;
  }

  _compareComplexTypes(obj1, obj2) {
    // 数组比较
    if (Array.isArray(obj1)) {
      return this._compareArrays(obj1, obj2);
    }

    // Date 比较
    if (obj1 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }

    // RegExp 比较
    if (obj1 instanceof RegExp) {
      return obj1.toString() === obj2.toString();
    }

    // Map 比较
    if (obj1 instanceof Map) {
      return this._compareMaps(obj1, obj2);
    }

    // Set 比较
    if (obj1 instanceof Set) {
      return this._compareSets(obj1, obj2);
    }

    // 普通对象比较
    return this._compareObjects(obj1, obj2);
  }

  _compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (!this._deepEqual(arr1[i], arr2[i])) {
        return false;
      }
    }

    return true;
  }

  _compareObjects(obj1, obj2) {
    // 使用 Reflect.ownKeys 获取所有属性（包括 Symbol）
    const keys1 = Reflect.ownKeys(obj1);
    const keys2 = Reflect.ownKeys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (!obj2.hasOwnProperty(key)) {
        return false;
      }

      if (!this._deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  _compareMaps(map1, map2) {
    if (map1.size !== map2.size) {
      return false;
    }

    for (let [key, value] of map1) {
      if (!map2.has(key) || !this._deepEqual(value, map2.get(key))) {
        return false;
      }
    }

    return true;
  }

  _compareSets(set1, set2) {
    if (set1.size !== set2.size) {
      return false;
    }

    // 对于 Set，需要找到对应的元素
    const arr1 = Array.from(set1);
    const arr2 = Array.from(set2);
    const used = new Array(arr2.length).fill(false);

    for (let item1 of arr1) {
      let found = false;
      for (let i = 0; i < arr2.length; i++) {
        if (!used[i] && this._deepEqual(item1, arr2[i])) {
          used[i] = true;
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }

    return true;
  }
}

// 使用示例
const comparator = new DeepEqualComparator();

function deepEqual(obj1, obj2) {
  return comparator.compare(obj1, obj2);
}
```

## 测试用例

```javascript
// 测试用例
console.log("=== 基本类型测试 ===");
console.log(deepEqual(1, 1)); // true
console.log(deepEqual("hello", "hello")); // true
console.log(deepEqual(true, true)); // true
console.log(deepEqual(null, null)); // true
console.log(deepEqual(undefined, undefined)); // true
console.log(deepEqual(NaN, NaN)); // true

console.log("=== 不同类型测试 ===");
console.log(deepEqual(1, "1")); // false
console.log(deepEqual(null, undefined)); // false
console.log(deepEqual(0, false)); // false

console.log("=== 对象测试 ===");
console.log(deepEqual({}, {})); // true
console.log(deepEqual({ a: 1 }, { a: 1 })); // true
console.log(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })); // true
console.log(deepEqual({ a: 1 }, { a: 2 })); // false
console.log(deepEqual({ a: 1 }, { a: 1, b: 2 })); // false

console.log("=== 数组测试 ===");
console.log(deepEqual([], [])); // true
console.log(deepEqual([1, 2, 3], [1, 2, 3])); // true
console.log(deepEqual([1, 2, 3], [3, 2, 1])); // false
console.log(deepEqual([{ a: 1 }], [{ a: 1 }])); // true

console.log("=== 嵌套对象测试 ===");
const obj1 = {
  a: 1,
  b: {
    c: 2,
    d: [3, 4, { e: 5 }],
  },
};

const obj2 = {
  a: 1,
  b: {
    c: 2,
    d: [3, 4, { e: 5 }],
  },
};

console.log(deepEqual(obj1, obj2)); // true

console.log("=== 特殊对象测试 ===");
console.log(deepEqual(new Date("2023-01-01"), new Date("2023-01-01"))); // true
console.log(deepEqual(/abc/g, /abc/g)); // true
console.log(deepEqual(new Map([["a", 1]]), new Map([["a", 1]]))); // true
console.log(deepEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))); // true

console.log("=== 循环引用测试 ===");
const circular1 = { a: 1 };
circular1.self = circular1;

const circular2 = { a: 1 };
circular2.self = circular2;

console.log(deepEqual(circular1, circular2)); // true
```

## 进阶考虑

### 1. 函数比较策略

```javascript
function compareFunctions(fn1, fn2) {
  // 策略1: 只比较引用
  if (fn1 === fn2) return true;

  // 策略2: 比较函数源码（不推荐，因为格式可能不同）
  if (fn1.toString() === fn2.toString()) return true;

  // 策略3: 比较函数名和参数长度
  return fn1.name === fn2.name && fn1.length === fn2.length;
}
```

### 2. 性能监控

```javascript
function deepEqualWithMetrics(obj1, obj2) {
  const start = performance.now();
  let comparisons = 0;

  function deepEqual(a, b, visited = new WeakMap()) {
    comparisons++;
    // ... 比较逻辑
  }

  const result = deepEqual(obj1, obj2);
  const end = performance.now();

  console.log(`比较耗时: ${end - start}ms, 比较次数: ${comparisons}`);
  return result;
}
```

### 3. 自定义比较器

```javascript
function deepEqualWithCustom(obj1, obj2, customComparators = {}) {
  function deepEqual(a, b, visited = new WeakMap()) {
    // 检查是否有自定义比较器
    const type = Object.prototype.toString.call(a);
    if (customComparators[type]) {
      return customComparators[type](a, b, deepEqual);
    }

    // 默认比较逻辑...
  }

  return deepEqual(obj1, obj2);
}

// 使用示例
const customComparators = {
  "[object Date]": (a, b) => Math.abs(a.getTime() - b.getTime()) < 1000, // 1秒内认为相等
  "[object Number]": (a, b) => Math.abs(a - b) < 0.001, // 浮点数精度比较
};

deepEqualWithCustom(obj1, obj2, customComparators);
```

## 相关知识点

- [JavaScript 数据类型](/javascript/data-types.md)
- [类型检测方法](/javascript/type-detection.md)
- [递归与算法](/algorithms/index.md)
- [WeakMap 与垃圾回收](/browser/garbage-collection.md)

## 总结

对象深度对比是一个看似简单但实际复杂的问题，需要考虑：

1. **类型判断** - 准确识别各种数据类型
2. **递归设计** - 处理嵌套结构
3. **边界处理** - null、undefined、NaN 等特殊值
4. **循环引用** - 避免无限递归
5. **性能优化** - 减少不必要的比较
6. **扩展性** - 支持自定义比较逻辑

这个题目能很好地考察候选人的 JavaScript 基础、算法思维和工程实践能力。
