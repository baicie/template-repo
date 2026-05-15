# TypeScript 工程化实践

## 项目配置 ⚙️

### TSConfig 完整配置

```json
{
  "compilerOptions": {
    // 基本选项
    "target": "ES2020", // 编译目标版本
    "module": "ESNext", // 模块系统
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 包含的库文件
    "moduleResolution": "node", // 模块解析策略
    "allowJs": true, // 允许编译 JS 文件
    "checkJs": false, // 检查 JS 文件中的错误
    "jsx": "react-jsx", // JSX 编译方式
    "declaration": true, // 生成声明文件
    "declarationMap": true, // 生成声明文件的 source map
    "sourceMap": true, // 生成 source map
    "outDir": "./dist", // 输出目录
    "rootDir": "./src", // 根目录
    "removeComments": true, // 删除注释
    "importHelpers": true, // 从 tslib 导入辅助工具函数
    "downlevelIteration": true, // 为旧版本提供迭代器支持
    "isolatedModules": true, // 确保每个文件都可以安全地转译

    // 严格检查选项
    "strict": true, // 启用所有严格类型检查选项
    "noImplicitAny": true, // 禁止隐式 any 类型
    "strictNullChecks": true, // 启用严格的 null 检查
    "strictFunctionTypes": true, // 启用严格的函数类型检查
    "strictBindCallApply": true, // 启用严格的 bind/call/apply 检查
    "strictPropertyInitialization": true, // 启用严格的属性初始化检查
    "noImplicitThis": true, // 禁止 this 有隐式的 any 类型
    "alwaysStrict": true, // 以严格模式解析并为每个源文件生成 "use strict"

    // 额外检查选项
    "noUnusedLocals": true, // 检查未使用的局部变量
    "noUnusedParameters": true, // 检查未使用的参数
    "noImplicitReturns": true, // 检查函数是否有返回值
    "noFallthroughCasesInSwitch": true, // 检查 switch 语句的 fallthrough
    "noUncheckedIndexedAccess": true, // 检查索引访问的安全性
    "exactOptionalPropertyTypes": true, // 精确可选属性类型

    // 模块解析选项
    "baseUrl": "./", // 基础目录
    "paths": {
      // 路径映射
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"], // 类型声明文件目录
    "types": ["node", "jest", "react"], // 包含的类型声明
    "allowSyntheticDefaultImports": true, // 允许合成默认导入
    "esModuleInterop": true, // 启用 ES 模块互操作
    "preserveSymlinks": true, // 保留符号链接
    "allowUmdGlobalAccess": true, // 允许访问 UMD 全局变量

    // Source Map 选项
    "sourceRoot": "", // 源文件根目录
    "mapRoot": "", // source map 文件根目录
    "inlineSourceMap": false, // 内联 source map
    "inlineSources": false, // 内联源代码

    // 实验性选项
    "experimentalDecorators": true, // 启用装饰器
    "emitDecoratorMetadata": true, // 为装饰器生成元数据

    // 高级选项
    "skipLibCheck": true, // 跳过库文件的类型检查
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "resolveJsonModule": true, // 支持导入 JSON 文件
    "incremental": true, // 启用增量编译
    "tsBuildInfoFile": "./dist/.tsbuildinfo" // 增量编译信息文件位置
  },

  "include": ["src/**/*", "tests/**/*", "*.config.ts"],

  "exclude": ["node_modules", "dist", "build", "**/*.test.ts", "**/*.spec.ts"],

  // 项目引用（用于 monorepo）
  "references": [{ "path": "../shared" }, { "path": "../utils" }]
}
```

### 环境特定配置

