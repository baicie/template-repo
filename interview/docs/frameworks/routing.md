# 前端路由系统深度解析

路由是现代前端应用的核心功能之一，它负责管理应用的页面导航和状态同步。本文将深入探讨客户端路由的实现原理、主流路由库的使用和高级路由模式。

## 🧭 路由基础原理

### History API vs Hash 路由

```javascript
// Hash 路由 (#/about)
class HashRouter {
  constructor() {
    this.routes = {};
    this.currentRoute = "";

    // 监听 hash 变化
    window.addEventListener("hashchange", this.handleHashChange.bind(this));

    // 初始化路由
    this.handleHashChange();
  }

  register(path, component) {
    this.routes[path] = component;
  }

  handleHashChange() {
    // 获取当前 hash (去除 #)
    const hash = window.location.hash.slice(1) || "/";
    this.navigate(hash);
  }

  navigate(path) {
    this.currentRoute = path;
    const component = this.routes[path];

    if (component) {
      this.render(component);
    } else {
      this.render(this.routes["/404"] || "<h1>404 - 页面不存在</h1>");
    }
  }

  render(component) {
    document.getElementById("app").innerHTML = component;
  }

  push(path) {
    window.location.hash = path;
  }
}

// History API 路由 (/about)
class HistoryRouter {
  constructor() {
    this.routes = {};
    this.currentRoute = "";

    // 监听浏览器前进后退
    window.addEventListener("popstate", this.handlePopState.bind(this));

    // 初始化路由
    this.handlePopState();
  }

  register(path, component) {
    this.routes[path] = component;
  }

  handlePopState() {
    const path = window.location.pathname;
    this.navigate(path);
  }

  navigate(path) {
    this.currentRoute = path;
    const component = this.routes[path];

    if (component) {
      this.render(component);
    } else {
      this.render(this.routes["/404"] || "<h1>404 - 页面不存在</h1>");
    }
  }

  render(component) {
    document.getElementById("app").innerHTML = component;
  }

  push(path) {
    // 使用 History API 更新 URL 但不刷新页面
    history.pushState(null, "", path);
    this.navigate(path);
  }

  replace(path) {
    history.replaceState(null, "", path);
    this.navigate(path);
  }
}

// 使用示例
const router = new HistoryRouter();

router.register("/", "<h1>首页</h1>");
router.register("/about", "<h1>关于我们</h1>");
router.register("/contact", "<h1>联系我们</h1>");

// 监听链接点击
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    router.push(e.target.getAttribute("href"));
  }
});
```

### 路径匹配算法

```javascript
// 路径匹配器
class PathMatcher {
  constructor(pattern) {
    this.pattern = pattern;
    this.keys = [];
    this.regexp = this.pathToRegexp(pattern);
  }

  pathToRegexp(path) {
    // 参数提取正则：:id => (?<id>[^/]+)
    const paramRegex = /:([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const regexpSource = path
      .replace(/\//g, "\\/")
      .replace(paramRegex, (match, paramName) => {
        this.keys.push(paramName);
        return "([^/]+)";
      })
      .replace(/\*/g, "(.*)");

    return new RegExp(`^${regexpSource}$`);
  }

  match(pathname) {
    const match = this.regexp.exec(pathname);

    if (!match) {
      return null;
    }

    const params = {};
    for (let i = 0; i < this.keys.length; i++) {
      params[this.keys[i]] = match[i + 1];
    }

    return {
      path: pathname,
      params,
      query: this.parseQuery(window.location.search),
    };
  }

  parseQuery(search) {
    const params = new URLSearchParams(search);
    const query = {};
    for (const [key, value] of params) {
      query[key] = value;
    }
    return query;
  }
}

// 路由优先级和匹配
class RouteResolver {
  constructor() {
    this.routes = [];
  }

  addRoute(path, component, options = {}) {
    const matcher = new PathMatcher(path);
    this.routes.push({
      path,
      component,
      matcher,
      priority: options.priority || 0,
      guards: options.guards || [],
    });

    // 按优先级排序
    this.routes.sort((a, b) => b.priority - a.priority);
  }

  resolve(pathname) {
    for (const route of this.routes) {
      const match = route.matcher.match(pathname);
      if (match) {
        return {
          route,
          match,
          component: route.component,
          guards: route.guards,
        };
      }
    }

    return null;
  }
}

// 使用示例
const resolver = new RouteResolver();

// 具体路径优先级更高
resolver.addRoute("/users/profile", ProfileComponent, { priority: 10 });
resolver.addRoute("/users/:id", UserComponent, { priority: 5 });
resolver.addRoute("/users/:id/posts/:postId", PostComponent, { priority: 15 });
resolver.addRoute("*", NotFoundComponent, { priority: -1 });

// 匹配测试
console.log(resolver.resolve("/users/profile"));
// { route: {...}, match: { path: '/users/profile', params: {}, query: {} } }

console.log(resolver.resolve("/users/123"));
// { route: {...}, match: { path: '/users/123', params: { id: '123' }, query: {} } }
```

