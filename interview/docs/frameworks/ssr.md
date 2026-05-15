# 服务端渲染实战指南

服务端渲染 (SSR) 是现代 Web 开发的重要技术，它能提供更好的 SEO、更快的首屏加载和更好的用户体验。本文将深入探讨 Next.js、Nuxt.js、Remix 等主流 SSR 框架的原理和实战应用。

## 🔍 SSR 核心概念

### SSR vs CSR vs SSG 对比

```javascript
// CSR (Client-Side Rendering) - 传统 SPA
// 浏览器收到空 HTML，然后加载 JS 构建页面
function CSRApp() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 客户端获取数据
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return <div>{data.content}</div>;
}

// SSR (Server-Side Rendering)
// 服务器生成完整 HTML，客户端进行水合
export async function getServerSideProps() {
  // 服务器端获取数据
  const res = await fetch("http://localhost:3000/api/data");
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

function SSRPage({ data }) {
  return <div>{data.content}</div>;
}

// SSG (Static Site Generation)
// 构建时生成静态 HTML
export async function getStaticProps() {
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();

  return {
    props: {
      data,
    },
    // 重新生成页面的时间间隔（秒）
    revalidate: 3600,
  };
}
```

### 水合 (Hydration) 过程

```javascript
// 服务器端渲染的 HTML
const serverHTML = `
  <div id="root">
    <h1>Hello, World!</h1>
    <button onclick="handleClick()">点击我</button>
    <p>计数: 0</p>
  </div>
`;

// 客户端 JavaScript 接管
function ClientApp() {
  const [count, setCount] = useState(0);

  // 水合过程中，React 会将事件处理器附加到已有的 DOM
  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h1>Hello, World!</h1>
      <button onClick={handleClick}>点击我</button>
      <p>计数: {count}</p>
    </div>
  );
}

// 水合过程
ReactDOM.hydrate(<ClientApp />, document.getElementById("root"));
```

## ⚡ Next.js 深度实战

### 项目设置与基础配置

```bash
# 创建 Next.js 项目
npx create-next-app@latest my-nextjs-app
cd my-nextjs-app

# 安装附加依赖
npm install styled-components @types/styled-components
npm install @next/bundle-analyzer
npm install sharp # 图片优化
```

```javascript
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 React 严格模式
  reactStrictMode: true,

  // 启用 SWC 编译器
  swcMinify: true,

  // 图片优化配置
  images: {
    domains: ["example.com", "cdn.example.com"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 国际化配置
  i18n: {
    locales: ["zh-CN", "en"],
    defaultLocale: "zh-CN",
    domains: [
      {
        domain: "example.com",
        defaultLocale: "en",
      },
      {
        domain: "example.cn",
        defaultLocale: "zh-CN",
      },
    ],
  },

  // 重定向
  async redirects() {
    return [
      {
        source: "/old-path",
        destination: "/new-path",
        permanent: true,
      },
    ];
  },

  // 重写
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://api.example.com/:path*",
      },
    ];
  },

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 webpack 配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

### 页面与路由系统

```javascript
// pages/index.js - 首页
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function HomePage({ posts }) {
  return (
    <>
      <Head>
        <title>我的博客 - 首页</title>
        <meta name="description" content="这是我的个人博客首页" />
        <meta property="og:title" content="我的博客" />
        <meta property="og:description" content="分享技术和生活" />
      </Head>

      <main>
        <h1>欢迎来到我的博客</h1>

        {/* 优化的图片组件 */}
        <Image
          src="/hero-image.jpg"
          alt="首页横幅"
          width={800}
          height={400}
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
        />

        <section>
          <h2>最新文章</h2>
          {posts.map((post) => (
            <article key={post.id}>
              <Link href={`/posts/${post.slug}`}>
                <a>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                </a>
              </Link>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

// 服务器端数据获取
export async function getServerSideProps() {
  // 从 API 或数据库获取文章列表
  const res = await fetch(`${process.env.API_URL}/posts`);
  const posts = await res.json();

  return {
    props: {
      posts,
    },
  };
}
```

```javascript
// pages/posts/[slug].js - 动态路由
import { useRouter } from "next/router";
import { GetStaticProps, GetStaticPaths } from "next";
import ErrorPage from "next/error";
import Head from "next/head";

export default function PostPage({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>加载中...</div>;
  }

  if (!post) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>{post.title} - 我的博客</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.featuredImage} />
      </Head>

      <article>
        <header>
          <h1>{post.title}</h1>
          <time>{new Date(post.date).toLocaleDateString()}</time>
          <div>
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}

// 静态生成路径
export const getStaticPaths: GetStaticPaths = async () => {
  // 获取所有文章的 slug
  const res = await fetch(`${process.env.API_URL}/posts`);
  const posts = await res.json();

  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: "blocking", // 或 true 或 false
  };
};

// 静态生成 props
export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const res = await fetch(`${process.env.API_URL}/posts/${params.slug}`);

    if (!res.ok) {
      return {
        notFound: true,
      };
    }

    const post = await res.json();

    return {
      props: {
        post,
      },
      // 增量静态再生
      revalidate: 3600,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
```

### API 路由与中间件

```javascript
// pages/api/posts/index.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  // 启用 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  switch (req.method) {
    case "GET":
      return await getPosts(req, res);
    case "POST":
      return await createPost(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getPosts(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // 模拟数据库查询
    let posts = await db.posts.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
            ],
          }
        : {},
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await db.posts.count();

    res.status(200).json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "获取文章失败" });
  }
}

