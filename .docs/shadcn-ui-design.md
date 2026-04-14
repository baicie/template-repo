# Shadcn/ui 模板项目设计方案

## 一、项目架构设计

采用 **Monorepo** 结构，使用 **pnpm workspaces** + **Turborepo** 构建系统。shadcn/ui 不是传统意义上的组件库，而是一组可直接复制、修改的组件源码，强调代码所有权和定制灵活性。

```
shadcn-app/
├── apps/
│   ├── web/               # Next.js 主应用
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # 本地业务组件
│   │   │   ├── lib/           # 工具函数
│   │   │   └── styles/        # 全局样式
│   │   ├── components.json    # shadcn/ui CLI 配置
│   │   └── package.json
│   └── docs/              # 文档站点 (可选)
├── packages/
│   ├── ui/                # shadcn/ui 组件包
│   │   ├── src/
│   │   │   ├── ui/            # UI 组件 (Button, Input...)
│   │   │   └── lib/           # 工具类 (cn, merge...)
│   │   ├── components.json    # shadcn/ui CLI 配置
│   │   └── package.json
│   ├── config/            # ESLint/Prettier 共享配置
│   ├── tsconfig/          # TypeScript 基础配置
│   └── types/             # 共享类型定义
├── turbo.json             # Turborepo 构建配置
├── pnpm-workspace.yaml    # pnpm 工作空间配置
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
| 构建系统 | Turborepo | ^2.0.0 | 增量构建缓存 |
| 前端构建 | Vite | ^6.0.0 | (可选) 单独渲染场景 |
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
| 状态管理 | zustand | ^5.0.0 | 轻量状态 |
| 代码规范 | ESLint 9 + Flat Config | ^9.0.0 | 最新配置格式 |
| 代码格式化 | Prettier | ^3.4.0 | 统一代码风格 |
| 测试 | Vitest | ^2.0.0 | 单元测试 |
| 类型合并 | @react-three/drei | latest | 简化 React 类型 |

---

## 三、核心特性设计

### 3.1 shadcn/ui 组件包 (`packages/ui`)

shadcn/ui 的核心理念是"复制源码到你的项目"，我们将其封装为独立包：

```
packages/ui/
├── src/
│   ├── ui/                    # 组件目录
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── utils.ts           # cn() 等工具函数
│   │   └── cn.ts              # 类名合并
│   ├── components.tsx         # 统一导出
│   └── index.ts               # 包导出
└── components.json            # shadcn/ui CLI 配置
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
    "components": "@/ui",
    "utils": "@/lib/utils",
    "ui": "@/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 3.3 组件变体系统

使用 `class-variance-authority` (CVA) 管理组件变体：

```typescript
// button.tsx
import { type VariantProps, cva } from "class-variance-authority";

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
```

### 3.4 Web 应用 (`apps/web`)

Next.js 15 App Router 架构：

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx          # 首页
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # 仪表盘布局
│   │   │   ├── overview/
│   │   │   └── settings/
│   │   └── api/              # API 路由
│   ├── components/
│   │   ├── ui/               # 来自 @repo/ui
│   │   ├── forms/            # 业务表单组件
│   │   └── layouts/          # 布局组件
│   ├── lib/
│   │   ├── utils.ts          # 工具函数
│   │   └── api.ts            # API 客户端
│   ├── hooks/                # 自定义 Hooks
│   └── styles/
│       └── globals.css       # 全局样式 + CSS 变量
├── public/                   # 静态资源
├── components.json
└── package.json
```

---

## 四、组件清单

### 4.1 基础组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Button | Radix Slot | 按钮组件，支持多种变体 |
| Badge | - | 徽章/标签 |
| Card | - | 卡片容器 |
| Input | - | 输入框 |
| Label | - | 标签 |
| Separator | Radix Separator | 分隔线 |
| Skeleton | - | 加载骨架屏 |

### 4.2 表单组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Form | react-hook-form | 表单容器 |
| Textarea | - | 多行文本 |
| Checkbox | Radix Checkbox | 复选框 |
| RadioGroup | Radix RadioGroup | 单选组 |
| Switch | Radix Switch | 开关 |
| Select | Radix Select | 选择器 |
| Slider | Radix Slider | 滑块 |

### 4.3 反馈组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Alert | - | 警告提示 |
| AlertDialog | Radix AlertDialog | 警告对话框 |
| Dialog | Radix Dialog | 对话框 |
| Drawer | Vaul | 抽屉 |
| Progress | Radix Progress | 进度条 |
| Toast | Sonner | 轻量提示 |
| Tooltip | Radix Tooltip | 工具提示 |
| HoverCard | Radix HoverCard | 悬停卡片 |

### 4.4 导航组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Tabs | Radix Tabs | 标签页 |
| DropdownMenu | Radix DropdownMenu | 下拉菜单 |
| NavigationMenu | Radix NavigationMenu | 导航菜单 |
| Sheet | Vaul | 侧边面板 |

### 4.5 数据展示组件

| 组件 | 依赖 | 说明 |
|------|------|------|
| Table | - | 表格 |
| Avatar | Radix Avatar | 头像 |
| Calendar | Radix Calendar | 日历 |
| Popover | Radix Popover | 弹出框 |

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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### 5.2 CSS 变量主题

```css
/* globals.css */
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
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 六、共享包设计

### 6.1 `@repo/tsconfig`

```json
packages/tsconfig/
├── base.json          # 基础配置
├── react.json         # React 配置
├── nextjs.json        # Next.js 配置
└── package.json
```

### 6.2 `@repo/config`

```json
packages/config/
├── eslint/            # ESLint 配置
│   ├── base.js
│   ├── nextjs.js
│   └── package.json
├── prettier/          # Prettier 配置
│   └── package.json
└── package.json
```

### 6.3 `@repo/types`

```json
packages/types/
├── index.ts           # 导出入口
├── user.ts            # 用户类型
└── package.json
```

---

## 七、Turborepo 配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

---

## 八、开发工作流

### 8.1 脚本命令

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

# 类型检查
pnpm type-check

# 单元测试
pnpm test

# 添加 shadcn/ui 组件
pnpm add:ui button    # 添加 Button 组件
pnpm add:ui card dialog form  # 添加多个组件

# 格式化代码
pnpm format
```

### 8.2 添加新组件

```bash
# 使用 shadcn/ui CLI 添加组件
cd packages/ui
npx shadcn@latest add button

# 或在根目录使用
pnpm --filter @repo/ui add button
```

### 8.3 更新主题

修改 `globals.css` 中的 CSS 变量即可调整主题色。

---

## 九、CI/CD 配置

### 9.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: ci

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

jobs:
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

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

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

## 十、代码示例

### 10.1 使用 shadcn/ui 组件

```tsx
// packages/ui/src/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@repo/ui";

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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 10.2 应用中使用

```tsx
// apps/web/src/app/page.tsx
import { Button } from "@repo/ui";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui";

export default function HomePage() {
  return (
    <main className="container py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Getting started with shadcn/ui</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Build beautiful applications with copy-and-paste components.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Get Started</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
```

---

## 十一、下一步计划

1. 创建项目目录结构
2. 初始化 pnpm workspaces
3. 配置 Turborepo
4. 创建共享配置包 (tsconfig, eslint, prettier)
5. 创建 `@repo/ui` 组件包
6. 初始化 shadcn/ui 组件集合
7. 创建 Next.js 应用
8. 配置 Tailwind CSS
9. 添加基础组件 (Button, Input, Card 等)
10. 创建示例页面
11. 配置 CI/CD
12. 编写开发规范文档 (agent.md)
