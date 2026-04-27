建议采用：

> **分层架构 + 插件化 Skill/Tool 系统 + 事件驱动 Runtime + 状态机式 Agent Loop**

不要一开始做成“大泥球 Agent”。核心要清楚：**Agent Core 只负责调度，不直接绑定具体业务能力**。

---

# 1. 总体架构

```txt
┌─────────────────────────────────────┐
│             Interface Layer          │
│      CLI / Web UI / VS Code / API    │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│              Agent Runtime           │
│  Planner / Executor / Context / Loop │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│           Capability Layer           │
│     Skills / Tools / MCP / Memory    │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│           Infrastructure Layer       │
│  Model Provider / DB / FS / Network  │
└─────────────────────────────────────┘
```

一句话：

> **上层负责交互，中间负责 Agent 执行，下层负责能力扩展和基础设施。**

---

# 2. 推荐架构类型

我建议你采用类似 **Hexagonal Architecture，也就是端口适配器架构**。

也可以简单理解成：

```txt
核心不依赖外部
外部通过接口接入核心
```

比如：

```txt
Agent Core 不应该直接依赖 OpenAI
Agent Core 不应该直接依赖 SQLite
Agent Core 不应该直接依赖 CLI
Agent Core 不应该直接依赖某个日志系统
```

而是通过接口：

```ts
ModelProvider;
MemoryStore;
ToolRegistry;
SkillRegistry;
EventBus;
ApprovalProvider;
```

这样后面你想换模型、换数据库、加 GUI、加 MCP，都不会动核心逻辑。

---

# 3. 核心模块划分

建议分成 8 个核心模块。

```txt
universal-agent/
├─ interface/        交互入口
├─ runtime/          Agent 运行时
├─ skills/           Skill 系统
├─ tools/            Tool 系统
├─ memory/           记忆系统
├─ models/           模型适配层
├─ guardrails/       权限与安全
└─ infrastructure/   文件、数据库、网络等基础设施
```

---

# 4. Interface Layer：交互层

第一版只做 CLI。

后面可以扩展 Web、桌面端、VS Code 插件。

```txt
interface/
├─ cli/
│  ├─ chat.ts
│  ├─ run.ts
│  ├─ skill.ts
│  └─ config.ts
├─ web/
│  └─ api.ts
└─ vscode/
   └─ extension.ts
```

这一层只负责：

```txt
1. 接收用户输入
2. 展示 Agent 输出
3. 展示工具调用过程
4. 处理用户确认
```

不要在这一层写 Agent 逻辑。

错误示例：

```ts
// 不推荐：CLI 里直接写 Agent 循环
cli.onInput(async input => {
  const response = await openai.chat(...)
  if (response.toolCall) {
    await fs.readFile(...)
  }
});
```

推荐：

```ts
// 推荐：CLI 只调用 Runtime
const result = await agentRuntime.run({
  input,
  workspace,
});
```

---

# 5. Agent Runtime：核心运行时

这是最重要的部分。

```txt
runtime/
├─ agent-runtime.ts
├─ planner.ts
├─ executor.ts
├─ context-builder.ts
├─ message-manager.ts
├─ run-session.ts
├─ event-bus.ts
└─ types.ts
```

它负责：

```txt
1. 创建任务会话
2. 构建上下文
3. 选择 Skill
4. 调用模型
5. 判断是否需要工具
6. 执行工具
7. 观察结果
8. 循环直到完成
```

核心流程：

```txt
input
  ↓
create session
  ↓
load memory
  ↓
select skills
  ↓
build context
  ↓
model generate
  ↓
tool call?
  ├─ yes → check permission → execute tool → append result → continue
  └─ no  → final output
```

---

# 6. Agent Runtime 用状态机设计

不要写成一堆 if else。

可以先用简单状态机。

```ts
type AgentRunState =
  | "created"
  | "context_building"
  | "thinking"
  | "tool_checking"
  | "tool_executing"
  | "observing"
  | "finalizing"
  | "failed";
```

