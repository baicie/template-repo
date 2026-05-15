# HTML 基础与语义化

HTML (HyperText Markup Language) 是构建 Web 页面的基础标记语言。现代 HTML 不仅仅是内容的载体，更是语义化、可访问性和 SEO 优化的重要工具。

## HTML5 语义化标签 🏗️

### 页面结构标签

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>语义化页面结构</title>
</head>
<body>
    <!-- 页面头部 -->
    <header>
        <nav>
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><a href="#services">服务</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        </nav>
    </header>

    <!-- 主要内容区域 -->
    <main>
        <!-- 文章内容 -->
        <article>
            <header>
                <h1>文章标题</h1>
                <p>
                    发布于 <time datetime="2024-01-15">2024年1月15日</time>
                    作者：<address>张三</address>
                </p>
            </header>

            <section>
                <h2>第一章节</h2>
                <p>章节内容...</p>

                <aside>
                    <h3>相关链接</h3>
                    <ul>
                        <li><a href="#">相关文章1</a></li>
                        <li><a href="#">相关文章2</a></li>
                    </ul>
                </aside>
            </section>

            <section>
                <h2>第二章节</h2>
                <p>章节内容...</p>
            </section>

            <footer>
                <p>标签：
                    <span class="tag">HTML5</span>
                    <span class="tag">语义化</span>
                </p>
            </footer>
        </article>

        <!-- 侧边栏 -->
        <aside>
            <section>
                <h2>热门文章</h2>
                <ul>
                    <li><a href="#">热门文章1</a></li>
                    <li><a href="#">热门文章2</a></li>
                </ul>
            </section>
        </aside>
    </main>

    <!-- 页面底部 -->
    <footer>
        <p>&copy; 2024 我的网站. 保留所有权利.</p>
    </footer>
</body>
</html>
```

### 语义化标签详解

**结构性标签**

```html
<!-- 页面或内容区域的头部 -->
<header>
  <h1>网站标题</h1>
  <nav>导航菜单</nav>
</header>

<!-- 导航链接区域 -->
<nav>
  <ul>
    <li><a href="/home">首页</a></li>
    <li><a href="/blog">博客</a></li>
  </ul>
</nav>

<!-- 主要内容区域 -->
<main>
  <!-- 页面的主要内容 -->
</main>

<!-- 独立的内容区域 -->
<article>
  <h2>文章标题</h2>
  <p>文章内容...</p>
</article>

<!-- 内容的分组 -->
<section>
  <h2>章节标题</h2>
  <p>章节内容...</p>
</section>

<!-- 侧边栏或辅助内容 -->
<aside>
  <h3>相关链接</h3>
  <ul>
    ...
  </ul>
</aside>

<!-- 页面或内容区域的底部 -->
<footer>
  <p>版权信息</p>
</footer>
```

**内容性标签**

```html
<!-- 强调重要性 -->
<strong>重要内容</strong>
<em>强调内容</em>

<!-- 标记关键词或专有名词 -->
<mark>高亮内容</mark>

<!-- 删除和插入的内容 -->
<del>已删除的内容</del>
<ins>新插入的内容</ins>

<!-- 小号文字 -->
<small>附加信息或版权声明</small>

<!-- 引用 -->
<blockquote cite="https://example.com">
  <p>这是一段引用的内容</p>
  <footer>—— <cite>引用来源</cite></footer>
</blockquote>

<!-- 行内引用 -->
<p>正如 <q>莎士比亚</q> 所说...</p>

<!-- 缩写和术语 -->
<abbr title="HyperText Markup Language">HTML</abbr>
<dfn>CSS</dfn> 是层叠样式表的缩写。

<!-- 时间和日期 -->
<time datetime="2024-01-15T10:30:00">2024年1月15日 上午10:30</time>

<!-- 联系信息 -->
<address>
  联系人：张三<br />
  邮箱：<a href="mailto:zhangsan@example.com">zhangsan@example.com</a>
</address>

<!-- 代码 -->
<code>console.log('Hello World');</code>
<pre><code>
function greet(name) {
    return `Hello, ${name}!`;
}
</code></pre>

<!-- 键盘输入 -->
<kbd>Ctrl</kbd> + <kbd>C</kbd>

<!-- 程序输出 -->
<samp>Error: File not found</samp>

