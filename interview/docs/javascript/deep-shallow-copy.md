# JavaScript 深浅拷贝 - 彻底理解

## 核心概念概述

**浅拷贝**：创建一个新对象，但对象的属性值是原始对象属性值的拷贝。如果属性值是引用类型，则拷贝的是引用地址。

**深拷贝**：创建一个新对象，并递归拷贝所有层级的属性，包括嵌套的对象和数组。

**引用传递**：JavaScript 中对象是通过引用传递的，多个变量可能指向同一个对象。

## 1. 理解拷贝的必要性 🔍

### 引用类型的问题

```javascript
// 直接赋值 - 引用传递
const original = {
  name: "Alice",
  age: 25,
  hobbies: ["reading", "coding"],
  address: {
    city: "Beijing",
    street: "123 Main St",
  },
};

const copied = original; // 只是复制了引用

// 修改 copied 会影响 original
copied.name = "Bob";
copied.hobbies.push("gaming");
copied.address.city = "Shanghai";

console.log("Original:", original);
// {
//   name: 'Bob',           // 被修改了
//   age: 25,
//   hobbies: ['reading', 'coding', 'gaming'], // 被修改了
//   address: { city: 'Shanghai', street: '123 Main St' } // 被修改了
// }

console.log("Copied:", copied);
// 完全相同，因为指向同一个对象

console.log("引用相等:", original === copied); // true

// 数组的引用问题
const originalArray = [1, 2, [3, 4]];
const copiedArray = originalArray;

copiedArray[0] = 999;
copiedArray[2][0] = 999;

console.log("Original Array:", originalArray); // [999, 2, [999, 4]]
console.log("Copied Array:", copiedArray); // [999, 2, [999, 4]]
```

### 为什么需要拷贝

```javascript
// 实际应用场景：状态管理
class UserManager {
  constructor() {
    this.users = [];
  }

  // 错误的做法：直接返回内部数组
  getUsersBad() {
    return this.users; // 外部可以直接修改内部状态
  }

  // 正确的做法：返回拷贝
  getUsersGood() {
    return [...this.users]; // 浅拷贝，防止直接修改
  }

  // 对于复杂对象，需要深拷贝
  getUsersDeep() {
    return this.users.map((user) => ({ ...user })); // 针对简单对象的浅拷贝
  }
}

const userManager = new UserManager();
userManager.users.push({ id: 1, name: "Alice" });

// 危险的操作
const badUsers = userManager.getUsersBad();
badUsers.push({ id: 2, name: "Hacker" }); // 直接修改了内部状态

// 安全的操作
const goodUsers = userManager.getUsersGood();
goodUsers.push({ id: 3, name: "Bob" }); // 不会影响内部状态

console.log("Internal users:", userManager.users);
```

## 2. 浅拷贝的实现方式 📄

### Object.assign()

```javascript
const original = {
  name: "Alice",
  age: 25,
  hobbies: ["reading", "coding"],
  address: {
    city: "Beijing",
  },
};

// Object.assign 浅拷贝
const shallowCopy1 = Object.assign({}, original);

// 修改第一层属性
shallowCopy1.name = "Bob";
console.log("Original name:", original.name); // 'Alice' - 未受影响

// 修改嵌套对象
shallowCopy1.address.city = "Shanghai";
console.log("Original city:", original.address.city); // 'Shanghai' - 受影响

// 修改数组
shallowCopy1.hobbies.push("gaming");
console.log("Original hobbies:", original.hobbies); // ['reading', 'coding', 'gaming'] - 受影响

console.log("地址引用相等:", original.address === shallowCopy1.address); // true
```

### 展开运算符（...）

```javascript
const original = {
  name: "Alice",
  age: 25,
  hobbies: ["reading", "coding"],
  address: {
    city: "Beijing",
  },
};

// 展开运算符浅拷贝
const shallowCopy2 = { ...original };

// 同样的问题：嵌套对象仍然是引用
shallowCopy2.name = "Charlie"; // 不影响原对象
shallowCopy2.address.city = "Guangzhou"; // 影响原对象

console.log("Original after spread:", original);

// 数组的展开运算符
const originalArray = [1, 2, [3, 4], { name: "nested" }];
const shallowCopyArray = [...originalArray];

shallowCopyArray[0] = 999; // 不影响原数组
shallowCopyArray[2][0] = 999; // 影响原数组
shallowCopyArray[3].name = "modified"; // 影响原数组

console.log("Original array:", originalArray);
```

