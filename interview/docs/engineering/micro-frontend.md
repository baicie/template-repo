# 微前端实战 - 大型应用架构设计

## 微前端架构概览

微前端是一种将单体前端应用拆分为多个独立、可部署的小型前端应用的架构模式，每个应用可以由不同的团队独立开发、测试和部署。

### 核心价值

- **技术栈无关**：不同团队可以选择不同的技术栈
- **独立部署**：各个应用可以独立发布和更新
- **团队自治**：减少团队间的协调成本
- **渐进升级**：可以逐步迁移遗留系统

## 1. 微前端架构模式 🏗️

### Single-SPA 基础架构

```javascript
// single-spa-config.js - 主应用配置
import { registerApplication, start } from "single-spa";

// 注册子应用
registerApplication({
  name: "navbar",
  app: () => System.import("@org/navbar"),
  activeWhen: () => true, // 始终激活
});

registerApplication({
  name: "home",
  app: () => System.import("@org/home"),
  activeWhen: (location) =>
    location.pathname === "/" || location.pathname === "/home",
});

registerApplication({
  name: "products",
  app: () => System.import("@org/products"),
  activeWhen: (location) => location.pathname.startsWith("/products"),
});

registerApplication({
  name: "profile",
  app: () => System.import("@org/profile"),
  activeWhen: (location) => location.pathname.startsWith("/profile"),
});

// 启动 single-spa
start({
  urlRerouteOnly: true,
});

// 子应用生命周期管理
const lifecycles = {
  async mount(props) {
    console.log("Mounting application with props:", props);
    // 挂载应用逻辑
  },

  async unmount(props) {
    console.log("Unmounting application");
    // 卸载应用逻辑
  },

  async update(props) {
    console.log("Updating application with props:", props);
    // 更新应用逻辑
  },
};
```

### React 子应用实现

```tsx
// src/App.tsx - React 子应用
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import singleSpaReact from "single-spa-react";

// 主应用组件
const App: React.FC<{ basename?: string }> = ({ basename = "/" }) => {
  return (
    <BrowserRouter basename={basename}>
      <div className="micro-app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/list" element={<ProductList />} />
          <Route path="/detail/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

// Single-SPA 生命周期配置
const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong in {props.name}</h2>
        <details>
          <summary>Error details</summary>
          <pre>{err.stack}</pre>
        </details>
      </div>
    );
  },
});

// 导出生命周期函数
export const { bootstrap, mount, unmount, update } = reactLifecycles;

// 独立运行模式
if (!window.singleSpaNavigate) {
  const domElement = document.getElementById("root");
  ReactDOM.render(<App />, domElement);
}

// 子应用间通信
interface MicroAppEventBus {
  emit(event: string, data: any): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
}

class EventBus implements MicroAppEventBus {
  private events: Map<string, Set<Function>> = new Map();

  emit(event: string, data: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }
}

// 全局事件总线
window.microAppEventBus = new EventBus();

// 使用示例
const ProductList: React.FC = () => {
  React.useEffect(() => {
    // 监听用户登录事件
    const handleUserLogin = (userData: any) => {
      console.log("User logged in:", userData);
      // 更新产品列表
    };

    window.microAppEventBus.on("user:login", handleUserLogin);

    return () => {
      window.microAppEventBus.off("user:login", handleUserLogin);
    };
  }, []);

  const handleProductClick = (product: any) => {
    // 发送产品选择事件
    window.microAppEventBus.emit("product:selected", product);
  };

  return <div>{/* 产品列表内容 */}</div>;
};
```

### Vue 子应用实现

```typescript
// src/main.ts - Vue 子应用
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import singleSpaVue from "single-spa-vue";
import App from "./App.vue";
import routes from "./routes";

// 创建 Vue 应用实例
const createVueApp = (props: any) => {
  const app = createApp(App);

  // 创建路由
  const router = createRouter({
    history: createWebHistory(props.basename || "/"),
    routes,
  });

  app.use(router);

  // 全局属性注入
  app.config.globalProperties.$eventBus = window.microAppEventBus;
  app.config.globalProperties.$props = props;

  return app;
};

// Single-SPA 生命周期配置
const vueLifecycles = singleSpaVue({
  createApp: createVueApp,
  appOptions: {
    render() {
      return h(App, {
        props: this.props,
      });
    },
  },
  handleInstance: (app, info) => {
    app.use(router);
  },
});

export const { bootstrap, mount, unmount, update } = vueLifecycles;

// 独立运行模式
if (!window.singleSpaNavigate) {
  const app = createVueApp({});
  app.mount("#app");
}
```

