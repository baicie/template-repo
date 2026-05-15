# TypeScript 面试题集

## 基础概念题 🎯

### 1. TypeScript 与 JavaScript 的区别是什么？

**参考答案：**

**核心区别：**

- **类型系统**：TypeScript 是静态类型，JavaScript 是动态类型
- **编译时检查**：TypeScript 在编译时发现错误，JavaScript 在运行时
- **开发体验**：TypeScript 提供更好的 IDE 支持和代码提示
- **向后兼容**：TypeScript 是 JavaScript 的超集，完全兼容

```typescript
// TypeScript - 编译时类型检查
function greet(name: string): string {
  return `Hello, ${name}!`;
}

greet(42); // 编译错误：Argument of type 'number' is not assignable to parameter of type 'string'

// JavaScript - 运行时才发现问题
function greet(name) {
  return `Hello, ${name.toUpperCase()}!`;
}

greet(42); // 运行时错误：name.toUpperCase is not a function
```

**TypeScript 的优势：**

1. **类型安全**：在开发阶段就能发现类型相关的错误
2. **更好的重构支持**：IDE 可以安全地重命名变量和函数
3. **自文档化**：类型本身就是最好的文档
4. **团队协作**：统一的类型规范降低沟通成本

### 2. 什么是类型推断？TypeScript 如何进行类型推断？

**参考答案：**

类型推断是 TypeScript 根据代码上下文自动推断变量类型的能力。

```typescript
// 基础类型推断
let name = "Alice"; // 推断为 string
let age = 30; // 推断为 number
let isActive = true; // 推断为 boolean

// 数组类型推断
let numbers = [1, 2, 3]; // 推断为 number[]
let mixed = [1, "hello", true]; // 推断为 (string | number | boolean)[]

// 对象类型推断
let user = {
  name: "Bob",
  age: 25,
}; // 推断为 { name: string; age: number; }

// 函数返回值推断
function add(a: number, b: number) {
  return a + b; // 推断返回类型为 number
}

// 上下文类型推断
const users: User[] = [
  { name: "Alice", age: 30 }, // 根据数组类型推断对象结构
  { name: "Bob", age: 25 },
];

// 最佳通用类型推断
let items = [1, 2, null]; // 推断为 (number | null)[]
```

**类型推断的规则：**

1. **从右到左**：根据赋值的右侧推断左侧的类型
2. **最佳通用类型**：当有多个候选类型时，选择兼容所有候选类型的类型
3. **上下文类型**：根据表达式所在的位置推断类型

### 3. 解释一下 any、unknown、never 类型的区别

**参考答案：**

```typescript
// any - 任意类型，关闭类型检查
let value: any = 42;
value = "hello";
value = true;
value.foo.bar.baz; // 不会报错，但运行时可能出错

// unknown - 未知类型，类型安全的 any
let userInput: unknown = getUserInput();

// 使用前必须进行类型检查
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase()); // 安全
}

// never - 永不存在的值的类型
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // 永远不会返回
  }
}

// never 在联合类型中会被移除
type Example = string | number | never; // 等同于 string | number
```

**使用场景对比：**

| 类型      | 用途                 | 类型安全 | 使用建议                     |
| --------- | -------------------- | -------- | ---------------------------- |
| `any`     | 关闭类型检查         | ❌       | 避免使用，仅在迁移时临时使用 |
| `unknown` | 表示未知类型         | ✅       | 替代 any，使用前必须类型检查 |
| `never`   | 表示不可达的代码路径 | ✅       | 用于详尽性检查和错误处理     |

### 4. interface 和 type 的区别是什么？什么时候使用哪个？

**参考答案：**

