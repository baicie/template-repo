# JavaScript 数组方法详解 - 高阶函数掌握

## 核心概念概述

**数组方法**：JavaScript Array 对象提供的用于操作和处理数组的内置方法。

**高阶函数**：接受函数作为参数或返回函数的方法，如 map、filter、reduce 等。

**不变性**：很多数组方法不修改原数组，而是返回新数组，这对于函数式编程很重要。

## 1. 数组遍历方法 🔄

### forEach - 遍历执行

```javascript
// forEach 基础用法
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((item, index, array) => {
  console.log(`索引 ${index}: ${item}`);
});

// forEach 的特点
const fruits = ["apple", "banana", "orange"];

// 1. 无返回值（返回 undefined）
const result = fruits.forEach((fruit) => {
  console.log(fruit);
  return fruit.toUpperCase(); // 这个返回值被忽略
});
console.log("forEach 返回值:", result); // undefined

// 2. 无法使用 break 或 continue
fruits.forEach((fruit, index) => {
  if (fruit === "banana") {
    return; // 相当于 continue，跳过当前迭代
  }
  console.log(`处理: ${fruit}`);
});

// 3. 稀疏数组处理
const sparse = [1, , 3, , 5]; // 稀疏数组
sparse.forEach((item, index) => {
  console.log(`索引 ${index}: ${item}`); // 跳过空位
});

// 实际应用：DOM 操作
const buttons = document.querySelectorAll(".btn");
buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    console.log(`按钮 ${index + 1} 被点击`);
  });
});

// 性能对比：forEach vs for 循环
function performanceTest() {
  const largeArray = new Array(1000000).fill(0).map((_, i) => i);

  console.time("forEach");
  largeArray.forEach((item) => item * 2);
  console.timeEnd("forEach");

  console.time("for loop");
  for (let i = 0; i < largeArray.length; i++) {
    largeArray[i] * 2;
  }
  console.timeEnd("for loop");

  console.time("for...of");
  for (const item of largeArray) {
    item * 2;
  }
  console.timeEnd("for...of");
}

// performanceTest();
```

### map - 映射转换

```javascript
// map 基础用法
const numbers = [1, 2, 3, 4, 5];

// 数字翻倍
const doubled = numbers.map((num) => num * 2);
console.log("原数组:", numbers); // [1, 2, 3, 4, 5]
console.log("翻倍后:", doubled); // [2, 4, 6, 8, 10]

// 对象数组映射
const users = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
  { id: 3, name: "Charlie", age: 35 },
];

// 提取姓名
const names = users.map((user) => user.name);
console.log("姓名列表:", names); // ['Alice', 'Bob', 'Charlie']

// 创建新对象
const userProfiles = users.map((user) => ({
  ...user,
  isAdult: user.age >= 18,
  displayName: `${user.name} (${user.age}岁)`,
}));
console.log("用户资料:", userProfiles);

// 复杂映射：API 数据转换
const apiData = [
  { user_id: 1, first_name: "Alice", last_name: "Smith", birth_year: 1998 },
  { user_id: 2, first_name: "Bob", last_name: "Johnson", birth_year: 1993 },
];

const normalizedUsers = apiData.map((item) => ({
  id: item.user_id,
  name: `${item.first_name} ${item.last_name}`,
  age: new Date().getFullYear() - item.birth_year,
  fullName: `${item.first_name} ${item.last_name}`,
}));

console.log("标准化用户数据:", normalizedUsers);

// 索引的使用
const items = ["a", "b", "c"];
const indexedItems = items.map((item, index) => ({
  id: index,
  value: item,
  position: index + 1,
}));

// 链式调用
const processedNumbers = [1, 2, 3, 4, 5]
  .map((n) => n * 2) // [2, 4, 6, 8, 10]
  .map((n) => n + 1) // [3, 5, 7, 9, 11]
  .map((n) => `数字: ${n}`); // ['数字: 3', '数字: 5', ...]

console.log("链式处理结果:", processedNumbers);

// map 的陷阱
const stringNumbers = ["1", "2", "3"];

// 错误：直接使用 parseInt
const wrongParsed = stringNumbers.map(parseInt);
console.log("错误解析:", wrongParsed); // [1, NaN, NaN]
// 原因：parseInt(string, radix)，map 传递了 index 作为 radix

// 正确：使用箭头函数
const correctParsed = stringNumbers.map((str) => parseInt(str));
console.log("正确解析:", correctParsed); // [1, 2, 3]

// 或者使用 Number
const numberParsed = stringNumbers.map(Number);
console.log("Number 解析:", numberParsed); // [1, 2, 3]
```