<!-- 变量 -->
<var>x</var> = <var>y</var> + <var>z</var>
```

## 现代表单设计 📝

### 基础表单结构

```html
<form action="/submit" method="post" novalidate>
  <fieldset>
    <legend>个人信息</legend>

    <!-- 文本输入 -->
    <div class="form-group">
      <label for="fullname">姓名 <span aria-label="必填">*</span></label>
      <input
        type="text"
        id="fullname"
        name="fullname"
        required
        autocomplete="name"
        placeholder="请输入您的姓名"
        aria-describedby="fullname-help"
      />
      <div id="fullname-help" class="form-help">请输入您的真实姓名</div>
    </div>

    <!-- 邮箱输入 -->
    <div class="form-group">
      <label for="email">邮箱地址 <span aria-label="必填">*</span></label>
      <input
        type="email"
        id="email"
        name="email"
        required
        autocomplete="email"
        placeholder="example@domain.com"
        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
      />
    </div>

    <!-- 电话号码 -->
    <div class="form-group">
      <label for="phone">手机号码</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        autocomplete="tel"
        placeholder="13800138000"
        pattern="1[3-9]\d{9}"
      />
    </div>

    <!-- 密码输入 -->
    <div class="form-group">
      <label for="password">密码 <span aria-label="必填">*</span></label>
      <input
        type="password"
        id="password"
        name="password"
        required
        autocomplete="new-password"
        minlength="8"
        aria-describedby="password-requirements"
      />
      <div id="password-requirements" class="form-help">
        密码至少8位，包含字母和数字
      </div>
    </div>
  </fieldset>

  <fieldset>
    <legend>偏好设置</legend>

    <!-- 单选按钮 -->
    <div class="form-group">
      <fieldset>
        <legend>性别</legend>
        <label>
          <input type="radio" name="gender" value="male" />
          男性
        </label>
        <label>
          <input type="radio" name="gender" value="female" />
          女性
        </label>
        <label>
          <input type="radio" name="gender" value="other" />
          其他
        </label>
      </fieldset>
    </div>

    <!-- 复选框 -->
    <div class="form-group">
      <fieldset>
        <legend>兴趣爱好</legend>
        <label>
          <input type="checkbox" name="interests" value="reading" />
          阅读
        </label>
        <label>
          <input type="checkbox" name="interests" value="music" />
          音乐
        </label>
        <label>
          <input type="checkbox" name="interests" value="sports" />
          运动
        </label>
      </fieldset>
    </div>

    <!-- 选择框 -->
    <div class="form-group">
      <label for="city">所在城市</label>
      <select id="city" name="city" required>
        <option value="">请选择城市</option>
        <optgroup label="直辖市">
          <option value="beijing">北京</option>
          <option value="shanghai">上海</option>
          <option value="tianjin">天津</option>
          <option value="chongqing">重庆</option>
        </optgroup>
        <optgroup label="省会城市">
          <option value="guangzhou">广州</option>
          <option value="shenzhen">深圳</option>
          <option value="hangzhou">杭州</option>
        </optgroup>
      </select>
    </div>

    <!-- 多行文本 -->
    <div class="form-group">
      <label for="bio">个人简介</label>
      <textarea
        id="bio"
        name="bio"
        rows="4"
        cols="50"
        placeholder="请简单介绍一下自己..."
        maxlength="500"
      ></textarea>
    </div>

    <!-- 文件上传 -->
    <div class="form-group">
      <label for="avatar">头像上传</label>
      <input
        type="file"
        id="avatar"
        name="avatar"
        accept="image/*"
        aria-describedby="avatar-help"
      />
      <div id="avatar-help" class="form-help">
        支持 JPG、PNG 格式，文件大小不超过 2MB
      </div>
    </div>
  </fieldset>

  <!-- 提交按钮 -->
  <div class="form-actions">
    <button type="submit">提交表单</button>
    <button type="reset">重置表单</button>
  </div>
</form>
```

### HTML5 表单验证

```html
<!-- 必填验证 -->
<input type="text" required />

<!-- 模式验证 -->
<input type="text" pattern="[A-Za-z]{3,}" title="至少3个字母" />

<!-- 长度验证 -->
<input type="text" minlength="6" maxlength="20" />
<input type="password" minlength="8" />

<!-- 数值验证 -->
<input type="number" min="1" max="100" step="1" />

<!-- 日期验证 -->
<input type="date" min="2024-01-01" max="2024-12-31" />

<!-- 自定义验证消息 -->
<input
  type="email"
  required
  oninvalid="this.setCustomValidity('请输入有效的邮箱地址')"
  oninput="this.setCustomValidity('')"
/>

