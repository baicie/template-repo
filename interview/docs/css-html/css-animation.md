# CSS 动画与特效

CSS 动画为网页带来生动的视觉体验，从简单的过渡效果到复杂的关键帧动画，掌握这些技术能够显著提升用户体验和页面的交互性。

## Transform 变换 🔄

### 2D 变换

```css
/* 平移 */
.translate {
  transform: translate(50px, 100px); /* X轴50px，Y轴100px */
  transform: translateX(50px); /* 仅X轴 */
  transform: translateY(100px); /* 仅Y轴 */
}

/* 缩放 */
.scale {
  transform: scale(1.5); /* 等比缩放1.5倍 */
  transform: scale(2, 0.5); /* X轴2倍，Y轴0.5倍 */
  transform: scaleX(2); /* 仅X轴 */
  transform: scaleY(0.5); /* 仅Y轴 */
}

/* 旋转 */
.rotate {
  transform: rotate(45deg); /* 顺时针旋转45度 */
  transform: rotate(-90deg); /* 逆时针旋转90度 */
}

/* 倾斜 */
.skew {
  transform: skew(15deg, 0deg); /* X轴倾斜15度 */
  transform: skewX(15deg); /* 仅X轴倾斜 */
  transform: skewY(10deg); /* 仅Y轴倾斜 */
}

/* 组合变换 */
.combined-transform {
  transform: translate(50px, 50px) rotate(45deg) scale(1.2);
  /* 变换顺序很重要！ */
}

/* 变换原点 */
.transform-origin {
  transform-origin: center center; /* 默认值 */
  transform-origin: top left; /* 左上角 */
  transform-origin: 50% 50%; /* 百分比 */
  transform-origin: 10px 20px; /* 具体像素值 */
}
```

### 3D 变换

```css
/* 3D 变换容器 */
.transform-3d-container {
  perspective: 1000px; /* 设置透视距离 */
  perspective-origin: center center; /* 透视原点 */
}

/* 3D 变换元素 */
.transform-3d {
  transform-style: preserve-3d; /* 保持3D效果 */
  backface-visibility: hidden; /* 隐藏背面 */
}

/* 3D 平移 */
.translate-3d {
  transform: translate3d(50px, 100px, 200px);
  transform: translateZ(100px); /* 仅Z轴 */
}

/* 3D 旋转 */
.rotate-3d {
  transform: rotateX(45deg); /* 绕X轴旋转 */
  transform: rotateY(45deg); /* 绕Y轴旋转 */
  transform: rotateZ(45deg); /* 绕Z轴旋转，等同于rotate() */
  transform: rotate3d(1, 1, 0, 45deg); /* 绕指定轴旋转 */
}

/* 3D 缩放 */
.scale-3d {
  transform: scale3d(1.5, 1.5, 1.5);
  transform: scaleZ(2); /* 仅Z轴缩放 */
}

/* 3D 实例：翻转卡片 */
.flip-card {
  width: 300px;
  height: 200px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-card-front {
  background-color: #bbb;
  color: black;
}

.flip-card-back {
  background-color: #2980b9;
  color: white;
  transform: rotateY(180deg);
}

/* 3D 立方体 */
.cube-container {
  width: 200px;
  height: 200px;
  position: relative;
  margin: 100px auto;
  perspective: 1000px;
}

.cube {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  animation: rotate-cube 4s infinite linear;
}

.cube-face {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid #000;
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-align: center;
  line-height: 196px;
}

.cube-front {
  background: rgba(255, 0, 0, 0.7);
  transform: translateZ(100px);
}
.cube-back {
  background: rgba(0, 255, 0, 0.7);
  transform: rotateY(180deg) translateZ(100px);
}
.cube-right {
  background: rgba(0, 0, 255, 0.7);
  transform: rotateY(90deg) translateZ(100px);
}
.cube-left {
  background: rgba(255, 255, 0, 0.7);
  transform: rotateY(-90deg) translateZ(100px);
}
.cube-top {
  background: rgba(255, 0, 255, 0.7);
  transform: rotateX(90deg) translateZ(100px);
}
.cube-bottom {
  background: rgba(0, 255, 255, 0.7);
  transform: rotateX(-90deg) translateZ(100px);
}

@keyframes rotate-cube {
  from {
    transform: rotateX(0deg) rotateY(0deg);
  }
  to {
    transform: rotateX(360deg) rotateY(360deg);
  }
}
```

## Transition 过渡 ⏱️