运行流程：

```txt
created
  ↓
context_building
  ↓
thinking
  ↓
tool_checking
  ↓
tool_executing
  ↓
observing
  ↓
thinking
  ↓
finalizing
```

好处是后面 GUI 可以直接展示：

```txt
Agent 正在思考
Agent 准备读取文件
Agent 等待用户确认
Agent 正在执行工具
Agent 已完成
```

---

# 7. Runtime 核心接口

```ts
export interface AgentRuntime {
  run(input: AgentRunInput): Promise<AgentRunResult>;
}

export type AgentRunInput = {
  input: string;
  workspace: string;
  sessionId?: string;
  mode?: "chat" | "task";
};

export type AgentRunResult = {
  sessionId: string;
  finalOutput: string;
  toolCalls: ToolCallRecord[];
  usedSkills: string[];
};
```

实现：

```ts
export class DefaultAgentRuntime implements AgentRuntime {
  constructor(
    private readonly modelProvider: ModelProvider,
    private readonly skillRegistry: SkillRegistry,
    private readonly toolRegistry: ToolRegistry,
    private readonly memoryStore: MemoryStore,
    private readonly guardrails: Guardrails,
    private readonly eventBus: EventBus,
  ) {}

  async run(input: AgentRunInput): Promise<AgentRunResult> {
    const session = await this.createSession(input);

    const skills = await this.skillRegistry.select(input.input);

    const memory = await this.memoryStore.searchRelevant(input.input);

    let messages = await this.buildContext({
      input,
      skills,
      memory,
    });

    for (let step = 0; step < 8; step++) {
      this.eventBus.emit("agent.thinking", { sessionId: session.id });

      const response = await this.modelProvider.generate({
        messages,
        tools: this.toolRegistry.getAvailableTools(skills),
      });

      if (response.type === "final") {
        await this.memoryStore.saveTaskResult({
          sessionId: session.id,
          input: input.input,
          output: response.content,
        });

        return {
          sessionId: session.id,
          finalOutput: response.content,
          toolCalls: session.toolCalls,
          usedSkills: skills.map((s) => s.name),
        };
      }

      if (response.type === "tool_call") {
        const tool = this.toolRegistry.get(response.name);

        await this.guardrails.checkToolCall({
          tool,
          args: response.args,
          workspace: input.workspace,
        });

        const result = await tool.execute(response.args, {
          workspace: input.workspace,
          sessionId: session.id,
        });

        messages.push({
          role: "tool",
          name: response.name,
          content: JSON.stringify(result),
        });

        session.toolCalls.push({
          name: response.name,
          input: response.args,
          output: result,
        });
      }
    }

    throw new Error("Agent reached max steps");
  }
}
```

---

# 8. Skill 系统架构

Skill 是通用 Agent 的扩展核心。

```txt
skills/
├─ registry.ts
├─ loader.ts
├─ selector.ts
├─ parser.ts
└─ types.ts
```

每个 Skill 是一个目录：

```txt
skills/log-summary/
├─ SKILL.md
├─ examples.md
└─ tools.ts
```

`SKILL.md`：

```md
---
name: log-summary
description: 聚合错误日志，精简堆栈，提炼高频问题与触发条件
triggers:
  - 错误日志
  - 高频错误
  - JS 报错
  - RUM
permissions:
  - read_file
  - search_files
  - http_get
tools:
  - read_file
  - search_files
  - http_get
---

# Log Summary Skill

你是一名资深前端监控与稳定性工程师。

## 目标

分析错误日志，提炼高频问题、触发条件和排查建议。

## 步骤

1. 获取原始日志
2. 脱敏
3. 聚合错误
4. 精简堆栈
5. 分析触发条件
6. 输出报告
```

Skill 类型：

```ts
export type Skill = {
  name: string;
  description: string;
  content: string;
  triggers: string[];
  permissions: string[];
  tools: string[];
};
```

