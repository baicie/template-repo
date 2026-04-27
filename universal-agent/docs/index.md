---
layout: home

hero:
  name: 'Universal Agent'
  text: '通用型 Agent Runtime'
  tagline: 基于 TypeScript + @openai/agents 构建的本地优先 AI Agent 框架
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/example/universal-agent

features:
  - title: 多模型支持
    details: OpenAI、OpenRouter、Ollama、本地模型，通过 ModelProvider 接口无缝接入
  - title: 插件化 Skill 系统
    details: SKILL.md 格式，动态加载，按需注入，Skill 数量不受限制
  - title: 内置安全沙箱
    details: 路径隔离、危险命令拦截、权限分级，默认只读，写操作需确认
  - title: 事件驱动架构
    details: 完整的事件总线，支持实时状态展示，方便调试和监控
  - title: 复杂状态流
    details: 分支、循环、暂停/恢复、人工确认、错误处理全支持
  - title: TypeScript-first
    details: 完整类型支持，零运行时依赖，Rolldown 打包输出 ES + CJS
---