### 基础过渡

```css
/* 基础过渡语法 */
.transition-basic {
  transition: property duration timing-function delay;

  /* 示例 */
  transition: all 0.3s ease-in-out 0.1s;

  /* 分别设置 */
  transition-property: all; /* 或指定属性如 width, height, color */
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  transition-delay: 0.1s;
}

/* 多个属性过渡 */
.transition-multiple {
  transition: width 0.3s ease-in-out, height 0.5s ease-out 0.1s,
    background-color 0.2s linear;
}

/* 常用的过渡效果 */
.button-transition {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-transition:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-transition:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

### 缓动函数

```css
/* 内置缓动函数 */
.timing-functions {
  transition-timing-function: linear; /* 匀速 */
  transition-timing-function: ease; /* 默认，慢-快-慢 */
  transition-timing-function: ease-in; /* 慢开始 */
  transition-timing-function: ease-out; /* 慢结束 */
  transition-timing-function: ease-in-out; /* 慢开始和结束 */
}

/* 自定义贝塞尔曲线 */
.custom-timing {
  transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition-timing-function: cubic-bezier(
    0.68,
    -0.55,
    0.265,
    1.55
  ); /* 弹性效果 */
}

/* 阶跃函数 */
.steps-timing {
  transition-timing-function: steps(4, end); /* 4步，结束时跳跃 */
  transition-timing-function: step-start; /* 等同于 steps(1, start) */
  transition-timing-function: step-end; /* 等同于 steps(1, end) */
}

/* 实际应用示例 */
.progress-bar {
  width: 0%;
  height: 20px;
  background: linear-gradient(45deg, #3498db, #2ecc71);
  border-radius: 10px;
  transition: width 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.progress-bar.loaded {
  width: 100%;
}

/* 打字机效果 */
.typewriter {
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #333;
  transition: width 3s steps(40, end);
}

.typewriter.typing {
  width: 100%;
}
```

## Animation 关键帧动画 🎬

### 基础动画语法

```css
/* 定义关键帧 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 使用百分比 */
@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-30px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0);
  }
}

/* 应用动画 */
.animated-element {
  animation: slideIn 1s ease-out forwards;

  /* 完整语法 */
  animation-name: slideIn;
  animation-duration: 1s;
  animation-timing-function: ease-out;
  animation-delay: 0s;
  animation-iteration-count: 1; /* 或 infinite */
  animation-direction: normal; /* reverse | alternate | alternate-reverse */
  animation-fill-mode: forwards; /* none | backwards | both */
  animation-play-state: running; /* paused */
}
```

### 复杂动画示例

```css
/* 加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 脉冲效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.pulse-button {
  animation: pulse 2s ease-in-out infinite;
}

/* 摇摆动画 */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}

