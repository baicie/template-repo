# 前端测试策略 - 单元测试、集成测试、E2E 测试

## 前端测试体系概览

现代前端测试不仅仅是代码验证，更是一套完整的质量保障体系，确保应用的稳定性、可靠性和用户体验。

### 测试金字塔理念 🔺

```
        /\
       /  \
      / E2E \ ← 少量，关键用户流程
     /______\
    /        \
   /Integration\ ← 适量，模块间交互
  /__________\
 /            \
/  Unit Tests  \ ← 大量，函数和组件级别
/______________\
```

**分层策略：**

- **单元测试 (70%)**：快速、独立、大量
- **集成测试 (20%)**：模块交互、API 测试
- **E2E 测试 (10%)**：用户场景、关键流程

## 1. 单元测试 - Jest & React Testing Library 🧪

### Jest 基础配置

```javascript
// jest.config.js
module.exports = {
  // 测试环境
  testEnvironment: "jsdom",

  // 文件匹配模式
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // 模块路径映射
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^components/(.*)$": "<rootDir>/src/components/$1",
  },

  // 设置文件
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  // 覆盖率配置
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/reportWebVitals.ts",
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // 转换配置
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    "^.+\\.css$": "jest-transform-css",
  },

  // 模块文件扩展名
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],

  // 忽略的转换模块
  transformIgnorePatterns: ["node_modules/(?!(axios|some-es6-module)/)"],
};

// setupTests.ts
import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// 配置 Testing Library
configure({ testIdAttribute: "data-testid" });

// 全局 Mock
global.matchMedia =
  global.matchMedia ||
  function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

### React 组件测试实战

```tsx
// Button.tsx - 被测试组件
import React from "react";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled,
  children,
  className = "",
  onClick,
  ...props
}) => {
  const baseClasses = "btn";
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  const loadingClasses = loading ? "btn--loading" : "";

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    loadingClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      data-testid="button"
      {...props}
    >
      {loading && <span data-testid="loading-spinner">Loading...</span>}
      {children}
    </button>
  );
};

