# TypeScript 高级类型与泛型

## 泛型编程 🧬

泛型是 TypeScript 最强大的特性之一，它允许我们创建可重用的组件，这些组件可以处理多种类型的数据。

### 泛型基础

```typescript
// 基础泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 使用方式
let output1 = identity<string>("hello"); // 明确指定类型
let output2 = identity("world"); // 类型推断

// 泛型数组函数
function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

let firstNumber = getFirstElement([1, 2, 3]); // number | undefined
let firstString = getFirstElement(["a", "b"]); // string | undefined

// 多个泛型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

let stringNumberPair = pair("hello", 42); // [string, number]
let booleanArrayPair = pair(true, [1, 2, 3]); // [boolean, number[]]
```

### 泛型约束

```typescript
// 泛型约束：限制泛型类型
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // ✅ string 有 length 属性
logLength([1, 2, 3]); // ✅ array 有 length 属性
// logLength(123);      // ❌ number 没有 length 属性

// 使用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let person = { name: "Alice", age: 30, email: "alice@example.com" };
let name = getProperty(person, "name"); // string
let age = getProperty(person, "age"); // number
// let invalid = getProperty(person, "invalid"); // ❌ 错误

// 条件约束
function processArray<T extends any[]>(arr: T): T {
  console.log(`Processing array with ${arr.length} elements`);
  return arr;
}
```

### 泛型接口与类

```typescript
// 泛型接口
interface Repository<T> {
  create(item: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<T[]>;
}

// 实现泛型接口
class UserRepository implements Repository<User> {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) throw new Error("User not found");

    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < initialLength;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }
}

// 泛型类
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// 使用泛型类
let numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()); // 2

let stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
```

## 条件类型 🔀

条件类型允许我们根据类型关系来选择类型，类似于三元运算符。

### 基础条件类型

```typescript
// 条件类型语法：T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
type Test3 = IsString<"hello">; // true

// 实用的条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type Test4 = NonNullable<string | null>; // string
type Test5 = NonNullable<number | undefined>; // number
type Test6 = NonNullable<boolean | null | undefined>; // boolean

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Test7 = ReturnType<() => string>; // string
type Test8 = ReturnType<(x: number) => number>; // number
type Test9 = ReturnType<() => void>; // void
```

### 分布式条件类型

```typescript
// 分布式条件类型：当条件类型作用于联合类型时
type ToArray<T> = T extends any ? T[] : never;

type Test10 = ToArray<string | number>; // string[] | number[]

// 实用示例：过滤类型
type Filter<T, U> = T extends U ? T : never;

type Primitive = string | number | boolean | null | undefined;
type Test11 = Filter<string | number | object, Primitive>; // string | number

// 排除类型
type Exclude<T, U> = T extends U ? never : T;
type Test12 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"

// 提取类型
type Extract<T, U> = T extends U ? T : never;
type Test13 = Extract<"a" | "b" | "c", "a" | "b">; // "a" | "b"
```

### infer 关键字

```typescript
// infer 用于在条件类型中推断类型
type GetArrayElementType<T> = T extends (infer U)[] ? U : never;

type Test14 = GetArrayElementType<string[]>; // string
type Test15 = GetArrayElementType<number[]>; // number
type Test16 = GetArrayElementType<string>; // never

// 提取函数参数类型
type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

type Test17 = Parameters<(a: string, b: number) => void>; // [string, number]
type Test18 = Parameters<() => void>; // []

// 提取 Promise 的值类型
type Awaited<T> = T extends Promise<infer U> ? U : T;

type Test19 = Awaited<Promise<string>>; // string
type Test20 = Awaited<Promise<number>>; // number
type Test21 = Awaited<string>; // string

// 复杂的 infer 示例
type GetConstructorParameters<T> = T extends new (...args: infer P) => any
  ? P
  : never;

class User {
  constructor(public name: string, public age: number) {}
}

type UserConstructorParams = GetConstructorParameters<typeof User>; // [string, number]
```

## 映射类型 🗺️

映射类型允许我们基于旧类型创建新类型。

### 基础映射类型

```typescript
// 基础映射类型语法
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

// 使用示例
interface User {
  id: number;
  name: string;
  email?: string;
}

type ReadonlyUser = Readonly<User>;
// {
//   readonly id: number;
//   readonly name: string;
//   readonly email?: string;
// }

type PartialUser = Partial<User>;
// {
//   id?: number;
//   name?: string;
//   email?: string;
// }

type RequiredUser = Required<User>;
// {
//   id: number;
//   name: string;
//   email: string;
// }
```

