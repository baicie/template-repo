# 小程序组件开发

组件化是现代前端开发的核心思想，小程序同样支持强大的组件化开发。本文详细介绍小程序自定义组件的开发技巧和最佳实践。

## 组件基础 🧩

### 组件结构

小程序自定义组件由四个文件组成：

- `.wxml` - 组件模板
- `.wxss` - 组件样式
- `.js` - 组件逻辑
- `.json` - 组件配置

```
components/
├── custom-button/
│   ├── custom-button.wxml
│   ├── custom-button.wxss
│   ├── custom-button.js
│   └── custom-button.json
└── user-card/
    ├── user-card.wxml
    ├── user-card.wxss
    ├── user-card.js
    └── user-card.json
```

### 基础组件示例

```json
// components/custom-button/custom-button.json
{
  "component": true,
  "usingComponents": {}
}
```

```xml
<!-- components/custom-button/custom-button.wxml -->
<button
  class="custom-btn {{type}} {{size}} {{disabled ? 'disabled' : ''}}"
  bindtap="handleTap"
  disabled="{{disabled}}"
>
  <text wx:if="{{loading}}" class="loading">⏳</text>
  <text class="btn-text">{{text}}</text>
</button>
```

```css
/* components/custom-button/custom-button.wxss */
.custom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  border: none;
  font-size: 32rpx;
  transition: all 0.3s ease;
}

.custom-btn.primary {
  background-color: #007aff;
  color: white;
}

.custom-btn.secondary {
  background-color: #f8f8f8;
  color: #333;
  border: 1rpx solid #e0e0e0;
}

.custom-btn.small {
  padding: 16rpx 32rpx;
  font-size: 28rpx;
}

.custom-btn.medium {
  padding: 20rpx 40rpx;
  font-size: 32rpx;
}

.custom-btn.large {
  padding: 24rpx 48rpx;
  font-size: 36rpx;
}

.custom-btn.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.loading {
  margin-right: 8rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn-text {
  line-height: 1;
}
```

```javascript
// components/custom-button/custom-button.js
Component({
  // 组件属性定义
  properties: {
    // 按钮文本
    text: {
      type: String,
      value: "按钮",
    },
    // 按钮类型
    type: {
      type: String,
      value: "primary",
    },
    // 按钮大小
    size: {
      type: String,
      value: "medium",
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false,
    },
    // 是否加载中
    loading: {
      type: Boolean,
      value: false,
    },
  },

  // 组件数据
  data: {
    clickCount: 0,
  },

  // 组件生命周期
  lifetimes: {
    created() {
      console.log("组件被创建");
    },
    attached() {
      console.log("组件进入页面节点树");
    },
    ready() {
      console.log("组件在视图层布局完成后执行");
    },
    detached() {
      console.log("组件离开页面节点树");
    },
  },

  // 页面生命周期
  pageLifetimes: {
    show() {
      console.log("组件所在页面被展示");
    },
    hide() {
      console.log("组件所在页面被隐藏");
    },
  },

  // 组件方法
  methods: {
    handleTap(e) {
      if (this.data.disabled || this.data.loading) {
        return;
      }

      // 更新点击次数
      this.setData({
        clickCount: this.data.clickCount + 1,
      });

      // 触发自定义事件
      this.triggerEvent(
        "tap",
        {
          clickCount: this.data.clickCount,
          ...e.detail,
        },
        {
          bubbles: true,
          composed: true,
        }
      );
    },

    // 外部可调用的方法
    reset() {
      this.setData({
        clickCount: 0,
      });
    },
  },
});
```

### 使用自定义组件

```json
// pages/index/index.json
{
  "usingComponents": {
    "custom-button": "/components/custom-button/custom-button"
  }
}
```

```xml
<!-- pages/index/index.wxml -->
<view class="container">
  <custom-button
    text="主要按钮"
    type="primary"
    size="large"
    bind:tap="handleButtonTap"
  />

  <custom-button
    text="次要按钮"
    type="secondary"
    size="medium"
    bind:tap="handleButtonTap"
  />

  <custom-button
    text="加载按钮"
    type="primary"
    loading="{{isLoading}}"
    bind:tap="handleLoadingButton"
  />

  <custom-button
    text="禁用按钮"
    disabled="{{true}}"
    bind:tap="handleButtonTap"
  />
</view>
```