## 2. Module Federation 实现 📦

### Webpack 5 Module Federation 配置

```javascript
// webpack.config.js - 主应用配置
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  mode: "development",
  devServer: {
    port: 3000,
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      filename: "remoteEntry.js",

      // 远程模块
      remotes: {
        "mf-home": "mfHome@http://localhost:3001/remoteEntry.js",
        "mf-products": "mfProducts@http://localhost:3002/remoteEntry.js",
        "mf-profile": "mfProfile@http://localhost:3003/remoteEntry.js",
      },

      // 共享依赖
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^18.0.0",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^18.0.0",
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: "^6.0.0",
        },
        axios: {
          singleton: true,
          requiredVersion: "^0.27.0",
        },
      },
    }),
  ],
};

// webpack.config.js - 子应用配置
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  mode: "development",
  devServer: {
    port: 3001,
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "mfHome",
      filename: "remoteEntry.js",

      // 暴露的模块
      exposes: {
        "./App": "./src/App",
        "./HomePage": "./src/components/HomePage",
        "./HomeService": "./src/services/HomeService",
      },

      // 共享依赖
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^18.0.0",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^18.0.0",
        },
      },
    }),
  ],
};
```

### 动态加载和错误处理

```tsx
// 主应用 - 动态加载子应用
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

// 动态导入子应用
const HomePage = lazy(() =>
  import("mf-home/App").catch(() => ({
    default: () => <div>Home application is unavailable</div>,
  }))
);

const ProductsApp = lazy(() =>
  import("mf-products/App").catch(() => ({
    default: () => <div>Products application is unavailable</div>,
  }))
);

const ProfileApp = lazy(() =>
  import("mf-profile/App").catch(() => ({
    default: () => <div>Profile application is unavailable</div>,
  }))
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="shell-app">
        <header className="app-header">
          <nav>
            <a href="/">Home</a>
            <a href="/products">Products</a>
            <a href="/profile">Profile</a>
          </nav>
        </header>

        <main className="app-main">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/*" element={<ProductsApp />} />
                <Route path="/profile/*" element={<ProfileApp />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
};

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Micro-frontend error:", error, errorInfo);

    // 发送错误报告
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    fetch("/api/errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(console.error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default App;
```

## 3. qiankun 企业级方案 🏢

### qiankun 主应用配置