### Array 浅拷贝方法

```javascript
const originalArray = [1, 2, [3, 4], { name: "object" }];

// 1. 展开运算符
const copy1 = [...originalArray];

// 2. Array.from()
const copy2 = Array.from(originalArray);

// 3. slice()
const copy3 = originalArray.slice();

// 4. concat()
const copy4 = [].concat(originalArray);

// 5. map() 返回新数组
const copy5 = originalArray.map((item) => item);

// 测试浅拷贝效果
copy1[2][0] = 999;
console.log("Original array after modification:", originalArray[2]); // [999, 4]

// 对比不同方法的性能
function performanceTest() {
  const largeArray = new Array(100000)
    .fill(0)
    .map((_, i) => ({ id: i, value: i * 2 }));

  console.time("Spread operator");
  const spreadCopy = [...largeArray];
  console.timeEnd("Spread operator");

  console.time("Array.from");
  const fromCopy = Array.from(largeArray);
  console.timeEnd("Array.from");

  console.time("slice");
  const sliceCopy = largeArray.slice();
  console.timeEnd("slice");
}

// performanceTest();
```

### 手写浅拷贝

```javascript
// 手写对象浅拷贝
function shallowCopy(obj) {
  // 基本类型直接返回
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  // 数组处理
  if (Array.isArray(obj)) {
    return obj.slice();
  }

  // 对象处理
  const copy = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = obj[key];
    }
  }

  return copy;
}

// 更完整的浅拷贝实现
function completeShallowCopy(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理正则
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map((item) => item);
  }

  // 处理普通对象
  const copy = {};

  // 拷贝可枚举属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = obj[key];
    }
  }

  // 拷贝 Symbol 属性
  const symbols = Object.getOwnPropertySymbols(obj);
  symbols.forEach((symbol) => {
    copy[symbol] = obj[symbol];
  });

  return copy;
}

// 测试手写浅拷贝
const testObj = {
  string: "hello",
  number: 42,
  boolean: true,
  date: new Date(),
  regex: /test/g,
  array: [1, 2, 3],
  nested: { a: 1, b: 2 },
  [Symbol("test")]: "symbol value",
};

const copied = completeShallowCopy(testObj);
console.log("手写浅拷贝结果:", copied);
console.log("嵌套对象引用相等:", testObj.nested === copied.nested); // true
```

## 3. 深拷贝的实现方式 📋

### JSON 方法（简单但有限制）

```javascript
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
};

// JSON 深拷贝
const deepCopy1 = JSON.parse(JSON.stringify(original));

// 修改深层嵌套对象
deepCopy1.address.details.street = "456 New St";
console.log("Original street:", original.address.details.street); // 未受影响

// JSON 方法的限制
const problematicObj = {
  date: new Date(),
  regex: /test/g,
  func: function () {
    return "hello";
  },
  symbol: Symbol("test"),
  undefined: undefined,
  null: null,
  nan: NaN,
  infinity: Infinity,
};

const jsonCopy = JSON.parse(JSON.stringify(problematicObj));
console.log("JSON 拷贝结果:", jsonCopy);
// {
//   date: "2023-01-01T00:00:00.000Z",  // 变成字符串
//   regex: {},                         // 变成空对象
//   // func 丢失
//   // symbol 丢失
//   // undefined 丢失
//   null: null,                        // 保持
//   nan: null,                         // 变成 null
//   infinity: null                     // 变成 null
// }

// 循环引用问题
const circularObj = { name: "test" };
circularObj.self = circularObj;

try {
  JSON.parse(JSON.stringify(circularObj));
} catch (error) {
  console.log("JSON 无法处理循环引用:", error.message);
}
```

### Lodash 深拷贝

```javascript
// 如果使用 Lodash
// const _ = require('lodash');

// const original = {
//   date: new Date(),
//   regex: /test/g,
//   func: function() { return 'hello'; },
//   nested: { a: { b: { c: 1 } } }
// };

// const deepCopy = _.cloneDeep(original);
// console.log('Lodash 深拷贝:', deepCopy);
```