## ⚛️ React Router 深度应用

### 基础路由配置

```javascript
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  NavLink,
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

// 基础路由结构
function App() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          首页
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          产品
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          关于
        </NavLink>
      </nav>

      <main>
        <Routes>
          {/* 基础路由 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* 嵌套路由 */}
          <Route path="/products/*" element={<ProductsLayout />}>
            <Route index element={<ProductsList />} />
            <Route path=":productId" element={<ProductDetail />} />
            <Route path=":productId/reviews" element={<ProductReviews />} />
            <Route path="new" element={<NewProduct />} />
          </Route>

          {/* 受保护的路由 */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 重定向 */}
          <Route
            path="/old-path"
            element={<Navigate to="/new-path" replace />}
          />

          {/* 404 页面 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// 嵌套路由布局
function ProductsLayout() {
  return (
    <div className="products-layout">
      <aside className="products-sidebar">
        <nav>
          <Link to="/products">所有产品</Link>
          <Link to="/products/new">添加产品</Link>
        </nav>
      </aside>
      <div className="products-content">
        <Outlet />
      </div>
    </div>
  );
}

// 产品详情页面
function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // 获取查询参数
  const tab = searchParams.get("tab") || "details";

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const goBack = () => {
    navigate(-1); // 或者 navigate('/products')
  };

  return (
    <div className="product-detail">
      <button onClick={goBack}>返回</button>

      <h1>产品 {productId}</h1>

      <div className="tabs">
        <button
          onClick={() => handleTabChange("details")}
          className={tab === "details" ? "active" : ""}
        >
          详情
        </button>
        <button
          onClick={() => handleTabChange("reviews")}
          className={tab === "reviews" ? "active" : ""}
        >
          评价
        </button>
        <button
          onClick={() => handleTabChange("specs")}
          className={tab === "specs" ? "active" : ""}
        >
          规格
        </button>
      </div>

      <div className="tab-content">
        {tab === "details" && <ProductDetails productId={productId} />}
        {tab === "reviews" && <ProductReviews productId={productId} />}
        {tab === "specs" && <ProductSpecs productId={productId} />}
      </div>
    </div>
  );
}
```

### 路由守卫与权限控制

```javascript
import { useContext, createContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

// 认证上下文
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户登录状态
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const userData = await verifyToken(token);
        setUser(userData);
      }
    } catch (error) {
      console.error("认证检查失败:", error);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { user, token } = await authenticate(credentials);
    localStorage.setItem("authToken", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 权限检查 Hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// 路由守卫组件
function ProtectedRoute({ children, requiredRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">检查登录状态...</div>;
  }

  if (!user) {
    // 重定向到登录页，并保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查角色权限
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

// 高级权限检查
function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => hasRole(role));
  };

  const hasAllRoles = (roles) => {
    return roles.every((role) => hasRole(role));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
}

// 权限组件包装器
function PermissionGate({ permission, roles, children, fallback = null }) {
  const { hasPermission, hasAnyRole } = usePermissions();

  let hasAccess = true;

  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  if (roles && !hasAnyRole(roles)) {
    hasAccess = false;
  }

  return hasAccess ? children : fallback;
}

// 使用示例
function AdminPanel() {
  return (
    <ProtectedRoute requiredRoles={["admin", "moderator"]}>
      <div>
        <h1>管理面板</h1>

        <PermissionGate
          permission="users.manage"
          fallback={<div>您没有管理用户的权限</div>}
        >
          <UserManagement />
        </PermissionGate>

        <PermissionGate roles={["admin"]} fallback={<div>仅管理员可见</div>}>
          <SystemSettings />
        </PermissionGate>
      </div>
    </ProtectedRoute>
  );
}
```

