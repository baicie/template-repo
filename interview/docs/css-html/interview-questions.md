# CSS/HTML 面试题集

这里收集了前端面试中最常见的 CSS 和 HTML 问题，涵盖基础概念、布局技术、性能优化等各个方面，帮助你全面准备前端面试。

## HTML 基础题 📄

### 1. HTML5 有哪些新特性？

**参考答案：**

**语义化标签：**

- `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
- `<time>`, `<mark>`, `<figure>`, `<figcaption>`

**表单增强：**

```html
<!-- 新的输入类型 -->
<input type="email" placeholder="邮箱地址" />
<input type="url" placeholder="网站地址" />
<input type="number" min="1" max="100" />
<input type="range" min="0" max="100" value="50" />
<input type="date" />
<input type="color" />
<input type="search" />

<!-- 新的表单属性 -->
<input type="text" required />
<input type="email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" />
<input type="text" placeholder="请输入内容" />
<input type="text" autocomplete="name" />
```

**多媒体支持：**

```html
<video controls>
  <source src="movie.mp4" type="video/mp4" />
  <source src="movie.webm" type="video/webm" />
  您的浏览器不支持视频标签。
</video>

<audio controls>
  <source src="music.mp3" type="audio/mpeg" />
  <source src="music.ogg" type="audio/ogg" />
  您的浏览器不支持音频标签。
</audio>

<canvas id="myCanvas" width="300" height="200"></canvas>
```

**存储和离线：**

- `localStorage` 和 `sessionStorage`
- Application Cache (已废弃，现在使用 Service Worker)
- Web SQL (已废弃) 和 IndexedDB

**新的 API：**

- Geolocation API
- Web Workers
- WebSocket
- File API
- Drag and Drop API

### 2. 什么是语义化 HTML？为什么重要？

**参考答案：**

语义化 HTML 是指使用恰当的 HTML 标签来描述内容的含义，而不仅仅是样式。

**语义化示例：**

```html
<!-- ❌ 非语义化 -->
<div class="header">
  <div class="nav">
    <div class="nav-item">首页</div>
    <div class="nav-item">关于</div>
  </div>
</div>
<div class="content">
  <div class="article">
    <div class="title">文章标题</div>
    <div class="text">文章内容...</div>
  </div>
</div>

<!-- ✅ 语义化 -->
<header>
  <nav>
    <ul>
      <li><a href="/">首页</a></li>
      <li><a href="/about">关于</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>文章标题</h1>
    <p>文章内容...</p>
  </article>
</main>
```

**重要性：**

1. **SEO 优化**：搜索引擎更好地理解页面结构和内容
2. **可访问性**：屏幕阅读器等辅助技术能正确解析内容
3. **代码可维护性**：结构清晰，便于开发和维护
4. **团队协作**：统一的语义标准便于团队理解

### 3. 如何优化网页的 SEO？

**参考答案：**

**Meta 标签优化：**

```html
<title>页面标题 - 网站名称</title>
<meta name="description" content="页面描述，150-160字符" />
<meta name="keywords" content="关键词1,关键词2,关键词3" />
<link rel="canonical" href="https://example.com/page" />

<!-- Open Graph 标签 -->
<meta property="og:title" content="页面标题" />
<meta property="og:description" content="页面描述" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:url" content="https://example.com/page" />
```

**结构化数据：**

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "文章标题",
    "author": {
      "@type": "Person",
      "name": "作者姓名"
    },
    "datePublished": "2024-01-15"
  }
</script>
```

**其他优化：**

- 使用语义化 HTML 标签
- 合理的标题层级 (h1-h6)
- 优化图片 alt 属性
- 内部链接优化
- 页面加载速度优化
- 移动端友好设计

### 4. 什么是 DOCTYPE？有什么作用？

**参考答案：**

DOCTYPE 是文档类型声明，告诉浏览器使用哪种 HTML 版本来解析文档。

**HTML5 DOCTYPE：**

```html
<!DOCTYPE html>
```

**作用：**