## 2. 数组过滤和查找方法 🔍

### filter - 条件过滤

```javascript
// filter 基础用法
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 过滤偶数
const evenNumbers = numbers.filter((num) => num % 2 === 0);
console.log("偶数:", evenNumbers); // [2, 4, 6, 8, 10]

// 过滤奇数
const oddNumbers = numbers.filter((num) => num % 2 !== 0);
console.log("奇数:", oddNumbers); // [1, 3, 5, 7, 9]

// 复杂对象过滤
const products = [
  { id: 1, name: "iPhone", price: 999, category: "electronics", inStock: true },
  { id: 2, name: "Book", price: 29, category: "books", inStock: false },
  {
    id: 3,
    name: "Laptop",
    price: 1299,
    category: "electronics",
    inStock: true,
  },
  { id: 4, name: "Shirt", price: 49, category: "clothing", inStock: true },
];

// 多条件过滤
const availableElectronics = products.filter(
  (product) =>
    product.category === "electronics" &&
    product.inStock &&
    product.price < 1000
);
console.log("可购买的电子产品:", availableElectronics);

// 价格范围过滤
const midRangeProducts = products.filter(
  (product) => product.price >= 30 && product.price <= 100
);

// 动态过滤函数
function createFilter(criteria) {
  return function (items) {
    return items.filter((item) => {
      return Object.keys(criteria).every((key) => {
        if (typeof criteria[key] === "function") {
          return criteria[key](item[key]);
        }
        return item[key] === criteria[key];
      });
    });
  };
}

// 使用动态过滤
const electronicsFilter = createFilter({
  category: "electronics",
  price: (price) => price < 1000,
  inStock: true,
});

const filteredProducts = electronicsFilter(products);
console.log("动态过滤结果:", filteredProducts);

// 实际应用：搜索功能
function searchProducts(products, searchTerm, filters = {}) {
  return products.filter((product) => {
    // 文本搜索
    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // 分类过滤
    const matchesCategory = filters.category
      ? product.category === filters.category
      : true;

    // 价格范围过滤
    const matchesPrice =
      filters.minPrice !== undefined && filters.maxPrice !== undefined
        ? product.price >= filters.minPrice && product.price <= filters.maxPrice
        : true;

    // 库存过滤
    const matchesStock = filters.inStockOnly ? product.inStock : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });
}

// 搜索示例
const searchResults = searchProducts(products, "phone", {
  category: "electronics",
  minPrice: 500,
  maxPrice: 1500,
  inStockOnly: true,
});

console.log("搜索结果:", searchResults);
```

### find 和 findIndex - 查找元素

```javascript
// find 基础用法
const users = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "user" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "user" },
];

// 查找第一个管理员
const admin = users.find((user) => user.role === "admin");
console.log("管理员:", admin);

// 查找指定 ID 的用户
const targetUser = users.find((user) => user.id === 2);
console.log("目标用户:", targetUser);

// 查找不存在的用户
const nonExistent = users.find((user) => user.id === 999);
console.log("不存在的用户:", nonExistent); // undefined

// findIndex 获取索引
const adminIndex = users.findIndex((user) => user.role === "admin");
console.log("管理员索引:", adminIndex); // 0

const nonExistentIndex = users.findIndex((user) => user.id === 999);
console.log("不存在用户的索引:", nonExistentIndex); // -1

// 实际应用：用户管理
class UserManager {
  constructor(users = []) {
    this.users = users;
  }

  // 根据 ID 查找用户
  findById(id) {
    return this.users.find((user) => user.id === id);
  }

  // 根据邮箱查找用户
  findByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  // 更新用户
  updateUser(id, updates) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return null;
  }

  // 删除用户
  deleteUser(id) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
    return null;
  }

  // 检查邮箱是否已存在
  isEmailTaken(email, excludeId = null) {
    return this.users.some(
      (user) => user.email === email && user.id !== excludeId
    );
  }
}

const userManager = new UserManager(users);

// 使用示例
console.log("查找用户:", userManager.findById(2));
console.log("更新用户:", userManager.updateUser(2, { name: "Robert" }));
console.log("邮箱已存在:", userManager.isEmailTaken("alice@example.com"));

// 复杂查找：多条件匹配
function findUserByConditions(users, conditions) {
  return users.find((user) => {
    return Object.keys(conditions).every((key) => {
      if (typeof conditions[key] === "function") {
        return conditions[key](user[key]);
      }
      if (Array.isArray(conditions[key])) {
        return conditions[key].includes(user[key]);
      }
      return user[key] === conditions[key];
    });
  });
}

// 查找活跃的管理员用户
const activeAdmin = findUserByConditions(users, {
  role: ["admin", "moderator"],
  email: (email) => email.includes("@example.com"),
});
```