```typescript
// main.ts - qiankun 主应用
import { registerMicroApps, start, setDefaultMountApp } from "qiankun";

// 注册子应用
registerMicroApps(
  [
    {
      name: "react-app",
      entry: "//localhost:3001",
      container: "#subapp-viewport",
      activeRule: "/react-app",
      props: {
        routerBase: "/react-app",
        getGlobalState: () => globalState,
      },
    },
    {
      name: "vue-app",
      entry: "//localhost:3002",
      container: "#subapp-viewport",
      activeRule: "/vue-app",
      props: {
        routerBase: "/vue-app",
        getGlobalState: () => globalState,
      },
    },
    {
      name: "angular-app",
      entry: "//localhost:3003",
      container: "#subapp-viewport",
      activeRule: "/angular-app",
    },
  ],
  {
    // 生命周期钩子
    beforeLoad: (app) => {
      console.log("before load", app.name);
      return Promise.resolve();
    },
    beforeMount: (app) => {
      console.log("before mount", app.name);
      return Promise.resolve();
    },
    afterMount: (app) => {
      console.log("after mount", app.name);
      return Promise.resolve();
    },
    beforeUnmount: (app) => {
      console.log("before unmount", app.name);
      return Promise.resolve();
    },
    afterUnmount: (app) => {
      console.log("after unmount", app.name);
      return Promise.resolve();
    },
  }
);

// 全局状态管理
import { initGlobalState } from "qiankun";

const initialState = {
  user: null,
  theme: "light",
  language: "zh-CN",
};

const actions = initGlobalState(initialState);

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log("Global state changed:", state, prev);
});

// 设置全局状态
actions.setGlobalState({
  user: { id: 1, name: "John Doe" },
});

// 设置默认应用
setDefaultMountApp("/react-app");

// 启动 qiankun
start({
  prefetch: true, // 预加载
  sandbox: {
    strictStyleIsolation: true, // 严格样式隔离
    experimentalStyleIsolation: true, // 实验性样式隔离
  },
  singular: false, // 允许多个应用同时存在
});

// 自定义加载器
const loader = (loading: boolean) => {
  const loadingElement = document.getElementById("global-loading");
  if (loadingElement) {
    loadingElement.style.display = loading ? "block" : "none";
  }
};

// 应用间通信
interface MicroAppCommunication {
  emit(event: string, data: any): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
}

class QiankunCommunication implements MicroAppCommunication {
  private actions: any;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor(actions: any) {
    this.actions = actions;
  }

  emit(event: string, data: any): void {
    this.actions.setGlobalState({
      event,
      data,
      timestamp: Date.now(),
    });
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);

    // 监听全局状态变化
    this.actions.onGlobalStateChange((state: any) => {
      if (state.event === event) {
        callback(state.data);
      }
    });
  }

  off(event: string, callback: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(callback);
    }
  }
}

const communication = new QiankunCommunication(actions);
window.microAppCommunication = communication;
```

### qiankun 子应用配置

```typescript
// src/public-path.ts - 动态设置 publicPath
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// src/main.tsx - React 子应用
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./public-path";

// 子应用生命周期
export async function bootstrap() {
  console.log("React app bootstraped");
}

export async function mount(props: any) {
  console.log("React app mount", props);

  const { container, routerBase, getGlobalState } = props;

  // 获取全局状态
  const globalState = getGlobalState();

  ReactDOM.render(
    <App routerBase={routerBase} globalState={globalState} {...props} />,
    container
      ? container.querySelector("#root")
      : document.querySelector("#root")
  );
}

export async function unmount(props: any) {
  console.log("React app unmount", props);

  const { container } = props;
  ReactDOM.unmountComponentAtNode(
    container
      ? container.querySelector("#root")
      : document.querySelector("#root")
  );
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  mount({});
}

// App.tsx - 应用主组件
interface AppProps {
  routerBase?: string;
  globalState?: any;
  onGlobalStateChange?: (callback: Function) => void;
  setGlobalState?: (state: any) => void;
}

const App: React.FC<AppProps> = ({
  routerBase = "/",
  globalState,
  onGlobalStateChange,
  setGlobalState,
}) => {
  const [user, setUser] = React.useState(globalState?.user);

  React.useEffect(() => {
    // 监听全局状态变化
    onGlobalStateChange?.((state: any) => {
      if (state.user) {
        setUser(state.user);
      }
    });
  }, [onGlobalStateChange]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    // 更新全局状态
    setGlobalState?.({ user: userData });
  };

  return (
    <BrowserRouter basename={routerBase}>
      <div className="micro-app">
        <header>
          {user ? (
            <span>Welcome, {user.name}</span>
          ) : (
            <button onClick={() => handleLogin({ id: 1, name: "John" })}>
              Login
            </button>
          )}
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
```

## 4. 样式隔离和主题统一 🎨

### CSS 样式隔离方案

