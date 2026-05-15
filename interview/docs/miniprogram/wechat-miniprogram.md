# 微信小程序基础

微信小程序是一种不需要下载安装即可使用的应用，实现了应用"触手可及"的梦想。本文将从零开始介绍微信小程序的开发基础。

## 小程序架构 🏗️

### 架构概览

微信小程序采用双线程架构：

- **渲染层（View）**：由 WebView 承载，负责页面渲染
- **逻辑层（App Service）**：由 JSCore 承载，负责逻辑处理

```
┌─────────────────┐    ┌─────────────────┐
│   渲染层(View)   │    │ 逻辑层(Service) │
│                 │    │                 │
│   WebView       │◄──►│   JSCore        │
│   - WXML        │    │   - JavaScript  │
│   - WXSS        │    │   - WXS         │
│   - Component   │    │   - API调用     │
└─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         └───────────────────────┘
              Native Bridge
```

### 文件结构

```
miniprogram/
├── pages/              # 页面文件夹
│   ├── index/
│   │   ├── index.wxml  # 页面结构
│   │   ├── index.wxss  # 页面样式
│   │   ├── index.js    # 页面逻辑
│   │   └── index.json  # 页面配置
│   └── logs/
├── utils/              # 工具函数
├── components/         # 自定义组件
├── app.js             # 小程序入口文件
├── app.json           # 全局配置
├── app.wxss           # 全局样式
└── project.config.json # 项目配置
```

## 基础语法 📝

### WXML 模板语法

```xml
<!-- 数据绑定 -->
<view>{{message}}</view>

<!-- 列表渲染 -->
<view wx:for="{{items}}" wx:key="id">
  {{index}}: {{item.name}}
</view>

<!-- 条件渲染 -->
<view wx:if="{{condition}}">显示内容</view>
<view wx:elif="{{condition2}}">其他内容</view>
<view wx:else>默认内容</view>

<!-- 事件绑定 -->
<button bindtap="handleTap">点击我</button>
<input bindinput="handleInput" value="{{inputValue}}" />

<!-- 模板引用 -->
<template name="msgItem">
  <view>{{index}}: {{msg}}</view>
</template>

<template is="msgItem" data="{{...item}}" />
```

### WXSS 样式

```css
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-size: 32rpx; /* rpx: 响应式像素单位 */
}

/* 选择器 */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

/* 伪类选择器 */
.button:hover {
  background-color: #f0f0f0;
}

/* 媒体查询 */
@media (max-width: 600px) {
  .container {
    padding: 10rpx;
  }
}

/* 导入样式 */
@import "common.wxss";
```

### JavaScript 逻辑

```javascript
// 页面生命周期
Page({
  data: {
    message: "Hello World",
    userInfo: {},
    items: [],
  },

  // 页面加载
  onLoad(options) {
    console.log("页面加载", options);
    this.loadData();
  },

  // 页面显示
  onShow() {
    console.log("页面显示");
  },

  // 页面隐藏
  onHide() {
    console.log("页面隐藏");
  },

  // 页面卸载
  onUnload() {
    console.log("页面卸载");
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  // 上拉加载
  onReachBottom() {
    this.loadMore();
  },

  // 事件处理
  handleTap(e) {
    console.log("点击事件", e);
    this.setData({
      message: "点击成功",
    });
  },

  // 数据加载
  loadData() {
    wx.showLoading({
      title: "加载中...",
    });

    // 模拟API请求
    setTimeout(() => {
      this.setData({
        items: [
          { id: 1, name: "项目1" },
          { id: 2, name: "项目2" },
        ],
      });
      wx.hideLoading();
    }, 1000);
  },
});
```

## 核心概念 🎯

### 页面生命周期

```javascript
Page({
  // 页面初始数据
  data: {},

  // 生命周期回调——监听页面加载
  onLoad(options) {
    // 页面创建时执行
    // 可以在这里获取页面参数
    console.log("页面参数:", options);
  },

  // 生命周期回调——监听页面显示
  onShow() {
    // 页面出现在前台时执行
    // 每次页面显示都会调用
  },

  // 生命周期回调——监听页面初次渲染完成
  onReady() {
    // 页面首次渲染完毕时执行
    // 只调用一次
  },

  // 生命周期回调——监听页面隐藏
  onHide() {
    // 页面从前台变为后台时执行
  },

  // 生命周期回调——监听页面卸载
  onUnload() {
    // 页面销毁时执行
    // 清理定时器、取消请求等
  },
});
```

### 数据绑定与更新

