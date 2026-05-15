# 小程序状态管理

随着小程序应用复杂度的增加，状态管理变得越来越重要。本文详细介绍小程序中的各种状态管理方案和最佳实践。

## 原生状态管理 📊

### 页面级状态管理

```javascript
// pages/index/index.js
Page({
  data: {
    // 页面状态
    userInfo: null,
    isLoading: false,
    error: null,

    // 列表状态
    list: [],
    hasMore: true,
    pageNum: 1,

    // UI 状态
    showModal: false,
    selectedTab: 0,
  },

  onLoad() {
    this.initPage();
  },

  async initPage() {
    try {
      this.setData({ isLoading: true });

      // 并行加载数据
      const [userInfo, list] = await Promise.all([
        this.getUserInfo(),
        this.getList(1),
      ]);

      this.setData({
        userInfo,
        list,
        isLoading: false,
      });
    } catch (error) {
      this.setData({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // 状态更新方法
  updateUserInfo(userInfo) {
    this.setData({ userInfo });

    // 同步到本地存储
    wx.setStorageSync("userInfo", userInfo);
  },

  // 列表状态管理
  async loadMoreList() {
    if (this.data.isLoading || !this.data.hasMore) return;

    try {
      this.setData({ isLoading: true });

      const newList = await this.getList(this.data.pageNum + 1);

      this.setData({
        list: [...this.data.list, ...newList],
        pageNum: this.data.pageNum + 1,
        hasMore: newList.length > 0,
        isLoading: false,
      });
    } catch (error) {
      this.setData({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // UI 状态管理
  toggleModal() {
    this.setData({
      showModal: !this.data.showModal,
    });
  },

  switchTab(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedTab: index });
  },
});
```

### 组件状态管理

```javascript
// components/user-profile/user-profile.js
Component({
  properties: {
    userId: String,
  },

  data: {
    // 组件内部状态
    userInfo: null,
    isEditing: false,
    formData: {},
    validationErrors: {},

    // 异步状态
    loading: false,
    error: null,
  },

  observers: {
    userId: function (newUserId) {
      if (newUserId) {
        this.loadUserInfo(newUserId);
      }
    },
  },

  lifetimes: {
    attached() {
      if (this.data.userId) {
        this.loadUserInfo(this.data.userId);
      }
    },
  },

  methods: {
    async loadUserInfo(userId) {
      try {
        this.setData({ loading: true, error: null });

        const userInfo = await this.fetchUserInfo(userId);

        this.setData({
          userInfo,
          formData: { ...userInfo }, // 复制用于编辑
          loading: false,
        });
      } catch (error) {
        this.setData({
          error: error.message,
          loading: false,
        });
      }
    },

    // 编辑状态管理
    startEdit() {
      this.setData({
        isEditing: true,
        formData: { ...this.data.userInfo },
      });
    },

    cancelEdit() {
      this.setData({
        isEditing: false,
        formData: { ...this.data.userInfo },
        validationErrors: {},
      });
    },

    // 表单状态管理
    handleInputChange(e) {
      const { field } = e.currentTarget.dataset;
      const { value } = e.detail;

      this.setData({
        [`formData.${field}`]: value,
      });

      // 清除对应字段的验证错误
      if (this.data.validationErrors[field]) {
        this.setData({
          [`validationErrors.${field}`]: null,
        });
      }
    },

    // 验证状态管理
    validateForm() {
      const { formData } = this.data;
      const errors = {};

      if (!formData.name || !formData.name.trim()) {
        errors.name = "姓名不能为空";
      }

      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "请输入有效的邮箱地址";
      }

      this.setData({ validationErrors: errors });
      return Object.keys(errors).length === 0;
    },

    async saveUserInfo() {
      if (!this.validateForm()) return;

      try {
        this.setData({ loading: true });

        const updatedUser = await this.updateUserInfo(
          this.data.userId,
          this.data.formData
        );

        this.setData({
          userInfo: updatedUser,
          isEditing: false,
          loading: false,
        });

        // 通知父组件
        this.triggerEvent("userUpdated", { user: updatedUser });

        wx.showToast({
          title: "保存成功",
          icon: "success",
        });
      } catch (error) {
        this.setData({
          error: error.message,
          loading: false,
        });
      }
    },
  },
});
```

