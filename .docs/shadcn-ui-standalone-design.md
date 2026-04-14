# Shadcn/ui 单体应用模板设计方案

## 一、项目架构设计

采用 **单体应用** 结构，无需 Monorepo 配置，项目结构简洁直观。适合中小型项目或快速启动场景。

```
shadcn-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── overview/
│   │   │   └── settings/
│   │   ├── api/               # API 路由
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── forms/             # 业务表单组件
│   │   └── layouts/           # 布局组件
│   ├── lib/
│   │   ├── utils.ts           # 工具函数 (cn)
│   │   └── api.ts             # API 客户端
│   ├── hooks/                 # 自定义 Hooks
│   └── styles/
│       └── globals.css        # 全局样式 + CSS 变量
├── public/                    # 静态资源
├── components.json            # shadcn/ui CLI 配置
├── next.config.ts             # Next.js 配置
├── tailwind.config.ts         # Tailwind CSS 配置
├── postcss.config.mjs         # PostCSS 配置
└── package.json
```

---

## 二、技术栈选型

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| React | react | ^19.0.0 | 最新版本 |
| React | react-dom | ^19.0.0 | 最新版本 |
| 框架 | Next.js | ^15.0.0 | App Router |
| Node.js | node | ^22.0.0 | 最新 LTS |
| 包管理 | pnpm | ^10.0.0 | 高效磁盘占用 |
| TypeScript | typescript | ^5.6.0 | 类型安全 |
| UI Primitives | @radix-ui/react-* | ^1.0.0 | 无样式组件 |
| 样式 | Tailwind CSS | ^4.0.0 | 实用优先 CSS |
| 组件集合 | shadcn/ui | latest | 可复制组件 |
| 样式工具 | class-variance-authority | ^0.7.0 | 组件变体 |
| 样式工具 | clsx | ^2.1.0 | 条件类名 |
| 样式工具 | tailwind-merge | ^2.0.0 | Tailwind 合并 |
| 图标 | lucide-react | ^0.400.0 | 图标库 |
| 动画 | tailwindcss-animate | ^1.0.0 | 动画支持 |
| 表单 | react-hook-form | ^7.0.0 | 表单管理 |
| 表单验证 | zod | ^3.0.0 | Schema 验证 |
| 表单集成 | @hookform/resolvers | ^3.0.0 | Zod 集成 |
| 状态管理 | zustand | ^5.0.0 | 轻量状态 |
| 弹窗 | vaul | ^0.9.0 | Drawer/Sheet |
| Toast | sonner | ^1.0.0 | Toast 通知 |
| 代码规范 | ESLint 9 + Flat Config | ^9.0.0 | 最新配置格式 |
| 代码格式化 | Prettier | ^3.4.0 | 统一代码风格 |
| 测试 | Vitest | ^2.0.0 | 单元测试 |
| 端到端测试 | Playwright | ^1.40.0 | E2E 测试 |

---

## 三、核心特性设计

### 3.1 组件目录结构

```
src/components/
├── ui/                        # shadcn/ui 组件 (自动管理)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── sonner.tsx             # Toast 提供器
│   ├── tooltip.tsx
│   ├── calendar.tsx
│   ├── date-picker.tsx
│   ├── data-table.tsx         # 数据表格
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   ├── separator.tsx
│   └── index.ts               # 统一导出
├── forms/                     # 业务表单组件
│   ├── login-form.tsx
│   ├── register-form.tsx
│   ├── profile-form.tsx
│   └── settings-form.tsx
├── layouts/                   # 布局组件
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── footer.tsx
│   └── dashboard-layout.tsx
└── shared/                    # 共享组件
    ├── loading-spinner.tsx
    ├── error-boundary.tsx
    └── page-header.tsx
```

### 3.2 shadcn/ui CLI 配置

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components/ui",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 3.3 组件变体系统

```typescript
// src/components/ui/button.tsx
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

### 3.4 Next.js App Router 结构

```
src/app/
├── layout.tsx              # 根布局 (全局 providers、主题)
├── page.tsx               # 首页
├── loading.tsx            # 全局加载状态
├── error.tsx              # 全局错误边界
├── not-found.tsx          # 404 页面
│
├── (auth)/                # 路由组：未认证页面
│   ├── layout.tsx         # 认证布局 (无侧边栏)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── (dashboard)/           # 路由组：认证后页面
│   ├── layout.tsx         # 仪表盘布局 (侧边栏 + 头部)
│   ├── overview/
│   │   └── page.tsx
│   ├── users/
│   │   ├── page.tsx       # 用户列表
│   │   ├── [id]/
│   │   │   └── page.tsx   # 用户详情
│   │   └── new/
│   │       └── page.tsx   # 新建用户
│   └── settings/
│       ├── page.tsx       # 设置首页
│       ├── profile/
│       │   └── page.tsx   # 个人资料
│       └── security/
│           └── page.tsx   # 安全设置
│
└── api/                   # API 路由
    ├── auth/
    │   ├── login/route.ts
    │   └── logout/route.ts
    └── users/
        └── route.ts