```typescript
// Interface - 用于定义对象结构
interface User {
  id: number;
  name: string;
  email?: string;
}

// Type - 用于定义类型别名
type UserID = string | number;
type Status = "active" | "inactive";

// 相同点：都可以定义对象结构
interface IUser {
  name: string;
}

type TUser = {
  name: string;
};

// 区别1：接口可以扩展，类型别名不能
interface AdminUser extends User {
  permissions: string[];
}

// 类型别名使用交叉类型
type AdminUser2 = User & {
  permissions: string[];
};

// 区别2：接口可以声明合并
interface Window {
  title: string;
}

interface Window {
  version: string;
}

// 合并后的 Window 包含 title 和 version

// 区别3：类型别名可以定义联合类型、基础类型别名
type StringOrNumber = string | number;
type Text = string;

// interface StringOrNumber = string | number; // 错误！

// 区别4：类型别名支持计算属性
type Keys = "name" | "age";
type UserRecord = {
  [K in Keys]: string;
};

// 区别5：类型别名支持条件类型
type NonNullable<T> = T extends null | undefined ? never : T;
```

**使用建议：**

- **Interface**：

  - 定义对象结构
  - 需要扩展或实现
  - 库的公共 API
  - 可能需要声明合并

- **Type**：
  - 联合类型
  - 基础类型别名
  - 计算类型
  - 复杂的类型操作

## 泛型与高级类型 🧬

### 5. 什么是泛型？如何使用泛型约束？

**参考答案：**

泛型允许我们在定义函数、类或接口时使用类型参数，使代码更加灵活和可重用。

```typescript
// 基础泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let stringResult = identity<string>("hello"); // 明确指定类型
let numberResult = identity(42); // 类型推断

// 泛型约束 - extends 关键字
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // ✅ string 有 length
logLength([1, 2, 3]); // ✅ array 有 length
// logLength(123); // ❌ number 没有 length

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 30 };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// getProperty(person, "invalid"); // ❌ 错误

// 条件约束
type ApiResponse<T> = T extends string ? { message: T } : { data: T };

type StringResponse = ApiResponse<string>; // { message: string }
type NumberResponse = ApiResponse<number>; // { data: number }

// 多重约束
function process<T extends string & { length: number }>(value: T): T {
  return value.toUpperCase() as T;
}
```

**泛型的实际应用：**

```typescript
// API 客户端
class ApiClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
  }

  async post<T, U>(url: string, data: U): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

// 使用
const client = new ApiClient();
const users = await client.get<User[]>("/users");
const newUser = await client.post<User, CreateUserRequest>("/users", userData);
```

### 6. 解释条件类型和 infer 关键字

**参考答案：**

条件类型允许根据类型关系选择类型，`infer` 用于在条件类型中推断类型。

```typescript
// 基础条件类型
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<string>; // false

// infer 推断类型
type GetArrayElementType<T> = T extends (infer U)[] ? U : never;

type ElementType = GetArrayElementType<string[]>; // string
type ElementType2 = GetArrayElementType<number[]>; // number

// 提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FuncReturn = MyReturnType<() => string>; // string
type FuncReturn2 = MyReturnType<(x: number) => boolean>; // boolean

// 提取函数参数类型
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type Params = MyParameters<(a: string, b: number) => void>; // [string, number]

// 提取 Promise 的值类型
type Awaited<T> = T extends Promise<infer U> ? U : T;

type PromiseValue = Awaited<Promise<string>>; // string
type NonPromiseValue = Awaited<number>; // number

// 递归条件类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface User {
  name: string;
  profile: {
    age: number;
    settings: {
      theme: string;
    };
  };
}

type ReadonlyUser = DeepReadonly<User>;
// 所有嵌套属性都变为只读

// 实际应用：解析路径参数
type ParseRoute<T> = T extends `/${infer Segment}/${infer Rest}`
  ? [Segment, ...ParseRoute<`/${Rest}`>]
  : T extends `/${infer Segment}`
  ? [Segment]
  : [];

type Route = ParseRoute<"/api/users/123">; // ["api", "users", "123"]
```

### 7. 什么是映射类型？如何创建自定义的工具类型？

**参考答案：**

映射类型允许基于旧类型创建新类型，通过遍历旧类型的属性来构造新类型。