### some 和 every - 条件检测

```javascript
// some - 检查是否有元素满足条件
const numbers = [1, 2, 3, 4, 5];

const hasEven = numbers.some((num) => num % 2 === 0);
console.log("是否包含偶数:", hasEven); // true

const hasLarge = numbers.some((num) => num > 10);
console.log("是否包含大于10的数:", hasLarge); // false

// every - 检查是否所有元素都满足条件
const allPositive = numbers.every((num) => num > 0);
console.log("是否都是正数:", allPositive); // true

const allEven = numbers.every((num) => num % 2 === 0);
console.log("是否都是偶数:", allEven); // false

// 实际应用：表单验证
const formData = {
  username: "alice123",
  email: "alice@example.com",
  password: "securepass123",
  confirmPassword: "securepass123",
  age: 25,
};

// 验证规则
const validationRules = [
  {
    field: "username",
    test: (value) => value && value.length >= 3,
    message: "用户名至少3个字符",
  },
  {
    field: "email",
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: "邮箱格式不正确",
  },
  {
    field: "password",
    test: (value) => value && value.length >= 8,
    message: "密码至少8个字符",
  },
  {
    field: "confirmPassword",
    test: (value, data) => value === data.password,
    message: "密码确认不匹配",
  },
  {
    field: "age",
    test: (value) => value >= 18,
    message: "年龄必须大于等于18岁",
  },
];

// 验证函数
function validateForm(data, rules) {
  const errors = [];

  // 检查是否有验证失败的字段
  const hasErrors = rules.some((rule) => {
    const isValid = rule.test(data[rule.field], data);
    if (!isValid) {
      errors.push({
        field: rule.field,
        message: rule.message,
      });
    }
    return !isValid;
  });

  // 检查所有必填字段是否都有值
  const requiredFields = ["username", "email", "password"];
  const allRequiredFilled = requiredFields.every(
    (field) => data[field] && data[field].toString().trim() !== ""
  );

  return {
    isValid: !hasErrors && allRequiredFilled,
    errors,
    hasAllRequired: allRequiredFilled,
  };
}

const validation = validateForm(formData, validationRules);
console.log("表单验证结果:", validation);

// 权限检查
const userPermissions = ["read", "write", "delete"];
const requiredPermissions = ["read", "write"];

const hasPermission = requiredPermissions.every((permission) =>
  userPermissions.includes(permission)
);
console.log("用户是否有足够权限:", hasPermission);

// 数组状态检查
const tasks = [
  { id: 1, completed: true },
  { id: 2, completed: false },
  { id: 3, completed: true },
];

const allCompleted = tasks.every((task) => task.completed);
const someCompleted = tasks.some((task) => task.completed);
const noneCompleted = !tasks.some((task) => task.completed);

console.log("所有任务完成:", allCompleted);
console.log("有任务完成:", someCompleted);
console.log("没有任务完成:", noneCompleted);
```

## 3. 数组归约方法 ♻️

### reduce - 强大的归约

