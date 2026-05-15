# CSS 基础与选择器

CSS (Cascading Style Sheets) 是用于描述 HTML 文档样式的语言。理解 CSS 的核心概念、选择器机制和层叠规则是掌握前端样式开发的基础。

## CSS 基础概念 🎨

### CSS 语法结构

```css
/* CSS 规则的基本结构 */
选择器 {
  属性名: 属性值;
  属性名: 属性值;
}

/* 示例 */
h1 {
  color: blue;
  font-size: 24px;
  margin-bottom: 16px;
}

/* 多个选择器 */
h1,
h2,
h3 {
  font-family: Arial, sans-serif;
  color: #333;
}

/* 注释 */
/* 这是一个CSS注释 */
```

### CSS 引入方式

```html
<!-- 1. 外部样式表 (推荐) -->
<link rel="stylesheet" href="styles.css" />

<!-- 2. 内部样式表 -->
<style>
  body {
    background-color: #f0f0f0;
  }
</style>

<!-- 3. 内联样式 (不推荐) -->
<p style="color: red; font-size: 16px;">内联样式文本</p>

<!-- 4. @import 导入 (性能较差) -->
<style>
  @import url("styles.css");
</style>
```

## 选择器详解 🎯

### 基础选择器

```css
/* 1. 元素选择器 */
p {
  color: black;
}

h1 {
  font-size: 2em;
}

/* 2. 类选择器 */
.highlight {
  background-color: yellow;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

/* 3. ID选择器 */
#header {
  background-color: #333;
  color: white;
}

#navigation {
  position: fixed;
  top: 0;
  width: 100%;
}

/* 4. 通用选择器 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 5. 属性选择器 */
/* 存在属性 */
[title] {
  cursor: help;
}

/* 属性值完全匹配 */
[type="text"] {
  border: 1px solid #ccc;
}

/* 属性值包含指定值 */
[class*="btn"] {
  display: inline-block;
  text-decoration: none;
}

/* 属性值以指定值开头 */
[href^="https://"]
{
  color: green;
}

/* 属性值以指定值结尾 */
[href$=".pdf"] {
  background: url(pdf-icon.png) no-repeat left center;
  padding-left: 20px;
}

/* 属性值包含指定单词 */
[title~="important"] {
  font-weight: bold;
}

/* 属性值以指定值开头(语言代码) */
[lang|="en"] {
  font-family: "Times New Roman", serif;
}
```

### 组合选择器

```css
/* 1. 后代选择器 (空格) */
.container p {
  line-height: 1.6;
}

.sidebar ul li {
  list-style: none;
  margin-bottom: 5px;
}

/* 2. 子元素选择器 (>) */
.nav > li {
  float: left;
}

.card > .header {
  border-bottom: 1px solid #eee;
}

/* 3. 相邻兄弟选择器 (+) */
h2 + p {
  margin-top: 0;
  font-weight: bold;
}

.alert + .alert {
  margin-top: 10px;
}

/* 4. 通用兄弟选择器 (~) */
h2 ~ p {
  color: #666;
}

.active ~ .tab-content {
  display: block;
}

/* 5. 多类选择器 */
.btn.btn-primary {
  background-color: #007bff;
}

.card.featured {
  border: 2px solid gold;
}
```

### 伪类选择器

