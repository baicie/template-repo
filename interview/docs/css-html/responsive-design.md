# 响应式设计

响应式设计是现代 Web 开发的核心理念，通过灵活的布局、媒体查询和自适应技术，创建能够在各种设备上完美显示的网站。

## 响应式设计基础 📱

### 视口设置

```html
<!-- 基础视口设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- 完整视口配置 -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
/>

<!-- 响应式图片视口 -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
/>
```

### 移动优先策略

```css
/* 移动优先基础样式 */
.container {
  width: 100%;
  padding: 1rem;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 渐进增强到平板 */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    padding: 2rem;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

/* 渐进增强到桌面 */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 大屏幕优化 */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

## 媒体查询详解 🔍

### 基础媒体查询

```css
/* 屏幕宽度查询 */
@media (max-width: 767px) {
  /* 移动设备样式 */
  .mobile-only {
    display: block;
  }
}

@media (min-width: 768px) {
  /* 平板及以上设备样式 */
  .tablet-up {
    display: flex;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* 仅平板设备样式 */
  .tablet-only {
    background: lightblue;
  }
}

/* 屏幕高度查询 */
@media (max-height: 600px) {
  .short-screen {
    padding: 0.5rem;
  }
}

/* 设备方向查询 */
@media (orientation: portrait) {
  .portrait-layout {
    flex-direction: column;
  }
}

@media (orientation: landscape) {
  .landscape-layout {
    flex-direction: row;
  }
}

/* 设备像素比查询 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .high-dpi-image {
    background-image: url("image@2x.png");
    background-size: 100px 100px;
  }
}
```

### 高级媒体查询

```css
/* 颜色能力查询 */
@media (color) {
  .color-content {
    color: #3498db;
  }
}

@media (monochrome) {
  .monochrome-content {
    color: black;
  }
}

/* 指针设备查询 */
@media (pointer: coarse) {
  /* 触摸设备 */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}

@media (pointer: fine) {
  /* 鼠标设备 */
  .hover-effect:hover {
    background: #f0f0f0;
  }
}

/* 悬停能力查询 */
@media (hover: hover) {
  .hover-animation:hover {
    transform: scale(1.05);
  }
}

@media (hover: none) {
  .touch-interaction {
    /* 触摸设备的交互样式 */
  }
}

/* 运动偏好查询 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 颜色方案偏好 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --bg-color: #ffffff;
    --text-color: #333333;
  }
}

/* 对比度偏好 */
@media (prefers-contrast: high) {
  .high-contrast {
    border: 2px solid black;
    background: white;
    color: black;
  }
}
```

### 断点系统

```css
/* 标准断点定义 */
:root {
  --breakpoint-xs: 0;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-xxl: 1400px;
}

/* 断点应用 */
.responsive-container {
  width: 100%;
  padding: 0 15px;
  margin: 0 auto;
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) {
  .responsive-container {
    max-width: 540px;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .responsive-container {
    max-width: 720px;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .responsive-container {
    max-width: 960px;
  }
}

/* X-Large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .responsive-container {
    max-width: 1140px;
  }
}

/* XX-Large devices (larger desktops, 1400px and up) */
@media (min-width: 1400px) {
  .responsive-container {
    max-width: 1320px;
  }
}
```

## 弹性布局系统 🌊

### 流式网格

```css
/* 基础流式网格 */
.fluid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(1rem, 4vw, 2rem);
  padding: clamp(1rem, 4vw, 2rem);
}

/* 响应式列数 */
.responsive-columns {
  display: grid;
  gap: 1rem;
}

@media (min-width: 576px) {
  .responsive-columns {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .responsive-columns {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 992px) {
  .responsive-columns {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 自适应卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 2rem;
}

.card-grid .card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
```

### Flexbox 响应式布局

```css
/* 响应式导航 */
.navbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.navbar-brand {
  flex-shrink: 0;
}

.navbar-nav {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 767px) {
  .navbar {
    flex-direction: column;
  }

  .navbar-nav {
    width: 100%;
    flex-direction: column;
    margin-top: 1rem;
  }

  .navbar-nav li {
    width: 100%;
    text-align: center;
    border-top: 1px solid #eee;
  }
}

/* 响应式内容布局 */
.content-layout {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.main-content {
  flex: 2;
  min-width: 0; /* 防止 flex 项目溢出 */
}

.sidebar {
  flex: 1;
  min-width: 250px;
}

@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
    padding: 1rem;
  }

  .sidebar {
    order: -1; /* 移动端侧边栏在上方 */
  }
}
```

## 响应式图片 🖼️

### 基础响应式图片

```html
<!-- 简单的响应式图片 -->
<img
  src="small.jpg"
  srcset="small.jpg 300w, medium.jpg 600w, large.jpg 1200w"
  sizes="(max-width: 600px) 300px, 
            (max-width: 1200px) 600px, 
            1200px"
  alt="响应式图片"
/>

<!-- 使用 picture 元素 -->
<picture>
  <source media="(min-width: 1024px)" srcset="desktop.webp" type="image/webp" />
  <source media="(min-width: 1024px)" srcset="desktop.jpg" />
  <source media="(min-width: 768px)" srcset="tablet.webp" type="image/webp" />
  <source media="(min-width: 768px)" srcset="tablet.jpg" />
  <source srcset="mobile.webp" type="image/webp" />
  <img src="mobile.jpg" alt="响应式图片" />
</picture>
```

### CSS 响应式图片

```css
/* 基础响应式图片 */
.responsive-image {
  max-width: 100%;
  height: auto;
}

/* 保持宽高比的响应式图片 */
.aspect-ratio-image {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  position: relative;
  overflow: hidden;
}

.aspect-ratio-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 现代 aspect-ratio 属性 */
.modern-aspect-ratio {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* 响应式背景图片 */
.responsive-bg {
  background-image: url("mobile.jpg");
  background-size: cover;
  background-position: center;
  min-height: 300px;
}

@media (min-width: 768px) {
  .responsive-bg {
    background-image: url("tablet.jpg");
    min-height: 400px;
  }
}

@media (min-width: 1024px) {
  .responsive-bg {
    background-image: url("desktop.jpg");
    min-height: 500px;
  }
}

/* 高 DPI 显示屏适配 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .high-dpi-bg {
    background-image: url("image@2x.jpg");
    background-size: 200px 200px;
  }
}
```

## 响应式字体 ✍️

### 流式字体大小

```css
/* 使用 clamp() 实现流式字体 */
.fluid-typography {
  font-size: clamp(1rem, 4vw, 2rem);
  line-height: clamp(1.4, 1.5, 1.6);
}

.hero-title {
  font-size: clamp(2rem, 8vw, 4rem);
  line-height: 1.2;
}

.body-text {
  font-size: clamp(0.875rem, 2.5vw, 1.125rem);
  line-height: clamp(1.4, 1.5, 1.6);
}

/* 传统方式的响应式字体 */
.responsive-text {
  font-size: 14px;
  line-height: 1.4;
}

@media (min-width: 576px) {
  .responsive-text {
    font-size: 16px;
    line-height: 1.5;
  }
}

@media (min-width: 768px) {
  .responsive-text {
    font-size: 18px;
    line-height: 1.6;
  }
}

@media (min-width: 1024px) {
  .responsive-text {
    font-size: 20px;
  }
}

/* 响应式标题系统 */
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
h2 {
  font-size: clamp(1.25rem, 4vw, 2.5rem);
}
h3 {
  font-size: clamp(1.125rem, 3vw, 2rem);
}
h4 {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}
h5 {
  font-size: clamp(0.875rem, 2vw, 1.25rem);
}
h6 {
  font-size: clamp(0.75rem, 1.5vw, 1rem);
}
```

### 响应式间距

```css
/* 流式间距系统 */
:root {
  --space-xs: clamp(0.25rem, 1vw, 0.5rem);
  --space-sm: clamp(0.5rem, 2vw, 1rem);
  --space-md: clamp(1rem, 3vw, 1.5rem);
  --space-lg: clamp(1.5rem, 4vw, 2rem);
  --space-xl: clamp(2rem, 5vw, 3rem);
  --space-xxl: clamp(3rem, 8vw, 5rem);
}

.section {
  padding: var(--space-lg) var(--space-md);
  margin-bottom: var(--space-xl);
}

.card {
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

/* 响应式网格间距 */
.grid-responsive {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}
```

## 移动端优化 📱

### 触摸友好设计

```css
/* 最小触摸目标尺寸 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  margin: 4px;
}

/* 触摸反馈 */
.button {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.button:active {
  transform: scale(0.98);
  background: #2980b9;
}

/* 禁用文本选择（适用于按钮等） */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 移动端表单优化 */
.mobile-form input,
.mobile-form textarea,
.mobile-form select {
  font-size: 16px; /* 防止 iOS 缩放 */
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 移动端导航优化 */
.mobile-nav {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100vh;
  background: white;
  transition: left 0.3s ease;
  z-index: 1000;
}

.mobile-nav.open {
  left: 0;
}

.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;
}

.mobile-nav-overlay.active {
  opacity: 1;
  visibility: visible;
}
```

### iOS 和 Android 特定优化

```css
/* iOS 特定样式 */
.ios-scroll {
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
}

/* 禁用 iOS 默认按钮样式 */
input[type="submit"],
input[type="button"],
button {
  -webkit-appearance: none;
  appearance: none;
}

/* Android 特定样式 */
.android-input {
  background-clip: padding-box; /* 修复 Android 边框问题 */
}

/* 安全区域适配 (iPhone X 等) */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .landscape-adjust {
    padding: 0.5rem;
  }

  .landscape-adjust .header {
    height: 40px;
  }
}
```

## 实战案例 🚀

### 响应式卡片组件

```css
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 4vw, 2rem);
  padding: clamp(1rem, 4vw, 2rem);
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.card-content {
  padding: clamp(1rem, 3vw, 1.5rem);
}

.card-title {
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.card-description {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .card-actions {
    flex-direction: column;
  }
}
```

### 响应式导航栏

```css
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem clamp(1rem, 4vw, 2rem);
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-brand {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.navbar-menu a {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.navbar-menu a:hover {
  color: #3498db;
}

.navbar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .navbar-menu {
    position: fixed;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    flex-direction: column;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-100vh);
    transition: transform 0.3s ease;
  }

  .navbar-menu.active {
    transform: translateY(0);
  }

  .navbar-toggle {
    display: block;
  }
}
```

### 响应式表单

```css
.responsive-form {
  max-width: 600px;
  margin: 0 auto;
  padding: clamp(1rem, 4vw, 2rem);
}

.form-grid {
  display: grid;
  gap: clamp(1rem, 3vw, 1.5rem);
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-input {
  padding: clamp(0.75rem, 2vw, 1rem);
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: clamp(0.875rem, 2vw, 1rem);
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }
}
```

---

🎯 **下一步**: 掌握了响应式设计后，建议学习 [CSS/HTML 面试题集](./interview-questions.md) 来检验和巩固你的前端基础技能！