```javascript
// pages/index/index.js
Page({
  data: {
    isLoading: false,
  },

  handleButtonTap(e) {
    console.log("按钮被点击:", e.detail);
    wx.showToast({
      title: `点击了 ${e.detail.clickCount} 次`,
      icon: "success",
    });
  },

  handleLoadingButton() {
    this.setData({ isLoading: true });

    setTimeout(() => {
      this.setData({ isLoading: false });
    }, 2000);
  },
});
```

## 高级组件开发 🚀

### 复杂数据组件

```javascript
// components/user-card/user-card.js
Component({
  properties: {
    user: {
      type: Object,
      value: {},
      observer(newVal, oldVal) {
        console.log("用户数据变化:", newVal, oldVal);
        this.processUserData(newVal);
      },
    },
    showActions: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    processedUser: {},
    avatarError: false,
  },

  lifetimes: {
    ready() {
      this.processUserData(this.data.user);
    },
  },

  methods: {
    processUserData(user) {
      if (!user || !user.id) return;

      const processedUser = {
        ...user,
        displayName: user.nickname || user.name || "未知用户",
        avatarUrl: user.avatar || "/images/default-avatar.png",
        statusText: this.getStatusText(user.status),
        joinDate: this.formatDate(user.createdAt),
      };

      this.setData({ processedUser });
    },

    getStatusText(status) {
      const statusMap = {
        online: "在线",
        offline: "离线",
        busy: "忙碌",
        away: "离开",
      };
      return statusMap[status] || "未知";
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },

    handleAvatarError() {
      this.setData({
        avatarError: true,
        "processedUser.avatarUrl": "/images/default-avatar.png",
      });
    },

    handleFollow() {
      this.triggerEvent("follow", {
        userId: this.data.processedUser.id,
        action: "follow",
      });
    },

    handleMessage() {
      this.triggerEvent("message", {
        userId: this.data.processedUser.id,
        userName: this.data.processedUser.displayName,
      });
    },

    handleViewProfile() {
      this.triggerEvent("viewProfile", {
        userId: this.data.processedUser.id,
      });
    },
  },
});
```

```xml
<!-- components/user-card/user-card.wxml -->
<view class="user-card">
  <view class="user-header">
    <image
      class="avatar {{avatarError ? 'error' : ''}}"
      src="{{processedUser.avatarUrl}}"
      mode="aspectFill"
      binderror="handleAvatarError"
    />
    <view class="user-info">
      <text class="username">{{processedUser.displayName}}</text>
      <text class="user-status {{processedUser.status}}">{{processedUser.statusText}}</text>
      <text class="join-date">加入时间: {{processedUser.joinDate}}</text>
    </view>
  </view>

  <view class="user-stats" wx:if="{{processedUser.stats}}">
    <view class="stat-item">
      <text class="stat-number">{{processedUser.stats.posts || 0}}</text>
      <text class="stat-label">动态</text>
    </view>
    <view class="stat-item">
      <text class="stat-number">{{processedUser.stats.followers || 0}}</text>
      <text class="stat-label">粉丝</text>
    </view>
    <view class="stat-item">
      <text class="stat-number">{{processedUser.stats.following || 0}}</text>
      <text class="stat-label">关注</text>
    </view>
  </view>

  <view class="user-actions" wx:if="{{showActions}}">
    <button class="action-btn primary" bindtap="handleFollow">关注</button>
    <button class="action-btn secondary" bindtap="handleMessage">私信</button>
    <button class="action-btn secondary" bindtap="handleViewProfile">查看</button>
  </view>
</view>
```

### 表单组件

```javascript
// components/form-input/form-input.js
Component({
  properties: {
    label: String,
    value: String,
    type: {
      type: String,
      value: "text",
    },
    placeholder: String,
    required: Boolean,
    disabled: Boolean,
    maxlength: Number,
    rules: {
      type: Array,
      value: [],
    },
  },

  data: {
    focused: false,
    error: "",
    isValid: true,
  },

  methods: {
    handleInput(e) {
      const value = e.detail.value;
      this.setData({ value });

      // 实时验证
      this.validate(value);

      // 触发输入事件
      this.triggerEvent("input", {
        value,
        isValid: this.data.isValid,
      });
    },

    handleFocus() {
      this.setData({
        focused: true,
        error: "", // 聚焦时清除错误
      });
      this.triggerEvent("focus");
    },

    handleBlur() {
      this.setData({ focused: false });
      this.validate(this.data.value);
      this.triggerEvent("blur");
    },

    validate(value) {
      let isValid = true;
      let error = "";

      // 必填验证
      if (this.data.required && (!value || !value.trim())) {
        isValid = false;
        error = `${this.data.label}不能为空`;
      }

      // 自定义规则验证
      if (isValid && this.data.rules.length > 0) {
        for (const rule of this.data.rules) {
          if (rule.pattern && !rule.pattern.test(value)) {
            isValid = false;
            error = rule.message || "格式不正确";
            break;
          }

          if (rule.validator && !rule.validator(value)) {
            isValid = false;
            error = rule.message || "验证失败";
            break;
          }
        }
      }

      this.setData({ isValid, error });
      return isValid;
    },

    // 外部调用验证
    validateField() {
      return this.validate(this.data.value);
    },

    // 清除验证状态
    clearValidation() {
      this.setData({
        error: "",
        isValid: true,
      });
    },
  },
});
```