```typescript
// 基础映射类型
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

type MyRequired<T> = {
  [P in keyof T]-?: T[P]; // -? 移除可选修饰符
};

type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 键名转换
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// 条件映射
type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionKeys<T>>;

interface Example {
  name: string;
  age: number;
  getName(): string;
  getAge(): number;
}

type ExampleData = NonFunctionProperties<Example>; // { name: string; age: number }

// 自定义工具类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

interface Mixed {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  onClick: () => void;
}

type StringProps = PickByType<Mixed, string>; // { name: string }
type NonFunctionProps = OmitByType<Mixed, Function>; // 排除函数属性

// 键值互换
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
```

## 实战应用题 💼

### 8. 如何为第三方库编写类型声明文件？

**参考答案：**

```typescript
// 1. 全局声明文件 (global.d.ts)
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: object) => void;
    dataLayer: any[];
  }

  var process: {
    env: {
      NODE_ENV: "development" | "production" | "test";
      API_URL?: string;
    };
  };
}

// 2. 模块声明文件
declare module "my-library" {
  export interface Config {
    apiKey: string;
    timeout?: number;
  }

  export class MyLibrary {
    constructor(config: Config);
    init(): Promise<void>;
    getData<T>(endpoint: string): Promise<T>;
  }

  export default MyLibrary;
}

// 3. 为 CSS 模块声明类型
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

// 4. 为图片资源声明类型
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  import React from "react";
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

// 5. 扩展现有模块
declare module "express" {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}

// 6. 复杂库的类型声明
declare module "chart-library" {
  export type ChartType = "line" | "bar" | "pie";

  export interface ChartData {
    labels: string[];
    datasets: Dataset[];
  }

  export interface Dataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }

  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: {
      x?: ScaleOptions;
      y?: ScaleOptions;
    };
  }

  export interface ScaleOptions {
    display?: boolean;
    title?: {
      display: boolean;
      text: string;
    };
  }

  export class Chart {
    constructor(
      ctx: HTMLCanvasElement | CanvasRenderingContext2D,
      config: {
        type: ChartType;
        data: ChartData;
        options?: ChartOptions;
      }
    );

    update(): void;
    destroy(): void;
    resize(): void;
  }

  export default Chart;
}

// 7. 使用示例
import Chart, { ChartData, ChartOptions } from "chart-library";

const data: ChartData = {
  labels: ["Jan", "Feb", "Mar"],
  datasets: [
    {
      label: "Sales",
      data: [10, 20, 30],
      backgroundColor: "blue",
    },
  ],
};

const options: ChartOptions = {
  responsive: true,
  scales: {
    y: {
      display: true,
      title: {
        display: true,
        text: "Value",
      },
    },
  },
};

const chart = new Chart(canvas, {
  type: "bar",
  data,
  options,
});
```

### 9. 如何实现一个类型安全的事件系统？

**参考答案：**