Skill 选择器：

```ts
export interface SkillRegistry {
  loadAll(): Promise<Skill[]>;
  select(input: string): Promise<Skill[]>;
}
```

第一版选择 Skill 可以简单用关键词匹配。

后面再升级成 embedding 检索。

---

# 9. Tool 系统架构

Tool 是真正执行能力的地方。

```txt
tools/
├─ registry.ts
├─ executor.ts
├─ types.ts
└─ builtin/
   ├─ read-file.ts
   ├─ write-file.ts
   ├─ search-files.ts
   ├─ list-dir.ts
   ├─ http-get.ts
   ├─ run-command.ts
   └─ memory.ts
```

Tool 接口：

```ts
import { z } from "zod";

export type ToolPermission =
  | "read"
  | "write"
  | "network"
  | "shell"
  | "dangerous";

export type ToolContext = {
  workspace: string;
  sessionId: string;
};

export type AgentTool<TInput = unknown, TOutput = unknown> = {
  name: string;
  description: string;
  permission: ToolPermission;
  requiresApproval?: boolean;
  parameters: z.ZodType<TInput>;
  execute(input: TInput, ctx: ToolContext): Promise<TOutput>;
};
```

Tool Registry：

```ts
export class ToolRegistry {
  private tools = new Map<string, AgentTool>();

  register(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool;
  }

  getAvailableTools(skills: Skill[]) {
    const allowedToolNames = new Set(skills.flatMap((skill) => skill.tools));
    return [...this.tools.values()].filter((tool) =>
      allowedToolNames.has(tool.name),
    );
  }
}
```

关键点：

> **不是所有 Tool 都默认暴露给 Agent，而是根据 Skill 权限动态开放。**

---

# 10. Guardrails 安全架构

这个模块必须单独做，不能散落在工具里。

```txt
guardrails/
├─ permissions.ts
├─ approval.ts
├─ sandbox.ts
├─ redaction.ts
├─ command-policy.ts
└─ network-policy.ts
```

它负责：

```txt
1. 工具权限检查
2. 文件路径沙箱
3. 危险命令拦截
4. 网络请求限制
5. 敏感信息脱敏
6. 人工确认
```

示例：

```ts
export class Guardrails {
  constructor(private readonly approvalProvider: ApprovalProvider) {}

  async checkToolCall(input: {
    tool: AgentTool;
    args: unknown;
    workspace: string;
  }) {
    if (input.tool.requiresApproval) {
      const approved = await this.approvalProvider.confirm({
        title: `Agent wants to call ${input.tool.name}`,
        payload: input.args,
      });

      if (!approved) {
        throw new Error("Tool call rejected by user");
      }
    }

    if (input.tool.permission === "dangerous") {
      throw new Error("Dangerous tool is disabled by default");
    }
  }
}
```

路径沙箱：

```ts
export function assertSafePath(workspace: string, targetPath: string) {
  const resolved = path.resolve(workspace, targetPath);

  if (!resolved.startsWith(path.resolve(workspace))) {
    throw new Error("Path escape is not allowed");
  }

  return resolved;
}
```

---

# 11. Memory 架构

Memory 不要一上来复杂化。

分三类：

```txt
memory/
├─ session-memory.ts
├─ long-term-memory.ts
├─ task-history.ts
└─ db.ts
```

## Session Memory

当前会话上下文。

```txt
当前任务
当前 workspace
工具结果
中间结论
用户追问
```

## Long-term Memory

长期偏好和项目背景。

```txt
用户偏好中文
用户常用 TypeScript
用户项目是 RUM SDK
危险操作需要确认
```

## Task History

历史任务记录。

```txt
任务输入
使用的 Skill
调用的工具
最终输出
执行状态
```

接口：