### 数据预加载与缓存

```javascript
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

// 路由数据预加载 Hook
function useRouteData(dataLoader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result = await dataLoader();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}

// 数据缓存管理器
class RouteDataCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  generateKey(path, params) {
    return `${path}:${JSON.stringify(params)}`;
  }

  async get(path, params, loader, options = {}) {
    const key = this.generateKey(path, params);
    const { ttl = 300000, force = false } = options; // 默认 5 分钟 TTL

    // 检查缓存
    if (!force && this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
      this.cache.delete(key);
    }

    // 检查是否有正在进行的请求
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // 创建新请求
    const request = loader()
      .then((data) => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        });
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  invalidate(pattern) {
    if (typeof pattern === "string") {
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

const routeCache = new RouteDataCache();

// 使用缓存的数据加载 Hook
function useCachedRouteData(path, loader, dependencies = [], options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result = await routeCache.get(
          path,
          dependencies,
          loader,
          options
        );

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [path, ...dependencies]);

  const invalidate = () => {
    routeCache.invalidate(routeCache.generateKey(path, dependencies));
  };

  return { data, loading, error, invalidate };
}

// 使用示例
function ProductDetail() {
  const { productId } = useParams();

  const {
    data: product,
    loading,
    error,
  } = useCachedRouteData(
    "/api/products",
    () => fetchProduct(productId),
    [productId],
    { ttl: 600000 } // 10 分钟缓存
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error.message}</div>;
  if (!product) return <div>产品不存在</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>价格: ¥{product.price}</p>
    </div>
  );
}
```

## 🟢 Vue Router 高级应用

### 路由配置与嵌套

```javascript
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: {
      title: "首页",
      requiresAuth: false,
    },
  },
  {
    path: "/products",
    component: () => import("@/layouts/ProductLayout.vue"),
    children: [
      {
        path: "",
        name: "ProductList",
        component: () => import("@/views/ProductList.vue"),
        meta: { title: "产品列表" },
      },
      {
        path: ":id(\\d+)",
        name: "ProductDetail",
        component: () => import("@/views/ProductDetail.vue"),
        props: true,
        meta: { title: "产品详情" },
        beforeEnter: (to, from, next) => {
          // 路由级别的守卫
          if (validateProductId(to.params.id)) {
            next();
          } else {
            next({ name: "NotFound" });
          }
        },
      },
      {
        path: ":id(\\d+)/edit",
        name: "ProductEdit",
        component: () => import("@/views/ProductEdit.vue"),
        props: true,
        meta: {
          title: "编辑产品",
          requiresAuth: true,
          requiresRole: ["admin", "editor"],
        },
      },
    ],
  },
  {
    path: "/user",
    component: () => import("@/layouts/UserLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "profile",
        name: "UserProfile",
        component: () => import("@/views/UserProfile.vue"),
        meta: { title: "个人资料" },
      },
      {
        path: "settings",
        name: "UserSettings",
        component: () => import("@/views/UserSettings.vue"),
        meta: { title: "用户设置" },
      },
    ],
  },
  // 动态路由 (运行时添加)
  {
    path: "/admin/:pathMatch(.*)*",
    name: "AdminModule",
    component: () => import("@/views/AdminModule.vue"),
    meta: { requiresRole: ["admin"] },
  },
  // 重定向
  {
    path: "/old-path",
    redirect: { name: "Home" },
  },
  // 别名
  {
    path: "/home",
    alias: ["/index", "/main"],
    component: () => import("@/views/Home.vue"),
  },
  // 404 处理
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: { title: "页面不存在" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    } else {
      return { top: 0 };
    }
  },
});

export default router;
```