## 全局状态管理 🌐

### 简单的全局 Store

```javascript
// store/index.js
class Store {
  constructor() {
    this.state = {
      // 用户状态
      user: {
        isLoggedIn: false,
        userInfo: null,
        token: null,
      },

      // 应用状态
      app: {
        theme: "light",
        language: "zh-CN",
        networkStatus: "online",
      },

      // 业务状态
      cart: {
        items: [],
        total: 0,
      },
    };

    this.listeners = new Map();
    this.middleware = [];
  }

  // 获取状态
  getState(path) {
    if (!path) return this.state;

    return path.split(".").reduce((obj, key) => {
      return obj && obj[key];
    }, this.state);
  }

  // 设置状态
  setState(path, value, options = {}) {
    const oldState = { ...this.state };

    // 更新状态
    if (path.includes(".")) {
      const keys = path.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return obj[key];
      }, this.state);
      target[lastKey] = value;
    } else {
      this.state[path] = value;
    }

    // 执行中间件
    this.middleware.forEach((middleware) => {
      middleware({
        action: { type: "SET_STATE", path, value },
        oldState,
        newState: this.state,
      });
    });

    // 通知监听器
    this.notify(path, value, oldState);

    // 持久化
    if (options.persist) {
      wx.setStorageSync(`store_${path}`, value);
    }
  }

  // 订阅状态变化
  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }

    this.listeners.get(path).add(callback);

    // 返回取消订阅函数
    return () => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // 通知监听器
  notify(path, value, oldState) {
    // 通知精确路径监听器
    if (this.listeners.has(path)) {
      this.listeners.get(path).forEach((callback) => {
        callback(value, this.getState(path.split(".").slice(0, -1).join(".")));
      });
    }

    // 通知父路径监听器
    const pathParts = path.split(".");
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentPath = pathParts.slice(0, i).join(".");
      if (this.listeners.has(parentPath)) {
        this.listeners.get(parentPath).forEach((callback) => {
          callback(this.getState(parentPath), oldState);
        });
      }
    }
  }

  // 批量更新
  batch(updates) {
    const oldState = { ...this.state };

    updates.forEach(({ path, value }) => {
      if (path.includes(".")) {
        const keys = path.split(".");
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
          if (!obj[key]) obj[key] = {};
          return obj[key];
        }, this.state);
        target[lastKey] = value;
      } else {
        this.state[path] = value;
      }
    });

    // 批量通知
    updates.forEach(({ path, value }) => {
      this.notify(path, value, oldState);
    });
  }

  // 添加中间件
  use(middleware) {
    this.middleware.push(middleware);
  }

  // 从本地存储恢复状态
  restore() {
    try {
      const keys = ["user", "app.theme", "app.language"];
      keys.forEach((key) => {
        const value = wx.getStorageSync(`store_${key}`);
        if (value !== "") {
          this.setState(key, value);
        }
      });
    } catch (error) {
      console.error("恢复状态失败:", error);
    }
  }
}

// 创建全局实例
const store = new Store();

// 添加日志中间件
store.use(({ action, oldState, newState }) => {
  console.log("State Change:", {
    action,
    oldState,
    newState,
  });
});

export default store;
```

### Store 使用示例

```javascript
// 在页面中使用 Store
import store from "../../store/index";

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    theme: "light",
  },

  onLoad() {
    // 订阅状态变化
    this.unsubscribeUser = store.subscribe("user", (user) => {
      this.setData({
        userInfo: user.userInfo,
        isLoggedIn: user.isLoggedIn,
      });
    });

    this.unsubscribeTheme = store.subscribe("app.theme", (theme) => {
      this.setData({ theme });
    });

    // 获取初始状态
    const user = store.getState("user");
    const theme = store.getState("app.theme");

    this.setData({
      userInfo: user.userInfo,
      isLoggedIn: user.isLoggedIn,
      theme,
    });
  },

  onUnload() {
    // 取消订阅
    if (this.unsubscribeUser) this.unsubscribeUser();
    if (this.unsubscribeTheme) this.unsubscribeTheme();
  },

  async login() {
    try {
      const { userInfo, token } = await this.performLogin();

      // 批量更新用户状态
      store.batch([
        { path: "user.isLoggedIn", value: true },
        { path: "user.userInfo", value: userInfo },
        { path: "user.token", value: token },
      ]);

      wx.showToast({
        title: "登录成功",
        icon: "success",
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "error",
      });
    }
  },

  logout() {
    store.batch([
      { path: "user.isLoggedIn", value: false },
      { path: "user.userInfo", value: null },
      { path: "user.token", value: null },
    ]);
  },

  toggleTheme() {
    const currentTheme = store.getState("app.theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    store.setState("app.theme", newTheme, { persist: true });
  },
});
```