```javascript
Page({
  data: {
    message: "Hello",
    user: {
      name: "张三",
      age: 25,
    },
    items: [],
  },

  // 更新数据
  updateData() {
    // 基础数据更新
    this.setData({
      message: "Hello World",
    });

    // 对象属性更新
    this.setData({
      "user.name": "李四",
      "user.age": 30,
    });

    // 数组操作
    this.setData({
      [`items[${index}]`]: newItem,
      "items[0].name": "新名称",
    });
  },

  // 批量更新（性能优化）
  batchUpdate() {
    this.setData({
      message: "批量更新",
      "user.name": "王五",
      items: [...this.data.items, newItem],
    });
  },
});
```

### 事件系统

```xml
<!-- 事件绑定方式 -->
<button bindtap="handleTap">冒泡事件</button>
<button catchtap="handleTap">非冒泡事件</button>
<button bind:tap="handleTap">推荐写法</button>
<button catch:tap="handleTap">推荐写法</button>

<!-- 传递数据 -->
<button bindtap="handleTap" data-id="{{item.id}}" data-name="{{item.name}}">
  点击传递数据
</button>

<!-- 表单事件 -->
<input bindinput="handleInput" bindblur="handleBlur" />
<form bindsubmit="handleSubmit">
  <button form-type="submit">提交</button>
</form>
```

```javascript
Page({
  handleTap(e) {
    console.log("事件对象:", e);
    console.log("事件类型:", e.type);
    console.log("当前组件:", e.currentTarget);
    console.log("触发组件:", e.target);
    console.log("自定义数据:", e.currentTarget.dataset);
  },

  handleInput(e) {
    const value = e.detail.value;
    this.setData({
      inputValue: value,
    });
  },

  handleSubmit(e) {
    console.log("表单数据:", e.detail.value);
  },
});
```

## 常用组件 🧩

### 基础组件

```xml
<!-- 视图容器 -->
<view class="container">基础视图</view>
<scroll-view scroll-y="{{true}}" style="height: 200px;">
  <view>可滚动内容</view>
</scroll-view>
<swiper indicator-dots="{{true}}" autoplay="{{true}}">
  <swiper-item>页面1</swiper-item>
  <swiper-item>页面2</swiper-item>
</swiper>

<!-- 基础内容 -->
<text>文本内容</text>
<rich-text nodes="{{htmlContent}}"></rich-text>
<progress percent="{{progressValue}}" show-info />

<!-- 表单组件 -->
<input placeholder="请输入内容" bindinput="handleInput" />
<textarea placeholder="多行输入" bindblur="handleTextarea" />
<button type="primary" bindtap="handleSubmit">提交</button>
<checkbox-group bindchange="handleCheckbox">
  <checkbox value="option1">选项1</checkbox>
  <checkbox value="option2">选项2</checkbox>
</checkbox-group>
<radio-group bindchange="handleRadio">
  <radio value="male">男</radio>
  <radio value="female">女</radio>
</radio-group>

<!-- 媒体组件 -->
<image src="{{imageUrl}}" mode="aspectFit" bindload="handleImageLoad" />
<video src="{{videoUrl}}" controls />
```

### 导航组件

```xml
<!-- 导航栏 -->
<navigation-bar title="页面标题" />

<!-- 页面跳转 -->
<navigator url="/pages/detail/detail" hover-class="navigator-hover">
  跳转到详情页
</navigator>

<!-- 函数式导航 -->
<button bindtap="navigateToDetail">跳转详情</button>
<button bindtap="redirectToLogin">重定向登录</button>
<button bindtap="switchTab">切换Tab</button>
```

```javascript
Page({
  navigateToDetail() {
    wx.navigateTo({
      url: "/pages/detail/detail?id=123",
    });
  },

  redirectToLogin() {
    wx.redirectTo({
      url: "/pages/login/login",
    });
  },

  switchTab() {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },

  navigateBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
});
```

## 常用 API 🔧

### 网络请求

```javascript
// HTTP 请求
wx.request({
  url: "https://api.example.com/data",
  method: "GET",
  data: {
    page: 1,
    size: 10,
  },
  header: {
    Authorization: "Bearer token",
  },
  success: (res) => {
    console.log("请求成功:", res.data);
    this.setData({
      items: res.data.list,
    });
  },
  fail: (err) => {
    console.error("请求失败:", err);
    wx.showToast({
      title: "网络错误",
      icon: "error",
    });
  },
});

// 文件上传
wx.uploadFile({
  url: "https://api.example.com/upload",
  filePath: tempFilePath,
  name: "file",
  formData: {
    userId: "123",
  },
  success: (res) => {
    console.log("上传成功:", res.data);
  },
});

// 文件下载
wx.downloadFile({
  url: "https://example.com/file.pdf",
  success: (res) => {
    wx.openDocument({
      filePath: res.tempFilePath,
    });
  },
});
```