```scss
// styles/isolation.scss - 样式隔离
.micro-app {
  // 使用 CSS Modules 或 Styled Components
  &[data-app="home"] {
    .button {
      background-color: #007bff;
      color: white;

      &:hover {
        background-color: #0056b3;
      }
    }
  }

  &[data-app="products"] {
    .button {
      background-color: #28a745;
      color: white;

      &:hover {
        background-color: #1e7e34;
      }
    }
  }
}

// Shadow DOM 样式隔离
class ShadowDOMIsolation {
  private shadowRoot: ShadowRoot;

  constructor(container: HTMLElement) {
    this.shadowRoot = container.attachShadow({ mode: 'open' });
  }

  loadStyles(cssText: string) {
    const style = document.createElement('style');
    style.textContent = cssText;
    this.shadowRoot.appendChild(style);
  }

  mount(element: HTMLElement) {
    this.shadowRoot.appendChild(element);
  }

  unmount() {
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }
  }
}

// CSS-in-JS 隔离
const createIsolatedStyles = (appName: string) => {
  const prefix = `micro-${appName}`;

  return {
    button: {
      className: `${prefix}-button`,
      styles: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',

        '&:hover': {
          backgroundColor: 'var(--primary-color-dark)',
        },
      },
    },

    card: {
      className: `${prefix}-card`,
      styles: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        margin: '16px 0',
      },
    },
  };
};
```

### 主题系统设计

```typescript
// theme/ThemeProvider.tsx - 主题提供者
import React, { createContext, useContext, useState, useEffect } from "react";

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545",
    background: "#ffffff",
    surface: "#f8f9fa",
    text: "#212529",
    textSecondary: "#6c757d",
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    fontSize: {
      small: "0.875rem",
      medium: "1rem",
      large: "1.25rem",
      xlarge: "1.5rem",
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  breakpoints: {
    mobile: "576px",
    tablet: "768px",
    desktop: "992px",
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: "#121212",
    surface: "#1e1e1e",
    text: "#ffffff",
    textSecondary: "#b3b3b3",
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  themeName: "light" | "dark";
}>({
  theme: lightTheme,
  toggleTheme: () => {},
  themeName: "light",
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeName, setThemeName] = useState<"light" | "dark">("light");

  const theme = themeName === "light" ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "light" ? "dark" : "light"));
  };

  // 同步主题到 CSS 变量
  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // 通知其他微应用主题变化
    window.microAppCommunication?.emit("theme:change", {
      theme: themeName,
      colors: theme.colors,
      spacing: theme.spacing,
    });
  }, [theme, themeName]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// 主题工具函数
export const createThemeAwareComponent = <T extends object>(
  Component: React.ComponentType<T & { theme: Theme }>
) => {
  return (props: T) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
};
```

## 5. 应用间通信机制 📡

### 事件总线通信

