# Shadcn Standalone

基于 [shadcn/ui](https://ui.shadcn.com/) 和 [Next.js 15](https://nextjs.org/) 的单体应用模板。

## 特性

- **shadcn/ui** - 精美的可复制组件集合
- **Next.js 15** - React 框架，支持 App Router
- **TypeScript** - 完整的类型安全
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无样式的可访问组件
- **pnpm** - 高效的包管理器

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

应用将在 http://localhost:3000 运行。

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务

```bash
pnpm start
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint |
| `pnpm type-check` | 运行 TypeScript 类型检查 |
| `pnpm format` | 格式化代码 |

## 添加组件

使用 shadcn/ui CLI 添加新组件：

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 认证页面
│   ├── (dashboard)/       # 仪表盘页面
│   └── api/               # API 路由
├── components/
│   ├── ui/                # shadcn/ui 组件
│   └── forms/             # 业务表单
└── lib/                    # 工具函数
```

## 技术栈

- React 19
- Next.js 15
- TypeScript 5
- Tailwind CSS 4
- Radix UI
- Zod (表单验证)
- pnpm

## License

MIT
