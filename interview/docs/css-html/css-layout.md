# CSS 布局技术

现代 CSS 布局技术为我们提供了强大而灵活的页面布局能力。从传统的浮动布局到现代的 Flexbox 和 Grid，每种技术都有其独特的优势和适用场景。

## Flexbox 弹性布局 💪

### Flex 容器属性

```css
/* 创建 Flex 容器 */
.flex-container {
  display: flex; /* 或 inline-flex */

  /* 主轴方向 */
  flex-direction: row; /* row | row-reverse | column | column-reverse */

  /* 换行控制 */
  flex-wrap: nowrap; /* nowrap | wrap | wrap-reverse */

  /* 简写 */
  flex-flow: row wrap; /* flex-direction + flex-wrap */

  /* 主轴对齐 */
  justify-content: flex-start; /* flex-start | flex-end | center | space-between | space-around | space-evenly */

  /* 交叉轴对齐 */
  align-items: stretch; /* stretch | flex-start | flex-end | center | baseline */

  /* 多行对齐 */
  align-content: stretch; /* stretch | flex-start | flex-end | center | space-between | space-around */

  /* 间距 */
  gap: 10px; /* 或 row-gap, column-gap */
}
```

### Flex 项目属性

```css
.flex-item {
  /* 扩展比例 */
  flex-grow: 1; /* 默认 0 */

  /* 收缩比例 */
  flex-shrink: 1; /* 默认 1 */

  /* 基础大小 */
  flex-basis: auto; /* 长度值 | auto | content */

  /* 简写 */
  flex: 1 1 auto; /* flex-grow + flex-shrink + flex-basis */
  /* 常用值 */
  flex: 1; /* 等同于 1 1 0% */
  flex: auto; /* 等同于 1 1 auto */
  flex: none; /* 等同于 0 0 auto */

  /* 单独对齐 */
  align-self: auto; /* auto | flex-start | flex-end | center | baseline | stretch */

  /* 顺序 */
  order: 0; /* 整数值，默认 0 */
}
```

### Flexbox 布局实例

```css
/* 1. 水平居中 */
.horizontal-center {
  display: flex;
  justify-content: center;
}

/* 2. 垂直居中 */
.vertical-center {
  display: flex;
  align-items: center;
}

/* 3. 水平垂直居中 */
.center-both {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 4. 等高列布局 */
.equal-height-columns {
  display: flex;
}

.column {
  flex: 1;
  padding: 20px;
  background: #f0f0f0;
  margin: 0 10px;
}

/* 5. 导航栏布局 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

/* 6. 卡片布局 */
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 300px; /* 最小宽度 300px，可扩展 */
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* 7. 媒体对象 */
.media {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.media-object {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.media-body {
  flex: 1;
}

/* 8. 圣杯布局 */
.holy-grail {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.holy-grail-header,
.holy-grail-footer {
  background: #333;
  color: white;
  padding: 1rem;
}

.holy-grail-body {
  display: flex;
  flex: 1;
}

.holy-grail-content {
  flex: 1;
  padding: 1rem;
}

.holy-grail-nav,
.holy-grail-ads {
  flex: 0 0 200px;
  padding: 1rem;
  background: #f0f0f0;
}

.holy-grail-nav {
  order: -1;
}

/* 9. 响应式布局 */
@media (max-width: 768px) {
  .holy-grail-body {
    flex-direction: column;
  }

  .holy-grail-nav,
  .holy-grail-ads {
    order: 0;
    flex: none;
  }
}
```

## Grid 网格布局 🏗️

### Grid 容器属性