```javascript
// reduce 基础用法
const numbers = [1, 2, 3, 4, 5];

// 求和
const sum = numbers.reduce((accumulator, current) => {
  console.log(`累加器: ${accumulator}, 当前值: ${current}`);
  return accumulator + current;
}, 0);
console.log("总和:", sum); // 15

// 求最大值
const max = numbers.reduce((acc, current) => (current > acc ? current : acc));
console.log("最大值:", max); // 5

// 求最小值
const min = numbers.reduce((acc, current) => (current < acc ? current : acc));
console.log("最小值:", min); // 1

// 数组转对象
const users = [
  { id: 1, name: "Alice", role: "admin" },
  { id: 2, name: "Bob", role: "user" },
  { id: 3, name: "Charlie", role: "user" },
];

// 以 ID 为键的对象
const usersById = users.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});
console.log("用户索引:", usersById);

// 分组
const usersByRole = users.reduce((acc, user) => {
  if (!acc[user.role]) {
    acc[user.role] = [];
  }
  acc[user.role].push(user);
  return acc;
}, {});
console.log("按角色分组:", usersByRole);

// 计数
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
const fruitCount = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log("水果计数:", fruitCount);

// 扁平化数组
const nestedArrays = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const flattened = nestedArrays.reduce((acc, current) => {
  return acc.concat(current);
}, []);
console.log("扁平化数组:", flattened);

// 复杂数据处理：订单统计
const orders = [
  { id: 1, userId: 1, amount: 100, status: "completed", items: ["A", "B"] },
  { id: 2, userId: 2, amount: 200, status: "completed", items: ["C"] },
  { id: 3, userId: 1, amount: 150, status: "pending", items: ["A", "D"] },
  { id: 4, userId: 3, amount: 80, status: "completed", items: ["B", "C"] },
];

const orderStats = orders.reduce(
  (acc, order) => {
    // 总销售额
    if (order.status === "completed") {
      acc.totalRevenue += order.amount;
      acc.completedOrders++;
    }

    // 按用户分组
    if (!acc.userOrders[order.userId]) {
      acc.userOrders[order.userId] = [];
    }
    acc.userOrders[order.userId].push(order);

    // 商品计数
    order.items.forEach((item) => {
      acc.itemCount[item] = (acc.itemCount[item] || 0) + 1;
    });

    // 按状态分组
    if (!acc.ordersByStatus[order.status]) {
      acc.ordersByStatus[order.status] = [];
    }
    acc.ordersByStatus[order.status].push(order);

    return acc;
  },
  {
    totalRevenue: 0,
    completedOrders: 0,
    userOrders: {},
    itemCount: {},
    ordersByStatus: {},
  }
);

console.log("订单统计:", orderStats);

// 函数式编程：管道操作
const pipe =
  (...functions) =>
  (initialValue) =>
    functions.reduce((acc, fn) => fn(acc), initialValue);

const processNumbers = pipe(
  (nums) => nums.filter((n) => n > 0),
  (nums) => nums.map((n) => n * 2),
  (nums) => nums.reduce((sum, n) => sum + n, 0)
);

const result = processNumbers([-1, 2, 3, -4, 5]);
console.log("管道处理结果:", result); // 20
```

### reduceRight - 从右归约

```javascript
// reduceRight 从右向左处理
const numbers = [1, 2, 3, 4, 5];

// 从右向左连接字符串
const rightConcat = numbers.reduceRight((acc, current) => {
  console.log(`累加器: "${acc}", 当前值: ${current}`);
  return acc + current.toString();
}, "");
console.log("从右连接:", rightConcat); // "54321"

// 对比从左连接
const leftConcat = numbers.reduce((acc, current) => {
  return acc + current.toString();
}, "");
console.log("从左连接:", leftConcat); // "12345"

// 实际应用：构建嵌套结构
const path = ["user", "profile", "settings", "theme"];

// 从右向左构建嵌套对象
const nestedObject = path.reduceRight((acc, key) => {
  return { [key]: acc };
}, "dark");

console.log("嵌套对象:", nestedObject);
// { user: { profile: { settings: { theme: 'dark' } } } }

// 函数组合（从右向左）
const compose =
  (...functions) =>
  (initialValue) =>
    functions.reduceRight((acc, fn) => fn(acc), initialValue);

const add5 = (x) => x + 5;
const multiply2 = (x) => x * 2;
const subtract3 = (x) => x - 3;

const composedFunction = compose(add5, multiply2, subtract3);
const composedResult = composedFunction(10); // ((10 - 3) * 2) + 5 = 19
console.log("组合函数结果:", composedResult);
```

## 4. 数组修改方法 ✏️

### 修改原数组的方法