```typescript
// 事件映射接口
interface EventMap {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "post:create": { postId: string; title: string; authorId: string };
  "post:update": { postId: string; changes: Partial<Post> };
  "notification:new": {
    id: string;
    message: string;
    type: "info" | "warning" | "error";
  };
}

// 事件监听器类型
type EventListener<T> = (data: T) => void | Promise<void>;

// 事件发射器类
class TypedEventEmitter<T extends Record<string, any> = EventMap> {
  private listeners: {
    [K in keyof T]?: Set<EventListener<T[K]>>;
  } = {};

  // 监听事件
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event]!.add(listener);

    // 返回取消监听函数
    return () => {
      this.listeners[event]?.delete(listener);
      if (this.listeners[event]?.size === 0) {
        delete this.listeners[event];
      }
    };
  }

  // 一次性监听
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): () => void {
    const wrappedListener: EventListener<T[K]> = async (data) => {
      await listener(data);
      this.off(event, wrappedListener);
    };

    return this.on(event, wrappedListener);
  }

  // 发射事件
  async emit<K extends keyof T>(event: K, data: T[K]): Promise<void> {
    const eventListeners = this.listeners[event];
    if (!eventListeners) return;

    const promises: Promise<void>[] = [];

    for (const listener of eventListeners) {
      try {
        const result = listener(data);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error);
      }
    }

    // 等待所有异步监听器完成
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  // 移除监听器
  off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): void {
    if (!listener) {
      // 移除所有监听器
      delete this.listeners[event];
    } else {
      // 移除特定监听器
      this.listeners[event]?.delete(listener);
    }
  }

  // 获取监听器数量
  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners[event]?.size || 0;
  }

  // 获取所有事件名
  eventNames(): (keyof T)[] {
    return Object.keys(this.listeners) as (keyof T)[];
  }

  // 移除所有监听器
  removeAllListeners(): void {
    this.listeners = {};
  }
}

// 使用示例
const eventEmitter = new TypedEventEmitter<EventMap>();

// 类型安全的事件监听
const unsubscribeLogin = eventEmitter.on("user:login", (data) => {
  // data 的类型自动推断为 { userId: string; timestamp: Date }
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

const unsubscribeNotification = eventEmitter.on(
  "notification:new",
  async (data) => {
    // data 的类型自动推断为 { id: string; message: string; type: "info" | "warning" | "error" }
    await sendNotificationToUser(data);
  }
);

// 类型安全的事件发射
eventEmitter.emit("user:login", {
  userId: "123",
  timestamp: new Date(),
});

// 编译时类型检查
// eventEmitter.emit("user:login", { userId: 123 }); // ❌ 类型错误
// eventEmitter.emit("invalid:event", {}); // ❌ 事件不存在

// 扩展事件系统
interface ExtendedEventMap extends EventMap {
  "system:shutdown": { reason: string; graceful: boolean };
  "cache:clear": { keys?: string[] };
}

const extendedEmitter = new TypedEventEmitter<ExtendedEventMap>();

// 支持新事件
extendedEmitter.on("system:shutdown", (data) => {
  console.log(
    `System shutting down: ${data.reason}, graceful: ${data.graceful}`
  );
});
```

### 10. 如何实现一个类型安全的状态管理器？

**参考答案：**

