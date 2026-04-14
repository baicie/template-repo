# shadcn/ui Monorepo 模板项目

基于 shadcn/ui 的 Monorepo 项目模板，使用 pnpm workspaces + Turborepo 构建。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | ^15.0.0 |
| React | react | ^19.0.0 |
| 包管理 | pnpm | ^10.0.0 |
| 构建系统 | Turborepo | ^2.0.0 |
| UI 组件 | shadcn/ui | latest |
| 样式 | Tailwind CSS | ^4.0.0 |
| 表单 | react-hook-form + zod | ^7.0.0 / ^3.0.0 |
| 状态管理 | zustand | ^5.0.0 |

## 项目结构

```
shadcn-app/
├── apps/
│   └── web/               # Next.js 主应用
├── packages/
│   ├── ui/                # shadcn/ui 组件包
│   ├── tsconfig/          # TypeScript 共享配置
│   ├── config/           # ESLint/Prettier 配置
│   └── types/            # 共享类型定义
├── turbo.json             # Turborepo 配置
├── pnpm-workspace.yaml    # pnpm 工作空间配置
└── package.json
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有应用
pnpm dev

# 仅启动 web 应用
pnpm --filter web dev
```

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
# ESLint 检查
pnpm lint

# TypeScript 类型检查
pnpm type-check

# 格式化代码
pnpm format
```

### 运行测试

```bash
pnpm test
```

## 添加 shadcn/ui 组件

```bash
# 添加单个组件
pnpm --filter @repo/ui exec shadcn@latest add button

# 添加多个组件
pnpm --filter @repo/ui exec shadcn@latest add card dialog form
```

## 可用脚本

| 脚本 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint |
| `pnpm type-check` | 运行 TypeScript 检查 |
| `pnpm test` | 运行单元测试 |
| `pnpm format` | 格式化代码 |
| `pnpm add:ui` | 添加 shadcn/ui 组件 |

## 环境变量

在 `apps/web` 目录下创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 许可证

MIT