### 高级状态管理 - Actions

```javascript
// store/actions.js
import store from "./index";
import api from "../utils/api";

// 用户相关 Actions
export const userActions = {
  async login(credentials) {
    try {
      store.setState("user.isLoading", true);

      const { userInfo, token } = await api.login(credentials);

      store.batch([
        { path: "user.isLoggedIn", value: true },
        { path: "user.userInfo", value: userInfo },
        { path: "user.token", value: token },
        { path: "user.isLoading", value: false },
        { path: "user.error", value: null },
      ]);

      // 持久化关键信息
      wx.setStorageSync("token", token);

      return { success: true, userInfo };
    } catch (error) {
      store.batch([
        { path: "user.isLoading", value: false },
        { path: "user.error", value: error.message },
      ]);

      throw error;
    }
  },

  async logout() {
    try {
      await api.logout();
    } catch (error) {
      console.warn("退出登录失败:", error);
    } finally {
      // 清除所有用户相关状态
      store.batch([
        { path: "user.isLoggedIn", value: false },
        { path: "user.userInfo", value: null },
        { path: "user.token", value: null },
        { path: "cart.items", value: [] },
        { path: "cart.total", value: 0 },
      ]);

      // 清除本地存储
      wx.removeStorageSync("token");
    }
  },

  async updateProfile(profileData) {
    try {
      const updatedUser = await api.updateProfile(profileData);
      store.setState("user.userInfo", updatedUser);
      return updatedUser;
    } catch (error) {
      store.setState("user.error", error.message);
      throw error;
    }
  },
};

// 购物车相关 Actions
export const cartActions = {
  addItem(product) {
    const currentItems = store.getState("cart.items");
    const existingItem = currentItems.find((item) => item.id === product.id);

    let newItems;
    if (existingItem) {
      newItems = currentItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newItems = [...currentItems, { ...product, quantity: 1 }];
    }

    const newTotal = this.calculateTotal(newItems);

    store.batch([
      { path: "cart.items", value: newItems },
      { path: "cart.total", value: newTotal },
    ]);
  },

  removeItem(productId) {
    const currentItems = store.getState("cart.items");
    const newItems = currentItems.filter((item) => item.id !== productId);
    const newTotal = this.calculateTotal(newItems);

    store.batch([
      { path: "cart.items", value: newItems },
      { path: "cart.total", value: newTotal },
    ]);
  },

  updateQuantity(productId, quantity) {
    const currentItems = store.getState("cart.items");

    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const newItems = currentItems.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );

    const newTotal = this.calculateTotal(newItems);

    store.batch([
      { path: "cart.items", value: newItems },
      { path: "cart.total", value: newTotal },
    ]);
  },

  clearCart() {
    store.batch([
      { path: "cart.items", value: [] },
      { path: "cart.total", value: 0 },
    ]);
  },

  calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  },
};

// 使用 Actions
// pages/login/login.js
import { userActions } from "../../store/actions";

Page({
  async handleLogin() {
    try {
      const result = await userActions.login({
        username: this.data.username,
        password: this.data.password,
      });

      wx.navigateBack();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "error",
      });
    }
  },
});
```

## Mobx 状态管理 📦

### 安装和配置

```bash
npm install mobx-miniprogram mobx-miniprogram-bindings
```