```ts
export interface MemoryStore {
  searchRelevant(query: string): Promise<MemoryItem[]>;
  saveTaskResult(input: {
    sessionId: string;
    input: string;
    output: string;
  }): Promise<void>;
  addMemory(memory: MemoryItem): Promise<void>;
}
```

第一版用 SQLite。

后面如果要语义检索，再加：

```txt
embedding + vector store
```

---

# 12. Model Provider 架构

不要绑定某一家模型。

```txt
models/
├─ provider.ts
├─ openai-provider.ts
├─ openrouter-provider.ts
├─ ollama-provider.ts
└─ types.ts
```

统一接口：

```ts
export interface ModelProvider {
  name: string;

  generate(input: ModelGenerateInput): Promise<ModelGenerateResult>;
}

export type ModelGenerateInput = {
  messages: AgentMessage[];
  tools?: AgentTool[];
  temperature?: number;
};

export type ModelGenerateResult =
  | {
      type: "final";
      content: string;
    }
  | {
      type: "tool_call";
      name: string;
      args: unknown;
    };
```

这样你后面可以接：

```txt
OpenAI
OpenRouter
Anthropic
Gemini
Ollama
本地模型
```

---

# 13. Event Bus 架构

强烈建议加一个事件系统。

因为后面你一定需要：

```txt
1. CLI 展示执行过程
2. Web UI 实时显示状态
3. 记录日志
4. Debug Agent 行为
5. 做任务历史回放
```

事件类型：

```ts
export type AgentEvent =
  | { type: "run.started"; sessionId: string; input: string }
  | { type: "skill.selected"; sessionId: string; skills: string[] }
  | { type: "agent.thinking"; sessionId: string }
  | {
      type: "tool.call.started";
      sessionId: string;
      toolName: string;
      args: unknown;
    }
  | {
      type: "tool.call.finished";
      sessionId: string;
      toolName: string;
      result: unknown;
    }
  | {
      type: "approval.requested";
      sessionId: string;
      toolName: string;
      args: unknown;
    }
  | { type: "run.finished"; sessionId: string; output: string }
  | { type: "run.failed"; sessionId: string; error: string };
```

EventBus：

```ts
export interface EventBus {
  emit(event: AgentEvent): void;
  on<T extends AgentEvent["type"]>(
    type: T,
    handler: (event: Extract<AgentEvent, { type: T }>) => void,
  ): void;
}
```

CLI 可以监听事件：

```ts
eventBus.on("agent.thinking", () => {
  spinner.text = "Agent 正在思考...";
});

eventBus.on("tool.call.started", (event) => {
  console.log(`调用工具：${event.toolName}`);
});
```

Web UI 后面可以把这些事件通过 SSE 推给前端。

---

# 14. Context Builder 架构

Context Builder 很关键。

它负责把这些东西组织给模型：

```txt
1. 系统 Prompt
2. 用户输入
3. 相关 Skills
4. 相关 Memory
5. 可用 Tools
6. 当前工作区信息
7. 历史消息
```

接口：

```ts
export class ContextBuilder {
  build(input: {
    userInput: string;
    skills: Skill[];
    memories: MemoryItem[];
    workspace: string;
  }): AgentMessage[] {
    return [
      {
        role: "system",
        content: this.buildSystemPrompt(),
      },
      {
        role: "system",
        content: this.buildSkillPrompt(input.skills),
      },
      {
        role: "system",
        content: this.buildMemoryPrompt(input.memories),
      },
      {
        role: "user",
        content: input.userInput,
      },
    ];
  }
}
```

重点：

> **不要把所有 Skill、所有 Memory、所有文件都塞进去。只塞相关的。**

---

# 15. 推荐最终目录