### 高级映射类型

```typescript
// Pick：选择特定属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type UserBasicInfo = Pick<User, "id" | "name">; // { id: number; name: string; }

// Omit：排除特定属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutId = Omit<User, "id">; // { name: string; email?: string; }

// Record：创建具有指定键值类型的对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type UserRoles = Record<"admin" | "user" | "guest", boolean>;
// {
//   admin: boolean;
//   user: boolean;
//   guest: boolean;
// }

// 键名转换
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type UserGetters = Getters<User>;
// {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string | undefined;
// }

// 条件映射
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

interface Example {
  name: string;
  age: number;
  getName(): string;
  getAge(): number;
}

type ExampleData = NonFunctionProperties<Example>; // { name: string; age: number; }
```

### 模板字面量类型

```typescript
// 模板字面量类型（TypeScript 4.1+）
type EventName<T extends string> = `on${Capitalize<T>}`;
type EventHandler<T extends string> = `handle${Capitalize<T>}`;

type ClickEvent = EventName<"click">; // "onClick"
type ClickHandler = EventHandler<"click">; // "handleClick"

// 复杂的模板字面量类型
type CSSProperties = "margin" | "padding" | "border";
type CSSDirections = "top" | "right" | "bottom" | "left";

type CSSPropertyWithDirection = `${CSSProperties}-${CSSDirections}`;
// "margin-top" | "margin-right" | "margin-bottom" | "margin-left" |
// "padding-top" | "padding-right" | "padding-bottom" | "padding-left" |
// "border-top" | "border-right" | "border-bottom" | "border-left"

// 实际应用：API 路径类型
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiPath = "/users" | "/posts" | "/comments";

type ApiEndpoint = `${HttpMethod} ${ApiPath}`;
// "GET /users" | "GET /posts" | "GET /comments" |
// "POST /users" | "POST /posts" | "POST /comments" | ...

// 解析模板字面量类型
type ParsePath<T extends string> = T extends `/${infer Segment}/${infer Rest}`
  ? [Segment, ...ParsePath<`/${Rest}`>]
  : T extends `/${infer Segment}`
  ? [Segment]
  : [];

type PathSegments = ParsePath<"/api/users/123">; // ["api", "users", "123"]
```

## 工具类型 🛠️

TypeScript 提供了许多内置的工具类型来帮助我们进行类型转换。

### 内置工具类型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
}

// 1. Partial<T> - 所有属性变为可选
type PartialUser = Partial<User>;
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   age?: number;
//   isActive?: boolean;
// }

// 2. Required<T> - 所有属性变为必需
type RequiredUser = Required<User>;
// {
//   id: number;
//   name: string;
//   email: string;
//   age: number;  // 不再可选
//   isActive: boolean;
// }

// 3. Readonly<T> - 所有属性变为只读
type ReadonlyUser = Readonly<User>;

// 4. Pick<T, K> - 选择特定属性
type UserBasicInfo = Pick<User, "id" | "name" | "email">;

// 5. Omit<T, K> - 排除特定属性
type UserWithoutId = Omit<User, "id">;

// 6. Record<K, T> - 创建对象类型
type UserStatus = Record<"active" | "inactive" | "pending", User[]>;

// 7. Exclude<T, U> - 从 T 中排除 U
type NonBooleanTypes = Exclude<string | number | boolean, boolean>; // string | number

// 8. Extract<T, U> - 从 T 中提取 U
type StringOrNumber = Extract<string | number | boolean, string | number>; // string | number

// 9. NonNullable<T> - 排除 null 和 undefined
type NonNullableString = NonNullable<string | null | undefined>; // string

// 10. ReturnType<T> - 获取函数返回类型
function getUser(): User {
  return {} as User;
}
type GetUserReturn = ReturnType<typeof getUser>; // User

// 11. Parameters<T> - 获取函数参数类型
function createUser(name: string, email: string, age?: number): User {
  return {} as User;
}
type CreateUserParams = Parameters<typeof createUser>; // [string, string, number?]

// 12. ConstructorParameters<T> - 获取构造函数参数类型
class UserClass {
  constructor(name: string, email: string) {}
}
type UserConstructorParams = ConstructorParameters<typeof UserClass>; // [string, string]