// Button.test.tsx - 测试用例
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button Component", () => {
  // 基础渲染测试
  test("renders button with children", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  // 属性测试
  test("applies correct variant classes", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByTestId("button")).toHaveClass("btn--primary");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByTestId("button")).toHaveClass("btn--secondary");

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByTestId("button")).toHaveClass("btn--danger");
  });

  test("applies correct size classes", () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByTestId("button")).toHaveClass("btn--small");

    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByTestId("button")).toHaveClass("btn--medium");

    rerender(<Button size="large">Large</Button>);
    expect(screen.getByTestId("button")).toHaveClass("btn--large");
  });

  // 交互测试
  test("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  // Loading 状态测试
  test("shows loading state correctly", () => {
    render(<Button loading>Loading Button</Button>);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("does not call onClick when loading", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <Button onClick={handleClick} loading>
        Loading
      </Button>
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  // 快照测试
  test("matches snapshot", () => {
    const { container } = render(
      <Button variant="primary" size="large">
        Snapshot Test
      </Button>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### 自定义 Hook 测试

```tsx
// useCounter.ts - 自定义 Hook
import { useState, useCallback } from "react";

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

export const useCounter = (initialValue: number = 0): UseCounterReturn => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback((value: number) => {
    setCount(value);
  }, []);

  return { count, increment, decrement, reset, set };
};

// useCounter.test.ts
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  test("initializes with default value", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  test("initializes with custom value", () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  test("increments count", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  test("decrements count", () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(9);
  });

  test("resets to initial value", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(7);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });

  test("sets specific value", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.set(42);
    });

    expect(result.current.count).toBe(42);
  });
});
```

### 异步操作测试

```tsx
// UserProfile.tsx - 异步组件
import React, { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserProfileProps {
  userId: number;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error">Error: {error}</div>;
  }

  if (!user) {
    return <div data-testid="no-user">User not found</div>;
  }

  return (
    <div data-testid="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

// UserProfile.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("UserProfile", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test("shows loading state initially", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: "John", email: "john@example.com" }),
    } as Response);

    render(<UserProfile userId={1} />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  test("displays user data after successful fetch", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    } as Response);

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
  });

  test("displays error message on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });

    expect(screen.getByText("Error: Network error")).toBeInTheDocument();
  });

  test("displays error for non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });

    expect(screen.getByText("Error: Failed to fetch user")).toBeInTheDocument();
  });
});
```

## 2. 集成测试策略 🔗

### API 集成测试

```typescript
// api/userService.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserData {
  name: string;
  email: string;
}

class UserService {
  private baseUrl = "/api/users";

  async getUsers(): Promise<User[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  }

  async getUser(id: number): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return response.json();
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return response.json();
  }

  async updateUser(
    id: number,
    userData: Partial<CreateUserData>
  ): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return response.json();
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  }
}

export const userService = new UserService();

// userService.test.ts - 集成测试
import { userService } from "./userService";
import { setupServer } from "msw/node";
import { rest } from "msw";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
];

// Mock Service Worker 设置
const server = setupServer(
  rest.get("/api/users", (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  }),

  rest.get("/api/users/:id", (req, res, ctx) => {
    const { id } = req.params;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (!user) {
      return res(ctx.status(404), ctx.json({ error: "User not found" }));
    }

    return res(ctx.json(user));
  }),

  rest.post("/api/users", async (req, res, ctx) => {
    const userData = await req.json();
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
    };

    return res(ctx.json(newUser));
  })
);

describe("UserService Integration Tests", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("fetches all users successfully", async () => {
    const users = await userService.getUsers();

    expect(users).toEqual(mockUsers);
    expect(users).toHaveLength(2);
  });

  test("fetches single user successfully", async () => {
    const user = await userService.getUser(1);

    expect(user).toEqual(mockUsers[0]);
  });

  test("throws error for non-existent user", async () => {
    await expect(userService.getUser(999)).rejects.toThrow(
      "Failed to fetch user"
    );
  });

  test("creates user successfully", async () => {
    const userData = { name: "New User", email: "new@example.com" };
    const newUser = await userService.createUser(userData);

    expect(newUser).toMatchObject(userData);
    expect(newUser.id).toBeDefined();
  });

  test("handles network errors gracefully", async () => {
    server.use(
      rest.get("/api/users", (req, res, ctx) => {
        return res.networkError("Network error");
      })
    );

    await expect(userService.getUsers()).rejects.toThrow();
  });
});
```

### 组件集成测试

```tsx
// UserList.tsx - 复合组件
import React, { useState, useEffect } from "react";
import { userService, User } from "../api/userService";
import { Button } from "./Button";

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getUsers();
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div data-testid="loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div data-testid="error">
        <p>Error: {error}</p>
        <Button onClick={fetchUsers}>Retry</Button>
      </div>
    );
  }

  return (
    <div data-testid="user-list">
      <h2>Users</h2>
      {users.length === 0 ? (
        <p data-testid="no-users">No users found</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id} data-testid={`user-${user.id}`}>
              <span>
                {user.name} - {user.email}
              </span>
              <Button
                variant="danger"
                size="small"
                onClick={() => handleDeleteUser(user.id)}
                data-testid={`delete-${user.id}`}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// UserList.integration.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { UserList } from "./UserList";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
];

const server = setupServer(
  rest.get("/api/users", (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  }),

  rest.delete("/api/users/:id", (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe("UserList Integration", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("loads and displays users", async () => {
    render(<UserList />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("user-list")).toBeInTheDocument();
    });

    expect(screen.getByText("John Doe - john@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("Jane Smith - jane@example.com")
    ).toBeInTheDocument();
  });

  test("deletes user successfully", async () => {
    const user = userEvent.setup();
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByTestId("user-list")).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId("delete-1");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByTestId("user-1")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("user-2")).toBeInTheDocument();
  });

  test("handles API error with retry", async () => {
    const user = userEvent.setup();

    server.use(
      rest.get("/api/users", (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: "Server error" }));
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Error: Failed to fetch users/)
    ).toBeInTheDocument();

    // 恢复正常响应
    server.use(
      rest.get("/api/users", (req, res, ctx) => {
        return res(ctx.json(mockUsers));
      })
    );

    const retryButton = screen.getByText("Retry");
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId("user-list")).toBeInTheDocument();
    });
  });
});
```

## 3. E2E 测试 - Cypress & Playwright 🎭

### Cypress 配置和使用

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // 自定义任务
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },

        // 数据库清理
        clearDatabase() {
          // 清理测试数据库
          return null;
        },
      });

      return config;
    },

    env: {
      apiUrl: "http://localhost:3001/api",
      testUser: {
        email: "test@example.com",
        password: "testpassword",
      },
    },
  },

  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
});