```txt
universal-agent/
├─ src/
│  ├─ interface/
│  │  ├─ cli/
│  │  └─ api/
│  │
│  ├─ runtime/
│  │  ├─ agent-runtime.ts
│  │  ├─ run-session.ts
│  │  ├─ context-builder.ts
│  │  ├─ message-manager.ts
│  │  ├─ event-bus.ts
│  │  └─ types.ts
│  │
│  ├─ skills/
│  │  ├─ loader.ts
│  │  ├─ registry.ts
│  │  ├─ selector.ts
│  │  └─ types.ts
│  │
│  ├─ tools/
│  │  ├─ registry.ts
│  │  ├─ executor.ts
│  │  ├─ types.ts
│  │  └─ builtin/
│  │     ├─ read-file.ts
│  │     ├─ search-files.ts
│  │     ├─ list-dir.ts
│  │     ├─ http-get.ts
│  │     ├─ write-file.ts
│  │     └─ run-command.ts
│  │
│  ├─ memory/
│  │  ├─ memory-store.ts
│  │  ├─ sqlite-memory-store.ts
│  │  └─ types.ts
│  │
│  ├─ models/
│  │  ├─ model-provider.ts
│  │  ├─ openai-provider.ts
│  │  ├─ openrouter-provider.ts
│  │  └─ ollama-provider.ts
│  │
│  ├─ guardrails/
│  │  ├─ guardrails.ts
│  │  ├─ approval-provider.ts
│  │  ├─ sandbox.ts
│  │  ├─ redaction.ts
│  │  └─ command-policy.ts
│  │
│  ├─ config/
│  │  ├─ config-loader.ts
│  │  └─ types.ts
│  │
│  └─ index.ts
│
├─ skills/
│  ├─ coding/
│  │  └─ SKILL.md
│  ├─ log-summary/
│  │  └─ SKILL.md
│  └─ writing/
│     └─ SKILL.md
│
├─ data/
│  └─ agent.sqlite
│
├─ package.json
└─ README.md
```

---

# 16. 推荐依赖关系

核心依赖方向应该是：

```txt
interface  → runtime
runtime    → skills / tools / memory / models / guardrails
skills     → 无核心依赖
tools      → guardrails / infrastructure
models     → 外部模型 SDK
memory     → database
```

不要出现：

```txt
runtime → cli
tools → cli
skills → cli
models → runtime
```

也就是说：

> **CLI 可以依赖 Runtime，但 Runtime 不能依赖 CLI。**

---

# 17. 架构原则总结

你这个 Agent 项目最适合这套架构：

```txt
1. 分层架构
   Interface / Runtime / Capability / Infrastructure

2. 端口适配器架构
   Model、Memory、Tool、Approval 都通过接口接入

3. 插件化架构
   Skill 和 Tool 都可以动态扩展

4. 事件驱动架构
   Agent 执行过程通过 EventBus 对外暴露

5. 状态机式 Runtime
   每次运行都有明确状态，方便调试和 GUI 展示

6. 默认安全架构
   只读优先，写操作确认，危险操作禁止
```

---

# 18. 最终一句话

最终架构建议是：

> **以 TypeScript 实现一个本地优先的 Agent Runtime，采用端口适配器 + 插件化架构；核心 Runtime 只负责 Agent Loop、上下文构建和执行调度，具体能力通过 Skill 和 Tool 注入，模型、记忆、权限、UI 都通过接口适配，执行过程通过 EventBus 暴露，第一版以 CLI 形态落地。**

---

# 19. Monorepo 架构设计

## 19.1 为什么需要 Monorepo

你的 Agent 系统天然会分层：

```txt
Core Runtime
Tool System
Skill System
Memory
CLI
Web UI
VS Code 插件
MCP
```

这些模块之间有共享类型、共享工具、共享配置。如果不用 monorepo，后面会出现：

```txt
1. core 和 cli 类型复制
2. web 和 cli 逻辑重复
3. skills 格式定义到处拷贝
4. tools 注册机制难复用
5. 发布多个 npm 包麻烦
```

但**第一版不要拆太细**，不要一上来就做成：

```txt
packages/agent-runtime
packages/tool-registry
packages/skill-loader
packages/memory
packages/model-provider
packages/guardrails
packages/event-bus
packages/config
packages/cli
packages/web
packages/vscode
```

