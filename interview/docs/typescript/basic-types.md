# TypeScript 基础类型与语法

## 类型系统概述

TypeScript 的类型系统是其核心特性，它在 JavaScript 的基础上添加了静态类型检查，让我们能在编译时发现潜在的错误。

### 为什么需要类型系统？

```javascript
// JavaScript - 运行时错误
function greet(name) {
  return "Hello, " + name.toUpperCase();
}

greet(42); // 运行时报错：name.toUpperCase is not a function
```

```typescript
// TypeScript - 编译时错误
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}

greet(42); // 编译错误：Argument of type 'number' is not assignable to parameter of type 'string'
```

## 1. 基础类型 🎯

### 原始类型

```typescript
// 字符串类型
let username: string = "Alice";
let message: string = `Hello, ${username}!`;

// 数字类型
let age: number = 25;
let price: number = 99.99;
let binary: number = 0b1010; // 二进制
let octal: number = 0o744; // 八进制
let hex: number = 0xf00d; // 十六进制

// 布尔类型
let isActive: boolean = true;
let isCompleted: boolean = false;

// undefined 和 null
let undefinedValue: undefined = undefined;
let nullValue: null = null;

// void 类型（主要用于函数返回值）
function logMessage(msg: string): void {
  console.log(msg);
}

// never 类型（永不返回的函数）
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // 无限循环
  }
}
```

### 类型推断

```typescript
// TypeScript 可以自动推断类型
let count = 10; // 推断为 number
let name = "Bob"; // 推断为 string
let isValid = true; // 推断为 boolean

// 最佳实践：简单情况下依赖类型推断
let items = [1, 2, 3]; // 推断为 number[]
let user = { name: "Alice", age: 30 }; // 推断为 { name: string; age: number; }
```

## 2. 数组与元组 📊

### 数组类型

```typescript
// 数组类型的两种写法
let numbers: number[] = [1, 2, 3, 4, 5];
let strings: Array<string> = ["apple", "banana", "orange"];

// 多维数组
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// 混合类型数组（联合类型）
let mixedArray: (string | number)[] = ["hello", 42, "world", 100];

// 只读数组
let readonlyNumbers: readonly number[] = [1, 2, 3];
// readonlyNumbers.push(4); // 错误：Property 'push' does not exist on type 'readonly number[]'

// 使用 ReadonlyArray 泛型
let readonlyStrings: ReadonlyArray<string> = ["a", "b", "c"];
```

### 元组类型

```typescript
// 元组：固定长度和类型的数组
let person: [string, number] = ["Alice", 30];
let coordinate: [number, number] = [10, 20];

// 访问元组元素
console.log(person[0]); // "Alice" (string)
console.log(person[1]); // 30 (number)

// 解构元组
let [name, age] = person;

// 可选元素
let optionalTuple: [string, number?] = ["Bob"]; // age 是可选的

// 剩余元素
let restTuple: [string, ...number[]] = ["Alice", 1, 2, 3, 4];

// 只读元组
let readonlyTuple: readonly [string, number] = ["Bob", 25];

// 具名元组（TypeScript 4.0+）
let namedTuple: [name: string, age: number] = ["Charlie", 35];
```

## 3. 对象类型 🏗️

### 对象字面量类型

```typescript
// 对象类型注解
let user: { name: string; age: number; email: string } = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
};

// 可选属性
let partialUser: { name: string; age?: number } = {
  name: "Bob",
  // age 是可选的
};

// 只读属性
let config: { readonly apiUrl: string; timeout: number } = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};
// config.apiUrl = "new url"; // 错误：Cannot assign to 'apiUrl' because it is a read-only property

// 索引签名
let scores: { [subject: string]: number } = {
  math: 95,
  english: 88,
  science: 92,
};

// 混合索引签名
let mixedObject: {
  name: string;
  [key: string]: any;
} = {
  name: "Alice",
  age: 30,
  isActive: true,
};
```

### 接口定义