```javascript
// store/counter.js
import { observable, action } from "mobx-miniprogram";

export const counterStore = observable({
  // 状态
  count: 0,

  // 计算属性
  get doubleCount() {
    return this.count * 2;
  },

  // Actions
  increment: action(function () {
    this.count++;
  }),

  decrement: action(function () {
    this.count--;
  }),

  reset: action(function () {
    this.count = 0;
  }),
});
```

### 在页面中使用 MobX

```javascript
// pages/counter/counter.js
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { counterStore } from "../../store/counter";

Page({
  data: {},

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: counterStore,
      fields: ["count", "doubleCount"],
      actions: ["increment", "decrement", "reset"],
    });
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings();
  },
});
```

```xml
<!-- pages/counter/counter.wxml -->
<view class="container">
  <text class="count">当前计数: {{count}}</text>
  <text class="double-count">双倍计数: {{doubleCount}}</text>

  <view class="buttons">
    <button bindtap="increment">+1</button>
    <button bindtap="decrement">-1</button>
    <button bindtap="reset">重置</button>
  </view>
</view>
```

### 复杂 MobX Store

```javascript
// store/todo.js
import { observable, action, computed } from "mobx-miniprogram";

export const todoStore = observable({
  // 状态
  todos: [],
  filter: "all", // all, active, completed

  // 计算属性
  get activeTodos() {
    return this.todos.filter((todo) => !todo.completed);
  },

  get completedTodos() {
    return this.todos.filter((todo) => todo.completed);
  },

  get filteredTodos() {
    switch (this.filter) {
      case "active":
        return this.activeTodos;
      case "completed":
        return this.completedTodos;
      default:
        return this.todos;
    }
  },

  get stats() {
    return {
      total: this.todos.length,
      active: this.activeTodos.length,
      completed: this.completedTodos.length,
    };
  },

  // Actions
  addTodo: action(function (text) {
    const todo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
    };
    this.todos.push(todo);
  }),

  toggleTodo: action(function (id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }),

  removeTodo: action(function (id) {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }),

  updateTodo: action(function (id, text) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.text = text.trim();
    }
  }),

  setFilter: action(function (filter) {
    this.filter = filter;
  }),

  clearCompleted: action(function () {
    this.todos = this.todos.filter((todo) => !todo.completed);
  }),

  toggleAll: action(function () {
    const allCompleted = this.todos.every((todo) => todo.completed);
    this.todos.forEach((todo) => {
      todo.completed = !allCompleted;
    });
  }),
});
```

## 数据持久化 💾

### 本地存储管理

```javascript
// utils/storage.js
class StorageManager {
  constructor() {
    this.prefix = "app_";
  }

  // 设置数据
  set(key, value, options = {}) {
    const fullKey = this.prefix + key;

    try {
      const data = {
        value,
        timestamp: Date.now(),
        expires: options.expires ? Date.now() + options.expires : null,
      };

      if (options.sync) {
        wx.setStorageSync(fullKey, data);
      } else {
        return new Promise((resolve, reject) => {
          wx.setStorage({
            key: fullKey,
            data,
            success: resolve,
            fail: reject,
          });
        });
      }
    } catch (error) {
      console.error("存储数据失败:", error);
      throw error;
    }
  }

  // 获取数据
  get(key, options = {}) {
    const fullKey = this.prefix + key;

    try {
      let data;

      if (options.sync) {
        data = wx.getStorageSync(fullKey);
      } else {
        return new Promise((resolve, reject) => {
          wx.getStorage({
            key: fullKey,
            success: (res) => resolve(res.data),
            fail: reject,
          });
        });
      }

      if (!data) return options.defaultValue || null;

      // 检查过期时间
      if (data.expires && Date.now() > data.expires) {
        this.remove(key, { sync: true });
        return options.defaultValue || null;
      }

      return data.value;
    } catch (error) {
      console.error("获取数据失败:", error);
      return options.defaultValue || null;
    }
  }

  // 删除数据
  remove(key, options = {}) {
    const fullKey = this.prefix + key;

    if (options.sync) {
      wx.removeStorageSync(fullKey);
    } else {
      return new Promise((resolve, reject) => {
        wx.removeStorage({
          key: fullKey,
          success: resolve,
          fail: reject,
        });
      });
    }
  }

  // 清除所有数据
  clear() {
    return new Promise((resolve, reject) => {
      wx.getStorageInfo({
        success: (res) => {
          const keys = res.keys.filter((key) => key.startsWith(this.prefix));

          Promise.all(
            keys.map(
              (key) =>
                new Promise((res, rej) => {
                  wx.removeStorage({
                    key,
                    success: res,
                    fail: rej,
                  });
                })
            )
          )
            .then(resolve)
            .catch(reject);
        },
        fail: reject,
      });
    });
  }

  // 获取存储信息
  getInfo() {
    return new Promise((resolve, reject) => {
      wx.getStorageInfo({
        success: (res) => {
          const appKeys = res.keys.filter((key) => key.startsWith(this.prefix));
          resolve({
            ...res,
            appKeys,
            appKeysCount: appKeys.length,
          });
        },
        fail: reject,
      });
    });
  }
}

export default new StorageManager();
```