<!-- JavaScript 自定义验证 -->
<script>
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");

    // 自定义验证函数
    function validatePassword() {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("两次输入的密码不一致");
      } else {
        confirmPassword.setCustomValidity("");
      }
    }

    password.addEventListener("change", validatePassword);
    confirmPassword.addEventListener("keyup", validatePassword);

    // 表单提交验证
    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();

        // 显示第一个无效字段
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }

      form.classList.add("was-validated");
    });
  });
</script>
```

## 可访问性 (Accessibility) ♿

### ARIA 属性应用

```html
<!-- ARIA 标签和描述 -->
<button
  aria-label="关闭对话框"
  aria-describedby="close-help"
  onclick="closeDialog()"
>
  <span aria-hidden="true">&times;</span>
</button>
<div id="close-help" class="sr-only">点击此按钮将关闭当前对话框</div>

<!-- ARIA 状态 -->
<button aria-expanded="false" aria-controls="menu" onclick="toggleMenu()">
  菜单
</button>
<ul id="menu" aria-hidden="true">
  <li><a href="/home">首页</a></li>
  <li><a href="/about">关于</a></li>
</ul>

<!-- ARIA 角色 -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">标签1</button>
  <button role="tab" aria-selected="false" aria-controls="panel2">标签2</button>
</div>
<div role="tabpanel" id="panel1">内容1</div>
<div role="tabpanel" id="panel2" hidden>内容2</div>

<!-- ARIA 实时区域 -->
<div aria-live="polite" id="status"></div>
<div aria-live="assertive" id="error"></div>

<!-- 表单可访问性 -->
<div class="form-group">
  <label for="search">搜索</label>
  <input
    type="search"
    id="search"
    aria-describedby="search-help"
    aria-required="true"
  />
  <div id="search-help">输入关键词搜索文章</div>
</div>

<!-- 导航可访问性 -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/" aria-current="page">首页</a></li>
    <li><a href="/blog">博客</a></li>
    <li><a href="/contact">联系</a></li>
  </ul>
</nav>

<nav aria-label="面包屑导航">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/blog">博客</a></li>
    <li aria-current="page">当前文章</li>
  </ol>
</nav>
```

### 键盘导航支持

```html
<!-- 跳过链接 -->
<a href="#main-content" class="skip-link">跳转到主内容</a>

<!-- 焦点管理 -->
<script>
  // 模态框焦点管理
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.style.display = "block";
    firstFocusable.focus();

    modal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal(modalId);
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // 自定义组件键盘支持
  function initAccordion() {
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach((header) => {
      header.addEventListener("keydown", function (e) {
        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            this.click();
            break;
          case "ArrowDown":
            e.preventDefault();
            const nextHeader =
              this.parentElement.nextElementSibling?.querySelector(
                ".accordion-header"
              );
            nextHeader?.focus();
            break;
          case "ArrowUp":
            e.preventDefault();
            const prevHeader =
              this.parentElement.previousElementSibling?.querySelector(
                ".accordion-header"
              );
            prevHeader?.focus();
            break;
        }
      });
    });
  }
</script>
```

## SEO 优化 🔍

### Meta 标签优化

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <!-- 基础 Meta 标签 -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>页面标题 - 网站名称</title>
    <meta
      name="description"
      content="页面描述，简洁明了地说明页面内容，建议控制在150-160字符"
    />
    <meta name="keywords" content="关键词1,关键词2,关键词3" />
    <meta name="author" content="作者姓名" />

    <!-- Open Graph 标签 (社交媒体分享) -->
    <meta property="og:title" content="页面标题" />
    <meta property="og:description" content="页面描述" />
    <meta property="og:image" content="https://example.com/image.jpg" />
    <meta property="og:url" content="https://example.com/page" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="网站名称" />

    <!-- Twitter Card 标签 -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@username" />
    <meta name="twitter:title" content="页面标题" />
    <meta name="twitter:description" content="页面描述" />
    <meta name="twitter:image" content="https://example.com/image.jpg" />

    <!-- 搜索引擎指令 -->
    <meta name="robots" content="index,follow" />
    <meta name="googlebot" content="index,follow" />

    <!-- 规范链接 -->
    <link rel="canonical" href="https://example.com/page" />

    <!-- 语言和地区 -->
    <link rel="alternate" hreflang="en" href="https://example.com/en/page" />
    <link rel="alternate" hreflang="zh-CN" href="https://example.com/zh/page" />

    <!-- 网站图标 -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <!-- DNS 预解析 -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    <link rel="dns-prefetch" href="//api.example.com" />

    <!-- 资源预加载 -->
    <link
      rel="preload"
      href="/fonts/main.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link rel="preload" href="/css/critical.css" as="style" />
    <link rel="preload" href="/images/hero.webp" as="image" />

    <!-- 结构化数据 -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "文章标题",
        "image": "https://example.com/image.jpg",
        "author": {
          "@type": "Person",
          "name": "作者姓名"
        },
        "publisher": {
          "@type": "Organization",
          "name": "网站名称",
          "logo": {
            "@type": "ImageObject",
            "url": "https://example.com/logo.png"
          }
        },
        "datePublished": "2024-01-15",
        "dateModified": "2024-01-16"
      }
    </script>
  </head>
</html>
```