```css
.grid-container {
  display: grid; /* 或 inline-grid */

  /* 定义行和列 */
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;

  /* 使用 repeat() */
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

  /* 命名网格线 */
  grid-template-columns: [sidebar-start] 200px [sidebar-end main-start] 1fr [main-end];

  /* 网格区域 */
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";

  /* 简写 */
  grid-template:
    "header header header" auto
    "sidebar main aside" 1fr
    "footer footer footer" auto
    / 200px 1fr 200px;

  /* 间距 */
  gap: 20px; /* 或 row-gap, column-gap */
  grid-gap: 20px; /* 旧语法 */

  /* 对齐 */
  justify-items: stretch; /* start | end | center | stretch */
  align-items: stretch; /* start | end | center | stretch */
  place-items: center; /* align-items + justify-items */

  justify-content: start; /* start | end | center | stretch | space-around | space-between | space-evenly */
  align-content: start;
  place-content: center; /* align-content + justify-content */

  /* 隐式网格 */
  grid-auto-columns: 1fr;
  grid-auto-rows: minmax(100px, auto);
  grid-auto-flow: row; /* row | column | row dense | column dense */
}
```

### Grid 项目属性

```css
.grid-item {
  /* 指定位置 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;

  /* 简写 */
  grid-column: 1 / 3; /* start / end */
  grid-row: 1 / 2;
  grid-area: 1 / 1 / 2 / 3; /* row-start / column-start / row-end / column-end */

  /* 使用命名区域 */
  grid-area: header;

  /* 跨越 */
  grid-column: span 2;
  grid-row: span 3;

  /* 对齐 */
  justify-self: center; /* start | end | center | stretch */
  align-self: center;
  place-self: center; /* align-self + justify-self */
}
```

### Grid 布局实例

```css
/* 1. 基础网格布局 */
.basic-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 2. 响应式网格 */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* 3. 复杂布局 */
.complex-layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  min-height: 100vh;
  gap: 10px;
}

.header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
.main {
  grid-area: main;
}
.aside {
  grid-area: aside;
}
.footer {
  grid-area: footer;
}

/* 4. 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 5. 不规则网格 */
.masonry-like {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;
  gap: 10px;
}

.masonry-item {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 20px;
}

.masonry-item:nth-child(1) {
  grid-row-end: span 20;
}
.masonry-item:nth-child(2) {
  grid-row-end: span 15;
}
.masonry-item:nth-child(3) {
  grid-row-end: span 25;
}

/* 6. 图片画廊 */
.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: 10px;
}

.photo-gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.photo-gallery .featured {
  grid-column: span 2;
  grid-row: span 2;
}

/* 7. 表单布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
```

## 传统布局方法 📐

### Float 布局

```css
/* 两栏布局 */
.two-column-float {
  overflow: hidden; /* 清除浮动 */
}

.sidebar-float {
  float: left;
  width: 200px;
  background: #f0f0f0;
  padding: 20px;
}

.content-float {
  margin-left: 220px; /* 留出侧边栏空间 */
  background: white;
  padding: 20px;
}

/* 三栏布局 - 双飞翼 */
.three-column-float {
  overflow: hidden;
}

.main-wrap {
  float: left;
  width: 100%;
}

.main-content {
  margin: 0 200px; /* 左右留出侧边栏空间 */
  background: white;
  padding: 20px;
}

.left-sidebar {
  float: left;
  width: 200px;
  margin-left: -100%;
  background: #f0f0f0;
  padding: 20px;
}

.right-sidebar {
  float: left;
  width: 200px;
  margin-left: -200px;
  background: #e0e0e0;
  padding: 20px;
}

/* 三栏布局 - 圣杯 */
.holy-grail-float {
  padding: 0 200px; /* 为侧边栏留出空间 */
  overflow: hidden;
}

.main-holy {
  float: left;
  width: 100%;
  background: white;
  padding: 20px;
}

.left-holy {
  float: left;
  width: 200px;
  margin-left: -100%;
  position: relative;
  left: -200px;
  background: #f0f0f0;
  padding: 20px;
}

.right-holy {
  float: left;
  width: 200px;
  margin-left: -200px;
  position: relative;
  right: -200px;
  background: #e0e0e0;
  padding: 20px;
}
```

### Position 布局