```css
/* 1. 链接状态伪类 */
a:link {
  color: blue;
  text-decoration: none;
}

a:visited {
  color: purple;
}

a:hover {
  color: red;
  text-decoration: underline;
}

a:active {
  color: orange;
}

/* 2. 表单状态伪类 */
input:focus {
  outline: 2px solid #007bff;
  border-color: #007bff;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

input:checked + label {
  font-weight: bold;
}

input:valid {
  border-color: green;
}

input:invalid {
  border-color: red;
}

/* 3. 结构伪类 */
/* 第一个/最后一个子元素 */
li:first-child {
  border-top: none;
}

li:last-child {
  border-bottom: none;
}

/* 第一个/最后一个类型元素 */
p:first-of-type {
  font-size: 1.2em;
}

p:last-of-type {
  margin-bottom: 0;
}

/* 第n个子元素 */
tr:nth-child(odd) {
  background-color: #f9f9f9;
}

tr:nth-child(even) {
  background-color: white;
}

tr:nth-child(3n + 1) {
  background-color: lightblue;
}

/* 第n个类型元素 */
h2:nth-of-type(2) {
  color: red;
}

/* 唯一子元素/类型元素 */
p:only-child {
  text-align: center;
}

img:only-of-type {
  display: block;
  margin: 0 auto;
}

/* 空元素 */
p:empty {
  display: none;
}

/* 4. 目标伪类 */
:target {
  background-color: yellow;
  padding: 10px;
}

/* 5. 否定伪类 */
input:not([type="submit"]) {
  margin-bottom: 10px;
}

li:not(.special) {
  color: gray;
}
```

### 伪元素选择器

```css
/* 1. ::before 和 ::after */
.quote::before {
  content: "" ";
    font-size: 2em;
    color: #ccc;
}

.quote::after {
    content: " "";
  font-size: 2em;
  color: #ccc;
}

/* 清除浮动 */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* 装饰性元素 */
.btn::before {
  content: "→ ";
}

/* 2. ::first-line 和 ::first-letter */
p::first-line {
  font-weight: bold;
  color: #333;
}

p::first-letter {
  font-size: 3em;
  float: left;
  line-height: 1;
  margin-right: 5px;
}

/* 3. ::selection */
::selection {
  background-color: #007bff;
  color: white;
}

/* 4. ::placeholder */
input::placeholder {
  color: #999;
  font-style: italic;
}

/* 5. 自定义滚动条 */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

## 选择器优先级 ⚖️

### 优先级计算规则

```css
/* 优先级权重计算：
   内联样式: 1000
   ID选择器: 100
   类选择器、属性选择器、伪类: 10
   元素选择器、伪元素: 1
   通用选择器: 0
*/

/* 示例分析 */
/* (0,0,1,1) = 11 */
div p {
  color: blue;
}

/* (0,1,0,0) = 100 */
#content {
  color: red;
}

/* (0,0,1,0) = 10 */
.highlight {
  color: green;
}

/* (0,1,1,1) = 111 */
#content .highlight p {
  color: purple;
}

/* (1,0,0,0) = 1000 */
/* <p style="color: orange;">内联样式</p> */

/* !important 声明 */
p {
  color: black !important; /* 优先级最高 */
}
```

### 优先级实战示例

```html
<div id="container" class="wrapper">
  <p class="text highlight">这是一段文本</p>
</div>
```

```css
/* 优先级从低到高 */
p {
  color: black;
} /* (0,0,0,1) = 1 */
.text {
  color: blue;
} /* (0,0,1,0) = 10 */
.highlight {
  color: green;
} /* (0,0,1,0) = 10 */
div p {
  color: red;
} /* (0,0,0,2) = 2 */
.wrapper p {
  color: purple;
} /* (0,0,1,1) = 11 */
#container p {
  color: orange;
} /* (0,1,0,1) = 101 */
#container .text {
  color: pink;
} /* (0,1,1,0) = 110 */
#container .highlight {
  color: brown;
} /* (0,1,1,0) = 110 */

/* 最终文本颜色为 brown，因为它的优先级最高且在后面 */
```

## 盒模型 📦

### 标准盒模型 vs IE 盒模型

```css
/* 标准盒模型 (content-box) */
.standard-box {
  box-sizing: content-box; /* 默认值 */
  width: 200px;
  height: 100px;
  padding: 20px;
  border: 5px solid black;
  margin: 10px;
}
/* 实际占用空间：
   宽度 = 200 + 20*2 + 5*2 + 10*2 = 270px
   高度 = 100 + 20*2 + 5*2 + 10*2 = 170px
*/

