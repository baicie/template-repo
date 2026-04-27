# Architecture

## 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                     Interface Layer                      │
│         CLI / Web UI / VS Code / Desktop / MCP          │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    Your Differentiation                   │
│  Skill System  │  Tool Ecosystem  │  Guardrails        │
│  Memory        │  Config System    │  EventBus          │
└──────────────────────────┬──────────────────────────────┘
                           │ composes
┌──────────────────────────▼──────────────────────────────┐
│              @openai/agents Runtime                      │
│  Agent Loop  │  Handoffs  │  Sessions  │  Tracing      │
└──────────────────────────┬──────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────┐
│               Model Provider Layer                       │
│  OpenAI  │  OpenRouter  │  Ollama  │  Local Models     │
└─────────────────────────────────────────────────────────┘
```

## 核心模块

### AgentRuntime

任务执行的入口，管理整个生命周期：

1. 选择 Skill
2. 构建上下文
3. 模型思考
4. 工具调用
5. 人工确认（可选）
6. 执行工具
7. 观察结果
8. 继续或结束

### EventBus

事件总线，用于解耦和监控：

```ts
eventBus.on('run.started', ({ sessionId, input }) => {})
eventBus.on('agent.thinking', ({ sessionId }) => {})
eventBus.on('tool.call.started', ({ sessionId, toolName, args }) => {})
eventBus.on('tool.call.finished', ({ sessionId, toolName, result }) => {})
eventBus.on('approval.requested', ({ sessionId, toolName, args }) => {})
eventBus.on('run.finished', ({ sessionId, output }) => {})
eventBus.on('run.failed', ({ sessionId, error }) => {})
```

### SkillRegistry

动态 Skill 加载和匹配：

- 扫描 `skills/` 目录
- 解析 `SKILL.md` 的 frontmatter 元数据
- 根据输入关键词匹配合适的 Skill
- 将 Skill 内容注入 Agent 的 system prompt

### 工具权限

| 权限        | 说明           | 默认行为 |
| ----------- | -------------- | -------- |
| `read`      | 读取文件、搜索 | 自动放行 |
| `write`     | 写入文件       | 需确认   |
| `network`   | HTTP 请求      | 需确认   |
| `shell`     | 执行命令       | 需确认   |
| `dangerous` | 危险操作       | 默认拦截 |

### 安全沙箱

- **路径隔离**: 所有文件操作限制在 workspace 内
- **命令拦截**: `rm -rf`、`git reset --hard` 等危险命令被拦截
- **URL 校验**: 禁止访问内部地址（localhost、127.0.0.1）