### 状态持久化插件

```javascript
// store/plugins/persist.js
export function createPersistPlugin(options = {}) {
  const {
    key = "store",
    storage = wx,
    whitelist = [],
    blacklist = [],
    transform = {},
  } = options;

  return (store) => {
    // 恢复状态
    const restoreState = () => {
      try {
        const persistedState = storage.getStorageSync(key);
        if (persistedState) {
          Object.keys(persistedState).forEach((path) => {
            if (shouldPersist(path)) {
              const value = transform[path]
                ? transform[path].deserialize(persistedState[path])
                : persistedState[path];
              store.setState(path, value);
            }
          });
        }
      } catch (error) {
        console.error("恢复状态失败:", error);
      }
    };

    // 持久化状态
    const persistState = (path, value) => {
      if (!shouldPersist(path)) return;

      try {
        const currentPersisted = storage.getStorageSync(key) || {};
        const transformedValue = transform[path]
          ? transform[path].serialize(value)
          : value;

        currentPersisted[path] = transformedValue;
        storage.setStorageSync(key, currentPersisted);
      } catch (error) {
        console.error("持久化状态失败:", error);
      }
    };

    // 判断是否应该持久化
    const shouldPersist = (path) => {
      if (blacklist.includes(path)) return false;
      if (whitelist.length > 0) return whitelist.includes(path);
      return true;
    };

    // 监听状态变化
    store.use(({ action }) => {
      if (action.type === "SET_STATE") {
        persistState(action.path, action.value);
      }
    });

    // 初始化时恢复状态
    restoreState();
  };
}

// 使用持久化插件
import store from "./index";
import { createPersistPlugin } from "./plugins/persist";

store.use(
  createPersistPlugin({
    key: "app_store",
    whitelist: ["user", "app.theme", "app.language"],
    transform: {
      user: {
        serialize: (user) => ({
          ...user,
          token: user.token ? "***" : null, // 敏感信息处理
        }),
        deserialize: (user) => user,
      },
    },
  })
);
```

## 最佳实践 ✨

### 状态设计原则

```javascript
// ✅ 好的状态设计
const goodState = {
  // 1. 扁平化结构
  user: {
    id: null,
    name: "",
    email: "",
    avatar: "",
  },

  // 2. 标准化数据
  posts: {
    byId: {
      1: { id: "1", title: "Post 1", authorId: "user1" },
      2: { id: "2", title: "Post 2", authorId: "user2" },
    },
    allIds: ["1", "2"],
  },

  // 3. 分离 UI 状态和业务状态
  ui: {
    isLoading: false,
    error: null,
    selectedPostId: null,
  },
};

// ❌ 不好的状态设计
const badState = {
  // 深度嵌套
  user: {
    profile: {
      personal: {
        info: {
          name: "",
        },
      },
    },
  },

  // 冗余数据
  posts: [
    {
      id: "1",
      title: "Post 1",
      author: { id: "user1", name: "User 1" }, // 用户信息重复
    },
  ],
};
```

### 性能优化