/* IE盒模型 (border-box) */
.border-box {
  box-sizing: border-box;
  width: 200px;
  height: 100px;
  padding: 20px;
  border: 5px solid black;
  margin: 10px;
}
/* 实际占用空间：
   宽度 = 200 + 10*2 = 220px (width包含padding和border)
   高度 = 100 + 10*2 = 120px
   内容区域 = 200 - 20*2 - 5*2 = 150px
*/

/* 全局设置border-box (推荐) */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* 或者使用继承方式 */
html {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}
```

### 外边距合并

```css
/* 垂直外边距合并 */
.element1 {
  margin-bottom: 20px;
}

.element2 {
  margin-top: 30px;
}
/* 实际间距是30px，不是50px */

/* 防止外边距合并的方法 */
.prevent-collapse {
  /* 方法1: 使用padding代替margin */
  padding-bottom: 20px;

  /* 方法2: 创建BFC */
  overflow: hidden;

  /* 方法3: 使用border */
  border-bottom: 1px solid transparent;

  /* 方法4: 使用flexbox */
  display: flex;
  flex-direction: column;
}

/* 父子元素外边距合并 */
.parent {
  margin-top: 20px;
}

.child {
  margin-top: 30px; /* 会与父元素合并，实际上移30px */
}

/* 解决方案 */
.parent-fixed {
  /* 给父元素添加边框或内边距 */
  border-top: 1px solid transparent;
  /* 或 */
  padding-top: 1px;
  /* 或创建BFC */
  overflow: hidden;
}
```

## 定位系统 📍

### 定位类型详解

```css
/* 1. static (静态定位，默认值) */
.static {
  position: static;
  /* top, right, bottom, left 无效 */
}

/* 2. relative (相对定位) */
.relative {
  position: relative;
  top: 10px; /* 相对于原来位置向下移动10px */
  left: 20px; /* 相对于原来位置向右移动20px */
  /* 原来的空间仍然保留 */
}

/* 3. absolute (绝对定位) */
.absolute {
  position: absolute;
  top: 0;
  right: 0;
  /* 相对于最近的非static定位祖先元素定位 */
  /* 脱离文档流，不占用空间 */
}

/* 4. fixed (固定定位) */
.fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
  /* 相对于视口定位 */
  /* 脱离文档流，不占用空间 */
}

/* 5. sticky (粘性定位) */
.sticky {
  position: sticky;
  top: 0;
  /* 在滚动时"粘"在指定位置 */
  background-color: white;
  z-index: 100;
}
```

### 定位实战案例

```css
/* 居中定位 */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 四角定位 */
.corner-positioning {
  position: relative;
}

.corner-positioning::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
  background: red;
}

/* 层叠上下文 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: white;
  padding: 20px;
  border-radius: 8px;
}
```

## BFC (块级格式化上下文) 🏗️

### BFC 的创建

```css
/* 创建BFC的方法 */
.bfc-root {
  /* 根元素自动创建BFC */
}

.bfc-float {
  float: left; /* 或 right */
}

.bfc-absolute {
  position: absolute; /* 或 fixed */
}

.bfc-inline-block {
  display: inline-block;
}

.bfc-table-cell {
  display: table-cell;
}

.bfc-table-caption {
  display: table-caption;
}

.bfc-overflow {
  overflow: hidden; /* 或 auto, scroll */
}

.bfc-flex {
  display: flex; /* 或 inline-flex */
}

.bfc-grid {
  display: grid; /* 或 inline-grid */
}

.bfc-flow-root {
  display: flow-root; /* 专门用于创建BFC */
}
```

### BFC 的应用

```css
/* 1. 清除浮动 */
.clearfix {
  overflow: hidden; /* 创建BFC */
}

.float-child {
  float: left;
  width: 200px;
  height: 100px;
  background: lightblue;
}

/* 2. 防止外边距合并 */
.bfc-container {
  overflow: hidden; /* 创建BFC */
}

.margin-child {
  margin-top: 20px;
  background: lightgreen;
}

/* 3. 两栏布局 */
.two-column {
  overflow: hidden; /* 创建BFC */
}

.sidebar {
  float: left;
  width: 200px;
  background: lightcoral;
}