### 路由守卫与权限

```javascript
import store from "@/store";

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 加载进度条
  NProgress.start();

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 我的应用`;
  }

  // 检查认证状态
  if (to.meta.requiresAuth) {
    const isAuthenticated = store.getters["auth/isAuthenticated"];

    if (!isAuthenticated) {
      // 尝试刷新 token
      try {
        await store.dispatch("auth/refreshToken");
      } catch (error) {
        next({
          name: "Login",
          query: { redirect: to.fullPath },
        });
        return;
      }
    }
  }

  // 检查角色权限
  if (to.meta.requiresRole) {
    const userRoles = store.getters["auth/userRoles"];
    const requiredRoles = Array.isArray(to.meta.requiresRole)
      ? to.meta.requiresRole
      : [to.meta.requiresRole];

    const hasPermission = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasPermission) {
      next({ name: "Forbidden" });
      return;
    }
  }

  // 数据预加载
  if (to.meta.preload) {
    try {
      await store.dispatch(to.meta.preload, to.params);
    } catch (error) {
      console.error("数据预加载失败:", error);
    }
  }

  next();
});

// 全局后置钩子
router.afterEach((to, from) => {
  NProgress.done();

  // 埋点统计
  if (process.env.NODE_ENV === "production") {
    analytics.track("page_view", {
      path: to.path,
      name: to.name,
      from: from.path,
    });
  }
});

// 路由错误处理
router.onError((error) => {
  console.error("路由错误:", error);

  if (error.message.includes("Loading chunk")) {
    // 处理代码分割加载失败
    window.location.reload();
  }
});
```

### 动态路由与权限菜单

```javascript
// 动态路由管理
class DynamicRouteManager {
  constructor(router, store) {
    this.router = router;
    this.store = store;
    this.addedRoutes = [];
  }

  async loadUserRoutes() {
    try {
      // 从服务器获取用户权限路由
      const userRoutes = await this.store.dispatch("auth/fetchUserRoutes");

      // 生成路由配置
      const routeConfigs = this.generateRouteConfigs(userRoutes);

      // 添加到路由器
      this.addRoutes(routeConfigs);

      return routeConfigs;
    } catch (error) {
      console.error("加载用户路由失败:", error);
      throw error;
    }
  }

  generateRouteConfigs(userRoutes) {
    return userRoutes.map((route) => ({
      path: route.path,
      name: route.name,
      component: () => this.loadComponent(route.component),
      meta: {
        title: route.title,
        icon: route.icon,
        permissions: route.permissions,
        ...route.meta,
      },
      children: route.children ? this.generateRouteConfigs(route.children) : [],
    }));
  }

  loadComponent(componentPath) {
    // 动态加载组件
    const componentMap = {
      UserManagement: () => import("@/views/admin/UserManagement.vue"),
      RoleManagement: () => import("@/views/admin/RoleManagement.vue"),
      SystemSettings: () => import("@/views/admin/SystemSettings.vue"),
      DataAnalytics: () => import("@/views/analytics/DataAnalytics.vue"),
    };

    return (
      componentMap[componentPath] || (() => import("@/views/NotFound.vue"))
    );
  }

  addRoutes(routes) {
    routes.forEach((route) => {
      this.router.addRoute("Admin", route); // 添加到 Admin 父路由下
      this.addedRoutes.push(route.name);
    });
  }

  removeRoutes() {
    this.addedRoutes.forEach((routeName) => {
      if (this.router.hasRoute(routeName)) {
        this.router.removeRoute(routeName);
      }
    });
    this.addedRoutes = [];
  }

  reset() {
    this.removeRoutes();
    this.addedRoutes = [];
  }
}