// cypress/support/commands.js - 自定义命令
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("createUser", (userData) => {
  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/users`,
    body: userData,
  });
});

Cypress.Commands.add("cleanupTestData", () => {
  cy.task("clearDatabase");
});

// cypress/e2e/user-management.cy.js
describe("User Management E2E", () => {
  beforeEach(() => {
    cy.cleanupTestData();
    cy.visit("/");
  });

  it("should create a new user", () => {
    // 导航到用户创建页面
    cy.get('[data-testid="nav-users"]').click();
    cy.get('[data-testid="add-user-button"]').click();

    // 填写表单
    cy.get('[data-testid="name-input"]').type("John Doe");
    cy.get('[data-testid="email-input"]').type("john.doe@example.com");
    cy.get('[data-testid="role-select"]').select("User");

    // 提交表单
    cy.get('[data-testid="submit-button"]').click();

    // 验证结果
    cy.get('[data-testid="success-message"]')
      .should("be.visible")
      .and("contain", "User created successfully");

    // 验证用户列表中出现新用户
    cy.get('[data-testid="user-list"]')
      .should("contain", "John Doe")
      .and("contain", "john.doe@example.com");
  });

  it("should edit existing user", () => {
    // 先创建一个用户
    cy.createUser({
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
    });

    cy.visit("/users");

    // 点击编辑按钮
    cy.get('[data-testid="user-jane@example.com"]')
      .find('[data-testid="edit-button"]')
      .click();

    // 修改用户信息
    cy.get('[data-testid="name-input"]').clear().type("Jane Johnson");

    cy.get('[data-testid="role-select"]').select("Admin");

    // 保存更改
    cy.get('[data-testid="save-button"]').click();

    // 验证更改
    cy.get('[data-testid="success-message"]').should(
      "contain",
      "User updated successfully"
    );

    cy.get('[data-testid="user-list"]')
      .should("contain", "Jane Johnson")
      .and("contain", "Admin");
  });

  it("should delete user with confirmation", () => {
    cy.createUser({
      name: "Test User",
      email: "test@example.com",
      role: "User",
    });

    cy.visit("/users");

    // 点击删除按钮
    cy.get('[data-testid="user-test@example.com"]')
      .find('[data-testid="delete-button"]')
      .click();

    // 确认删除对话框
    cy.get('[data-testid="confirm-dialog"]').should("be.visible");
    cy.get('[data-testid="confirm-delete"]').click();

    // 验证用户已删除
    cy.get('[data-testid="success-message"]').should(
      "contain",
      "User deleted successfully"
    );

    cy.get('[data-testid="user-list"]').should("not.contain", "Test User");
  });

  it("should handle form validation errors", () => {
    cy.get('[data-testid="nav-users"]').click();
    cy.get('[data-testid="add-user-button"]').click();

    // 提交空表单
    cy.get('[data-testid="submit-button"]').click();

    // 验证错误消息
    cy.get('[data-testid="name-error"]')
      .should("be.visible")
      .and("contain", "Name is required");

    cy.get('[data-testid="email-error"]')
      .should("be.visible")
      .and("contain", "Email is required");

    // 填写无效邮箱
    cy.get('[data-testid="email-input"]').type("invalid-email");
    cy.get('[data-testid="submit-button"]').click();

    cy.get('[data-testid="email-error"]').should(
      "contain",
      "Invalid email format"
    );
  });
});
```

### Playwright 实现

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "npm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});

// e2e/user-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("User Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    // 清理测试数据
    await page.request.delete("/api/test/cleanup");
    await page.goto("/");
  });

  test("complete user lifecycle", async ({ page }) => {
    // 创建用户
    await page.click('[data-testid="nav-users"]');
    await page.click('[data-testid="add-user-button"]');

    await page.fill('[data-testid="name-input"]', "John Doe");
    await page.fill('[data-testid="email-input"]', "john@example.com");
    await page.selectOption('[data-testid="role-select"]', "User");

    await page.click('[data-testid="submit-button"]');

    // 验证创建成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      "User created successfully"
    );

    // 验证用户出现在列表中
    const userRow = page.locator('[data-testid="user-john@example.com"]');
    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText("John Doe");

    // 编辑用户
    await userRow.locator('[data-testid="edit-button"]').click();
    await page.fill('[data-testid="name-input"]', "John Smith");
    await page.click('[data-testid="save-button"]');

    // 验证编辑成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      "User updated successfully"
    );

    // 删除用户
    await page
      .locator('[data-testid="user-john@example.com"]')
      .locator('[data-testid="delete-button"]')
      .click();

    await page.click('[data-testid="confirm-delete"]');

    // 验证删除成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      "User deleted successfully"
    );

    await expect(
      page.locator('[data-testid="user-john@example.com"]')
    ).not.toBeVisible();
  });

  test("responsive design", async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/users");

    // 验证移动端导航
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();

    // 验证用户卡片布局
    const userCards = page.locator('[data-testid^="user-card-"]');
    await expect(userCards.first()).toBeVisible();
  });

  test("accessibility compliance", async ({ page }) => {
    await page.goto("/users");

    // 键盘导航测试
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="add-user-button"]')).toBeFocused();

    // ARIA 标签测试
    const addButton = page.locator('[data-testid="add-user-button"]');
    await expect(addButton).toHaveAttribute("aria-label", "Add new user");

    // 颜色对比度测试（需要额外的插件）
    // await expect(page).toPassAxeTest();
  });
});
```

## 4. 测试工具链集成 🛠️

### 测试覆盖率配置

```javascript
// jest.config.js - 覆盖率配置
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}'
  ],

  coverageDirectory: 'coverage',

  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },

    // 特定文件的覆盖率要求
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};