### 数据存储

```javascript
// 同步存储
wx.setStorageSync("userInfo", {
  name: "张三",
  id: 123,
});

const userInfo = wx.getStorageSync("userInfo");

// 异步存储
wx.setStorage({
  key: "settings",
  data: {
    theme: "dark",
    language: "zh-CN",
  },
  success: () => {
    console.log("存储成功");
  },
});

wx.getStorage({
  key: "settings",
  success: (res) => {
    console.log("获取数据:", res.data);
  },
});

// 清除存储
wx.removeStorage({
  key: "userInfo",
});

wx.clearStorage(); // 清除所有本地数据
```

### 界面交互

```javascript
// 消息提示
wx.showToast({
  title: "操作成功",
  icon: "success",
  duration: 2000,
});

wx.showToast({
  title: "自定义图标",
  image: "/images/icon.png",
});

// 模态对话框
wx.showModal({
  title: "确认删除",
  content: "删除后无法恢复，确定要删除吗？",
  showCancel: true,
  success: (res) => {
    if (res.confirm) {
      console.log("用户点击确定");
      this.deleteItem();
    }
  },
});

// 操作菜单
wx.showActionSheet({
  itemList: ["拍照", "从相册选择", "取消"],
  success: (res) => {
    console.log("选择:", res.tapIndex);
    if (res.tapIndex === 0) {
      this.takePhoto();
    } else if (res.tapIndex === 1) {
      this.chooseImage();
    }
  },
});

// 加载提示
wx.showLoading({
  title: "加载中...",
  mask: true,
});

setTimeout(() => {
  wx.hideLoading();
}, 2000);
```

### 设备功能

```javascript
// 获取系统信息
wx.getSystemInfo({
  success: (res) => {
    console.log("设备信息:", res);
    console.log("屏幕宽度:", res.screenWidth);
    console.log("操作系统:", res.platform);
    console.log("微信版本:", res.version);
  },
});

// 选择图片
wx.chooseImage({
  count: 9,
  sizeType: ["original", "compressed"],
  sourceType: ["album", "camera"],
  success: (res) => {
    const tempFilePaths = res.tempFilePaths;
    this.setData({
      images: [...this.data.images, ...tempFilePaths],
    });
  },
});

// 预览图片
wx.previewImage({
  current: currentUrl,
  urls: imageUrls,
});

// 扫码
wx.scanCode({
  success: (res) => {
    console.log("扫码结果:", res.result);
    this.handleScanResult(res.result);
  },
});

// 获取位置
wx.getLocation({
  type: "gcj02",
  success: (res) => {
    console.log("位置信息:", res);
    this.setData({
      latitude: res.latitude,
      longitude: res.longitude,
    });
  },
});

// 选择位置
wx.chooseLocation({
  success: (res) => {
    console.log("选择的位置:", res);
    this.setData({
      address: res.address,
      latitude: res.latitude,
      longitude: res.longitude,
    });
  },
});
```

## 配置文件 ⚙️

### app.json 全局配置

```json
{
  "pages": ["pages/index/index", "pages/logs/logs"],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "小程序标题",
    "navigationBarTextStyle": "black",
    "enablePullDownRefresh": true,
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "images/icon_home.png",
        "selectedIconPath": "images/icon_home_active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/profile/profile",
        "iconPath": "images/icon_profile.png",
        "selectedIconPath": "images/icon_profile_active.png",
        "text": "我的"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": false,
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    }
  }
}
```

### 页面配置

```json
{
  "navigationBarTitleText": "页面标题",
  "navigationBarBackgroundColor": "#ffffff",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#eeeeee",
  "backgroundTextStyle": "light",
  "enablePullDownRefresh": true,
  "onReachBottomDistance": 50,
  "disableScroll": false,
  "usingComponents": {
    "custom-component": "/components/custom/custom"
  }
}
```

## 实战案例 🚀

### 待办事项应用