// Vuex store 中的路由管理
const authModule = {
  state: {
    user: null,
    permissions: [],
    menuRoutes: [],
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions;
    },
    SET_MENU_ROUTES(state, routes) {
      state.menuRoutes = routes;
    },
  },

  actions: {
    async login({ commit, dispatch }, credentials) {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      // 保存用户信息
      commit("SET_USER", user);
      setToken(token);

      // 加载用户路由
      await dispatch("loadUserRoutes");
    },

    async loadUserRoutes({ commit, state }) {
      const routes = await authAPI.getUserRoutes(state.user.id);

      // 过滤权限路由
      const filteredRoutes = this.filterRoutesByPermissions(
        routes,
        state.user.permissions
      );

      commit("SET_MENU_ROUTES", filteredRoutes);
      return filteredRoutes;
    },

    filterRoutesByPermissions(routes, permissions) {
      return routes.filter((route) => {
        if (route.meta?.permissions) {
          const hasPermission = route.meta.permissions.some((permission) =>
            permissions.includes(permission)
          );
          if (!hasPermission) return false;
        }

        if (route.children) {
          route.children = this.filterRoutesByPermissions(
            route.children,
            permissions
          );
        }

        return true;
      });
    },
  },
};
```

## 🛡️ 路由安全与性能优化

### 路由懒加载与预加载

```javascript
// 智能预加载策略
class RoutePreloader {
  constructor() {
    this.preloadedRoutes = new Set();
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  // 基于用户行为的预加载
  preloadOnHover(routeName, delay = 200) {
    let timeoutId;

    return {
      onMouseEnter: () => {
        timeoutId = setTimeout(() => {
          this.preload(routeName);
        }, delay);
      },
      onMouseLeave: () => {
        clearTimeout(timeoutId);
      },
    };
  }

  // 基于网络状态的预加载
  preloadOnGoodConnection(routeName) {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      const isGoodConnection =
        connection.effectiveType === "4g" &&
        !connection.saveData &&
        connection.downlink > 1.5;

      if (isGoodConnection) {
        this.preload(routeName);
      }
    }
  }

  // 基于用户访问模式的预加载
  preloadByPattern(currentRoute, userHistory) {
    const patterns = this.analyzeUserPatterns(userHistory);
    const likelyNextRoutes = patterns[currentRoute] || [];

    likelyNextRoutes.forEach((route) => {
      this.preload(route, { priority: "low" });
    });
  }

  async preload(routeName, options = {}) {
    if (this.preloadedRoutes.has(routeName)) {
      return;
    }

    this.preloadQueue.push({ routeName, options });

    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  async processPreloadQueue() {
    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const { routeName, options } = this.preloadQueue.shift();

      try {
        await this.loadRouteComponent(routeName);
        this.preloadedRoutes.add(routeName);
      } catch (error) {
        console.warn(`预加载路由 ${routeName} 失败:`, error);
      }

      // 避免阻塞主线程
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    this.isPreloading = false;
  }

  analyzeUserPatterns(history) {
    const patterns = {};

    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i];
      const next = history[i + 1];

      if (!patterns[current]) {
        patterns[current] = {};
      }

      patterns[current][next] = (patterns[current][next] || 0) + 1;
    }

    // 转换为排序后的数组
    Object.keys(patterns).forEach((route) => {
      patterns[route] = Object.entries(patterns[route])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3) // 取前3个最可能的路由
        .map(([nextRoute]) => nextRoute);
    });

    return patterns;
  }
}

// 使用预加载器
const preloader = new RoutePreloader();