### 结构化数据示例

```html
<!-- 面包屑导航 -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首页",
        "item": "https://example.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "博客",
        "item": "https://example.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "文章标题"
      }
    ]
  }
</script>

<!-- 产品信息 -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "产品名称",
    "image": "https://example.com/product.jpg",
    "description": "产品描述",
    "brand": {
      "@type": "Brand",
      "name": "品牌名称"
    },
    "offers": {
      "@type": "Offer",
      "price": "99.99",
      "priceCurrency": "CNY",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "商家名称"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "89"
    }
  }
</script>

<!-- 本地企业信息 -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "企业名称",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "街道地址",
      "addressLocality": "城市",
      "addressRegion": "省份",
      "postalCode": "邮编",
      "addressCountry": "CN"
    },
    "telephone": "+86-123-4567-8900",
    "openingHours": "Mo-Fr 09:00-18:00",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "39.9042",
      "longitude": "116.4074"
    }
  }
</script>
```

## 性能优化 ⚡

### 资源加载优化

```html
<!-- 关键资源预加载 -->
<link rel="preload" href="/css/critical.css" as="style" />
<link rel="preload" href="/js/main.js" as="script" />
<link
  rel="preload"
  href="/fonts/main.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
<link rel="dns-prefetch" href="//cdn.example.com" />

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- 预获取 -->
<link rel="prefetch" href="/page2.html" />
<link rel="prefetch" href="/images/next-page-hero.jpg" />

<!-- 模块预加载 -->
<link rel="modulepreload" href="/js/modules/utils.js" />

<!-- 异步加载非关键 CSS -->
<link
  rel="preload"
  href="/css/non-critical.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript><link rel="stylesheet" href="/css/non-critical.css" /></noscript>

<!-- 延迟加载 JavaScript -->
<script src="/js/main.js" defer></script>
<script src="/js/analytics.js" async></script>

<!-- 响应式图片 -->
<picture>
  <source
    media="(min-width: 800px)"
    srcset="/images/hero-large.webp"
    type="image/webp"
  />
  <source media="(min-width: 800px)" srcset="/images/hero-large.jpg" />
  <source
    media="(min-width: 400px)"
    srcset="/images/hero-medium.webp"
    type="image/webp"
  />
  <source media="(min-width: 400px)" srcset="/images/hero-medium.jpg" />
  <img src="/images/hero-small.jpg" alt="英雄图片" loading="lazy" />
</picture>

<!-- 懒加载图片 -->
<img
  src="/images/placeholder.jpg"
  data-src="/images/actual-image.jpg"
  alt="图片描述"
  loading="lazy"
  class="lazy"
/>

<!-- Service Worker 注册 -->
<script>
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .then(function (registration) {
          console.log("SW registered: ", registration);
        })
        .catch(function (registrationError) {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
</script>
```

### 内容优化

```html
<!-- 压缩和优化的 HTML -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>优化标题</title>
    <link rel="stylesheet" href="/css/main.min.css" />
  </head>
  <body>
    <main>
      <h1>主要内容</h1>
      <p>段落内容</p>
    </main>
    <script src="/js/main.min.js" defer></script>
  </body>
</html>

<!-- 内联关键 CSS -->
<style>
  /* 首屏关键样式 */
  body {
    font-family: Arial, sans-serif;
    margin: 0;
  }
  .header {
    background: #333;
    color: #fff;
    padding: 1rem;
  }
  .hero {
    height: 100vh;
    background: url(/images/hero.jpg) center/cover;
  }
</style>

<!-- 资源提示 -->
<meta http-equiv="x-dns-prefetch-control" content="on" />
<link rel="dns-prefetch" href="//example.com" />

<!-- 缓存控制 -->
<meta http-equiv="Cache-Control" content="public, max-age=31536000" />

<!-- 压缩算法提示 -->
<meta http-equiv="Content-Encoding" content="gzip" />
```

---

🎯 **下一步**: 掌握了 HTML 基础后，建议学习 [CSS 基础与选择器](./css-fundamentals.md) 来深入理解样式系统！