### 列表组件

```javascript
// components/virtual-list/virtual-list.js
Component({
  properties: {
    items: {
      type: Array,
      value: [],
    },
    itemHeight: {
      type: Number,
      value: 100,
    },
    bufferSize: {
      type: Number,
      value: 5,
    },
  },

  data: {
    scrollTop: 0,
    containerHeight: 0,
    visibleItems: [],
    startIndex: 0,
    endIndex: 0,
  },

  lifetimes: {
    ready() {
      this.getContainerHeight();
      this.updateVisibleItems();
    },
  },

  observers: {
    "items, itemHeight, containerHeight": function () {
      this.updateVisibleItems();
    },
  },

  methods: {
    getContainerHeight() {
      const query = this.createSelectorQuery();
      query.select(".virtual-list-container").boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          this.setData({
            containerHeight: res[0].height,
          });
        }
      });
    },

    handleScroll(e) {
      const scrollTop = e.detail.scrollTop;
      this.setData({ scrollTop });
      this.updateVisibleItems();
    },

    updateVisibleItems() {
      const { items, itemHeight, containerHeight, scrollTop, bufferSize } =
        this.data;

      if (!items.length || !containerHeight) return;

      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / itemHeight) - bufferSize
      );
      const endIndex = Math.min(
        items.length - 1,
        startIndex + visibleCount + bufferSize * 2
      );

      const visibleItems = [];
      for (let i = startIndex; i <= endIndex; i++) {
        visibleItems.push({
          ...items[i],
          index: i,
          top: i * itemHeight,
        });
      }

      this.setData({
        visibleItems,
        startIndex,
        endIndex,
      });
    },

    handleItemTap(e) {
      const { index } = e.currentTarget.dataset;
      const item = this.data.items[index];
      this.triggerEvent("itemTap", { item, index });
    },
  },
});
```

## 组件通信 📡

### 父子组件通信

```javascript
// 子组件向父组件传递数据
Component({
  methods: {
    notifyParent() {
      this.triggerEvent(
        "customEvent",
        {
          data: "from child component",
          timestamp: Date.now(),
        },
        {
          bubbles: true, // 是否冒泡
          composed: true, // 是否可以穿越组件边界
          capturePhase: false, // 是否在捕获阶段触发
        }
      );
    },
  },
});

// 父组件接收子组件数据
Page({
  handleCustomEvent(e) {
    console.log("收到子组件数据:", e.detail);
  },
});
```

### 组件间通信

```javascript
// 使用全局事件总线
// utils/event-bus.js
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }
}

export default new EventBus();

// 组件A发送消息
import EventBus from "../../utils/event-bus";

Component({
  methods: {
    sendMessage() {
      EventBus.emit("message", {
        from: "componentA",
        data: "Hello from A",
      });
    },
  },
});

// 组件B接收消息
import EventBus from "../../utils/event-bus";

Component({
  lifetimes: {
    attached() {
      EventBus.on("message", this.handleMessage.bind(this));
    },
    detached() {
      EventBus.off("message", this.handleMessage.bind(this));
    },
  },

  methods: {
    handleMessage(data) {
      console.log("收到消息:", data);
    },
  },
});
```

### 跨页面组件通信

```javascript
// 使用全局数据管理
// store/index.js
class Store {
  constructor() {
    this.state = {};
    this.listeners = {};
  }

  setState(key, value) {
    this.state[key] = value;
    this.notify(key, value);
  }

  getState(key) {
    return this.state[key];
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    // 返回取消订阅函数
    return () => {
      this.listeners[key] = this.listeners[key].filter((cb) => cb !== callback);
    };
  }

  notify(key, value) {
    if (this.listeners[key]) {
      this.listeners[key].forEach((callback) => callback(value));
    }
  }
}

export default new Store();

// 组件中使用
import store from "../../store/index";

Component({
  data: {
    userData: null,
  },

  lifetimes: {
    attached() {
      // 订阅数据变化
      this.unsubscribe = store.subscribe("user", (userData) => {
        this.setData({ userData });
      });

      // 获取初始数据
      const userData = store.getState("user");
      if (userData) {
        this.setData({ userData });
      }
    },

    detached() {
      // 取消订阅
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    },
  },

  methods: {
    updateUser() {
      const newUserData = { name: "新用户", id: 123 };
      store.setState("user", newUserData);
    },
  },
});
```