// 13. InstanceType<T> - 获取构造函数的实例类型
type UserInstance = InstanceType<typeof UserClass>; // UserClass
```

### 自定义工具类型

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface NestedUser {
  id: number;
  profile: {
    name: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
}

type DeepReadonlyUser = DeepReadonly<NestedUser>;
// 所有嵌套属性都变为只读

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepPartialUser = DeepPartial<NestedUser>;
// 所有嵌套属性都变为可选

// 键值对换
type Reverse<T extends Record<keyof T, keyof any>> = {
  [P in T[keyof T]]: {
    [K in keyof T]: T[K] extends P ? K : never;
  }[keyof T];
};

type StatusCodes = {
  OK: 200;
  NOT_FOUND: 404;
  SERVER_ERROR: 500;
};

type CodeToStatus = Reverse<StatusCodes>;
// {
//   200: "OK";
//   404: "NOT_FOUND";
//   500: "SERVER_ERROR";
// }

// 函数重载类型
type Overload<T> = T extends {
  (...args: infer A1): infer R1;
  (...args: infer A2): infer R2;
  (...args: infer A3): infer R3;
}
  ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3]
  : T extends {
      (...args: infer A1): infer R1;
      (...args: infer A2): infer R2;
    }
  ? [(...args: A1) => R1, (...args: A2) => R2]
  : T extends (...args: infer A) => infer R
  ? [(...args: A) => R]
  : never;

// 可选链类型
type OptionalChain<T, K extends keyof T> = T[K] extends object
  ? { [P in keyof T[K]]?: OptionalChain<T[K], P> }
  : T[K];
```

## 类型守卫 🛡️

类型守卫帮助我们在运行时确定变量的具体类型。

### 基础类型守卫

```typescript
// typeof 类型守卫
function processValue(value: string | number) {
  if (typeof value === "string") {
    // 这里 TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  } else {
    // 这里 TypeScript 知道 value 是 number
    console.log(value.toFixed(2));
  }
}

// instanceof 类型守卫
class Dog {
  bark() {
    console.log("Woof!");
  }
}

class Cat {
  meow() {
    console.log("Meow!");
  }
}

function handlePet(pet: Dog | Cat) {
  if (pet instanceof Dog) {
    pet.bark(); // TypeScript 知道这是 Dog
  } else {
    pet.meow(); // TypeScript 知道这是 Cat
  }
}

// in 操作符类型守卫
interface Bird {
  type: "bird";
  fly(): void;
}

interface Fish {
  type: "fish";
  swim(): void;
}

function handleAnimal(animal: Bird | Fish) {
  if ("fly" in animal) {
    animal.fly(); // TypeScript 知道这是 Bird
  } else {
    animal.swim(); // TypeScript 知道这是 Fish
  }
}
```

### 自定义类型守卫

```typescript
// 自定义类型守卫函数
function isString(value: any): value is string {
  return typeof value === "string";
}

function isNumber(value: any): value is number {
  return typeof value === "number";
}

function processUnknownValue(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道 value 是 string
    console.log(value.length);
  } else if (isNumber(value)) {
    // TypeScript 知道 value 是 number
    console.log(value.toFixed(2));
  }
}

// 更复杂的类型守卫
interface User {
  id: number;
  name: string;
  email: string;
}

interface Admin {
  id: number;
  name: string;
  email: string;
  permissions: string[];
}

function isAdmin(user: User | Admin): user is Admin {
  return "permissions" in user;
}

function handleUser(user: User | Admin) {
  if (isAdmin(user)) {
    // TypeScript 知道这是 Admin
    console.log(user.permissions);
  } else {
    // TypeScript 知道这是 User
    console.log(user.name);
  }
}

// 数组类型守卫
function isStringArray(arr: unknown[]): arr is string[] {
  return arr.every((item) => typeof item === "string");
}

function isNumberArray(arr: unknown[]): arr is number[] {
  return arr.every((item) => typeof item === "number");
}

// 对象类型守卫
function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

function processObject(obj: object) {
  if (hasProperty(obj, "name") && typeof obj.name === "string") {
    // TypeScript 知道 obj 有 name 属性且为 string
    console.log(obj.name.toUpperCase());
  }
}
```

### 断言函数

