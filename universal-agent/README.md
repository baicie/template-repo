# Universal Agent

通用型 Agent Runtime，支持多模型、多工具、插件化 Skill 系统。

## 特性

- **多模型支持**：OpenAI、OpenRouter、Ollama、本地模型
- **插件化 Skill 系统**：SKILL.md 格式，动态加载
- **内置工具**：文件读写、搜索、命令执行、HTTP 请求
- **安全沙箱**：路径隔离、危险命令拦截、权限分级
- **事件驱动**：完整的事件系统，支持实时状态展示
- **TypeScript-first**：完整类型支持

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动 CLI（热重载）
pnpm dev

# 或直接运行
pnpm --filter @agent/cli dev
```

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test        # watch mode
pnpm test:run    # run once
pnpm test:coverage
```

### 代码检查

```bash
pnpm lint        # eslint
pnpm lint:fix    # auto fix
pnpm format      # prettier
pnpm format:check
pnpm check       # tsc
```

## 项目结构

```
universal-agent/
├─ apps/
│  └─ cli/           # 命令行入口
├─ packages/
│  └─ core/          # Agent Runtime 核心库
├─ skills/           # 内置 Skills
│  ├─ coding/
│  ├─ log-summary/
│  └─ writing/
├─ docs/             # VitePress 文档
├─ scripts/          # 共享 tsconfig
└─ .github/workflows/
```

## 文档

````bash
pnpm docs:dev      # 开发模式
pnpm docs:build    # 构建静态站点
pnpm docs:preview  # 预览

## CLI 命令

```bash
# 交互式聊天
agent chat

# 单次任务
agent run "帮我分析这个 bug"

# 查看技能列表
agent skill list

# 初始化配置
agent config init
````

## 开发指南

### 添加新工具

在 `packages/core/src/tools/` 中创建工具，使用 `@openai/agents` 的 `tool()` 封装：

```ts
import { tool } from '@openai/agents'
import { z } from 'zod'

export const myTool = tool({
  name: 'my_tool',
  description: '描述工具用途',
  parameters: z.object({ input: z.string() }),
  async execute({ input }, ctx) {
    // 工具实现
    return { result: input }
  },
})
```

### 添加新 Skill

在 `skills/` 中创建目录，添加 `SKILL.md`：

```md
---
name: my-skill
description: 技能描述
triggers:
  - 关键词1
  - 关键词2
permissions:
  - read
tools:
  - read_file
---

# My Skill

你是...（详细的 Skill 指令）
```

## License

MIT