### 手写深拷贝（完整版）

```javascript
// 完整的深拷贝实现
function deepClone(obj, hash = new WeakMap()) {
  // null 或基本类型
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  let cloneObj;

  // 处理各种对象类型
  const objType = Object.prototype.toString.call(obj);

  switch (objType) {
    case "[object Date]":
      cloneObj = new Date(obj);
      break;

    case "[object RegExp]":
      cloneObj = new RegExp(obj);
      break;

    case "[object Array]":
      cloneObj = [];
      hash.set(obj, cloneObj);
      obj.forEach((item, index) => {
        cloneObj[index] = deepClone(item, hash);
      });
      break;

    case "[object Object]":
      cloneObj = {};
      hash.set(obj, cloneObj);

      // 拷贝可枚举属性
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloneObj[key] = deepClone(obj[key], hash);
        }
      }

      // 拷贝 Symbol 属性
      const symbols = Object.getOwnPropertySymbols(obj);
      symbols.forEach((symbol) => {
        cloneObj[symbol] = deepClone(obj[symbol], hash);
      });
      break;

    case "[object Map]":
      cloneObj = new Map();
      hash.set(obj, cloneObj);
      obj.forEach((value, key) => {
        cloneObj.set(deepClone(key, hash), deepClone(value, hash));
      });
      break;

    case "[object Set]":
      cloneObj = new Set();
      hash.set(obj, cloneObj);
      obj.forEach((value) => {
        cloneObj.add(deepClone(value, hash));
      });
      break;

    case "[object Function]":
      // 函数克隆（简化处理）
      cloneObj = function () {
        return obj.apply(this, arguments);
      };
      break;

    default:
      // 其他类型直接赋值或使用构造函数
      cloneObj = obj;
  }

  return cloneObj;
}

// 测试深拷贝
const complexObj = {
  // 基本类型
  string: "hello",
  number: 42,
  boolean: true,
  null: null,
  undefined: undefined,

  // 引用类型
  date: new Date("2023-01-01"),
  regex: /test/gi,
  array: [1, 2, [3, 4]],

  // 嵌套对象
  nested: {
    level2: {
      level3: {
        value: "deep",
      },
    },
  },

  // 集合类型
  map: new Map([
    ["key1", "value1"],
    ["key2", { nested: "value" }],
  ]),
  set: new Set([1, 2, 3, { obj: "in set" }]),

  // 函数
  func: function (x) {
    return x * 2;
  },

  // Symbol 属性
  [Symbol("test")]: "symbol value",
};

// 添加循环引用
complexObj.circular = complexObj;
complexObj.nested.backRef = complexObj;

const clonedObj = deepClone(complexObj);

// 验证深拷贝效果
console.log("原对象和克隆对象相等:", complexObj === clonedObj); // false
console.log("嵌套对象独立:", complexObj.nested === clonedObj.nested); // false
console.log("循环引用处理:", clonedObj.circular === clonedObj); // true

// 修改克隆对象不影响原对象
clonedObj.nested.level2.level3.value = "modified";
console.log("原对象值:", complexObj.nested.level2.level3.value); // 'deep'
console.log("克隆对象值:", clonedObj.nested.level2.level3.value); // 'modified'
```

### 性能优化版深拷贝