```

---

## 四、组件清单

### 4.1 基础组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Button | Radix Slot | 按钮组件，支持多种变体 |
| Badge | - | 徽章/标签 |
| Card | - | 卡片容器 (Header/Content/Footer) |
| Input | - | 输入框 |
| Textarea | - | 多行文本 |
| Label | - | 标签 |
| Separator | Radix Separator | 分隔线 |
| Skeleton | - | 加载骨架屏 |
| Avatar | Radix Avatar | 头像 |

### 4.2 表单组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Form | react-hook-form + Zod | 完整表单解决方案 |
| Checkbox | Radix Checkbox | 复选框 |
| RadioGroup | Radix RadioGroup | 单选组 |
| Switch | Radix Switch | 开关 |
| Select | Radix Select | 选择器 |
| Slider | Radix Slider | 滑块 |
| Combobox | Radix Popover | 可搜索选择器 |

### 4.3 反馈组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Alert | - | 警告提示 |
| AlertDialog | Radix AlertDialog | 警告对话框 |
| Dialog | Radix Dialog | 对话框 |
| Drawer/Sheet | Vaul | 抽屉/侧边面板 |
| Popover | Radix Popover | 弹出框 |
| Progress | Radix Progress | 进度条 |
| Toast | Sonner | 轻量提示 |
| Toaster | Sonner | Toast 提供器 |
| Tooltip | Radix Tooltip | 工具提示 |
| HoverCard | Radix HoverCard | 悬停卡片 |

### 4.4 导航组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Tabs | Radix Tabs | 标签页 |
| DropdownMenu | Radix DropdownMenu | 下拉菜单 |
| NavigationMenu | Radix NavigationMenu | 导航菜单 |
| Breadcrumb | - | 面包屑导航 |
| Pagination | - | 分页器 |

### 4.5 数据展示组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Table | - | 表格容器 |
| DataTable | TanStack Table | 功能表格 |
| Calendar | Radix Calendar | 日历 |
| DatePicker | Calendar + Popover | 日期选择器 |
| AspectRatio | Radix AspectRatio | 宽高比 |

---

## 五、Tailwind CSS 配置

### 5.1 Tailwind 配置

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "animate-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "animate-in": "animate-in 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### 5.2 CSS 变量主题

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .container {
    @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
  }
}
```

---

## 六、工具函数

### 6.1 cn() - 类名合并

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 6.2 API 客户端

```typescript
// src/lib/api.ts
import type { z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message, error);
  }

  return response.json();
}
```

---

## 七、开发工作流

### 7.1 脚本命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务
pnpm start

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check

# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e

# 添加 shadcn/ui 组件
pnpm ui add button         # 添加 Button 组件
pnpm ui add card dialog    # 添加多个组件
pnpm ui add --all          # 添加所有组件

# 更新 shadcn/ui
pnpm ui upgrade
```

### 7.2 添加新组件

```bash
# 使用 shadcn/ui CLI 添加组件
npx shadcn@latest add button

# 或通过 pnpm
pnpm dlx shadcn@latest add form

# 手动添加 (复制源码)
# 1. 从 shadcn/ui 官网复制组件代码
# 2. 粘贴到 src/components/ui/ 目录
# 3. 确保导入路径正确
```

### 7.3 主题定制

```typescript
// 修改 CSS 变量
// src/styles/globals.css

// 品牌色主题示例
:root {
  --primary: 221 83% 53%;     /* 蓝色主色 */
  --primary-foreground: 0 0% 98%;
  --destructive: 0 84% 60%;
  --accent: 210 40% 96%;
}
```

---

## 八、CI/CD 配置

### 8.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: ci

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: .node-version
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: .node-version
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: .node-version
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Test
        run: pnpm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: .node-version
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
```

---

## 九、代码示例

### 9.1 根布局

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### 9.2 仪表盘布局

```tsx
// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

### 9.3 表单组件示例

```tsx
// src/components/forms/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少8个字符"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    console.log(data);
    // 处理登录逻辑
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          登录
        </Button>
      </form>
    </Form>
  );
}
```

### 9.4 数据表格示例

```tsx
// src/components/data-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="筛选..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
```

---

## 十、环境变量

```bash
# .env.local
# 数据库
DATABASE_URL=

# 认证
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# OAuth (可选)
GITHUB_ID=
GITHUB_SECRET=

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 十一、下一步计划

1. 初始化 Next.js 15 项目
2. 配置 TypeScript
3. 配置 Tailwind CSS + shadcn/ui
4. 初始化 shadcn/ui CLI
5. 添加基础组件 (Button, Input, Card 等)
6. 配置 ESLint + Prettier
7. 创建布局组件 (Sidebar, Header)
8. 实现登录/注册页面
9. 实现仪表盘页面
10. 配置 Zustand 状态管理
11. 实现 API 路由
12. 添加单元测试
13. 配置 CI/CD
14. 编写开发规范文档 (agent.md)