```javascript
// push - 末尾添加元素
const fruits = ["apple", "banana"];
const newLength = fruits.push("orange", "grape");
console.log("添加后的数组:", fruits); // ['apple', 'banana', 'orange', 'grape']
console.log("新长度:", newLength); // 4

// pop - 末尾移除元素
const lastFruit = fruits.pop();
console.log("移除的元素:", lastFruit); // 'grape'
console.log("移除后的数组:", fruits); // ['apple', 'banana', 'orange']

// unshift - 开头添加元素
const newLengthUnshift = fruits.unshift("kiwi", "mango");
console.log("开头添加后:", fruits); // ['kiwi', 'mango', 'apple', 'banana', 'orange']
console.log("新长度:", newLengthUnshift); // 5

// shift - 开头移除元素
const firstFruit = fruits.shift();
console.log("移除的首元素:", firstFruit); // 'kiwi'
console.log("移除后的数组:", fruits); // ['mango', 'apple', 'banana', 'orange']

// splice - 万能修改方法
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

// 删除元素
const deleted1 = numbers.splice(2, 2); // 从索引2开始删除2个元素
console.log("删除的元素:", deleted1); // [3, 4]
console.log("删除后的数组:", numbers); // [1, 2, 5, 6, 7, 8]

// 插入元素
numbers.splice(2, 0, "a", "b"); // 在索引2插入元素，不删除
console.log("插入后的数组:", numbers); // [1, 2, 'a', 'b', 5, 6, 7, 8]

// 替换元素
const deleted2 = numbers.splice(2, 2, "x", "y", "z"); // 删除2个，插入3个
console.log("替换的元素:", deleted2); // ['a', 'b']
console.log("替换后的数组:", numbers); // [1, 2, 'x', 'y', 'z', 5, 6, 7, 8]

// reverse - 反转数组
const originalArray = [1, 2, 3, 4, 5];
const reversed = originalArray.reverse();
console.log("反转后:", originalArray); // [5, 4, 3, 2, 1]
console.log("返回值:", reversed); // [5, 4, 3, 2, 1] (同一个数组)
console.log("是否是同一个数组:", originalArray === reversed); // true

// sort - 排序数组
const unsorted = [3, 1, 4, 1, 5, 9, 2, 6];

// 默认排序（字符串排序）
const defaultSorted = [...unsorted].sort();
console.log("默认排序:", defaultSorted); // [1, 1, 2, 3, 4, 5, 6, 9]

// 数字排序
const numberSorted = [...unsorted].sort((a, b) => a - b);
console.log("数字升序:", numberSorted); // [1, 1, 2, 3, 4, 5, 6, 9]

const numberDescSorted = [...unsorted].sort((a, b) => b - a);
console.log("数字降序:", numberDescSorted); // [9, 6, 5, 4, 3, 2, 1, 1]

// 对象数组排序
const people = [
  { name: "Alice", age: 30, score: 85 },
  { name: "Bob", age: 25, score: 92 },
  { name: "Charlie", age: 35, score: 78 },
];

// 按年龄排序
const sortedByAge = [...people].sort((a, b) => a.age - b.age);
console.log("按年龄排序:", sortedByAge);

// 按分数降序排序
const sortedByScore = [...people].sort((a, b) => b.score - a.score);
console.log("按分数排序:", sortedByScore);

// 多级排序
const students = [
  { name: "Alice", grade: "A", age: 20 },
  { name: "Bob", grade: "B", age: 20 },
  { name: "Charlie", grade: "A", age: 19 },
  { name: "David", grade: "B", age: 21 },
];

const multiSorted = [...students].sort((a, b) => {
  // 首先按等级排序
  if (a.grade !== b.grade) {
    return a.grade.localeCompare(b.grade);
  }
  // 等级相同时按年龄排序
  return a.age - b.age;
});
console.log("多级排序:", multiSorted);
```

### 不修改原数组的方法

```javascript
// concat - 连接数组
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const arr3 = [7, 8, 9];

const concatenated = arr1.concat(arr2, arr3);
console.log("原数组1:", arr1); // [1, 2, 3] - 未修改
console.log("连接后:", concatenated); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// 使用展开运算符连接（推荐）
const spreadConcatenated = [...arr1, ...arr2, ...arr3];
console.log("展开连接:", spreadConcatenated);

// slice - 提取子数组
const original = [1, 2, 3, 4, 5, 6, 7, 8];

const sliced1 = original.slice(2, 5); // 从索引2到4（不包含5）
console.log("切片1:", sliced1); // [3, 4, 5]

const sliced2 = original.slice(3); // 从索引3到末尾
console.log("切片2:", sliced2); // [4, 5, 6, 7, 8]

const sliced3 = original.slice(-3); // 从倒数第3个到末尾
console.log("切片3:", sliced3); // [6, 7, 8]

const sliced4 = original.slice(-5, -2); // 从倒数第5个到倒数第2个
console.log("切片4:", sliced4); // [4, 5, 6]

console.log("原数组未变:", original); // [1, 2, 3, 4, 5, 6, 7, 8]

// 实际应用：分页处理
function paginate(array, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: array.slice(startIndex, endIndex),
    currentPage: page,
    totalPages: Math.ceil(array.length / pageSize),
    totalItems: array.length,
    hasNext: endIndex < array.length,
    hasPrev: page > 1,
  };
}

const allItems = Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`);
const page2 = paginate(allItems, 2, 10);
console.log("第2页数据:", page2);

// 数组复制的不同方式
const sourceArray = [1, 2, 3, { nested: "object" }];

// 浅拷贝方法
const copy1 = sourceArray.slice(); // slice()
const copy2 = [...sourceArray]; // 展开运算符
const copy3 = Array.from(sourceArray); // Array.from()
const copy4 = sourceArray.concat(); // concat()

// 验证是否为不同的数组
console.log("slice 拷贝:", copy1 === sourceArray); // false
console.log("spread 拷贝:", copy2 === sourceArray); // false