## 组件样式 🎨

### 样式隔离

```javascript
// 组件样式隔离选项
Component({
  options: {
    styleIsolation: "isolated", // 启用样式隔离
  },
});

// 样式隔离选项说明
const styleIsolationOptions = {
  isolated: "启用样式隔离，组件内外样式互不影响",
  "apply-shared": "页面样式影响组件，组件样式不影响页面",
  shared: "页面和组件样式互相影响",
};
```

### 外部样式类

```javascript
// 组件支持外部样式类
Component({
  externalClasses: ["custom-class", "header-class", "content-class"],

  properties: {
    customStyle: String,
  },
});
```

```xml
<!-- 组件模板 -->
<view class="container custom-class" style="{{customStyle}}">
  <view class="header header-class">标题</view>
  <view class="content content-class">内容</view>
</view>
```

```xml
<!-- 使用组件时传入样式类 -->
<custom-component
  custom-class="my-custom-style"
  header-class="my-header-style"
  custom-style="background-color: red;"
/>
```

### CSS 变量支持

```css
/* 组件样式中使用 CSS 变量 */
.custom-component {
  --primary-color: #007aff;
  --border-radius: 8rpx;
  --spacing: 20rpx;
}

.button {
  background-color: var(--primary-color);
  border-radius: var(--border-radius);
  padding: var(--spacing);
}

/* 外部可以覆盖 CSS 变量 */
.my-component {
  --primary-color: #ff3b30;
  --border-radius: 16rpx;
}
```

## 组件测试 🧪

### 单元测试

```javascript
// test/components/custom-button.test.js
const simulate = require("miniprogram-simulate");

describe("CustomButton Component", () => {
  let component;

  beforeEach(() => {
    component = simulate.render({
      usingComponents: {
        "custom-button": "/components/custom-button/custom-button",
      },
      template: `<custom-button text="测试按钮" bind:tap="handleTap" />`,
    });
  });

  afterEach(() => {
    component.detach();
  });

  test("should render button with correct text", () => {
    const button = component.querySelector("custom-button");
    expect(button.data.text).toBe("测试按钮");
  });

  test("should trigger tap event", () => {
    const button = component.querySelector("custom-button");
    const mockTap = jest.fn();

    component.addEventListener("tap", mockTap);
    button.dispatchEvent("tap");

    expect(mockTap).toHaveBeenCalled();
  });

  test("should be disabled when disabled prop is true", () => {
    const button = component.querySelector("custom-button");
    button.setData({ disabled: true });

    expect(button.data.disabled).toBe(true);
  });
});
```

### 集成测试

```javascript
// test/integration/user-card.test.js
const simulate = require("miniprogram-simulate");

describe("UserCard Integration", () => {
  let page;

  beforeEach(() => {
    page = simulate.render({
      usingComponents: {
        "user-card": "/components/user-card/user-card",
      },
      template: `
        <user-card 
          user="{{user}}" 
          bind:follow="handleFollow"
          bind:message="handleMessage"
        />
      `,
      data: {
        user: {
          id: 1,
          name: "测试用户",
          avatar: "/images/test-avatar.png",
          status: "online",
        },
      },
      methods: {
        handleFollow(e) {
          console.log("关注用户:", e.detail.userId);
        },
        handleMessage(e) {
          console.log("发送消息:", e.detail.userId);
        },
      },
    });
  });

  afterEach(() => {
    page.detach();
  });

  test("should display user information correctly", () => {
    const userCard = page.querySelector("user-card");
    expect(userCard.data.processedUser.displayName).toBe("测试用户");
    expect(userCard.data.processedUser.statusText).toBe("在线");
  });

  test("should handle follow action", () => {
    const userCard = page.querySelector("user-card");
    const followBtn = userCard.querySelector(".action-btn.primary");

    const mockFollow = jest.fn();
    page.addEventListener("follow", mockFollow);

    followBtn.dispatchEvent("tap");

    expect(mockFollow).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          userId: 1,
          action: "follow",
        }),
      })
    );
  });
});
```

## 最佳实践 ✨