```typescript
// communication/EventBus.ts - 高级事件总线
interface EventHandler<T = any> {
  (data: T): void | Promise<void>;
}

interface EventBusOptions {
  namespace?: string;
  persistence?: boolean;
  encryption?: boolean;
}

class AdvancedEventBus {
  private events: Map<string, Set<EventHandler>> = new Map();
  private namespace: string;
  private persistence: boolean;
  private encryption: boolean;
  private history: Array<{ event: string; data: any; timestamp: number }> = [];

  constructor(options: EventBusOptions = {}) {
    this.namespace = options.namespace || "default";
    this.persistence = options.persistence || false;
    this.encryption = options.encryption || false;

    // 跨窗口通信
    window.addEventListener("message", this.handleMessage.bind(this));

    // 页面卸载时清理
    window.addEventListener("beforeunload", this.cleanup.bind(this));
  }

  // 发送事件
  emit<T = any>(event: string, data: T): void {
    const fullEvent = `${this.namespace}:${event}`;

    // 记录历史
    this.history.push({
      event: fullEvent,
      data,
      timestamp: Date.now(),
    });

    // 限制历史记录数量
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    // 本地事件处理
    const handlers = this.events.get(fullEvent);
    if (handlers) {
      handlers.forEach(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`Event handler error for ${fullEvent}:`, error);
        }
      });
    }

    // 跨窗口广播
    this.broadcast(fullEvent, data);

    // 持久化存储
    if (this.persistence) {
      this.persistEvent(fullEvent, data);
    }
  }

  // 监听事件
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    const fullEvent = `${this.namespace}:${event}`;

    if (!this.events.has(fullEvent)) {
      this.events.set(fullEvent, new Set());
    }

    this.events.get(fullEvent)!.add(handler);

    // 返回取消监听函数
    return () => {
      this.off(event, handler);
    };
  }

  // 取消监听
  off<T = any>(event: string, handler: EventHandler<T>): void {
    const fullEvent = `${this.namespace}:${event}`;
    const handlers = this.events.get(fullEvent);

    if (handlers) {
      handlers.delete(handler);

      if (handlers.size === 0) {
        this.events.delete(fullEvent);
      }
    }
  }

  // 一次性监听
  once<T = any>(event: string, handler: EventHandler<T>): () => void {
    const onceHandler = async (data: T) => {
      await handler(data);
      this.off(event, onceHandler);
    };

    return this.on(event, onceHandler);
  }

  // 跨窗口消息处理
  private handleMessage(event: MessageEvent) {
    if (event.data?.type === "micro-app-event") {
      const { event: eventName, data, namespace } = event.data;

      if (namespace === this.namespace) {
        const handlers = this.events.get(eventName);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }
      }
    }
  }

  // 广播消息
  private broadcast(event: string, data: any) {
    const message = {
      type: "micro-app-event",
      event,
      data,
      namespace: this.namespace,
      timestamp: Date.now(),
    };

    // 发送给所有窗口
    if (window.parent !== window) {
      window.parent.postMessage(message, "*");
    }

    // 发送给所有子窗口
    Array.from(window.frames).forEach((frame) => {
      try {
        frame.postMessage(message, "*");
      } catch (error) {
        // 忽略跨域错误
      }
    });
  }

  // 持久化事件
  private persistEvent(event: string, data: any) {
    try {
      const key = `eventbus:${this.namespace}:${event}`;
      const value = this.encryption ? this.encrypt(data) : JSON.stringify(data);
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to persist event:", error);
    }
  }

  // 加密数据
  private encrypt(data: any): string {
    // 简单的 Base64 编码，实际应用中应使用更强的加密
    return btoa(JSON.stringify(data));
  }

  // 解密数据
  private decrypt(encryptedData: string): any {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      return null;
    }
  }

  // 获取事件历史
  getHistory(
    event?: string
  ): Array<{ event: string; data: any; timestamp: number }> {
    if (event) {
      const fullEvent = `${this.namespace}:${event}`;
      return this.history.filter((item) => item.event === fullEvent);
    }
    return [...this.history];
  }

  // 清理资源
  private cleanup() {
    this.events.clear();
    this.history = [];
  }

  // 调试信息
  debug(): void {
    console.group(`EventBus Debug - ${this.namespace}`);
    console.log("Active Events:", Array.from(this.events.keys()));
    console.log("Event History:", this.history);
    console.log("Options:", {
      namespace: this.namespace,
      persistence: this.persistence,
      encryption: this.encryption,
    });
    console.groupEnd();
  }
}

// 全局事件总线实例
export const globalEventBus = new AdvancedEventBus({
  namespace: "global",
  persistence: true,
});

// React Hook
export const useEventBus = (eventBus: AdvancedEventBus = globalEventBus) => {
  const emit = React.useCallback(
    (event: string, data: any) => {
      eventBus.emit(event, data);
    },
    [eventBus]
  );

  const on = React.useCallback(
    (event: string, handler: EventHandler) => {
      return eventBus.on(event, handler);
    },
    [eventBus]
  );

  const once = React.useCallback(
    (event: string, handler: EventHandler) => {
      return eventBus.once(event, handler);
    },
    [eventBus]
  );

  return { emit, on, once };
};

// 使用示例
export const UserProfile: React.FC = () => {
  const { emit, on } = useEventBus();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // 监听用户更新事件
    const unsubscribe = on("user:update", (userData) => {
      setUser(userData);
    });

    return unsubscribe;
  }, [on]);

  const handleUpdateProfile = (profileData: any) => {
    // 发送用户更新事件
    emit("user:update", { ...user, ...profileData });
  };

  return <div>{/* 用户资料组件 */}</div>;
};
```

## 6. 部署和运维策略 🚀

### 独立部署配置