```javascript
// 针对性能优化的深拷贝
function optimizedDeepClone(obj) {
  // 快速路径：基本类型
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 使用栈而非递归，避免栈溢出
  const stack = [{ parent: null, key: null, data: obj }];
  const map = new WeakMap();
  let root = null;

  while (stack.length > 0) {
    const { parent, key, data } = stack.pop();

    let cloneData;

    if (map.has(data)) {
      cloneData = map.get(data);
    } else {
      const type = Object.prototype.toString.call(data);

      switch (type) {
        case "[object Array]":
          cloneData = [];
          map.set(data, cloneData);

          data.forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              stack.push({ parent: cloneData, key: index, data: item });
            } else {
              cloneData[index] = item;
            }
          });
          break;

        case "[object Object]":
          cloneData = {};
          map.set(data, cloneData);

          for (const k in data) {
            if (data.hasOwnProperty(k)) {
              const value = data[k];
              if (typeof value === "object" && value !== null) {
                stack.push({ parent: cloneData, key: k, data: value });
              } else {
                cloneData[k] = value;
              }
            }
          }
          break;

        case "[object Date]":
          cloneData = new Date(data);
          break;

        case "[object RegExp]":
          cloneData = new RegExp(data);
          break;

        default:
          cloneData = data;
      }
    }

    if (parent) {
      parent[key] = cloneData;
    } else {
      root = cloneData;
    }
  }

  return root;
}

// 性能测试
function performanceComparison() {
  const testData = {
    level1: {
      level2: {
        level3: {
          array: new Array(1000).fill(0).map((_, i) => ({
            id: i,
            value: `item-${i}`,
            nested: { count: i * 2 },
          })),
        },
      },
    },
  };

  console.time("JSON.parse/stringify");
  JSON.parse(JSON.stringify(testData));
  console.timeEnd("JSON.parse/stringify");

  console.time("递归深拷贝");
  deepClone(testData);
  console.timeEnd("递归深拷贝");

  console.time("优化深拷贝");
  optimizedDeepClone(testData);
  console.timeEnd("优化深拷贝");
}

// performanceComparison();
```

## 4. 实际应用场景 🚀

### React/Vue 状态管理

```javascript
// React 状态更新（需要不可变性）
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Build app", completed: false },
      ],
    };
  }

  // 错误的做法：直接修改状态
  toggleTodoBad(id) {
    const todo = this.state.todos.find((t) => t.id === id);
    todo.completed = !todo.completed; // 直接修改
    this.setState({ todos: this.state.todos }); // React 可能不会重新渲染
  }

  // 正确的做法：创建新的状态
  toggleTodoGood(id) {
    this.setState({
      todos: this.state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed } // 浅拷贝
          : todo
      ),
    });
  }

  // 深层嵌套状态更新
  updateNestedState(userId, newProfile) {
    this.setState((prevState) => ({
      users: {
        ...prevState.users, // 浅拷贝第一层
        [userId]: {
          ...prevState.users[userId], // 浅拷贝用户对象
          profile: {
            ...prevState.users[userId].profile, // 浅拷贝 profile
            ...newProfile, // 合并新的 profile 数据
          },
        },
      },
    }));
  }
}

// Redux reducer 示例
function todosReducer(state = [], action) {
  switch (action.type) {
    case "ADD_TODO":
      // 返回新数组，不修改原数组
      return [...state, action.payload];

    case "TOGGLE_TODO":
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );

    case "UPDATE_TODO_NESTED":
      return state.map((todo) =>
        todo.id === action.id
          ? {
              ...todo,
              metadata: {
                ...todo.metadata,
                ...action.payload,
              },
            }
          : todo
      );

    default:
      return state;
  }
}
```

### 表单数据处理

```javascript
// 表单数据深拷贝处理
class FormManager {
  constructor(initialData) {
    this.originalData = deepClone(initialData);
    this.currentData = deepClone(initialData);
    this.isDirty = false;
  }

  // 更新字段值
  updateField(path, value) {
    const keys = path.split(".");
    const newData = deepClone(this.currentData);

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    this.currentData = newData;
    this.checkDirty();
  }

  // 检查是否有修改
  checkDirty() {
    this.isDirty = !this.deepEqual(this.originalData, this.currentData);
  }

  // 重置表单
  reset() {
    this.currentData = deepClone(this.originalData);
    this.isDirty = false;
  }

  // 保存更改
  save() {
    this.originalData = deepClone(this.currentData);
    this.isDirty = false;
  }

  // 深度比较
  deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}

// 使用示例
const formData = {
  user: {
    name: "Alice",
    email: "alice@example.com",
    profile: {
      bio: "Software Developer",
      preferences: {
        theme: "dark",
        notifications: true,
      },
    },
  },
};

const formManager = new FormManager(formData);

// 更新嵌套字段
formManager.updateField("user.profile.preferences.theme", "light");
console.log("Form is dirty:", formManager.isDirty); // true

// 重置更改
formManager.reset();
console.log("Form is dirty after reset:", formManager.isDirty); // false
```