```typescript
// 使用接口定义对象类型
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // 可选属性
  isActive: boolean;
}

// 使用接口
let user1: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  isActive: true,
};

// 接口继承
interface AdminUser extends User {
  permissions: string[];
  lastLogin: Date;
}

let admin: AdminUser = {
  id: 2,
  name: "Bob",
  email: "bob@example.com",
  isActive: true,
  permissions: ["read", "write", "delete"],
  lastLogin: new Date(),
};

// 接口合并
interface Product {
  name: string;
  price: number;
}

interface Product {
  category: string;
}

// 合并后的 Product 接口包含所有属性
let product: Product = {
  name: "Laptop",
  price: 999,
  category: "Electronics",
};
```

## 4. 函数类型 🔧

### 函数声明与表达式

```typescript
// 函数声明
function add(x: number, y: number): number {
  return x + y;
}

// 函数表达式
let multiply = function (x: number, y: number): number {
  return x * y;
};

// 箭头函数
let divide = (x: number, y: number): number => x / y;

// 完整的函数类型
let subtract: (x: number, y: number) => number = (x, y) => x - y;
```

### 可选参数与默认参数

```typescript
// 可选参数
function greet(name: string, greeting?: string): string {
  if (greeting) {
    return `${greeting}, ${name}!`;
  }
  return `Hello, ${name}!`;
}

console.log(greet("Alice")); // "Hello, Alice!"
console.log(greet("Bob", "Hi")); // "Hi, Bob!"

// 默认参数
function createUser(name: string, age: number = 18, isActive: boolean = true) {
  return { name, age, isActive };
}

console.log(createUser("Charlie")); // { name: "Charlie", age: 18, isActive: true }
console.log(createUser("David", 25)); // { name: "David", age: 25, isActive: true }

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4, 5)); // 15
```

### 函数重载

```typescript
// 函数重载声明
function process(value: string): string;
function process(value: number): number;
function process(value: boolean): boolean;

// 函数实现
function process(value: string | number | boolean): string | number | boolean {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else if (typeof value === "number") {
    return value * 2;
  } else {
    return !value;
  }
}

// 使用
console.log(process("hello")); // "HELLO"
console.log(process(5)); // 10
console.log(process(true)); // false

// 更复杂的重载示例
interface User {
  id: number;
  name: string;
}

function getUser(id: number): User;
function getUser(name: string): User;
function getUser(idOrName: number | string): User {
  if (typeof idOrName === "number") {
    // 根据 ID 查找用户
    return { id: idOrName, name: "User" + idOrName };
  } else {
    // 根据名称查找用户
    return { id: 1, name: idOrName };
  }
}
```

## 5. 联合类型与交叉类型 🔗

### 联合类型

```typescript
// 联合类型：可以是多种类型中的一种
type Status = "pending" | "approved" | "rejected";
type ID = string | number;

let currentStatus: Status = "pending";
let userId: ID = "user123";
let productId: ID = 12345;

// 函数中的联合类型
function formatId(id: string | number): string {
  if (typeof id === "string") {
    return id.toUpperCase();
  } else {
    return id.toString();
  }
}

// 数组联合类型
let mixedArray: (string | number)[] = ["hello", 42, "world", 100];

// 对象联合类型
type Dog = {
  type: "dog";
  breed: string;
  bark(): void;
};

type Cat = {
  type: "cat";
  color: string;
  meow(): void;
};

type Pet = Dog | Cat;

function handlePet(pet: Pet) {
  // 类型守卫
  if (pet.type === "dog") {
    console.log(`This is a ${pet.breed} dog`);
    pet.bark();
  } else {
    console.log(`This is a ${pet.color} cat`);
    pet.meow();
  }
}
```

### 交叉类型

```typescript
// 交叉类型：合并多个类型
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

// 交叉类型
type Duck = Flyable & Swimmable;

let duck: Duck = {
  fly() {
    console.log("Flying...");
  },
  swim() {
    console.log("Swimming...");
  },
};

// 对象类型的交叉
type PersonalInfo = {
  name: string;
  age: number;
};

type ContactInfo = {
  email: string;
  phone: string;
};

type FullProfile = PersonalInfo & ContactInfo;

let profile: FullProfile = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
  phone: "123-456-7890",
};
```

## 6. 字面量类型 📝

### 字符串字面量类型

```typescript
// 字符串字面量类型
type Theme = "light" | "dark";
type Size = "small" | "medium" | "large";

let currentTheme: Theme = "light";
let buttonSize: Size = "medium";

// 函数中使用字面量类型
function setTheme(theme: Theme): void {
  document.body.className = theme;
}

setTheme("dark"); // ✅
// setTheme("blue"); // ❌ 错误：Argument of type '"blue"' is not assignable to parameter of type 'Theme'
```

