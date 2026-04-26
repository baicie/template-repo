# AI 网文小说创作项目

> 在 Cursor 内直接完成小说创作——纯提示词驱动，多书管理，AI 协作写作，规格驱动开发（SDD）。

## 快速开始

### 1. 创建新书

```
1. 在 books/ 下创建新书目录
2. 填写 books/{书名}/meta.md
3. 填写 books/{书名}/00-context.md
4. 运行 constitution（创作宪法）
5. 运行 outline-concept（构思故事）
6. 开始写第 1 章
```

### 2. 开始写作

```
告诉 Cursor：「构思一个新故事」
Cursor 自动按七步方法论引导你完成规划和创作
```

### 3. 日常写作

```
告诉 Cursor：「写第 1 章」
Cursor 自动读取上下文 → 写作 → 更新 tracking/*.json
```

## 14 个 Skills

| Skill | 说明 |
|-------|------|
| `write-chapter` | 写新章节 |
| `scene-plan` | 场景规划 |
| `outline-concept` | 故事构思 |
| `humanize-text` | 去AI味/润色 |
| `quality-check` | 五维质量检查 |
| `boring-detect` | 流水账检测 |
| `opening-check` | 黄金三章检查 |
| `novel-review` | 全面复核 |
| `novel-export` | 平台格式导出 |
| `worldbuilding` | 构建世界观 |
| `character-design` | 设计角色 |
| `consistency-check` | 一致性检查 |
| `inspiration` | 获取灵感 |
| `switch-book` | 切换书籍 |

## 项目结构

```
novel-ai/
├── books/{书名}/           # 每本书独立目录
│   ├── constitution.md     # 创作宪法
│   ├── meta.md           # 作品信息
│   ├── 00-context.md    # 写作上下文
│   ├── tracking/*.json   # JSON 追踪
│   └── chapters/          # 章节正文
│
├── prompts/               # 30 个提示词模板
├── .agents/skills/        # 14 个 Skills
├── workflows/             # 工作流指南
├── configs/               # 配置文件
└── .cursor/rules/         # Cursor 规则
```

## 文档索引

| 文档 | 说明 |
|------|------|
| `AGENTS.md` | Agent 核心规则 |
| `BOOKS.md` | 书籍索引 |
| `PROMPTS.md` | 提示词导航 |
| `workflows/` | 工作流指南 |
| `.agents/skills/*/SKILL.md` | 各技能详细说明 |