这会过度设计。

## 19.2 推荐第一版结构

采用**轻量 monorepo：pnpm workspace + TypeScript project references**。

第一版只拆 3 个包：

```txt
universal-agent/
├─ apps/
│  └─ cli/
│     ├─ src/
│     └─ package.json
│
├─ packages/
│  ├─ core/
│  │  ├─ src/
│  │  │  ├─ runtime/
│  │  │  ├─ skills/
│  │  │  ├─ tools/
│  │  │  ├─ memory/
│  │  │  ├─ models/
│  │  │  └─ guardrails/
│  │  └─ package.json
│  │
│  ├─ skills/
│  │  ├─ coding/
│  │  │  └─ SKILL.md
│  │  ├─ log-summary/
│  │  │  └─ SKILL.md
│  │  └─ package.json
│  │
│  └─ shared/
│     ├─ src/
│     └─ package.json
│
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ README.md
```

更简洁一点，第一版可以这样：

```txt
universal-agent/
├─ apps/
│  └─ cli/
├─ packages/
│  ├─ core/
│  └─ skills/
├─ package.json
└─ pnpm-workspace.yaml
```

也就是只拆：

```txt
apps/cli
packages/core
skills/
```

## 19.3 各包职责

### `packages/core`

放 Agent 核心。

```txt
packages/core/
├─ src/
│  ├─ runtime/
│  ├─ tools/
│  ├─ skills/
│  ├─ memory/
│  ├─ models/
│  ├─ guardrails/
│  └─ index.ts
```

负责：Agent Loop、Tool Registry、Skill Loader、Memory Store、Model Provider、Guardrails、EventBus。

### `apps/cli`

放命令行入口。依赖 `@agent/core`。

```txt
apps/cli/
├─ src/
│  ├─ commands/
│  ├─ ui/
│  └─ index.ts
```

### `packages/skills`

放内置 Skills。

```txt
packages/skills/
├─ coding/
│  └─ SKILL.md
├─ log-summary/
│  └─ SKILL.md
└─ writing/
   └─ SKILL.md
```

## 19.4 pnpm workspace 配置

`pnpm-workspace.yaml`：

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

根目录 `package.json`：

```json
{
  "name": "universal-agent",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter @agent/cli dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "packageManager": "pnpm@10.0.0"
}
```

## 19.5 包命名建议

```txt
@agent/core
@agent/cli
@agent/skills
@agent/shared
```

## 19.6 演进路线

### Phase 1

```txt
apps/cli
packages/core
skills/
```

### Phase 2

```txt
apps/web
packages/shared
packages/mcp
```

### Phase 3

```txt
apps/vscode
apps/desktop
packages/toolkit
packages/plugin-sdk
```

### Phase 4

```txt
packages/skill-market
packages/rag
packages/browser
packages/devtools
```

## 19.7 什么时候不需要 monorepo

如果你的目标只是：

```txt
一个 CLI
一个 Agent
几个内置工具
自己本地用
```

那完全可以先单仓单包。但你的方向是"通用型 Agent Runtime"，后面大概率会做 Web UI、VS Code 插件、MCP、Desktop、Skill 包、Tool 包。所以可以从一开始就用轻量 monorepo。

---

# 20. 复杂状态流与 `@openai/agents` 能力分析

## 20.1 什么是复杂状态流

普通 Agent 是"问一句答一句"：

```txt
用户输入 → 模型回答
```

复杂状态流 Agent 会进入多个可追踪状态，反复循环、暂停、恢复、等待确认、调用工具、切换 Agent：

```txt
用户输入
  ↓
选择 Skill
  ↓
构建上下文
  ↓
思考
  ↓
调用工具
  ↓
等待用户确认
  ↓
执行工具
  ↓
观察结果
  ↓
继续思考
  ↓
可能切换给另一个 Agent
  ↓
保存记忆
  ↓
输出最终结果
```