// 但嵌套对象仍然是引用
console.log("嵌套对象引用:", copy1[3] === sourceArray[3]); // true
```

## 5. 现代数组方法（ES6+）📚

### Array.from - 类数组转换

```javascript
// Array.from 基础用法
const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
const realArray = Array.from(arrayLike);
console.log("类数组转换:", realArray); // ['a', 'b', 'c']

// NodeList 转换
const elements = document.querySelectorAll("div");
const elementArray = Array.from(elements);
// 现在可以使用数组方法
elementArray.forEach((el) => console.log(el.textContent));

// 字符串转数组
const chars = Array.from("hello");
console.log("字符数组:", chars); // ['h', 'e', 'l', 'l', 'o']

// 使用映射函数
const doubled = Array.from([1, 2, 3], (x) => x * 2);
console.log("映射转换:", doubled); // [2, 4, 6]

// 生成序列
const sequence = Array.from({ length: 5 }, (_, i) => i + 1);
console.log("序列生成:", sequence); // [1, 2, 3, 4, 5]

// 生成字母序列
const letters = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);
console.log("字母序列:", letters); // ['A', 'B', 'C', ...]

// Set 和 Map 转换
const uniqueNumbers = new Set([1, 2, 2, 3, 3, 4]);
const arrayFromSet = Array.from(uniqueNumbers);
console.log("Set转数组:", arrayFromSet); // [1, 2, 3, 4]

const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
const arrayFromMap = Array.from(map);
console.log("Map转数组:", arrayFromMap); // [['a', 1], ['b', 2], ['c', 3]]

// 实际应用：表格数据处理
function extractTableData(table) {
  const rows = Array.from(table.querySelectorAll("tr"));

  return rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td, th"));
    return cells.map((cell) => cell.textContent.trim());
  });
}

// 去重并排序
function uniqueAndSort(array) {
  return Array.from(new Set(array)).sort();
}

const mixedArray = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
const uniqueSorted = uniqueAndSort(mixedArray);
console.log("去重排序:", uniqueSorted);
```

### Array.of - 创建数组

```javascript
// Array.of vs Array 构造函数
console.log("Array(3):", Array(3)); // [empty × 3] - 空位数组
console.log("Array.of(3):", Array.of(3)); // [3] - 包含数字3的数组

console.log("Array(1, 2, 3):", Array(1, 2, 3)); // [1, 2, 3]
console.log("Array.of(1, 2, 3):", Array.of(1, 2, 3)); // [1, 2, 3]

// 创建单元素数组
const singleElement = Array.of(42);
console.log("单元素数组:", singleElement); // [42]

// 创建不同类型的数组
const mixedTypes = Array.of("string", 42, true, null, undefined);
console.log("混合类型数组:", mixedTypes);

// 实际应用：工厂函数
function createArray(...elements) {
  return Array.of(...elements);
}

const factoryArray = createArray("a", "b", "c");
console.log("工厂数组:", factoryArray);
```

### flat 和 flatMap - 数组扁平化

```javascript
// flat - 扁平化数组
const nested1 = [1, 2, [3, 4]];
const flattened1 = nested1.flat();
console.log("一层扁平化:", flattened1); // [1, 2, 3, 4]

const nested2 = [1, 2, [3, 4, [5, 6]]];
const flattened2 = nested2.flat(2); // 扁平化2层
console.log("两层扁平化:", flattened2); // [1, 2, 3, 4, 5, 6]

const deepNested = [1, [2, [3, [4, [5]]]]];
const fullyFlattened = deepNested.flat(Infinity); // 完全扁平化
console.log("完全扁平化:", fullyFlattened); // [1, 2, 3, 4, 5]

// flatMap - 映射后扁平化
const sentences = ["Hello world", "How are you", "Fine thanks"];
const words = sentences.flatMap((sentence) => sentence.split(" "));
console.log("句子转单词:", words);
// ['Hello', 'world', 'How', 'are', 'you', 'Fine', 'thanks']

// 等价于 map + flat
const wordsMapFlat = sentences.map((sentence) => sentence.split(" ")).flat();
console.log("map+flat结果:", wordsMapFlat);

// 实际应用：数据处理
const users = [
  { name: "Alice", hobbies: ["reading", "coding"] },
  { name: "Bob", hobbies: ["gaming", "music"] },
  { name: "Charlie", hobbies: ["cooking"] },
];

// 获取所有爱好
const allHobbies = users.flatMap((user) => user.hobbies);
console.log("所有爱好:", allHobbies);

// 获取唯一爱好
const uniqueHobbies = [...new Set(allHobbies)];
console.log("唯一爱好:", uniqueHobbies);