```json
// tsconfig.dev.json - 开发环境
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,
    "removeComments": false,
    "noEmit": true,
    "incremental": true
  },
  "include": [
    "src/**/*",
    "tests/**/*",
    "dev/**/*"
  ]
}

// tsconfig.prod.json - 生产环境
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "declaration": true,
    "declarationMap": false
  },
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts",
    "dev/**/*",
    "tests/**/*"
  ]
}

// tsconfig.test.json - 测试环境
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom"],
    "module": "CommonJS",
    "target": "ES2018"
  },
  "include": [
    "src/**/*",
    "tests/**/*",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

## 代码组织与架构 🏗️

### 目录结构最佳实践

```
src/
├── components/          # 组件
│   ├── common/         # 通用组件
│   │   ├── Button/
│   │   │   ├── index.ts
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   ├── Button.styles.ts
│   │   │   └── Button.test.tsx
│   │   └── index.ts
│   ├── layout/         # 布局组件
│   └── pages/          # 页面组件
├── hooks/              # 自定义 Hooks
├── services/           # API 服务
├── stores/             # 状态管理
├── utils/              # 工具函数
├── types/              # 类型定义
│   ├── api.ts         # API 相关类型
│   ├── common.ts      # 通用类型
│   ├── components.ts  # 组件类型
│   └── index.ts       # 类型导出
├── constants/          # 常量定义
├── assets/            # 静态资源
└── styles/            # 样式文件
```

### 类型定义组织

```typescript
// types/common.ts - 通用类型
export type ID = string | number;

export interface BaseEntity {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type Status = "idle" | "loading" | "success" | "error";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// types/api.ts - API 相关类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiRequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
}

// types/user.ts - 用户相关类型
export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  profile?: UserProfile;
}

export type UserRole = "admin" | "moderator" | "user";
export type UserStatus = "active" | "inactive" | "suspended";

export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest
  extends Partial<Omit<User, "id" | "createdAt" | "updatedAt">> {}

// types/components.ts - 组件类型
export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface InputProps {
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}

// types/index.ts - 统一导出
export * from "./common";
export * from "./api";
export * from "./user";
export * from "./components";
```

### 服务层架构

```typescript
// services/base.service.ts - 基础服务类
export abstract class BaseService {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  protected async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...config.headers };

    try {
      const response = await fetch(url, {
        method: config.method || "GET",
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  protected get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  protected post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", data });
  }

  protected put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", data });
  }

  protected delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// services/user.service.ts - 用户服务
class UserService extends BaseService {
  constructor() {
    super("/api/users");
  }

  async getUsers(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await this.get<PaginatedResponse<User>>("", params);
    return response.data;
  }

  async getUserById(id: ID): Promise<User> {
    const response = await this.get<User>(`/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.post<User>("", userData);
    return response.data;
  }

  async updateUser(id: ID, userData: UpdateUserRequest): Promise<User> {
    const response = await this.put<User>(`/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: ID): Promise<boolean> {
    await this.delete(`/${id}`);
    return true;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.get<User[]>("/search", { q: query });
    return response.data;
  }
}

export const userService = new UserService();
```

### 自定义 Hooks

```typescript
// hooks/useApi.ts - API 请求 Hook
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, dependencies);

  React.useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

// hooks/useLocalStorage.ts - 本地存储 Hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// hooks/useDebounce.ts - 防抖 Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// hooks/usePagination.ts - 分页 Hook
export function usePagination<T>(
  fetchFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  initialParams: Partial<PaginationParams> = {}
) {
  const [params, setParams] = React.useState<PaginationParams>({
    page: 1,
    limit: 10,
    ...initialParams,
  });

  const { data, loading, error, refetch } = useApi(
    () => fetchFn(params),
    [params]
  );

  const goToPage = React.useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const changeLimit = React.useCallback((limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const sort = React.useCallback(
    (sortBy: string, sortOrder: "asc" | "desc" = "asc") => {
      setParams((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
    },
    []
  );

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: params.page,
    limit: params.limit,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    goToPage,
    changeLimit,
    sort,
    refetch,
  };
}
```

## 构建与编译 🔨

### Webpack 集成

```javascript
// webpack.config.js
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true, // 仅转译，类型检查交给 ForkTsCheckerWebpackPlugin
              configFile: "tsconfig.json",
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: "tsconfig.json",
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
};
```

### Vite 集成

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@utils": resolve(__dirname, "src/utils"),
      "@types": resolve(__dirname, "src/types"),
    },
  },

  build: {
    target: "es2020",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["lodash", "date-fns"],
        },
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
});
```

### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
  },

  plugins: ["@typescript-eslint", "react", "react-hooks"],

  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],

  rules: {
    // TypeScript 规则
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",

    // React 规则
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // 通用规则
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
  },

  settings: {
    react: {
      version: "detect",
    },
  },
};
```

## 测试配置 🧪

### Jest 配置

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // 模块路径映射
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
  },

  // 设置文件
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  // 覆盖率配置
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/setupTests.ts",
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // TypeScript 配置
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },

  // 测试文件模式
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{ts,tsx}",
  ],

  // 转换配置
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
```