```javascript
// pages/todo/todo.js
Page({
  data: {
    inputValue: "",
    todos: [],
    filter: "all", // all, active, completed
  },

  onLoad() {
    this.loadTodos();
  },

  // 加载数据
  loadTodos() {
    const todos = wx.getStorageSync("todos") || [];
    this.setData({ todos });
  },

  // 保存数据
  saveTodos() {
    wx.setStorageSync("todos", this.data.todos);
  },

  // 输入处理
  handleInput(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },

  // 添加任务
  addTodo() {
    const { inputValue, todos } = this.data;
    if (!inputValue.trim()) {
      wx.showToast({
        title: "请输入任务内容",
        icon: "none",
      });
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.setData({
      todos: [newTodo, ...todos],
      inputValue: "",
    });
    this.saveTodos();
  },

  // 切换完成状态
  toggleTodo(e) {
    const { id } = e.currentTarget.dataset;
    const todos = this.data.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.setData({ todos });
    this.saveTodos();
  },

  // 删除任务
  deleteTodo(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个任务吗？",
      success: (res) => {
        if (res.confirm) {
          const todos = this.data.todos.filter((todo) => todo.id !== id);
          this.setData({ todos });
          this.saveTodos();
        }
      },
    });
  },

  // 过滤任务
  filterTodos(e) {
    const { filter } = e.currentTarget.dataset;
    this.setData({ filter });
  },

  // 清除已完成
  clearCompleted() {
    const todos = this.data.todos.filter((todo) => !todo.completed);
    this.setData({ todos });
    this.saveTodos();
  },

  // 获取过滤后的任务
  getFilteredTodos() {
    const { todos, filter } = this.data;
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  },
});
```

```xml
<!-- pages/todo/todo.wxml -->
<view class="container">
  <!-- 输入框 -->
  <view class="input-section">
    <input
      class="todo-input"
      placeholder="添加新任务..."
      value="{{inputValue}}"
      bindinput="handleInput"
      bindconfirm="addTodo"
    />
    <button class="add-btn" bindtap="addTodo">添加</button>
  </view>

  <!-- 过滤器 -->
  <view class="filter-section">
    <button
      class="filter-btn {{filter === 'all' ? 'active' : ''}}"
      bindtap="filterTodos"
      data-filter="all"
    >
      全部
    </button>
    <button
      class="filter-btn {{filter === 'active' ? 'active' : ''}}"
      bindtap="filterTodos"
      data-filter="active"
    >
      进行中
    </button>
    <button
      class="filter-btn {{filter === 'completed' ? 'active' : ''}}"
      bindtap="filterTodos"
      data-filter="completed"
    >
      已完成
    </button>
  </view>

  <!-- 任务列表 -->
  <scroll-view class="todo-list" scroll-y="{{true}}">
    <view
      wx:for="{{getFilteredTodos()}}"
      wx:key="id"
      class="todo-item {{item.completed ? 'completed' : ''}}"
    >
      <view class="todo-content" bindtap="toggleTodo" data-id="{{item.id}}">
        <view class="checkbox {{item.completed ? 'checked' : ''}}">
          <text wx:if="{{item.completed}}">✓</text>
        </view>
        <text class="todo-text">{{item.text}}</text>
      </view>
      <button
        class="delete-btn"
        bindtap="deleteTodo"
        data-id="{{item.id}}"
      >
        删除
      </button>
    </view>
  </scroll-view>

  <!-- 底部操作 -->
  <view class="footer" wx:if="{{todos.length > 0}}">
    <text class="count">
      剩余 {{todos.filter(item => !item.completed).length}} 个任务
    </text>
    <button
      class="clear-btn"
      bindtap="clearCompleted"
      wx:if="{{todos.some(item => item.completed)}}"
    >
      清除已完成
    </button>
  </view>
</view>
```

```css
/* pages/todo/todo.wxss */
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.input-section {
  display: flex;
  margin-bottom: 30rpx;
  background: white;
  border-radius: 10rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.todo-input {
  flex: 1;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.add-btn {
  background: #007aff;
  color: white;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
}

.filter-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
  background: white;
  border-radius: 10rpx;
  padding: 20rpx;
}

.filter-btn {
  flex: 1;
  margin: 0 10rpx;
  background: #f8f8f8;
  color: #666;
  border-radius: 8rpx;
}

.filter-btn.active {
  background: #007aff;
  color: white;
}

.todo-list {
  height: 800rpx;
}

.todo-item {
  display: flex;
  align-items: center;
  background: white;
  margin-bottom: 20rpx;
  padding: 30rpx 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #007aff;
  border-color: #007aff;
  color: white;
}

.todo-text {
  font-size: 32rpx;
  color: #333;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.delete-btn {
  background: #ff3b30;
  color: white;
  border-radius: 8rpx;
  padding: 15rpx 30rpx;
  font-size: 28rpx;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30rpx;
  padding: 20rpx;
  background: white;
  border-radius: 10rpx;
}

.count {
  color: #666;
  font-size: 28rpx;
}

.clear-btn {
  background: #ff9500;
  color: white;
  border-radius: 8rpx;
  padding: 15rpx 30rpx;
  font-size: 28rpx;
}
```

---

🎯 **下一步**: 掌握了微信小程序基础后，建议学习 [小程序框架对比](./framework-comparison.md) 来了解跨平台开发方案！