### 数字字面量类型

```typescript
// 数字字面量类型
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatus = 200 | 404 | 500;

let roll: DiceRoll = 4;
let status: HttpStatus = 200;

// 混合字面量类型
type Config = {
  env: "development" | "production" | "test";
  port: 3000 | 8080;
  debug: true | false;
};
```

### 模板字面量类型

```typescript
// 模板字面量类型（TypeScript 4.1+）
type Greeting = `Hello, ${string}!`;

let greeting1: Greeting = "Hello, World!"; // ✅
let greeting2: Greeting = "Hello, TypeScript!"; // ✅
// let greeting3: Greeting = "Hi, there!"; // ❌

// 更复杂的模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">; // "onClick"
type ChangeEvent = EventName<"change">; // "onChange"

// 实际应用示例
type CSSProperty = "width" | "height" | "color";
type CSSPropertyWithUnit = `${CSSProperty}${"px" | "%" | "em"}`;

let cssValue: CSSPropertyWithUnit = "widthpx"; // ✅
```

## 7. 枚举类型 🏷️

### 数字枚举

```typescript
// 数字枚举
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

let dir: Direction = Direction.Up;
console.log(dir); // 0
console.log(Direction[0]); // "Up"

// 自定义起始值
enum Status {
  Pending = 1,
  Approved, // 2
  Rejected, // 3
}

// 自定义所有值
enum HttpStatusCode {
  OK = 200,
  NotFound = 404,
  InternalServerError = 500,
}
```

### 字符串枚举

```typescript
// 字符串枚举
enum Theme {
  Light = "light",
  Dark = "dark",
  Auto = "auto",
}

let currentTheme: Theme = Theme.Dark;
console.log(currentTheme); // "dark"

// 混合枚举（不推荐）
enum Mixed {
  No = 0,
  Yes = "yes",
}
```

### 常量枚举

```typescript
// 常量枚举（编译时内联）
const enum Colors {
  Red = "red",
  Green = "green",
  Blue = "blue",
}

let color = Colors.Red; // 编译后直接替换为 "red"

// 计算枚举成员
enum FileAccess {
  None,
  Read = 1 << 1, // 2
  Write = 1 << 2, // 4
  ReadWrite = Read | Write, // 6
  G = "123".length, // 3
}
```

## 8. 类型断言 ⚡

### 类型断言语法

```typescript
// 角括号语法
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

// as 语法（推荐，JSX 中必须使用）
let someValue2: any = "this is a string";
let strLength2: number = (someValue2 as string).length;

// DOM 元素类型断言
let inputElement = document.getElementById("user-input") as HTMLInputElement;
inputElement.value = "Hello TypeScript";

// 非空断言操作符
function processUser(user: User | null) {
  // 我们确信 user 不为 null
  console.log(user!.name);
}
```

### 类型断言的最佳实践

```typescript
// ❌ 错误的类型断言
let num: number = 42;
// let str: string = num as string; // 运行时错误

// ✅ 正确的类型断言
let value: unknown = "hello";
if (typeof value === "string") {
  let str: string = value; // 类型守卫，无需断言
}

// ✅ 合理的类型断言
interface ApiResponse {
  data: any;
}

function processApiResponse(response: ApiResponse) {
  // 我们知道 data 的具体结构
  let users = response.data as User[];
  return users.map((user) => user.name);
}

// 双重断言（尽量避免）
let value2: string = "hello";
let num2: number = value2 as any as number; // 危险！
```

## 9. 实战示例 🎮

### 用户管理系统