// package.json 脚本
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false --passWithNoTests"
  }
}
```

### CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Start application
        run: npm start &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 5. 测试最佳实践 ✨

### 测试组织结构

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
│   └── UserList/
│       ├── UserList.tsx
│       ├── UserList.test.tsx
│       └── UserList.integration.test.tsx
├── hooks/
│   ├── useCounter.ts
│   └── useCounter.test.ts
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
└── __tests__/
    ├── setup.ts
    └── test-utils.tsx
```

### 测试工具函数

```tsx
// __tests__/test-utils.tsx
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider } from "styled-components";
import { theme } from "../theme";

// 创建测试用的 QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// 重新导出所有内容
export * from "@testing-library/react";
export { customRender as render };

// 自定义匹配器
export const toBeInTheDocument = (received: any) => {
  const pass = received !== null;
  return {
    message: () =>
      `expected element ${pass ? "not " : ""}to be in the document`,
    pass,
  };
};
```

## 面试常见问题解答

### Q1: 前端测试的分层策略是什么？

**回答框架：**

1. **测试金字塔**：单元测试(70%) → 集成测试(20%) → E2E 测试(10%)
2. **单元测试**：快速、独立、覆盖业务逻辑
3. **集成测试**：验证模块间交互
4. **E2E 测试**：关键用户流程验证

### Q2: 如何测试异步操作？

**关键技术：**

1. **waitFor**：等待异步状态更新
2. **MSW**：Mock Service Worker 模拟 API
3. **act**：确保状态更新完成
4. **findBy**：异步查询元素

### Q3: 测试覆盖率多少合适？

**答案要点：**

1. **不同层级**：单元测试 80%+，集成测试 60%+
2. **关键路径**：核心业务逻辑 90%+
3. **质量优于数量**：有效测试比高覆盖率更重要
4. **持续改进**：逐步提升，不要一步到位

这样的测试体系能确保前端应用的质量和稳定性！