### 测试工具类型

```typescript
// src/test-utils.tsx - 测试工具
import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

// 创建测试用的 QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// 自定义渲染函数
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialEntries = ["/"],
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Mock 类型
export type MockedFunction<T extends (...args: any[]) => any> =
  jest.MockedFunction<T>;

// 创建 Mock 服务
export function createMockService<T extends Record<string, any>>(
  service: T
): { [K in keyof T]: MockedFunction<T[K]> } {
  const mockedService = {} as { [K in keyof T]: MockedFunction<T[K]> };

  for (const key in service) {
    if (typeof service[key] === "function") {
      mockedService[key] = jest.fn() as MockedFunction<T[K]>;
    }
  }

  return mockedService;
}

// 等待异步操作
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 创建测试数据
export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "user",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

### 组件测试示例

```typescript
// components/Button/Button.test.tsx
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders with correct text", () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    renderWithProviders(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies correct variant classes", () => {
    renderWithProviders(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });
});

// hooks/useApi.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useApi } from "./useApi";

describe("useApi Hook", () => {
  it("handles successful API call", async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: "success" });

    const { result } = renderHook(() => useApi(mockApiCall));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: "success" });
    expect(result.current.error).toBe(null);
  });

  it("handles API call errors", async () => {
    const mockError = new Error("API Error");
    const mockApiCall = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApi(mockApiCall));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(mockError);
  });
});
```

## 性能优化 ⚡

### 编译性能优化

```json
// tsconfig.json - 性能优化配置
{
  "compilerOptions": {
    "incremental": true, // 启用增量编译
    "tsBuildInfoFile": "./.tsbuildinfo", // 增量编译信息文件
    "skipLibCheck": true, // 跳过库文件类型检查
    "skipDefaultLibCheck": true, // 跳过默认库文件检查
    "disableSourceOfProjectReferenceRedirect": true, // 禁用项目引用重定向
    "disableSolutionSearching": true, // 禁用解决方案搜索
    "disableReferencedProjectLoad": true // 禁用引用项目加载
  },
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### 代码分割与懒加载

```typescript
// 路由级别的代码分割
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage"));
const UserPage = lazy(() => import("../pages/UserPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));

export function AppRouter() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Suspense>
  );
}

// 组件级别的懒加载
const LazyModal = lazy(() =>
  import("../components/Modal").then((module) => ({
    default: module.Modal,
  }))
);

// 条件懒加载
const AdminPanel = lazy(() =>
  import("../components/AdminPanel").then((module) => ({
    default: module.AdminPanel,
  }))
);

export function Dashboard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div>
      <h1>Dashboard</h1>
      {isAdmin && (
        <Suspense fallback={<div>Loading admin panel...</div>}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  );
}
```

### 类型优化技巧

```typescript
// 使用 const assertions 减少类型推断开销
const themes = ["light", "dark"] as const;
type Theme = (typeof themes)[number]; // "light" | "dark"

// 使用 satisfies 操作符（TypeScript 4.9+）
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} satisfies Record<string, string | number>;

// 优化大型联合类型
type EventType =
  | "user:login"
  | "user:logout"
  | "user:register"
  | "post:create"
  | "post:update"
  | "post:delete";

// 使用映射类型而不是重复定义
type EventHandlers = {
  [K in EventType]: (data: any) => void;
};

// 延迟类型计算
type LazyType<T> = T extends any ? { value: T } : never;

// 使用品牌类型增强类型安全
type UserId = string & { readonly brand: unique symbol };
type PostId = string & { readonly brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}

// 这样可以防止混用不同类型的 ID
function getUser(id: UserId) {
  /* ... */
}
function getPost(id: PostId) {
  /* ... */
}

const userId = createUserId("user-123");
const postId = createPostId("post-456");

getUser(userId); // ✅
// getUser(postId); // ❌ 类型错误
```

---

🎯 **下一步**: 掌握了工程化实践后，建议学习 [TypeScript 面试题集](./interview-questions.md) 来检验和巩固你的 TypeScript 技能！