以"分析项目并修复一个 bug"为例，流程可能是：

```txt
1. scan_project
2. read_file
3. analyze_error
4. search_related_files
5. propose_patch
6. wait_for_approval
7. write_file
8. run_test
9. test_failed
10. read_error
11. fix_again
12. run_test
13. final_report
```

这里面有：

```txt
分支：测试失败怎么办？
循环：失败后继续修
暂停：等用户确认再写文件
恢复：用户确认后继续执行
状态记录：当前执行到哪一步
错误处理：工具调用失败怎么办？
```

这就是复杂状态流。

### 简单 Agent Loop vs 复杂状态流

| 维度 | 简单 Agent Loop | 复杂状态流 |
| --- | --- | --- |
| 模型调用 | 一次或有限次 | 多轮循环，分支重试 |
| 工具调用 | 线性执行 | 有条件分支、失败重试 |
| 状态 | 无 | 多阶段、暂停/恢复 |
| 审批 | 无 | 需要人工确认 |
| 错误处理 | 基本 | 深层恢复机制 |
| 适用场景 | 问答、简单任务 | 多步骤任务、bug 修复 |

> `@openai/agents` 解决的是"Agent 怎么和模型、工具、多 Agent 协作"；
> 复杂状态流解决的是"你的应用在整个任务生命周期里怎么组织状态"。

## 20.2 `@openai/agents` 提供了什么能力

官方定位是一个 TypeScript/JavaScript 的轻量 Agent SDK，核心抽象少：Agents、Tools、Handoffs、Guardrails。

### 1. Agent 定义

```ts
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant",
});

const result = await run(agent, "Write a haiku about recursion.");
console.log(result.finalOutput);
```

### 2. 内置 Agent Loop

这是最重要的能力。你不用手写：

```txt
模型返回 tool_call
  ↓
解析 tool_call
  ↓
执行工具
  ↓
把结果塞回 messages
  ↓
继续请求模型
```

SDK 内置这个循环，自动处理"调用工具 → 返回结果给模型 → 继续执行直到完成"。

### 3. Function Tools

用 Zod 做参数校验，把 TS 函数变成 Agent 可调用的工具：

```ts
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const readFile = tool({
  name: "read_file",
  description: "读取项目中的文件",
  parameters: z.object({
    path: z.string(),
  }),
  async execute({ path }) {
    return `文件 ${path} 的内容`;
  },
});

const agent = new Agent({
  name: "Coding Agent",
  instructions: "你是一个代码分析 Agent。",
  tools: [readFile],
});
```

### 4. Handoffs / 多 Agent 协作

让一个 Agent 把任务交给另一个专业 Agent：

```txt
TriageAgent
  ├─ CodingAgent
  ├─ LogAgent
  └─ WritingAgent
```

适合这样设计：

```txt
RouterAgent：判断任务类型
CodingAgent：代码分析/修改
LogAgent：日志分析
ResearchAgent：资料整理
WritingAgent：写文档
```

### 5. Guardrails

做输入/输出校验和安全检查。在 agent 执行过程中并行运行验证，不通过时 fail fast。

但注意：SDK 的 Guardrails 是基础能力，文件权限、命令白名单、路径沙箱、危险操作确认，仍然要自己设计。

```txt
以下不应该完全交给模型判断：
rm -rf
git reset --hard
读取 ~/.ssh
读取浏览器 cookie
npm publish
curl -X DELETE
```

### 6. Sessions / 记忆

Sessions 用于在 Agent loop 中维护工作上下文。

```txt
没有 Session：每次 run 都是新上下文
有 Session：可以保留历史消息、工具结果、当前任务状态
```

但更强的记忆能力（长期用户偏好、项目知识库、向量记忆、Skill 使用记录）通常需要自己用 SQLite / Postgres / Vector DB 做。

### 7. Human in the Loop

支持人在 Agent 执行过程中介入。