```css
/* 绝对定位布局 */
.absolute-layout {
  position: relative;
  height: 100vh;
}

.header-absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #333;
  color: white;
  padding: 0 20px;
  line-height: 60px;
}

.sidebar-absolute {
  position: absolute;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 200px;
  background: #f0f0f0;
  padding: 20px;
  overflow-y: auto;
}

.content-absolute {
  position: absolute;
  top: 60px;
  left: 200px;
  right: 0;
  bottom: 0;
  background: white;
  padding: 20px;
  overflow-y: auto;
}

/* 固定定位元素 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s;
}

.back-to-top.visible {
  opacity: 1;
}
```

## 居中对齐方案 🎯

### 水平居中

```css
/* 1. 行内元素/行内块元素 */
.text-center {
  text-align: center;
}

/* 2. 块级元素 */
.block-center {
  width: 300px;
  margin: 0 auto;
}

/* 3. 绝对定位 */
.absolute-center-h {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* 4. Flexbox */
.flex-center-h {
  display: flex;
  justify-content: center;
}

/* 5. Grid */
.grid-center-h {
  display: grid;
  justify-content: center;
}
```

### 垂直居中

```css
/* 1. 行内元素 */
.line-height-center {
  height: 100px;
  line-height: 100px;
}

/* 2. 表格单元格 */
.table-cell-center {
  display: table-cell;
  vertical-align: middle;
  height: 200px;
}

/* 3. 绝对定位 */
.absolute-center-v {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

/* 4. Flexbox */
.flex-center-v {
  display: flex;
  align-items: center;
  height: 200px;
}

/* 5. Grid */
.grid-center-v {
  display: grid;
  align-content: center;
  height: 200px;
}
```

### 水平垂直居中

```css
/* 1. 绝对定位 + transform */
.absolute-center-both {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 2. 绝对定位 + margin */
.absolute-margin-center {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}

/* 3. Flexbox */
.flex-center-both {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 4. Grid */
.grid-center-both {
  display: grid;
  place-items: center;
  height: 100vh;
}

/* 5. 表格布局 */
.table-center {
  display: table;
  width: 100%;
  height: 100vh;
}

.table-cell-center-both {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
```

## 多列布局 📰

### CSS Multi-column

```css
/* 基础多列布局 */
.multi-column {
  column-count: 3;
  column-gap: 2rem;
  column-rule: 1px solid #ddd;
}

/* 响应式列数 */
.responsive-columns {
  column-width: 250px;
  column-gap: 2rem;
}

/* 控制分栏 */
.column-content h2 {
  break-after: column;
  /* 或 break-before: column */
}

.column-content .no-break {
  break-inside: avoid;
}

/* 跨列元素 */
.column-content .span-all {
  column-span: all;
  margin: 2rem 0;
  padding: 1rem;
  background: #f0f0f0;
}

/* 平衡列高 */
.balanced-columns {
  column-fill: balance; /* auto | balance */
}
```

## 响应式布局基础 📱

### 媒体查询

```css
/* 移动优先 */
.responsive-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* 平板 */
@media (min-width: 768px) {
  .responsive-layout {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .responsive-layout {
    grid-template-columns: 200px 1fr 200px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* 容器查询 (实验性) */
@container (min-width: 400px) {
  .card {
    display: flex;
    align-items: center;
  }
}
```

### 流式布局

```css
/* 流式网格 */
.fluid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 4vw, 2rem);
  padding: clamp(1rem, 4vw, 2rem);
}

/* 流式字体 */
.fluid-text {
  font-size: clamp(1rem, 4vw, 2rem);
}

/* 流式间距 */
.fluid-spacing {
  padding: clamp(1rem, 5vw, 3rem);
  margin-bottom: clamp(2rem, 8vw, 6rem);
}
```

---

🎯 **下一步**: 掌握了布局技术后，建议学习 [CSS 动画与特效](./css-animation.md) 来为页面添加生动的交互效果！