```typescript
// 状态类型定义
interface AppState {
  user: {
    id: string | null;
    name: string;
    email: string;
    isAuthenticated: boolean;
  };
  ui: {
    theme: "light" | "dark";
    sidebarOpen: boolean;
    loading: boolean;
  };
  data: {
    posts: Post[];
    comments: Comment[];
    notifications: Notification[];
  };
}

// Action 类型定义
type StateAction<T extends keyof AppState> =
  | {
      type: "SET_STATE";
      payload: {
        key: T;
        value: Partial<AppState[T]>;
      };
    }
  | {
      type: "RESET_STATE";
      payload: {
        key: T;
      };
    }
  | {
      type: "UPDATE_NESTED";
      payload: {
        key: T;
        path: string[];
        value: any;
      };
    };

// 选择器类型
type StateSelector<T, R> = (state: T) => R;

// 监听器类型
type StateListener<T> = (state: T, prevState: T) => void;

// 状态管理器类
class TypedStateManager<T extends Record<string, any>> {
  private state: T;
  private listeners: Set<StateListener<T>> = new Set();
  private initialState: T;

  constructor(initialState: T) {
    this.state = { ...initialState };
    this.initialState = { ...initialState };
  }

  // 获取完整状态
  getState(): T {
    return { ...this.state };
  }

  // 获取特定键的状态
  getStateByKey<K extends keyof T>(key: K): T[K] {
    return { ...this.state[key] };
  }

  // 设置状态
  setState<K extends keyof T>(key: K, value: Partial<T[K]>): void {
    const prevState = { ...this.state };

    this.state = {
      ...this.state,
      [key]: {
        ...this.state[key],
        ...value,
      },
    };

    this.notifyListeners(this.state, prevState);
  }

  // 批量更新状态
  batchUpdate(updates: {
    [K in keyof T]?: Partial<T[K]>;
  }): void {
    const prevState = { ...this.state };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        this.state = {
          ...this.state,
          [key]: {
            ...this.state[key as keyof T],
            ...value,
          },
        };
      }
    }

    this.notifyListeners(this.state, prevState);
  }

  // 重置状态
  resetState<K extends keyof T>(key?: K): void {
    const prevState = { ...this.state };

    if (key) {
      this.state = {
        ...this.state,
        [key]: { ...this.initialState[key] },
      };
    } else {
      this.state = { ...this.initialState };
    }

    this.notifyListeners(this.state, prevState);
  }

  // 选择器
  select<R>(selector: StateSelector<T, R>): R {
    return selector(this.state);
  }

  // 订阅状态变化
  subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  // 创建计算属性
  computed<R>(selector: StateSelector<T, R>): {
    get: () => R;
    subscribe: (listener: (value: R, prevValue: R) => void) => () => void;
  } {
    let currentValue = selector(this.state);
    const computedListeners: Set<(value: R, prevValue: R) => void> = new Set();

    // 订阅状态变化
    this.subscribe((newState, prevState) => {
      const newValue = selector(newState);
      const prevValue = selector(prevState);

      if (newValue !== currentValue) {
        const oldValue = currentValue;
        currentValue = newValue;

        computedListeners.forEach((listener) => {
          listener(newValue, oldValue);
        });
      }
    });

    return {
      get: () => currentValue,
      subscribe: (listener) => {
        computedListeners.add(listener);
        return () => {
          computedListeners.delete(listener);
        };
      },
    };
  }

  // 创建 Action
  createAction<K extends keyof T>(
    key: K,
    actionCreator: (currentState: T[K], globalState: T) => Partial<T[K]>
  ): () => void {
    return () => {
      const currentKeyState = this.state[key];
      const newKeyState = actionCreator(currentKeyState, this.state);
      this.setState(key, newKeyState);
    };
  }

  // 中间件支持
  use(
    middleware: (
      action: { type: string; payload: any },
      state: T,
      next: () => void
    ) => void
  ): void {
    // 中间件实现
  }

  private notifyListeners(newState: T, prevState: T): void {
    this.listeners.forEach((listener) => {
      try {
        listener(newState, prevState);
      } catch (error) {
        console.error("Error in state listener:", error);
      }
    });
  }
}

// 使用示例
const stateManager = new TypedStateManager<AppState>({
  user: {
    id: null,
    name: "",
    email: "",
    isAuthenticated: false,
  },
  ui: {
    theme: "light",
    sidebarOpen: false,
    loading: false,
  },
  data: {
    posts: [],
    comments: [],
    notifications: [],
  },
});

// 类型安全的状态操作
stateManager.setState("user", {
  id: "123",
  name: "Alice",
  isAuthenticated: true,
});

stateManager.setState("ui", {
  theme: "dark",
  sidebarOpen: true,
});

// 批量更新
stateManager.batchUpdate({
  user: { name: "Bob" },
  ui: { loading: true },
});

// 选择器使用
const isAuthenticated = stateManager.select(
  (state) => state.user.isAuthenticated
);
const userName = stateManager.select((state) => state.user.name);

// 计算属性
const userDisplayName = stateManager.computed((state) =>
  state.user.isAuthenticated ? state.user.name : "Guest"
);

console.log(userDisplayName.get()); // 获取当前值

// 订阅计算属性变化
const unsubscribe = userDisplayName.subscribe((newName, oldName) => {
  console.log(`Display name changed from ${oldName} to ${newName}`);
});

// 创建 Action
const loginAction = stateManager.createAction(
  "user",
  (currentUser, globalState) => ({
    isAuthenticated: true,
    id: "new-user-id",
  })
);

const toggleSidebarAction = stateManager.createAction("ui", (currentUI) => ({
  sidebarOpen: !currentUI.sidebarOpen,
}));

// 执行 Action
loginAction();
toggleSidebarAction();

// 订阅全局状态变化
const globalUnsubscribe = stateManager.subscribe((newState, prevState) => {
  console.log("State changed:", {
    from: prevState,
    to: newState,
  });
});
```

---

🎯 **面试技巧总结**：

1. **深度理解概念**：不仅要知道是什么，更要知道为什么
2. **结合实际项目**：用具体的项目经验来说明 TypeScript 的价值
3. **展示编程能力**：准备好手写代码，展示对类型系统的掌握
4. **关注最新特性**：了解 TypeScript 的发展趋势和新特性
5. **性能意识**：了解 TypeScript 编译性能优化技巧

记住，TypeScript 面试不仅考查语法知识，更看重你对类型系统的理解和在实际项目中的应用能力！