// 复杂数据扁平化
const departments = [
  {
    name: "Engineering",
    teams: [
      { name: "Frontend", members: ["Alice", "Bob"] },
      { name: "Backend", members: ["Charlie", "David"] },
    ],
  },
  {
    name: "Marketing",
    teams: [{ name: "Content", members: ["Eve", "Frank"] }],
  },
];

// 获取所有团队成员
const allMembers = departments
  .flatMap((dept) => dept.teams)
  .flatMap((team) => team.members);
console.log("所有成员:", allMembers);

// 手写 flat 实现
function myFlat(arr, depth = 1) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...myFlat(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

const testNested = [1, [2, [3, [4]]]];
console.log("手写flat:", myFlat(testNested, 2));
```

## 6. 实际应用场景 🎯

### 数据处理管道

```javascript
// 构建数据处理管道
class DataPipeline {
  constructor(data) {
    this.data = data;
  }

  filter(predicate) {
    this.data = this.data.filter(predicate);
    return this;
  }

  map(transform) {
    this.data = this.data.map(transform);
    return this;
  }

  sort(compareFn) {
    this.data = this.data.sort(compareFn);
    return this;
  }

  take(count) {
    this.data = this.data.slice(0, count);
    return this;
  }

  groupBy(keyFn) {
    this.data = this.data.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
    return this;
  }

  result() {
    return this.data;
  }
}

// 使用管道处理电商数据
const products = [
  {
    id: 1,
    name: "iPhone 13",
    price: 999,
    category: "Electronics",
    rating: 4.5,
  },
  {
    id: 2,
    name: "MacBook Pro",
    price: 2499,
    category: "Electronics",
    rating: 4.8,
  },
  { id: 3, name: "Nike Shoes", price: 129, category: "Fashion", rating: 4.2 },
  { id: 4, name: "Book", price: 19, category: "Books", rating: 4.0 },
  { id: 5, name: "iPad", price: 599, category: "Electronics", rating: 4.6 },
];

const topElectronics = new DataPipeline(products)
  .filter((product) => product.category === "Electronics")
  .filter((product) => product.rating >= 4.5)
  .sort((a, b) => b.rating - a.rating)
  .take(3)
  .map((product) => ({
    name: product.name,
    price: `$${product.price}`,
    rating: product.rating,
  }))
  .result();

console.log("顶级电子产品:", topElectronics);
```

### 搜索和排序系统

```javascript
// 高级搜索系统
class SearchEngine {
  constructor(data) {
    this.data = data;
  }

  search(query, options = {}) {
    let results = [...this.data];

    // 文本搜索
    if (query) {
      const searchFields = options.fields || ["name", "description"];
      results = results.filter((item) =>
        searchFields.some(
          (field) =>
            item[field] &&
            item[field].toLowerCase().includes(query.toLowerCase())
        )
      );
    }

    // 价格范围过滤
    if (options.minPrice !== undefined) {
      results = results.filter((item) => item.price >= options.minPrice);
    }
    if (options.maxPrice !== undefined) {
      results = results.filter((item) => item.price <= options.maxPrice);
    }

    // 分类过滤
    if (options.categories && options.categories.length > 0) {
      results = results.filter((item) =>
        options.categories.includes(item.category)
      );
    }

    // 评分过滤
    if (options.minRating !== undefined) {
      results = results.filter((item) => item.rating >= options.minRating);
    }

    // 排序
    if (options.sortBy) {
      results = this.sortResults(results, options.sortBy, options.sortOrder);
    }

    // 分页
    if (options.page && options.pageSize) {
      const startIndex = (options.page - 1) * options.pageSize;
      results = results.slice(startIndex, startIndex + options.pageSize);
    }

    return results;
  }

  sortResults(results, sortBy, order = "asc") {
    return results.sort((a, b) => {
      let comparison = 0;

      if (typeof a[sortBy] === "string") {
        comparison = a[sortBy].localeCompare(b[sortBy]);
      } else {
        comparison = a[sortBy] - b[sortBy];
      }

      return order === "desc" ? -comparison : comparison;
    });
  }

  // 自动完成建议
  getSuggestions(query, limit = 5) {
    if (!query) return [];

    const suggestions = this.data
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.name)
      .slice(0, limit);

    return [...new Set(suggestions)]; // 去重
  }

  // 相关商品推荐
  getRelated(item, limit = 4) {
    return this.data
      .filter(
        (other) => other.id !== item.id && other.category === item.category
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}

// 使用搜索引擎
const searchEngine = new SearchEngine(products);

const searchResults = searchEngine.search("iphone", {
  categories: ["Electronics"],
  minRating: 4.0,
  sortBy: "price",
  sortOrder: "asc",
});

console.log("搜索结果:", searchResults);

const suggestions = searchEngine.getSuggestions("iph");
console.log("搜索建议:", suggestions);
```

### 统计分析工具

```javascript
// 数据统计分析
class Analytics {
  static sum(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
  }

  static average(numbers) {
    return numbers.length > 0 ? this.sum(numbers) / numbers.length : 0;
  }

  static median(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static mode(numbers) {
    const frequency = numbers.reduce((freq, num) => {
      freq[num] = (freq[num] || 0) + 1;
      return freq;
    }, {});

    const maxFreq = Math.max(...Object.values(frequency));
    return Object.keys(frequency)
      .filter((key) => frequency[key] === maxFreq)
      .map(Number);
  }

  static variance(numbers) {
    const avg = this.average(numbers);
    const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2));
    return this.average(squaredDiffs);
  }

  static standardDeviation(numbers) {
    return Math.sqrt(this.variance(numbers));
  }

  static percentile(numbers, percentile) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);

    if (Math.floor(index) === index) {
      return sorted[index];
    } else {
      const lower = sorted[Math.floor(index)];
      const upper = sorted[Math.ceil(index)];
      return lower + (upper - lower) * (index - Math.floor(index));
    }
  }

  static analyze(data, field) {
    const values = data
      .map((item) => item[field])
      .filter((val) => typeof val === "number" && !isNaN(val));

    return {
      count: values.length,
      sum: this.sum(values),
      average: this.average(values),
      median: this.median(values),
      mode: this.mode(values),
      min: Math.min(...values),
      max: Math.max(...values),
      variance: this.variance(values),
      standardDeviation: this.standardDeviation(values),
      percentiles: {
        p25: this.percentile(values, 25),
        p50: this.percentile(values, 50),
        p75: this.percentile(values, 75),
        p90: this.percentile(values, 90),
        p95: this.percentile(values, 95),
      },
    };
  }
}