```yaml
# docker-compose.yml - 微前端部署
version: '3.8'

services:
  # 主应用
  shell-app:
    build:
      context: ./shell-app
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - home-app
      - products-app
      - profile-app

  # 子应用 1
  home-app:
    build:
      context: ./home-app
      dockerfile: Dockerfile
    ports:
      - "3001:80"
    environment:
      - NODE_ENV=production
      - PUBLIC_PATH=/home-app/

  # 子应用 2
  products-app:
    build:
      context: ./products-app
      dockerfile: Dockerfile
    ports:
      - "3002:80"
    environment:
      - NODE_ENV=production
      - PUBLIC_PATH=/products-app/

  # 子应用 3
  profile-app:
    build:
      context: ./profile-app
      dockerfile: Dockerfile
    ports:
      - "3003:80"
    environment:
      - NODE_ENV=production
      - PUBLIC_PATH=/profile-app/

  # Nginx 网关
  nginx-gateway:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - shell-app
      - home-app
      - products-app
      - profile-app

# nginx.conf - 微前端网关配置
events {
    worker_connections 1024;
}

http {
    upstream shell-app {
        server shell-app:80;
    }

    upstream home-app {
        server home-app:80;
    }

    upstream products-app {
        server products-app:80;
    }

    upstream profile-app {
        server profile-app:80;
    }

    server {
        listen 80;

        # 主应用
        location / {
            proxy_pass http://shell-app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # 子应用路由
        location /home-app/ {
            proxy_pass http://home-app/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /products-app/ {
            proxy_pass http://products-app/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /profile-app/ {
            proxy_pass http://profile-app/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### CI/CD 流水线

```yaml
# .github/workflows/micro-frontend-deploy.yml
name: Micro Frontend Deploy

on:
  push:
    branches: [main]
    paths:
      - "shell-app/**"
      - "home-app/**"
      - "products-app/**"
      - "profile-app/**"

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      shell-changed: ${{ steps.changes.outputs.shell }}
      home-changed: ${{ steps.changes.outputs.home }}
      products-changed: ${{ steps.changes.outputs.products }}
      profile-changed: ${{ steps.changes.outputs.profile }}
    steps:
      - uses: actions/checkout@v3
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            shell:
              - 'shell-app/**'
            home:
              - 'home-app/**'
            products:
              - 'products-app/**'
            profile:
              - 'profile-app/**'

  deploy-shell:
    needs: detect-changes
    if: needs.detect-changes.outputs.shell-changed == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy Shell App
        run: |
          cd shell-app
          npm ci
          npm run build
          docker build -t shell-app:${{ github.sha }} .
          docker push myregistry.com/shell-app:${{ github.sha }}

  deploy-home:
    needs: detect-changes
    if: needs.detect-changes.outputs.home-changed == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy Home App
        run: |
          cd home-app
          npm ci
          npm run build
          docker build -t home-app:${{ github.sha }} .
          docker push myregistry.com/home-app:${{ github.sha }}

  # 类似的任务用于其他应用...
```

## 面试常见问题解答

### Q1: 微前端的优缺点是什么？

**优点：**

- 技术栈无关，团队自主选择
- 独立开发和部署，提升开发效率
- 应用隔离，降低系统复杂度
- 渐进式升级，降低迁移成本

**缺点：**

- 增加系统复杂度和维护成本
- 资源重复加载，影响性能
- 应用间协调复杂
- 调试和测试难度增加

### Q2: 如何选择微前端方案？

**选择标准：**

1. **团队规模**：大团队选择 qiankun，小团队选择 Single-SPA
2. **技术栈**：同技术栈选择 Module Federation
3. **部署方式**：独立部署选择容器化方案
4. **性能要求**：高性能要求选择 Module Federation
5. **维护成本**：考虑长期维护和升级成本

### Q3: 微前端的样式隔离如何实现？

**隔离方案：**

1. **CSS Modules**：编译时生成唯一类名
2. **Styled Components**：CSS-in-JS 方案
3. **Shadow DOM**：原生浏览器隔离
4. **PostCSS 插件**：自动添加前缀
5. **qiankun 沙箱**：运行时样式隔离

这样的微前端架构能支撑大型应用的复杂业务需求！