.main-content {
  overflow: hidden; /* 创建BFC，不被浮动元素覆盖 */
  background: lightgray;
}

/* 4. 自适应三栏布局 */
.three-column {
  overflow: hidden;
}

.left-sidebar {
  float: left;
  width: 200px;
  background: lightblue;
}

.right-sidebar {
  float: right;
  width: 200px;
  background: lightgreen;
}

.center-content {
  overflow: hidden; /* 创建BFC */
  background: lightyellow;
}
```

## 浮动与清除 🌊

### 浮动基础

```css
/* 浮动元素 */
.float-left {
  float: left;
  width: 200px;
  height: 150px;
  background: lightblue;
  margin-right: 20px;
}

.float-right {
  float: right;
  width: 200px;
  height: 150px;
  background: lightgreen;
  margin-left: 20px;
}

/* 浮动的特性 */
.float-element {
  float: left;
  /* 1. 脱离文档流 */
  /* 2. 向左或向右移动直到碰到容器边缘或其他浮动元素 */
  /* 3. 块级元素可以并排显示 */
  /* 4. 内联元素可以设置宽高 */
}
```

### 清除浮动的方法

```css
/* 方法1: clear属性 */
.clear-both {
  clear: both; /* left, right, both */
}

/* 方法2: 伪元素清除 (推荐) */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* 更简洁的版本 */
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

/* 方法3: overflow创建BFC */
.clear-with-overflow {
  overflow: hidden;
}

/* 方法4: display: flow-root */
.clear-with-flow-root {
  display: flow-root;
}

/* 方法5: 父元素也浮动 */
.float-parent {
  float: left;
  width: 100%;
}
```

### 浮动布局实例

```css
/* 经典的图文混排 */
.article {
  line-height: 1.6;
}

.article img {
  float: left;
  margin: 0 20px 10px 0;
  border-radius: 4px;
}

/* 卡片网格布局 */
.card-grid {
  overflow: hidden; /* 清除浮动 */
}

.card {
  float: left;
  width: calc(33.333% - 20px);
  margin: 10px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card {
    width: calc(50% - 20px);
  }
}

@media (max-width: 480px) {
  .card {
    width: calc(100% - 20px);
  }
}
```

## CSS 继承 🧬

### 继承属性

```css
/* 可继承的属性 */
.inherited-properties {
  /* 字体相关 */
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  line-height: 1.5;

  /* 文本相关 */
  color: #333;
  text-align: left;
  text-indent: 0;
  text-transform: none;

  /* 列表相关 */
  list-style: none;

  /* 表格相关 */
  border-collapse: separate;
  border-spacing: 0;

  /* 其他 */
  cursor: default;
  visibility: visible;
}

/* 不可继承的属性 */
.non-inherited-properties {
  /* 盒模型 */
  width: 200px;
  height: 100px;
  padding: 10px;
  margin: 10px;
  border: 1px solid black;

  /* 定位 */
  position: static;
  top: 0;
  left: 0;

  /* 背景 */
  background-color: white;
  background-image: none;

  /* 显示 */
  display: block;
  float: none;
  clear: none;
}
```

### 控制继承

```css
/* inherit: 强制继承 */
.force-inherit {
  border: inherit; /* 继承父元素的border */
  background-color: inherit;
}

/* initial: 重置为初始值 */
.reset-initial {
  color: initial; /* 重置为浏览器默认颜色 */
  font-size: initial;
}

/* unset: 自然值 */
.natural-value {
  color: unset; /* 可继承属性使用继承值，不可继承属性使用初始值 */
  margin: unset;
}

/* revert: 回退到用户代理样式 */
.revert-style {
  font-size: revert; /* 回退到浏览器默认样式 */
}

/* 实际应用 */
.button-reset {
  all: unset; /* 重置所有属性 */
  display: inline-block; /* 重新设置需要的属性 */
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
```

---

🎯 **下一步**: 掌握了 CSS 基础后，建议学习 [CSS 布局技术](./css-layout.md) 来深入理解现代布局方案！