1. **触发标准模式**：确保浏览器以标准模式渲染页面
2. **避免怪异模式**：防止浏览器进入怪异模式（Quirks Mode）
3. **统一渲染**：不同浏览器采用相同的渲染标准

**历史版本：**

```html
<!-- HTML 4.01 Strict -->
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML 1.0 Strict -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

## CSS 基础题 🎨

### 5. CSS 盒模型是什么？标准模式和怪异模式的区别？

**参考答案：**

**盒模型组成：**

- Content（内容）
- Padding（内边距）
- Border（边框）
- Margin（外边距）

**标准盒模型 (content-box)：**

```css
.standard-box {
  box-sizing: content-box; /* 默认值 */
  width: 200px;
  height: 100px;
  padding: 20px;
  border: 5px solid black;
  margin: 10px;
}
/* 实际占用宽度 = 200 + 20*2 + 5*2 + 10*2 = 270px */
```

**IE 盒模型 (border-box)：**

```css
.border-box {
  box-sizing: border-box;
  width: 200px; /* 包含 padding 和 border */
  height: 100px;
  padding: 20px;
  border: 5px solid black;
  margin: 10px;
}
/* 实际占用宽度 = 200 + 10*2 = 220px */
/* 内容区域宽度 = 200 - 20*2 - 5*2 = 150px */
```

**最佳实践：**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### 6. CSS 选择器优先级如何计算？

**参考答案：**

**优先级权重：**

- 内联样式：1000
- ID 选择器：100
- 类选择器、属性选择器、伪类：10
- 元素选择器、伪元素：1
- 通用选择器：0

**计算示例：**

```css
/* (0,0,0,1) = 1 */
p {
  color: black;
}

/* (0,0,1,0) = 10 */
.text {
  color: blue;
}

/* (0,1,0,0) = 100 */
#content {
  color: red;
}

/* (0,1,1,1) = 111 */
#content .text p {
  color: green;
}

/* (1,0,0,0) = 1000 */
/* <p style="color: orange;"> */

/* !important 声明具有最高优先级 */
p {
  color: purple !important;
}
```

**优先级规则：**

1. 权重值大的优先
2. 权重相同时，后声明的优先
3. `!important` 具有最高优先级
4. 继承的样式优先级最低

### 7. 什么是 BFC？如何创建 BFC？

**参考答案：**

BFC (Block Formatting Context) 是块级格式化上下文，是页面中一个独立的渲染区域。

**BFC 的特性：**

1. 内部的块级盒子垂直排列
2. 同一 BFC 内相邻盒子的 margin 会合并
3. BFC 不会与浮动元素重叠
4. 计算 BFC 高度时会包含浮动元素
5. BFC 是独立容器，内外元素不会相互影响

**创建 BFC 的方法：**

```css
/* 1. 根元素 */
html {
  /* 自动创建 BFC */
}

/* 2. 浮动元素 */
.bfc-float {
  float: left;
}

/* 3. 绝对定位元素 */
.bfc-absolute {
  position: absolute;
}

/* 4. display 值 */
.bfc-inline-block {
  display: inline-block;
}
.bfc-table-cell {
  display: table-cell;
}
.bfc-flex {
  display: flex;
}
.bfc-grid {
  display: grid;
}

/* 5. overflow 不为 visible */
.bfc-overflow {
  overflow: hidden;
}

/* 6. 专门用于创建 BFC */
.bfc-flow-root {
  display: flow-root;
}
```

**BFC 应用：**

```css
/* 清除浮动 */
.clearfix {
  overflow: hidden; /* 创建 BFC */
}

/* 防止 margin 合并 */
.prevent-margin-collapse {
  overflow: hidden;
}

/* 自适应两栏布局 */
.sidebar {
  float: left;
  width: 200px;
}

.content {
  overflow: hidden; /* 创建 BFC，不被浮动覆盖 */
}
```

### 8. position 的各个值有什么区别？

**参考答案：**

```css
/* static - 默认值，正常文档流 */
.static {
  position: static;
  /* top, right, bottom, left 无效 */
}