.shake-on-error {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* 浮动效果 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.floating-element {
  animation: float 3s ease-in-out infinite;
}

/* 渐显动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

/* 弹性进入 */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  20% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  40% {
    transform: scale3d(0.9, 0.9, 0.9);
  }
  60% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  80% {
    transform: scale3d(0.97, 0.97, 0.97);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

.bounce-in {
  animation: bounceIn 0.75s;
}
```

### 动画序列

```css
/* 复杂动画序列 */
@keyframes complexAnimation {
  0% {
    transform: translateX(-100px) rotate(0deg);
    opacity: 0;
    background-color: #e74c3c;
  }
  25% {
    transform: translateX(0px) rotate(90deg);
    opacity: 0.5;
    background-color: #f39c12;
  }
  50% {
    transform: translateX(100px) rotate(180deg);
    opacity: 1;
    background-color: #2ecc71;
  }
  75% {
    transform: translateX(0px) rotate(270deg);
    opacity: 0.8;
    background-color: #3498db;
  }
  100% {
    transform: translateX(-100px) rotate(360deg);
    opacity: 0;
    background-color: #9b59b6;
  }
}

.complex-animated {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  animation: complexAnimation 4s ease-in-out infinite;
}

/* 多个动画组合 */
.multi-animation {
  animation: slideIn 1s ease-out, pulse 2s ease-in-out 1s infinite,
    float 3s ease-in-out 2s infinite;
}
```

## 高级动画技巧 🎨

### 性能优化

```css
/* GPU 加速 */
.gpu-accelerated {
  transform: translateZ(0); /* 或 translate3d(0, 0, 0) */
  will-change: transform; /* 告诉浏览器将要变化的属性 */
}

/* 优化的动画属性 */
.optimized-animation {
  /* 推荐：只动画这些属性 */
  animation: optimizedMove 1s ease-out;
}

@keyframes optimizedMove {
  from {
    transform: translateX(-100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 避免动画这些属性 */
.avoid-these {
  /* 不推荐：会触发重排 */
  /* width, height, padding, margin, border */
  /* left, top, right, bottom (使用 transform 代替) */
}

/* 动画完成后清理 */
.animation-cleanup {
  animation: slideIn 1s ease-out forwards;
}

.animation-cleanup.animation-complete {
  will-change: auto; /* 清除 will-change */
}
```

### 响应式动画

```css
/* 根据屏幕尺寸调整动画 */
.responsive-animation {
  animation: mobileAnimation 1s ease-out;
}

@media (min-width: 768px) {
  .responsive-animation {
    animation: desktopAnimation 1.5s ease-out;
  }
}

@keyframes mobileAnimation {
  from {
    transform: translateY(50px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes desktopAnimation {
  from {
    transform: translateY(100px) scale(0.8);
  }
  to {
    transform: translateY(0) scale(1);
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .respectful-animation {
    animation: none;
  }

  .respectful-transition {
    transition: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .respectful-animation {
    animation: slideIn 1s ease-out;
  }
}
```

### 交互式动画

```css
/* 悬停触发动画 */
.hover-animation {
  transition: transform 0.3s ease;
}

.hover-animation:hover {
  transform: scale(1.05) rotate(5deg);
  animation: wiggle 0.5s ease-in-out;
}

@keyframes wiggle {
  0%,
  100% {
    transform: scale(1.05) rotate(5deg);
  }
  25% {
    transform: scale(1.05) rotate(7deg);
  }
  75% {
    transform: scale(1.05) rotate(3deg);
  }
}

/* 点击动画 */
.click-animation {
  position: relative;
  overflow: hidden;
}

.click-animation::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s linear;
}

@keyframes ripple {
  to {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

/* 滚动触发动画 */
.scroll-animation {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s ease-out;
}

.scroll-animation.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* JavaScript 配合 */
/*
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-animation').forEach(el => {
    observer.observe(el);
});
*/
```

### 动画库风格效果

```css
/* Animate.css 风格的动画 */
.animate__animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.animate__fadeIn {
  animation-name: fadeIn;
}

.animate__slideInLeft {
  animation-name: slideInLeft;
}

.animate__bounceIn {
  animation-name: bounceIn;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translate3d(-100%, 0, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

/* 延迟类 */
.animate__delay-1s {
  animation-delay: 1s;
}
.animate__delay-2s {
  animation-delay: 2s;
}

/* 速度类 */
.animate__slow {
  animation-duration: 2s;
}
.animate__fast {
  animation-duration: 0.5s;
}

/* 重复类 */
.animate__infinite {
  animation-iteration-count: infinite;
}
.animate__repeat-2 {
  animation-iteration-count: 2;
}
```

## 实战项目案例 🚀

### 加载动画集合

```css
/* 点状加载器 */
.dots-loader {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.dots-loader div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #3498db;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.dots-loader div:nth-child(1) {
  left: 8px;
  animation: dots1 0.6s infinite;
}

.dots-loader div:nth-child(2) {
  left: 8px;
  animation: dots2 0.6s infinite;
}

.dots-loader div:nth-child(3) {
  left: 32px;
  animation: dots2 0.6s infinite;
}

.dots-loader div:nth-child(4) {
  left: 56px;
  animation: dots3 0.6s infinite;
}

@keyframes dots1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes dots3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

@keyframes dots2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}

/* 波纹加载器 */
.wave-loader {
  width: 40px;
  height: 40px;
  margin: 100px auto;
  background-color: #3498db;
  border-radius: 100%;
  animation: wave-scale 1s infinite ease-in-out;
}

@keyframes wave-scale {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
```

### 卡片悬停效果

```css
.card-hover-effect {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateY(0);
}

.card-hover-effect:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-hover-effect .card-image {
  transition: transform 0.5s ease;
}

.card-hover-effect:hover .card-image {
  transform: scale(1.1);
}

.card-hover-effect .card-content {
  padding: 20px;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.card-hover-effect:hover .card-content {
  transform: translateY(-5px);
}
```

---

🎯 **下一步**: 掌握了动画技术后，建议学习 [响应式设计](./responsive-design.md) 来创建适配各种设备的现代网页！
