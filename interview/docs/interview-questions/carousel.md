# 轮播图实现

## 题目描述

实现一个图片轮播组件，要求：

- 支持自动播放和手动切换
- 有左右切换按钮
- 有底部指示器
- 支持无限循环
- 鼠标悬停时暂停自动播放

## 核心考察点

- DOM 操作和事件处理
- CSS 动画和布局
- 定时器管理
- 组件化思维

## 实现思路

### 1. HTML 结构设计

```html
<div class="carousel-container">
  <!-- 图片容器 -->
  <div class="carousel-wrapper">
    <div class="carousel-slides">
      <img src="image1.jpg" alt="Image 1" />
      <img src="image2.jpg" alt="Image 2" />
      <img src="image3.jpg" alt="Image 3" />
    </div>
  </div>

  <!-- 左右按钮 -->
  <button class="carousel-btn prev-btn">‹</button>
  <button class="carousel-btn next-btn">›</button>

  <!-- 指示器 -->
  <div class="carousel-indicators">
    <span class="indicator active"></span>
    <span class="indicator"></span>
    <span class="indicator"></span>
  </div>
</div>
```

### 2. CSS 样式实现

```css
.carousel-container {
  position: relative;
  width: 600px;
  height: 400px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.carousel-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slides {
  display: flex;
  width: 300%; /* 3张图片 */
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-slides img {
  width: 33.333%; /* 每张图片占1/3宽度 */
  height: 100%;
  object-fit: cover;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.3s;
}

.indicator.active {
  background: white;
}
```

### 3. JavaScript 逻辑实现

```javascript
class Carousel {
  constructor(container) {
    this.container = container;
    this.slides = container.querySelector(".carousel-slides");
    this.prevBtn = container.querySelector(".prev-btn");
    this.nextBtn = container.querySelector(".next-btn");
    this.indicators = container.querySelectorAll(".indicator");

    this.currentIndex = 0;
    this.totalSlides = this.indicators.length;
    this.autoPlayTimer = null;
    this.autoPlayDelay = 3000;

    this.init();
  }

  init() {
    // 绑定事件
    this.prevBtn.addEventListener("click", () => this.prevSlide());
    this.nextBtn.addEventListener("click", () => this.nextSlide());

    // 指示器点击事件
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index));
    });

    // 鼠标悬停事件
    this.container.addEventListener("mouseenter", () => this.pauseAutoPlay());
    this.container.addEventListener("mouseleave", () => this.startAutoPlay());

    // 开始自动播放
    this.startAutoPlay();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateSlidePosition();
    this.updateIndicators();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
    this.updateSlidePosition();
    this.updateIndicators();
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlidePosition();
    this.updateIndicators();
  }

  updateSlidePosition() {
    const translateX = -this.currentIndex * (100 / this.totalSlides);
    this.slides.style.transform = `translateX(${translateX}%)`;
  }

  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === this.currentIndex);
    });
  }

  startAutoPlay() {
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  // 销毁方法，清理定时器
  destroy() {
    this.pauseAutoPlay();
  }
}

// 使用示例
document.addEventListener("DOMContentLoaded", () => {
  const carouselContainer = document.querySelector(".carousel-container");
  const carousel = new Carousel(carouselContainer);
});
```

## 进阶优化

### 1. 无限循环优化

```javascript
// 在 slides 前后各添加一张图片实现真正的无限循环
class InfiniteCarousel extends Carousel {
  constructor(container) {
    super(container);
    this.setupInfiniteLoop();
  }

  setupInfiniteLoop() {
    const firstSlide = this.slides.children[0].cloneNode(true);
    const lastSlide =
      this.slides.children[this.totalSlides - 1].cloneNode(true);

    this.slides.appendChild(firstSlide);
    this.slides.insertBefore(lastSlide, this.slides.firstChild);

    // 调整初始位置
    this.currentIndex = 1;
    this.updateSlidePosition();
  }

  updateSlidePosition() {
    const translateX = -this.currentIndex * (100 / (this.totalSlides + 2));
    this.slides.style.transform = `translateX(${translateX}%)`;

    // 处理边界情况
    if (this.currentIndex === 0) {
      setTimeout(() => {
        this.slides.style.transition = "none";
        this.currentIndex = this.totalSlides;
        this.updateSlidePosition();
        setTimeout(() => {
          this.slides.style.transition = "transform 0.5s ease-in-out";
        }, 10);
      }, 500);
    } else if (this.currentIndex === this.totalSlides + 1) {
      setTimeout(() => {
        this.slides.style.transition = "none";
        this.currentIndex = 1;
        this.updateSlidePosition();
        setTimeout(() => {
          this.slides.style.transition = "transform 0.5s ease-in-out";
        }, 10);
      }, 500);
    }
  }
}
```

### 2. 触摸支持（移动端）

```javascript
// 添加触摸事件支持
addTouchSupport() {
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  this.container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
    this.pauseAutoPlay();
  });

  this.container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
  });

  this.container.addEventListener('touchend', (e) => {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // 水平滑动距离大于垂直滑动距离，且滑动距离足够
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    }

    isDragging = false;
    this.startAutoPlay();
  });
}
```

### 3. 懒加载优化

```javascript
// 图片懒加载
setupLazyLoading() {
  const images = this.slides.querySelectorAll('img');

  images.forEach((img, index) => {
    if (index === 0) {
      // 第一张图片立即加载
      this.loadImage(img);
    } else {
      // 其他图片延迟加载
      img.dataset.src = img.src;
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
    }
  });
}

loadImage(img) {
  if (img.dataset.src) {
    img.src = img.dataset.src;
    delete img.dataset.src;
  }
}

// 在切换时预加载下一张图片
goToSlide(index) {
  super.goToSlide(index);

  // 预加载当前和下一张图片
  const currentImg = this.slides.children[index];
  const nextIndex = (index + 1) % this.totalSlides;
  const nextImg = this.slides.children[nextIndex];

  this.loadImage(currentImg);
  this.loadImage(nextImg);
}
```

## 相关知识点

- [DOM 操作与事件](/browser/api.md)
- [CSS 动画](/css-html/css-animation.md)
- [JavaScript 定时器](/javascript/async-programming.md)
- [移动端触摸事件](/browser/compatibility.md)

## 总结

轮播图是一个综合性很强的面试题，涉及：

1. **HTML 结构设计** - 语义化和可访问性
2. **CSS 布局和动画** - Flexbox、定位、过渡效果
3. **JavaScript 逻辑** - 事件处理、定时器、状态管理
4. **用户体验** - 响应式设计、触摸支持、性能优化

掌握这个组件的实现，能够很好地展示前端开发的综合能力。