// 销售数据分析
const salesData = [
  { month: "Jan", sales: 1200, profit: 240 },
  { month: "Feb", sales: 1350, profit: 270 },
  { month: "Mar", sales: 1100, profit: 220 },
  { month: "Apr", sales: 1500, profit: 300 },
  { month: "May", sales: 1450, profit: 290 },
  { month: "Jun", sales: 1600, profit: 320 },
];

const salesAnalysis = Analytics.analyze(salesData, "sales");
const profitAnalysis = Analytics.analyze(salesData, "profit");

console.log("销售额分析:", salesAnalysis);
console.log("利润分析:", profitAnalysis);
```

## 面试重点总结 🎯

### 必须掌握的核心方法

1. **遍历方法**

   - forEach：纯遍历，无返回值
   - map：映射转换，返回新数组
   - filter：条件过滤，返回新数组

2. **查找方法**

   - find/findIndex：查找单个元素
   - some/every：条件检测
   - includes：包含检测

3. **归约方法**

   - reduce/reduceRight：强大的数据处理
   - 掌握累加器模式

4. **现代方法**
   - Array.from：类数组转换
   - flat/flatMap：数组扁平化

### 常考面试题类型

```javascript
// 1. 方法区别
// map vs forEach 的区别？

// 2. 实现原理
// 手写实现 map、filter、reduce

// 3. 性能对比
// 不同遍历方法的性能差异

// 4. 实际应用
// 如何处理复杂的数据转换？

// 5. 陷阱题
// [1,2,3].map(parseInt) 的结果？
```

### 方法速查表

| 方法          | 修改原数组 | 返回值           | 主要用途 |
| ------------- | ---------- | ---------------- | -------- |
| forEach       | ❌         | undefined        | 遍历执行 |
| map           | ❌         | 新数组           | 映射转换 |
| filter        | ❌         | 新数组           | 条件过滤 |
| reduce        | ❌         | 任意值           | 数据归约 |
| find          | ❌         | 元素或 undefined | 查找元素 |
| some/every    | ❌         | boolean          | 条件检测 |
| push/pop      | ✅         | 长度/元素        | 末尾操作 |
| shift/unshift | ✅         | 元素/长度        | 开头操作 |
| splice        | ✅         | 删除的元素       | 万能修改 |
| sort          | ✅         | 排序后数组       | 排序     |
| reverse       | ✅         | 反转后数组       | 反转     |

### 记忆要点

- **不变性原则**：优先使用不修改原数组的方法
- **链式调用**：map、filter、reduce 可以链式组合
- **性能考虑**：大数据量时考虑使用原生 for 循环
- **函数式编程**：善用高阶函数处理复杂逻辑

掌握数组方法是 JavaScript 数据处理的核心技能！