```typescript
// 定义用户相关类型
type UserRole = "admin" | "user" | "guest";
type UserStatus = "active" | "inactive" | "pending";

interface BaseUser {
  readonly id: number;
  username: string;
  email: string;
  createdAt: Date;
}

interface User extends BaseUser {
  role: UserRole;
  status: UserStatus;
  profile?: UserProfile;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}

// 用户管理类
class UserManager {
  private users: User[] = [];

  // 添加用户
  addUser(userData: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      id: this.generateId(),
      createdAt: new Date(),
      ...userData,
    };

    this.users.push(newUser);
    return newUser;
  }

  // 查找用户
  findUser(id: number): User | undefined;
  findUser(username: string): User | undefined;
  findUser(idOrUsername: number | string): User | undefined {
    if (typeof idOrUsername === "number") {
      return this.users.find((user) => user.id === idOrUsername);
    } else {
      return this.users.find((user) => user.username === idOrUsername);
    }
  }

  // 更新用户状态
  updateUserStatus(userId: number, status: UserStatus): boolean {
    const user = this.findUser(userId);
    if (user) {
      user.status = status;
      return true;
    }
    return false;
  }

  // 获取活跃用户
  getActiveUsers(): User[] {
    return this.users.filter((user) => user.status === "active");
  }

  private generateId(): number {
    return this.users.length > 0
      ? Math.max(...this.users.map((u) => u.id)) + 1
      : 1;
  }
}

// 使用示例
const userManager = new UserManager();

const newUser = userManager.addUser({
  username: "alice",
  email: "alice@example.com",
  role: "user",
  status: "active",
  profile: {
    firstName: "Alice",
    lastName: "Johnson",
  },
});

console.log(newUser);
```

### 配置管理系统

```typescript
// 环境配置类型
type Environment = "development" | "staging" | "production";

// 数据库配置
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

// API 配置
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  apiKey?: string;
}

// 应用配置
interface AppConfig {
  env: Environment;
  debug: boolean;
  database: DatabaseConfig;
  api: ApiConfig;
  features: {
    [featureName: string]: boolean;
  };
}

// 配置验证函数
function validateConfig(config: Partial<AppConfig>): config is AppConfig {
  return !!(
    config.env &&
    config.database &&
    config.api &&
    typeof config.debug === "boolean"
  );
}

// 配置管理器
class ConfigManager {
  private config: AppConfig;

  constructor(config: Partial<AppConfig>) {
    if (!validateConfig(config)) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  getConfig(): Readonly<AppConfig> {
    return Object.freeze({ ...this.config });
  }

  getDatabaseConfig(): DatabaseConfig {
    return { ...this.config.database };
  }

  getApiConfig(): ApiConfig {
    return { ...this.config.api };
  }

  isFeatureEnabled(featureName: string): boolean {
    return this.config.features[featureName] || false;
  }

  isProduction(): boolean {
    return this.config.env === "production";
  }
}

// 使用示例
const config = new ConfigManager({
  env: "development",
  debug: true,
  database: {
    host: "localhost",
    port: 5432,
    username: "dev_user",
    password: "dev_password",
    database: "myapp_dev",
  },
  api: {
    baseUrl: "http://localhost:3000/api",
    timeout: 5000,
    retries: 3,
  },
  features: {
    newDashboard: true,
    betaFeature: false,
  },
});
```

## 💡 最佳实践

### 1. 类型注解的使用原则

```typescript
// ✅ 好的实践
let count = 0; // 依赖类型推断
let users: User[] = []; // 空数组需要显式类型
let callback: (error: Error | null, data?: any) => void; // 复杂类型需要注解

// ❌ 避免的做法
let name: string = "Alice"; // 不必要的类型注解
let isActive: boolean = true; // 类型推断已经足够
```

### 2. 接口 vs 类型别名

```typescript
// ✅ 使用接口定义对象结构
interface User {
  id: number;
  name: string;
}

// ✅ 使用类型别名定义联合类型
type Status = "active" | "inactive";
type ID = string | number;

// ✅ 接口可以扩展
interface AdminUser extends User {
  permissions: string[];
}

// ✅ 类型别名适合复杂类型操作
type PartialUser = Partial<User>;
type UserKeys = keyof User;
```

### 3. 严格模式配置

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                 // 启用所有严格检查
    "noImplicitAny": true,         // 禁止隐式 any
    "strictNullChecks": true,      // 严格空值检查
    "strictFunctionTypes": true,   // 严格函数类型检查
    "noImplicitReturns": true,     // 确保函数有返回值
    "noUnusedLocals": true,        // 检查未使用的局部变量
    "noUnusedParameters": true     // 检查未使用的参数
  }
}
```

---

🎯 **下一步**: 掌握了基础类型后，建议学习 [高级类型与泛型](./advanced-types.md) 来深入理解 TypeScript 的强大功能！