```typescript
// 断言函数（TypeScript 3.7+）
function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function assertIsString(value: any): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Expected string");
  }
}

function assertIsNumber(value: any): asserts value is number {
  if (typeof value !== "number") {
    throw new Error("Expected number");
  }
}

// 使用断言函数
function processValue2(value: unknown) {
  assertIsString(value);
  // 这里 TypeScript 知道 value 是 string
  console.log(value.toUpperCase());
}

// 非空断言函数
function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error("Value is null or undefined");
  }
}

function processUser(user: User | null) {
  assertNonNull(user);
  // 这里 TypeScript 知道 user 不为 null
  console.log(user.name);
}
```

## 实战案例 🎯

### 状态管理器

```typescript
// 状态管理器的类型定义
type StateSelector<T, R> = (state: T) => R;
type StateUpdater<T> = (prevState: T) => T;
type Listener<T> = (state: T) => void;

class StateManager<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(updater: StateUpdater<T> | T): void {
    const newState =
      typeof updater === "function"
        ? (updater as StateUpdater<T>)(this.state)
        : updater;

    if (newState !== this.state) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  select<R>(selector: StateSelector<T, R>): R {
    return selector(this.state);
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

// 使用示例
interface AppState {
  user: User | null;
  theme: "light" | "dark";
  notifications: Notification[];
}

const stateManager = new StateManager<AppState>({
  user: null,
  theme: "light",
  notifications: [],
});

// 订阅状态变化
const unsubscribe = stateManager.subscribe((state) => {
  console.log("State changed:", state);
});

// 更新状态
stateManager.setState((prevState) => ({
  ...prevState,
  theme: "dark",
}));

// 选择部分状态
const currentUser = stateManager.select((state) => state.user);
const notificationCount = stateManager.select(
  (state) => state.notifications.length
);
```

### API 客户端

```typescript
// API 响应类型
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

interface ApiError {
  error: string;
  message: string;
  status: number;
}

// HTTP 方法类型
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// 请求配置
interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// API 客户端类
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...config.headers };

    try {
      const response = await fetch(url, {
        method: config.method || "GET",
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  async post<T, U = any>(
    endpoint: string,
    body: U,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  async put<T, U = any>(
    endpoint: string,
    body: U,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

// 使用示例
const apiClient = new ApiClient("https://api.example.com", {
  "Content-Type": "application/json",
  Authorization: "Bearer token",
});

// 类型安全的 API 调用
interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/users");
  return response.data;
}

async function createUser(userData: Omit<User, "id">): Promise<User> {
  const response = await apiClient.post<User, Omit<User, "id">>(
    "/users",
    userData
  );
  return response.data;
}
```

### 事件系统

```typescript
// 事件类型映射
interface EventMap {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "notification:new": {
    id: string;
    message: string;
    type: "info" | "warning" | "error";
  };
  "theme:change": { theme: "light" | "dark" };
}

// 事件监听器类型
type EventListener<T> = (data: T) => void;

// 事件发射器
class EventEmitter<T extends Record<string, any> = EventMap> {
  private listeners: {
    [K in keyof T]?: Set<EventListener<T[K]>>;
  } = {};

  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event]!.add(listener);

    // 返回取消订阅函数
    return () => {
      this.listeners[event]?.delete(listener);
    };
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      });
    }
  }

  off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): void {
    if (!listener) {
      // 移除所有监听器
      delete this.listeners[event];
    } else {
      // 移除特定监听器
      this.listeners[event]?.delete(listener);
    }
  }

  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): () => void {
    const wrappedListener = (data: T[K]) => {
      listener(data);
      this.off(event, wrappedListener);
    };

    return this.on(event, wrappedListener);
  }
}

// 使用示例
const eventEmitter = new EventEmitter<EventMap>();

// 类型安全的事件监听
const unsubscribeLogin = eventEmitter.on("user:login", (data) => {
  // data 的类型是 { userId: string; timestamp: Date }
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

const unsubscribeNotification = eventEmitter.on("notification:new", (data) => {
  // data 的类型是 { id: string; message: string; type: "info" | "warning" | "error" }
  console.log(`New ${data.type} notification: ${data.message}`);
});

// 类型安全的事件发射
eventEmitter.emit("user:login", {
  userId: "123",
  timestamp: new Date(),
});

eventEmitter.emit("notification:new", {
  id: "notif-1",
  message: "Welcome to the app!",
  type: "info",
});
```

---

🎯 **下一步**: 掌握了高级类型后，建议学习 [TypeScript 工程化](./engineering.md) 来了解如何在实际项目中应用这些高级特性！