### API 数据缓存

```javascript
// 缓存管理器
class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  // 设置缓存（深拷贝确保数据独立）
  set(key, data, ttl = 5 * 60 * 1000) {
    // 默认5分钟
    const cacheItem = {
      data: deepClone(data), // 深拷贝存储
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(key, cacheItem);
  }

  // 获取缓存（深拷贝确保返回独立数据）
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 返回深拷贝，防止外部修改缓存数据
    return deepClone(item.data);
  }

  // 更新缓存
  update(key, updater) {
    const data = this.get(key);
    if (data) {
      const updatedData = updater(data);
      this.set(key, updatedData);
      return updatedData;
    }
    return null;
  }
}

// 使用示例
const cache = new CacheManager();

const userData = {
  id: 1,
  name: "Alice",
  posts: [{ id: 101, title: "First Post", comments: [] }],
};

// 缓存用户数据
cache.set("user:1", userData);

// 获取缓存数据
const cachedUser = cache.get("user:1");
cachedUser.posts[0].comments.push({ id: 1, text: "Great post!" });

// 原始缓存数据不受影响
const freshUser = cache.get("user:1");
console.log("原始缓存数据:", freshUser.posts[0].comments.length); // 0
console.log("修改后的数据:", cachedUser.posts[0].comments.length); // 1
```

## 5. 拷贝方法选择指南 📝

### 性能对比分析

```javascript
// 性能测试函数
function performanceTest() {
  // 准备测试数据
  const simpleObj = { a: 1, b: 2, c: 3 };
  const complexObj = {
    level1: {
      level2: {
        level3: {
          array: new Array(1000)
            .fill(0)
            .map((_, i) => ({ id: i, value: `item-${i}` })),
        },
      },
    },
  };

  const iterations = 10000;

  // 浅拷贝性能测试
  console.log("=== 浅拷贝性能测试 ===");

  console.time("Object.assign");
  for (let i = 0; i < iterations; i++) {
    Object.assign({}, simpleObj);
  }
  console.timeEnd("Object.assign");

  console.time("Spread operator");
  for (let i = 0; i < iterations; i++) {
    const copy = { ...simpleObj };
  }
  console.timeEnd("Spread operator");

  // 深拷贝性能测试
  console.log("\n=== 深拷贝性能测试 ===");

  const smallIterations = 1000;

  console.time("JSON.parse/stringify");
  for (let i = 0; i < smallIterations; i++) {
    JSON.parse(JSON.stringify(complexObj));
  }
  console.timeEnd("JSON.parse/stringify");

  console.time("手写深拷贝");
  for (let i = 0; i < smallIterations; i++) {
    deepClone(complexObj);
  }
  console.timeEnd("手写深拷贝");
}

// performanceTest();
```

### 方法选择决策树

```javascript
// 拷贝方法选择函数
function chooseCopyMethod(obj, requirements = {}) {
  const {
    needDeep = false, // 是否需要深拷贝
    hasFunction = false, // 是否包含函数
    hasSymbol = false, // 是否包含 Symbol
    hasCircular = false, // 是否有循环引用
    needPerformance = false, // 是否要求高性能
    supportAllTypes = false, // 是否需要支持所有类型
  } = requirements;

  // 浅拷贝
  if (!needDeep) {
    if (Array.isArray(obj)) {
      return {
        method: "Spread Operator",
        code: "[...array]",
        implementation: () => [...obj],
      };
    } else {
      return {
        method: "Object Spread",
        code: "{...object}",
        implementation: () => ({ ...obj }),
      };
    }
  }

  // 深拷贝
  if (needDeep) {
    // 简单对象，高性能要求
    if (needPerformance && !hasFunction && !hasSymbol && !hasCircular) {
      return {
        method: "JSON Method",
        code: "JSON.parse(JSON.stringify(obj))",
        implementation: () => JSON.parse(JSON.stringify(obj)),
      };
    }

    // 复杂对象，需要完整支持
    if (supportAllTypes || hasFunction || hasSymbol || hasCircular) {
      return {
        method: "Custom Deep Clone",
        code: "deepClone(obj)",
        implementation: () => deepClone(obj),
      };
    }

    // 中等复杂度
    return {
      method: "Structured Clone (if available)",
      code: "structuredClone(obj)",
      implementation: () => {
        if (typeof structuredClone !== "undefined") {
          return structuredClone(obj);
        } else {
          return deepClone(obj);
        }
      },
    };
  }
}

// 使用示例
const testCases = [
  {
    name: "简单对象浅拷贝",
    obj: { a: 1, b: 2 },
    requirements: { needDeep: false },
  },
  {
    name: "嵌套对象深拷贝",
    obj: { a: { b: { c: 1 } } },
    requirements: { needDeep: true, needPerformance: true },
  },
  {
    name: "包含函数的对象",
    obj: { func: () => {}, value: 42 },
    requirements: { needDeep: true, hasFunction: true },
  },
];

testCases.forEach(({ name, obj, requirements }) => {
  const recommendation = chooseCopyMethod(obj, requirements);
  console.log(`${name}: 推荐使用 ${recommendation.method}`);
  console.log(`代码: ${recommendation.code}\n`);
});
```