### 组件设计原则

```javascript
// 1. 单一职责原则
// ❌ 不好的设计 - 一个组件做太多事情
Component({
  properties: {
    user: Object,
    showProfile: Boolean,
    showMessages: Boolean,
    showSettings: Boolean,
  },
  // ... 大量混合逻辑
});

// ✅ 好的设计 - 每个组件只做一件事
// UserProfile 组件只负责显示用户信息
// UserActions 组件只负责用户操作
// UserSettings 组件只负责用户设置

// 2. 属性验证和默认值
Component({
  properties: {
    title: {
      type: String,
      value: "",
      observer(newVal) {
        // 属性变化时的处理逻辑
        this.validateTitle(newVal);
      },
    },
    items: {
      type: Array,
      value: [],
      observer: "_onItemsChange",
    },
    config: {
      type: Object,
      value: () => ({
        showHeader: true,
        pageSize: 10,
      }),
    },
  },

  methods: {
    validateTitle(title) {
      if (typeof title !== "string") {
        console.warn("Title should be a string");
      }
    },

    _onItemsChange(newItems) {
      this.processItems(newItems);
    },
  },
});

// 3. 错误处理
Component({
  methods: {
    async loadData() {
      try {
        this.setData({ loading: true, error: null });

        const data = await this.fetchData();
        this.setData({ data, loading: false });
      } catch (error) {
        console.error("加载数据失败:", error);

        this.setData({
          loading: false,
          error: error.message || "加载失败",
        });

        // 通知父组件错误
        this.triggerEvent("error", { error });
      }
    },
  },
});
```

### 性能优化

```javascript
// 1. 合理使用 observers
Component({
  observers: {
    // 只监听需要的属性
    "user.name, user.avatar": function (name, avatar) {
      this.updateUserDisplay(name, avatar);
    },

    // 避免监听大对象
    "items.**": function () {
      // 这会在 items 的任何属性变化时触发，可能导致性能问题
      // 建议具体监听需要的属性
    },
  },
});

// 2. 防抖处理
Component({
  data: {
    searchTimer: null,
  },

  methods: {
    handleSearch(e) {
      const keyword = e.detail.value;

      // 清除之前的定时器
      if (this.data.searchTimer) {
        clearTimeout(this.data.searchTimer);
      }

      // 设置新的定时器
      const timer = setTimeout(() => {
        this.performSearch(keyword);
      }, 500);

      this.setData({ searchTimer: timer });
    },

    performSearch(keyword) {
      // 实际搜索逻辑
      console.log("搜索:", keyword);
    },
  },
});

// 3. 虚拟列表优化
Component({
  properties: {
    items: Array,
  },

  data: {
    visibleItems: [],
    itemHeight: 100,
    containerHeight: 0,
    scrollTop: 0,
  },

  methods: {
    updateVisibleItems() {
      const { items, itemHeight, containerHeight, scrollTop } = this.data;

      if (!items.length) return;

      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = startIndex + Math.ceil(containerHeight / itemHeight);

      const visibleItems = items
        .slice(startIndex, endIndex + 1)
        .map((item, index) => ({
          ...item,
          index: startIndex + index,
          style: `top: ${(startIndex + index) * itemHeight}px`,
        }));

      this.setData({ visibleItems });
    },
  },
});
```

### 组件文档

```javascript
/**
 * CustomButton 自定义按钮组件
 *
 * @component
 * @example
 * <custom-button
 *   text="点击我"
 *   type="primary"
 *   size="large"
 *   bind:tap="handleTap"
 * />
 */
Component({
  /**
   * 组件属性
   */
  properties: {
    /**
     * 按钮文本
     * @type {String}
     * @default "按钮"
     */
    text: {
      type: String,
      value: "按钮",
    },

    /**
     * 按钮类型
     * @type {"primary" | "secondary" | "danger"}
     * @default "primary"
     */
    type: {
      type: String,
      value: "primary",
    },

    /**
     * 按钮大小
     * @type {"small" | "medium" | "large"}
     * @default "medium"
     */
    size: {
      type: String,
      value: "medium",
    },
  },

  /**
   * 组件事件
   */
  methods: {
    /**
     * 按钮点击事件
     * @event tap
     * @param {Object} detail - 事件详情
     * @param {Number} detail.clickCount - 点击次数
     */
    handleTap(e) {
      // 实现逻辑
    },
  },
});
```

---

🎯 **下一步**: 掌握了组件开发后，建议学习 [小程序状态管理](./state-management.md) 来处理复杂的数据流管理！