```javascript
// 1. 避免不必要的状态更新
Component({
  observers: {
    "userInfo.name": function (name) {
      // 只在真正变化时更新
      if (name !== this.data.displayName) {
        this.setData({ displayName: name });
      }
    },
  },

  methods: {
    updateUser(newUser) {
      // 浅比较避免无意义更新
      const currentUser = this.data.userInfo;
      const hasChanged = Object.keys(newUser).some(
        (key) => newUser[key] !== currentUser[key]
      );

      if (hasChanged) {
        this.setData({ userInfo: { ...currentUser, ...newUser } });
      }
    },
  },
});

// 2. 批量更新状态
const batchUpdate = (updates) => {
  const batchedData = {};
  updates.forEach(({ key, value }) => {
    batchedData[key] = value;
  });
  this.setData(batchedData);
};

// 3. 使用计算属性减少重复计算
Component({
  data: {
    _computedCache: {},
  },

  methods: {
    getFilteredList() {
      const { list, filter } = this.data;
      const cacheKey = `${list.length}_${filter}`;

      if (this.data._computedCache[cacheKey]) {
        return this.data._computedCache[cacheKey];
      }

      const filtered = list.filter(
        (item) => filter === "all" || item.status === filter
      );

      this.setData({
        [`_computedCache.${cacheKey}`]: filtered,
      });

      return filtered;
    },
  },
});
```

### 错误处理

```javascript
// store/error-handler.js
export class ErrorHandler {
  constructor(store) {
    this.store = store;
  }

  handle(error, context = {}) {
    console.error("应用错误:", error, context);

    // 设置错误状态
    this.store.setState("app.error", {
      message: error.message,
      code: error.code,
      context,
      timestamp: Date.now(),
    });

    // 错误上报
    this.report(error, context);

    // 用户提示
    this.showUserFriendlyMessage(error);
  }

  report(error, context) {
    // 上报到错误监控服务
    wx.reportAnalytics("error", {
      error: error.message,
      stack: error.stack,
      context,
    });
  }

  showUserFriendlyMessage(error) {
    const userMessages = {
      NETWORK_ERROR: "网络连接异常，请检查网络设置",
      AUTH_FAILED: "登录已过期，请重新登录",
      PERMISSION_DENIED: "权限不足，无法执行此操作",
    };

    const message = userMessages[error.code] || "操作失败，请稍后重试";

    wx.showToast({
      title: message,
      icon: "none",
      duration: 2000,
    });
  }

  clear() {
    this.store.setState("app.error", null);
  }
}

// 在 actions 中使用
export const userActions = {
  async login(credentials) {
    try {
      // ... 登录逻辑
    } catch (error) {
      errorHandler.handle(error, {
        action: "login",
        userId: credentials.username,
      });
      throw error;
    }
  },
};
```

### 开发工具

```javascript
// store/devtools.js
export function createDevtools(store) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // 状态变化日志
  store.use(({ action, oldState, newState }) => {
    console.group(`🔄 ${action.type}: ${action.path}`);
    console.log("Action:", action);
    console.log("Old State:", oldState);
    console.log("New State:", newState);
    console.groupEnd();
  });

  // 时间旅行调试
  const history = [];
  let currentIndex = -1;

  store.use(({ action, newState }) => {
    // 记录状态快照
    history.push({
      action,
      state: JSON.parse(JSON.stringify(newState)),
      timestamp: Date.now(),
    });
    currentIndex = history.length - 1;
  });

  // 暴露调试方法到全局
  wx.storeDevtools = {
    getHistory: () => history,
    getCurrentIndex: () => currentIndex,
    jumpToState: (index) => {
      if (index >= 0 && index < history.length) {
        const snapshot = history[index];
        store.state = JSON.parse(JSON.stringify(snapshot.state));
        currentIndex = index;
        console.log("跳转到状态:", snapshot);
      }
    },
    exportState: () => {
      return JSON.stringify(store.state, null, 2);
    },
    importState: (stateJson) => {
      try {
        const state = JSON.parse(stateJson);
        store.state = state;
        console.log("导入状态成功");
      } catch (error) {
        console.error("导入状态失败:", error);
      }
    },
  };
}
```

---

🎯 **下一步**: 掌握了状态管理后，建议学习 [小程序性能优化](./performance-optimization.md) 来提升应用性能！