async function createPost(req, res) {
  try {
    const { title, content, excerpt, tags } = req.body;

    // 验证数据
    if (!title || !content) {
      return res.status(400).json({ error: "标题和内容是必填项" });
    }

    const post = await db.posts.create({
      data: {
        title,
        content,
        excerpt,
        tags,
        slug: generateSlug(title),
        publishedAt: new Date(),
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "创建文章失败" });
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
```

```javascript
// middleware.js - 全局中间件
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 身份验证检查
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth-token");

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 地理位置重定向
  const country = request.geo?.country || "US";
  if (country === "CN" && !request.nextUrl.pathname.startsWith("/cn")) {
    return NextResponse.redirect(
      new URL("/cn" + request.nextUrl.pathname, request.url)
    );
  }

  // A/B 测试
  const bucket = request.cookies.get("bucket");
  if (!bucket) {
    const response = NextResponse.next();
    const randomBucket = Math.random() < 0.5 ? "A" : "B";
    response.cookies.set("bucket", randomBucket);
    response.headers.set("x-bucket", randomBucket);
    return response;
  }

  // 安全头
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    // 匹配所有路径除了 api、_next/static、_next/image、favicon.ico
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 性能优化技巧

```javascript
// 代码分割和动态导入
import dynamic from "next/dynamic";
import { Suspense } from "react";

// 动态导入组件
const DynamicComponent = dynamic(() => import("../components/HeavyComponent"), {
  loading: () => <p>加载中...</p>,
  ssr: false, // 禁用服务端渲染
});

// 条件加载
const AdminPanel = dynamic(() => import("../components/AdminPanel"), {
  ssr: false,
});

function Dashboard({ user }) {
  return (
    <div>
      <h1>仪表板</h1>
      {user.isAdmin && (
        <Suspense fallback={<div>加载管理面板...</div>}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  );
}

// 预加载关键路由
import { useRouter } from "next/router";

function Navigation() {
  const router = useRouter();

  return (
    <nav>
      <Link href="/products">
        <a
          onMouseEnter={() => {
            // 鼠标悬停时预加载
            router.prefetch("/products");
          }}
        >
          产品
        </a>
      </Link>
    </nav>
  );
}
```

## 🟢 Nuxt.js Vue 生态

### Nuxt 3 项目设置

```bash
# 创建 Nuxt 3 项目
npx nuxi@latest init my-nuxt-app
cd my-nuxt-app

# 安装依赖
npm install
npm install @pinia/nuxt @nuxtjs/tailwindcss @vueuse/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 应用配置
  app: {
    head: {
      title: "我的 Nuxt 应用",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "这是我的 Nuxt 3 应用" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  // CSS 框架
  css: ["~/assets/css/main.css"],

  // 模块
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@vueuse/nuxt"],

  // 构建配置
  build: {
    transpile: ["@heroicons/vue"],
  },

  // 运行时配置
  runtimeConfig: {
    // 服务器端私有变量
    apiSecret: process.env.API_SECRET,
    // 公开变量（客户端也可访问）
    public: {
      apiBase: process.env.API_BASE_URL || "/api",
    },
  },

  // SSR 配置
  ssr: true,

  // 实验性功能
  experimental: {
    payloadExtraction: false,
  },

  // Nitro 配置
  nitro: {
    prerender: {
      routes: ["/sitemap.xml"],
    },
  },
});
```

### 页面与布局

```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex items-center">
              <img src="/logo.svg" alt="Logo" class="h-8 w-8" />
              <span class="ml-2 text-xl font-bold">我的应用</span>
            </NuxtLink>

            <nav class="ml-6 flex space-x-8">
              <NuxtLink
                to="/posts"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                active-class="text-blue-600"
              >
                文章
              </NuxtLink>
              <NuxtLink
                to="/about"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                active-class="text-blue-600"
              >
                关于
              </NuxtLink>
            </nav>
          </div>

          <div class="flex items-center">
            <ClientOnly>
              <ThemeToggle />
            </ClientOnly>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="bg-gray-800 text-white py-8">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p>&copy; 2023 我的应用. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// 布局级别的设置
useHead({
  bodyAttrs: {
    class: "font-sans",
  },
});
</script>
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <Head>
      <Title>首页 - 我的博客</Title>
      <Meta name="description" content="欢迎来到我的个人博客" />
    </Head>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section class="text-center mb-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">欢迎来到我的博客</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          分享技术文章、生活感悟和学习笔记
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-8">最新文章</h2>

        <div v-if="pending" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">加载失败: {{ error.message }}</p>
          <button @click="refresh()" class="mt-2 text-blue-600 hover:underline">
            重试
          </button>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="post in data.posts"
            :key="post.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <NuxtImg
              v-if="post.featuredImage"
              :src="post.featuredImage"
              :alt="post.title"
              class="w-full h-48 object-cover"
            />

            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                {{ post.title }}
              </h3>
              <p class="text-gray-600 mb-4">
                {{ post.excerpt }}
              </p>
              <div class="flex justify-between items-center">
                <time class="text-sm text-gray-500">
                  {{ formatDate(post.publishedAt) }}
                </time>
                <NuxtLink
                  :to="`/posts/${post.slug}`"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  阅读更多
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// 异步数据获取
const { data, pending, error, refresh } = await useFetch("/api/posts", {
  query: {
    limit: 6,
    featured: true,
  },
  key: "featured-posts",
});

// 工具函数
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// SEO 优化
useSeoMeta({
  title: "首页 - 我的博客",
  ogTitle: "我的个人博客",
  description: "分享技术文章、生活感悟和学习笔记",
  ogDescription: "分享技术文章、生活感悟和学习笔记",
  ogImage: "/og-image.jpg",
  twitterCard: "summary_large_image",
});
</script>
```

### 状态管理 (Pinia)

```typescript
// stores/auth.ts
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isAuthenticated = computed(() => !!user.value);

  const login = async (credentials) => {
    try {
      const { data } = await $fetch("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      user.value = data.user;

      // 设置认证 cookie
      const token = useCookie("auth-token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 天
      });
      token.value = data.token;

      await navigateTo("/dashboard");
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: "登录失败",
      });
    }
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", {
      method: "POST",
    });

    user.value = null;
    const token = useCookie("auth-token");
    token.value = null;

    await navigateTo("/login");
  };

  const fetchUser = async () => {
    try {
      const data = await $fetch("/api/auth/me");
      user.value = data.user;
    } catch (error) {
      // 用户未认证或 token 无效
      user.value = null;
    }
  };

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    fetchUser,
  };
});

// stores/posts.ts
export const usePostsStore = defineStore("posts", () => {
  const posts = ref([]);
  const currentPost = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchPosts = async (params = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await $fetch("/api/posts", {
        query: params,
      });
      posts.value = data.posts;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const fetchPost = async (slug) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await $fetch(`/api/posts/${slug}`);
      currentPost.value = data.post;
    } catch (err) {
      error.value = err.message;
      throw createError({
        statusCode: 404,
        statusMessage: "文章不存在",
      });
    } finally {
      loading.value = false;
    }
  };

  const createPost = async (postData) => {
    try {
      const data = await $fetch("/api/posts", {
        method: "POST",
        body: postData,
      });
      posts.value.unshift(data.post);
      return data.post;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  return {
    posts: readonly(posts),
    currentPost: readonly(currentPost),
    loading: readonly(loading),
    error: readonly(error),
    fetchPosts,
    fetchPost,
    createPost,
  };
});
```

### 服务器 API

```typescript
// server/api/posts/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { page = 1, limit = 10, search, category } = query;

  try {
    // 构建查询条件
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) {
      where.category = { slug: category };
    }

    // 获取文章列表
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { name: true, avatar: true },
          },
          category: {
            select: { name: true, slug: true },
          },
          _count: {
            select: { comments: true },
          },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { publishedAt: "desc" },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts: posts.map((post) => ({
        ...post,
        commentsCount: post._count.comments,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "获取文章列表失败",
    });
  }
});

// server/api/posts/[slug].get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, avatar: true, bio: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        tags: {
          select: { name: true, slug: true },
        },
        comments: {
          where: { approved: true },
          include: {
            author: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: "文章不存在",
      });
    }

    // 增加阅读量
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return { post };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "获取文章失败",
    });
  }
});
```

## 🎵 Remix 全栈框架

### Remix 项目结构

```bash
# 创建 Remix 应用
npx create-remix@latest my-remix-app
cd my-remix-app

# 安装依赖
npm install @prisma/client prisma
npm install tailwindcss @tailwindcss/typography
```

```typescript
// app/root.tsx
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";

import stylesheet from "~/styles/app.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "我的 Remix 应用",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="zh-CN">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

// 错误边界
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <html>
      <head>
        <title>哎呀！出错了</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="error-container">
          <h1>应用错误</h1>
          <p>很抱歉，应用遇到了意外错误。</p>
          <pre>{error.message}</pre>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// 捕获边界
export function CatchBoundary() {
  const caught = useCatch();

  return (
    <html>
      <head>
        <title>哎呀！{caught.status}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="error-container">
          <h1>
            {caught.status} {caught.statusText}
          </h1>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
```

### 路由与数据加载

```typescript
// app/routes/posts.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Outlet, NavLink } from "@remix-run/react";
import { getPosts } from "~/models/post.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPosts();
  return json<LoaderData>({ posts });
};

export default function PostsRoute() {
  const { posts } = useLoaderData<LoaderData>();

  return (
    <div className="posts-layout">
      <nav className="posts-nav">
        <h2>文章列表</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <NavLink
                to={post.slug}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {post.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="posts-main">
        <Outlet />
      </main>
    </div>
  );
}

// app/routes/posts/$slug.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/post.server";
import invariant from "tiny-invariant";

type LoaderData = {
  post: Awaited<ReturnType<typeof getPost>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "Slug is required");

  const post = await getPost(params.slug);
  if (!post) {
    throw new Response("文章不存在", { status: 404 });
  }

  return json<LoaderData>({ post });
};

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  if (!data?.post) {
    return {
      title: "文章不存在",
      description: "找不到您要查看的文章",
    };
  }

  return {
    title: data.post.title,
    description: data.post.excerpt,
    "og:title": data.post.title,
    "og:description": data.post.excerpt,
    "og:image": data.post.featuredImage,
  };
};

export default function PostRoute() {
  const { post } = useLoaderData<LoaderData>();

  return (
    <article className="post">
      <header className="post-header">
        <h1>{post.title}</h1>
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
        </time>
      </header>

      <div
        className="post-content prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
```

### 表单处理与数据变更

```typescript
// app/routes/admin/posts/new.tsx
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { createPost } from "~/models/post.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    title?: string;
    content?: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const excerpt = formData.get("excerpt");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "标题是必填项" } },
      { status: 400 }
    );
  }

  if (typeof content !== "string" || content.length === 0) {
    return json<ActionData>(
      { errors: { content: "内容是必填项" } },
      { status: 400 }
    );
  }

  const post = await createPost({
    title,
    content,
    excerpt: typeof excerpt === "string" ? excerpt : "",
    authorId: userId,
  });

  return redirect(`/posts/${post.slug}`);
};

export default function NewPostRoute() {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  return (
    <div className="new-post">
      <h1>创建新文章</h1>

      <Form method="post" className="post-form">
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input
            type="text"
            id="title"
            name="title"
            className={actionData?.errors?.title ? "error" : ""}
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-describedby={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
          {actionData?.errors?.title && (
            <div className="error-message" id="title-error">
              {actionData.errors.title}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">摘要</label>
          <textarea id="excerpt" name="excerpt" rows={3} />
        </div>

        <div className="form-group">
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            name="content"
            rows={20}
            className={actionData?.errors?.content ? "error" : ""}
            aria-invalid={actionData?.errors?.content ? true : undefined}
            aria-describedby={
              actionData?.errors?.content ? "content-error" : undefined
            }
          />
          {actionData?.errors?.content && (
            <div className="error-message" id="content-error">
              {actionData.errors.content}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "创建中..." : "创建文章"}
        </button>
      </Form>
    </div>
  );
}
```

## 🔧 SSR 优化策略

### 缓存策略

```javascript
// Next.js 增量静态再生 (ISR)
export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);

  return {
    props: { post },
    // 每小时重新生成一次
    revalidate: 3600,
    // 返回 404 如果数据不存在
    notFound: !post,
  };
}

// Nuxt.js 缓存控制
export default defineEventHandler(async (event) => {
  // 设置缓存头
  setHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");

  const data = await fetchData();
  return data;
});

// Remix 缓存头
export const headers = () => ({
  "Cache-Control": "public, max-age=3600",
});
```

### 流式渲染

```javascript
// React 18 Suspense 流式渲染
import { Suspense } from "react";

function App() {
  return (
    <html>
      <head>
        <title>流式渲染示例</title>
      </head>
      <body>
        <header>
          <h1>我的网站</h1>
        </header>

        <main>
          <Suspense fallback={<div>加载中...</div>}>
            <SlowComponent />
          </Suspense>

          <Suspense fallback={<div>加载侧边栏...</div>}>
            <Sidebar />
          </Suspense>
        </main>
      </body>
    </html>
  );
}

// 慢组件
async function SlowComponent() {
  // 模拟慢数据获取
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return <div>这是一个慢组件</div>;
}
```

### 预渲染和预加载

```javascript
// 关键资源预加载
function MyApp() {
  return (
    <>
      <Head>
        {/* DNS 预解析 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />

        {/* 预连接 */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />

        {/* 关键资源预加载 */}
        <link rel="preload" href="/critical.css" as="style" />
        <link rel="preload" href="/hero-image.jpg" as="image" />

        {/* 字体预加载 */}
        <link
          rel="preload"
          href="/fonts/Inter-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin
        />
      </Head>

      <MainContent />
    </>
  );
}

// 路由预加载
function Navigation() {
  return (
    <nav>
      <Link
        href="/products"
        onMouseEnter={() => {
          // 预加载下一页
          Router.prefetch("/products");
        }}
      >
        产品页面
      </Link>
    </nav>
  );
}
```

---

🔍 **服务端渲染技术为现代 Web 应用提供了更好的性能、SEO 和用户体验。掌握 Next.js、Nuxt.js、Remix 等框架的核心特性和优化技巧，能够帮助你构建高质量的全栈应用！**