```txt
Agent：我准备修改 src/index.ts，是否确认？
用户：确认
Agent：继续写文件
```

### 8. Tracing / 调试

内置 tracing，方便查看：

```txt
调用了哪个模型
调用了哪个工具
工具参数是什么
结果是什么
是否发生 handoff
guardrails 是否触发
```

### 9. MCP Tool Calling

内置 MCP server 工具集成，和 function tools 使用方式一致。可以接 filesystem MCP、git MCP、browser MCP、database MCP 等。

### 10. 它不提供什么

`@openai/agents` 是 Agent 执行引擎，不是完整产品框架。你仍然需要自己做：

```txt
1. CLI / GUI
2. Skill 系统
3. Tool 权限系统
4. 文件路径沙箱
5. SQLite 长期记忆
6. 任务历史
7. 配置系统
8. 插件市场
9. Web UI 执行过程展示
10. 复杂业务状态机
```

## 20.3 推荐的分工

### 第一版分工

```txt
@openai/agents 负责：
- Agent 定义
- 模型调用
- 工具调用循环
- handoffs
- sessions
- tracing
- guardrails 基础能力

你自己负责：
- CLI
- Skill Loader
- Tool Registry 外层权限
- 文件/命令沙箱
- SQLite Memory
- EventBus
- 任务状态管理
```

### 推荐的依赖组合

第一版：

```txt
@openai/agents
+ zod
+ commander
+ gray-matter
+ better-sqlite3
```

如果后面发现任务变成这样，再考虑加：

```txt
需要暂停/恢复
需要多阶段审批
需要失败重试
需要长任务队列
需要 UI 展示每个状态
需要固定流程编排
```

再考虑：

```txt
LangGraph.js
```

或者自己写一个轻量状态机。

## 20.4 结论

复杂状态流指的是 Agent 任务有明确生命周期、分支、循环、暂停、恢复、审批和错误处理。

`@openai/agents` 提供：

```txt
Agent 定义
Agent Loop
工具调用
Zod 参数校验
多 Agent handoff
Guardrails
Sessions
Human-in-the-loop
Tracing
MCP 工具接入
Realtime Agents
```

你的通用 Agent 产品还需要自己补：

```txt
Skill 系统
权限系统
沙箱
CLI / GUI
长期记忆
任务状态机
插件管理
```

**一句话：用 `@openai/agents` 作为 Agent Runtime 的底座，在它之上构建自己的 Skill 系统、Tool 生态和 Interface 层——既享受成熟稳定的 Agent Loop，又保持对自己系统的完全掌控。**

---

# 21. 总结：架构全景图

基于以上所有章节，你的通用型 Agent 的完整架构建议如下：

```txt
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

## Monorepo 第一版结构

```txt
universal-agent/
├─ apps/
│  └─ cli/
├─ packages/
│  ├─ core/        （Agent Runtime、Tools、Skills、Memory、Guardrails）
│  └─ skills/      （内置 Skills）
├─ package.json
└─ pnpm-workspace.yaml
```

## 核心原则

```txt
1. 分层架构：Interface / Runtime / Capability / Infrastructure
2. 端口适配器：Model、Memory、Tool、Approval 都通过接口接入
3. 插件化：Skill 和 Tool 都可以动态扩展
4. 事件驱动：Agent 执行过程通过 EventBus 对外暴露
5. 默认安全：只读优先，写操作确认，危险操作禁止
6. 轻量起步：第一版只拆 apps/cli + packages/core，不要过度设计
7. 站在巨人肩上：用 @openai/agents 作为 Runtime 底座
```

## 一句话

> **以 TypeScript + `@openai/agents` 为底座，实现一个本地优先的通用型 Agent Runtime；采用端口适配器 + 插件化架构；核心 Runtime 只负责调度，具体能力通过 Skill 和 Tool 注入；monorepo 第一版只拆 3 个包，轻量起步，服务于未来扩展。**