/* relative - 相对定位 */
.relative {
  position: relative;
  top: 10px; /* 相对于原位置偏移 */
  left: 20px;
  /* 原来的空间仍然占用 */
}

/* absolute - 绝对定位 */
.absolute {
  position: absolute;
  top: 0;
  right: 0;
  /* 相对于最近的非 static 定位祖先元素 */
  /* 脱离文档流 */
}

/* fixed - 固定定位 */
.fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
  /* 相对于视口定位 */
  /* 脱离文档流 */
}

/* sticky - 粘性定位 */
.sticky {
  position: sticky;
  top: 0;
  /* 滚动时"粘"在指定位置 */
  /* 不脱离文档流 */
}
```

**实际应用：**

```css
/* 居中定位 */
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 固定导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* 粘性侧边栏 */
.sidebar {
  position: sticky;
  top: 20px;
}
```

## 布局相关题 📐

### 9. 如何实现水平垂直居中？

**参考答案：**

**1. Flexbox 方法（推荐）：**

```css
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

**2. Grid 方法：**

```css
.grid-center {
  display: grid;
  place-items: center;
  height: 100vh;
}
```

**3. 绝对定位 + transform：**

```css
.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**4. 绝对定位 + margin：**

```css
.absolute-margin {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}
```

**5. 表格布局：**

```css
.table-center {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
  width: 100vw;
  height: 100vh;
}
```

### 10. Flex 布局和 Grid 布局的区别？

**参考答案：**

**Flexbox（一维布局）：**

```css
.flex-container {
  display: flex;
  flex-direction: row; /* 主轴方向 */
  justify-content: space-between; /* 主轴对齐 */
  align-items: center; /* 交叉轴对齐 */
  flex-wrap: wrap; /* 换行 */
  gap: 1rem;
}

.flex-item {
  flex: 1 1 200px; /* grow shrink basis */
  align-self: flex-start; /* 单独对齐 */
}
```

**Grid（二维布局）：**

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

.grid-item {
  grid-column: 1 / 3; /* 跨列 */
  grid-row: 2 / 4; /* 跨行 */
  grid-area: main; /* 使用命名区域 */
}
```

**使用场景对比：**

| 特性       | Flexbox            | Grid           |
| ---------- | ------------------ | -------------- |
| 维度       | 一维（行或列）     | 二维（行和列） |
| 适用场景   | 组件内布局、导航栏 | 页面整体布局   |
| 内容驱动   | 是                 | 否             |
| 浏览器支持 | 更好               | 较新           |
| 学习曲线   | 较简单             | 较复杂         |

### 11. 如何实现三栏布局？

**参考答案：**

**1. Flexbox 方法：**

```css
.three-column-flex {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex: 0 0 200px; /* 固定宽度 */
  background: #f0f0f0;
}

.main {
  flex: 1; /* 自适应 */
  background: white;
}

.aside {
  flex: 0 0 200px;
  background: #e0e0e0;
}
```

**2. Grid 方法：**

```css
.three-column-grid {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  min-height: 100vh;
}
```

**3. 浮动方法（圣杯布局）：**

```css
.holy-grail {
  padding: 0 200px; /* 为侧边栏留空间 */
}

.main-holy {
  float: left;
  width: 100%;
}

.left-holy {
  float: left;
  width: 200px;
  margin-left: -100%;
  position: relative;
  left: -200px;
}

.right-holy {
  float: left;
  width: 200px;
  margin-left: -200px;
  position: relative;
  right: -200px;
}
```

**4. 双飞翼布局：**

```css
.main-wrap {
  float: left;
  width: 100%;
}

.main-content {
  margin: 0 200px; /* 为侧边栏留空间 */
}

.left-wing {
  float: left;
  width: 200px;
  margin-left: -100%;
}

.right-wing {
  float: left;
  width: 200px;
  margin-left: -200px;
}
```

## 响应式设计题 📱

### 12. 什么是响应式设计？如何实现？

**参考答案：**

响应式设计是指网站能够根据不同设备的屏幕尺寸自动调整布局和样式。

**核心技术：**