// 在 Vue 组件中使用
export default {
  setup() {
    const router = useRouter();

    // 鼠标悬停预加载
    const productLinkProps = preloader.preloadOnHover("ProductDetail");

    // 网络状况良好时预加载
    onMounted(() => {
      preloader.preloadOnGoodConnection("UserProfile");
    });

    return {
      productLinkProps,
    };
  },
};
```

### 路由性能监控

```javascript
// 路由性能监控
class RoutePerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  startNavigation(to, from) {
    const navigationId = `${from.name || "unknown"}->${to.name}`;
    this.startTimes.set(navigationId, performance.now());
  }

  endNavigation(to, from) {
    const navigationId = `${from.name || "unknown"}->${to.name}`;
    const startTime = this.startTimes.get(navigationId);

    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(navigationId, duration);
      this.startTimes.delete(navigationId);
    }
  }

  recordMetric(navigationId, duration) {
    if (!this.metrics.has(navigationId)) {
      this.metrics.set(navigationId, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        averageTime: 0,
      });
    }

    const metric = this.metrics.get(navigationId);
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.averageTime = metric.totalTime / metric.count;

    // 如果导航时间过长，发出警告
    if (duration > 3000) {
      console.warn(`慢导航检测: ${navigationId} 耗时 ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics() {
    const result = {};
    for (const [key, value] of this.metrics) {
      result[key] = { ...value };
    }
    return result;
  }

  getSlowRoutes(threshold = 1000) {
    const slowRoutes = [];
    for (const [route, metric] of this.metrics) {
      if (metric.averageTime > threshold) {
        slowRoutes.push({ route, ...metric });
      }
    }
    return slowRoutes.sort((a, b) => b.averageTime - a.averageTime);
  }

  reportToAnalytics() {
    const metrics = this.getMetrics();
    const slowRoutes = this.getSlowRoutes();

    // 发送到分析服务
    analytics.track("route_performance", {
      metrics,
      slowRoutes,
      timestamp: Date.now(),
    });
  }
}

// 集成到路由器
const performanceMonitor = new RoutePerformanceMonitor();

router.beforeEach((to, from, next) => {
  performanceMonitor.startNavigation(to, from);
  next();
});

router.afterEach((to, from) => {
  performanceMonitor.endNavigation(to, from);
});

// 定期报告性能数据
setInterval(() => {
  performanceMonitor.reportToAnalytics();
}, 60000); // 每分钟报告一次
```

### 路由缓存策略

```javascript
// 路由级别的缓存管理
class RouteCacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheConfig = new Map();
  }

  setCacheConfig(routeName, config) {
    this.cacheConfig.set(routeName, {
      ttl: 300000, // 5分钟默认TTL
      maxSize: 10, // 最大缓存条目数
      strategy: "lru", // LRU策略
      ...config,
    });
  }

  shouldCache(route) {
    return this.cacheConfig.has(route.name) && route.meta?.cache !== false;
  }

  getCacheKey(route) {
    const params = JSON.stringify(route.params);
    const query = JSON.stringify(route.query);
    return `${route.name}:${params}:${query}`;
  }

  get(route) {
    if (!this.shouldCache(route)) return null;

    const key = this.getCacheKey(route);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.getCacheTTL(route)) {
      // 更新LRU顺序
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached.data;
    }

    return null;
  }

  set(route, data) {
    if (!this.shouldCache(route)) return;

    const key = this.getCacheKey(route);
    const config = this.cacheConfig.get(route.name);

    // 检查缓存大小限制
    if (this.cache.size >= config.maxSize) {
      // 删除最旧的条目 (LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  invalidate(pattern) {
    if (typeof pattern === "string") {
      // 精确匹配
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      // 正则匹配
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  getCacheTTL(route) {
    const config = this.cacheConfig.get(route.name);
    return config?.ttl || 300000;
  }

  clear() {
    this.cache.clear();
  }
}

// 在 Vue 组件中使用缓存
export default {
  name: "CachedComponent",

  async beforeRouteEnter(to, from, next) {
    const cachedData = routeCacheManager.get(to);

    if (cachedData) {
      next((vm) => {
        vm.data = cachedData;
        vm.loading = false;
      });
    } else {
      try {
        const data = await fetchData(to.params);
        routeCacheManager.set(to, data);

        next((vm) => {
          vm.data = data;
          vm.loading = false;
        });
      } catch (error) {
        next((vm) => {
          vm.error = error;
          vm.loading = false;
        });
      }
    }
  },

  data() {
    return {
      data: null,
      loading: true,
      error: null,
    };
  },
};
```

---

🧭 **现代前端路由系统不仅要处理页面导航，还要考虑性能优化、安全控制、用户体验等多个方面。掌握路由的深层原理和高级应用技巧，能够帮助你构建更加健壮和高效的单页应用！**
