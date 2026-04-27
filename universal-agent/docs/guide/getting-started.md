# Getting Started

## 前置要求

- Node.js >= 22.0.0
- pnpm >= 10.0.0

## 安装

```bash
# 安装依赖
pnpm install

# 安装完成后，simple-git-hooks 会自动设置 git hooks
```

## 快速开始

```bash
# 启动 CLI 开发模式（tsx 热重载）
pnpm dev

# 或者直接运行
pnpm --filter @agent/cli dev
```

## 常用命令

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `pnpm dev`           | 启动 CLI 开发模式             |
| `pnpm build`         | 构建所有包（packages + apps） |
| `pnpm clean`         | 清理构建产物和缓存            |
| `pnpm check`         | TypeScript 类型检查           |
| `pnpm lint`          | ESLint 代码检查               |
| `pnpm lint:fix`      | ESLint 自动修复               |
| `pnpm format`        | Prettier 代码格式化           |
| `pnpm format:check`  | Prettier 格式检查             |
| `pnpm test`          | Vitest 测试（watch 模式）     |
| `pnpm test:run`      | Vitest 测试（单次）           |
| `pnpm test:coverage` | 测试覆盖率                    |
| `pnpm docs:dev`      | VitePress 文档开发            |
| `pnpm docs:build`    | 构建 VitePress 文档           |
| `pnpm docs:preview`  | 预览 VitePress 文档           |

## 项目结构

```
universal-agent/
├── apps/
│   └── cli/              # CLI 入口
├── packages/
│   └── core/            # Agent Runtime 核心库
│       └── src/
│           ├── runtime/     # AgentRuntime + EventBus
│           ├── tools/        # 文件操作、grep、系统工具
│           ├── skills/       # SkillLoader + SkillRegistry
│           ├── memory/      # 记忆存储
│           ├── guardrails/  # 安全沙箱
│           └── types.ts     # 共享类型定义
├── skills/               # 内置 Skills
│   ├── coding/
│   ├── log-summary/
│   └── writing/
├── docs/                 # VitePress 文档
│   ├── .vitepress/
│   └── guide/
├── scripts/              # 共享 tsconfig
└── .github/workflows/    # CI/CD
```

## Git Hooks

提交代码前会自动运行：

- **pre-commit**: `pnpm lint-staged && pnpm check`（格式化 + ESLint + TSC）
- **commit-msg**: 验证 commit message 符合 Conventional Commits 格式

跳过 hooks：

```bash
SKIP_SIMPLE_GIT_HOOKS=1 git commit -m "..."
```