**1. 流式布局：**

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
```

**2. 媒体查询：**

```css
/* 移动优先 */
.responsive {
  font-size: 14px;
  padding: 1rem;
}

/* 平板 */
@media (min-width: 768px) {
  .responsive {
    font-size: 16px;
    padding: 2rem;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .responsive {
    font-size: 18px;
    padding: 3rem;
  }
}
```

**3. 弹性图片：**

```css
.responsive-image {
  max-width: 100%;
  height: auto;
}

/* 现代方法 */
.aspect-ratio-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

**4. 视口设置：**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**5. 流式字体：**

```css
.fluid-typography {
  font-size: clamp(1rem, 4vw, 2rem);
}
```

### 13. 移动端适配有哪些方案？

**参考答案：**

**1. viewport + rem：**

```javascript
// 设置根元素字体大小
function setRem() {
  const width = document.documentElement.clientWidth;
  const rem = (width / 375) * 16; // 以 iPhone 6 为基准
  document.documentElement.style.fontSize = rem + "px";
}

window.addEventListener("resize", setRem);
setRem();
```

**2. vw/vh 方案：**

```css
.vw-layout {
  width: 50vw; /* 50% 视口宽度 */
  height: 20vh; /* 20% 视口高度 */
  font-size: 4vw; /* 响应式字体 */
}
```

**3. 媒体查询：**

```css
@media (max-width: 480px) {
  .mobile-style {
    font-size: 14px;
    padding: 0.5rem;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .tablet-style {
    font-size: 16px;
    padding: 1rem;
  }
}
```

**4. Flexbox/Grid 响应式：**

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr;
  }
}
```

## 性能优化题 ⚡

### 14. CSS 性能优化有哪些方法？

**参考答案：**

**1. 选择器优化：**

```css
/* ❌ 避免复杂选择器 */
.container .content .article .title .text span {
  color: red;
}

/* ✅ 使用简单选择器 */
.article-text {
  color: red;
}

/* ❌ 避免通配符选择器 */
* {
  margin: 0;
  padding: 0;
}

/* ✅ 针对性重置 */
h1,
h2,
h3,
p,
ul,
ol {
  margin: 0;
  padding: 0;
}
```

**2. 避免重排和重绘：**

```css
/* ❌ 会触发重排的属性 */
.bad-animation {
  animation: badMove 1s ease;
}

@keyframes badMove {
  from {
    width: 100px;
    height: 100px;
  }
  to {
    width: 200px;
    height: 200px;
  }
}

/* ✅ 只触发合成的属性 */
.good-animation {
  animation: goodMove 1s ease;
}

@keyframes goodMove {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(2);
  }
}
```

**3. 使用 GPU 加速：**

```css
.gpu-accelerated {
  transform: translateZ(0); /* 触发硬件加速 */
  will-change: transform; /* 告知浏览器变化属性 */
}

/* 动画结束后清理 */
.animation-complete {
  will-change: auto;
}
```

**4. 减少 CSS 文件大小：**

```css
/* 使用简写属性 */
.shorthand {
  margin: 10px 20px 30px 40px;
  padding: 10px 20px;
  background: url(bg.jpg) no-repeat center/cover;
}

/* 合并相同属性 */
h1,
h2,
h3 {
  font-family: Arial, sans-serif;
  color: #333;
}
```

### 15. 什么是重排和重绘？如何避免？

**参考答案：**

**重排（Reflow）：**

- 元素的几何属性发生变化时触发
- 会影响整个页面的布局
- 性能消耗较大

**重绘（Repaint）：**

- 元素的外观属性发生变化时触发
- 不影响布局，只重新绘制
- 性能消耗较小

**触发重排的属性：**

```css
/* 这些属性的改变会触发重排 */
.reflow-triggers {
  width: 100px;
  height: 100px;
  padding: 10px;
  margin: 10px;
  border: 1px solid black;
  position: absolute;
  top: 100px;
  left: 100px;
  font-size: 16px;
  line-height: 1.5;
}
```

**只触发重绘的属性：**

```css
/* 这些属性的改变只触发重绘 */
.repaint-only {
  color: red;
  background-color: blue;
  border-color: green;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  opacity: 0.8;
  visibility: hidden;
}
```

**避免重排重绘的方法：**

**1. 使用 transform 和 opacity：**

```css
/* ❌ 触发重排 */
.move-bad {
  left: 100px;
  top: 100px;
}