## 6. 常见陷阱与解决方案 ⚠️

### 陷阱 1：浅拷贝的误区

```javascript
// 误以为这样是深拷贝
const original = {
  user: { name: "Alice" },
  settings: { theme: "dark" },
};

const wrong = { ...original }; // 只是浅拷贝
wrong.user.name = "Bob";
console.log(original.user.name); // 'Bob' - 原对象被修改

// 正确的做法
const correct = {
  ...original,
  user: { ...original.user },
  settings: { ...original.settings },
};

correct.user.name = "Charlie";
console.log(original.user.name); // 'Bob' - 原对象未被修改
```

### 陷阱 2：数组嵌套对象

```javascript
// 数组中的对象仍然是引用
const originalUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const copiedUsers = [...originalUsers]; // 浅拷贝数组
copiedUsers[0].name = "Modified Alice";

console.log(originalUsers[0].name); // 'Modified Alice' - 原数组被影响

// 正确的做法：深拷贝数组元素
const correctCopy = originalUsers.map((user) => ({ ...user }));
correctCopy[0].name = "Correct Alice";
console.log(originalUsers[0].name); // 'Modified Alice' - 不再被影响
```

### 陷阱 3：循环引用检测不足

```javascript
// 简单的循环引用检测
function detectCircular(obj, seen = new Set()) {
  if (obj === null || typeof obj !== "object") {
    return false;
  }

  if (seen.has(obj)) {
    return true;
  }

  seen.add(obj);

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && detectCircular(obj[key], seen)) {
      return true;
    }
  }

  seen.delete(obj);
  return false;
}

// 安全的深拷贝
function safeDeepClone(obj) {
  if (detectCircular(obj)) {
    console.warn("检测到循环引用，使用专门的深拷贝方法");
    return deepClone(obj); // 使用支持循环引用的版本
  } else {
    return JSON.parse(JSON.stringify(obj)); // 使用高性能的 JSON 方法
  }
}
```

## 面试重点总结 🎯

### 必须掌握的核心概念

1. **浅拷贝 vs 深拷贝**

   - 区别和适用场景
   - 实现方法和性能对比
   - 实际应用中的选择

2. **常见拷贝方法**

   - Object.assign、展开运算符
   - JSON.parse/stringify 的限制
   - 手写深拷贝的实现

3. **实际应用场景**
   - React/Vue 状态管理
   - 防止意外修改
   - 缓存和数据隔离

### 常考面试题类型

```javascript
// 1. 基础概念
// 解释浅拷贝和深拷贝的区别

// 2. 实现题
// 手写一个深拷贝函数

// 3. 场景题
// React 中为什么需要不可变性？

// 4. 陷阱题
// 以下代码的输出是什么？
const a = { x: { y: 1 } };
const b = { ...a };
b.x.y = 2;
console.log(a.x.y); // ?

// 5. 性能优化
// 如何选择合适的拷贝方法？
```

### 记忆要点

- **浅拷贝**：复制一层，引用类型仍共享
- **深拷贝**：递归复制，完全独立
- **JSON 方法**：简单快速，但有类型限制
- **手写实现**：完整功能，处理所有情况

掌握深浅拷贝是理解 JavaScript 对象管理的关键！