/* ✅ 只触发合成 */
.move-good {
  transform: translate(100px, 100px);
}
```

**2. 批量修改样式：**

```javascript
// ❌ 多次触发重排
element.style.width = "100px";
element.style.height = "100px";
element.style.padding = "10px";

// ✅ 一次性修改
element.className = "new-style";
```

**3. 使用文档片段：**

```javascript
// ❌ 多次插入触发重排
for (let i = 0; i < 1000; i++) {
  const div = document.createElement("div");
  document.body.appendChild(div);
}

// ✅ 使用文档片段
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement("div");
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
```

## 兼容性题 🌐

### 16. 如何处理浏览器兼容性问题？

**参考答案：**

**1. CSS Reset/Normalize：**

```css
/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 或使用 Normalize.css */
/* normalize.css v8.0.1 */
```

**2. 前缀处理：**

```css
.prefix-example {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);

  -webkit-transition: all 0.3s ease;
  -moz-transition: all 0.3s ease;
  -ms-transition: all 0.3s ease;
  -o-transition: all 0.3s ease;
  transition: all 0.3s ease;
}
```

**3. 特性检测：**

```css
/* 使用 @supports */
@supports (display: grid) {
  .grid-layout {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

@supports not (display: grid) {
  .grid-layout {
    display: flex;
    flex-wrap: wrap;
  }
}
```

**4. 渐进增强：**

```css
/* 基础样式 */
.button {
  padding: 10px 20px;
  background: #ccc;
  border: 1px solid #999;
}

/* 现代浏览器增强 */
.button {
  background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.button:hover {
  background: linear-gradient(to bottom, #e8e8e8, #d8d8d8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

**5. polyfill 和 fallback：**

```css
/* Flexbox fallback */
.flex-container {
  display: table; /* IE9+ */
  display: flex; /* 现代浏览器 */
}

.flex-item {
  display: table-cell; /* IE9+ */
  flex: 1; /* 现代浏览器 */
}

/* Grid fallback */
.grid-container {
  display: flex; /* fallback */
  flex-wrap: wrap;
  display: grid; /* 现代浏览器 */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

### 17. 常见的 CSS hack 有哪些？

**参考答案：**

**注意：现代开发中不推荐使用 CSS hack，应该使用标准方法。**

**IE 条件注释（已废弃）：**

```html
<!--[if IE 6]>
  <link rel="stylesheet" href="ie6.css" />
<![endif]-->

<!--[if lt IE 9]>
  <script src="html5shiv.js"></script>
<![endif]-->
```

**CSS 属性 hack：**

```css
.ie-hack {
  width: 100px; /* 标准浏览器 */
  *width: 110px; /* IE6/7 */
  _width: 120px; /* IE6 */
  width: 100px\9; /* IE6-8 */
  width: 100px\0; /* IE8-9 */
}
```

**现代替代方案：**

```css
/* 使用 @supports */
@supports (display: grid) {
  .modern-layout {
    display: grid;
  }
}

@supports not (display: grid) {
  .modern-layout {
    display: flex;
  }
}

/* 使用 CSS 变量 fallback */
.modern-colors {
  background: #3498db; /* fallback */
  background: var(--primary-color, #3498db);
}
```

---

🎯 **面试技巧总结**：

1. **理解原理**：不仅要知道怎么做，更要知道为什么这样做
2. **实际应用**：结合具体项目经验来回答问题
3. **与时俱进**：了解最新的 CSS 特性和最佳实践
4. **兼容性意识**：考虑不同浏览器的支持情况
5. **性能优化**：始终从性能角度思考解决方案

记住，CSS/HTML 面试不仅考查基础知识，更看重你对前端技术的理解深度和实际应用能力！
