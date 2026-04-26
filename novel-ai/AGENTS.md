---
name: ai-novel-writing
description: AI 网文小说创作助手。用于在 Cursor 内配合提示词模板库管理多本小说的创作、润色和修订。激活于任何涉及小说写作、提示词、网文创作的任务。
---

# AI Novel Writing — 项目规则

> 本项目是一个纯提示词驱动的小说创作系统，在 Cursor 内直接完成多本小说的创作，基于规格驱动开发（SDD）理念，融合雪花写作法与 novel-writer 七步方法论。

## 1. 项目结构

```
novel-ai/
├── books/                           # 所有小说（每本一个独立目录）
│   └── {书名}/
│       ├── constitution.md          # 创作宪法（最高原则）
│       ├── meta.md                # 作品元信息
│       ├── 00-context.md         # 当前写作上下文
│       ├── 00-outline.md          # 总大纲
│       ├── 00-characters.md       # 角色档案
│       ├── 00-world.md           # 世界观设定
│       ├── 00-glossary.md        # 术语表
│       ├── tracking/             # JSON 追踪数据
│       │   ├── plot-tracker.json   # 情节追踪
│       │   ├── character-state.json # 角色状态
│       │   ├── relationships.json  # 关系网络
│       │   ├── timeline.json       # 时间线
│       │   ├── hooks.json          # 钩子追踪
│       │   └── debts.json          # 债务追踪
│       ├── chapters/             # 章节正文
│       └── drafts/               # 废弃草稿
│
├── prompts/                        # 提示词模板库
│   ├── workflow/                # 七步方法论
│   ├── worldbuilding/           # 世界观构建
│   ├── character/              # 角色塑造
│   ├── outline/               # 大纲规划
│   ├── writing/               # 正文章节写作
│   ├── review/               # 审核修订
│   ├── inspiration/          # 灵感发散
│   └── templates/             # 通用模板
│
├── .agents/skills/             # Agent Skills（14个）
│   ├── write-chapter/        # 章节写作
│   ├── scene-plan/          # 场景规划
│   ├── outline-concept/      # 故事构思
│   ├── humanize-text/       # 人语化处理
│   ├── quality-check/        # 五维质量检查
│   ├── boring-detect/       # 流水账检测
│   ├── opening-check/       # 黄金三章检查
│   ├── novel-review/        # 全面复核（六维审查）
│   ├── novel-export/        # 平台格式导出
│   ├── worldbuilding/       # 世界观构建
│   ├── character-design/    # 角色设计
│   ├── consistency-check/   # 一致性检查
│   ├── inspiration/        # 灵感发散
│   └── switch-book/        # 书籍切换
│
├── .cursor/rules/             # Cursor Agent 规则
│   ├── novel-writing.md     # 写作核心规则+查询协议+优先级
│   ├── ai-persona.md       # AI 写作身份
│   └── current-book.md     # 当前书籍上下文
│
├── workflows/                # 工作流指南
│   ├── 01-from-idea-to-book.md
│   ├── 02-chapter-writing-flow.md
│   ├── 03-revision-flow.md
│   └── 04-operations.md     # 日常运维
│
└── configs/                  # 配置文件
    ├── active-book.md       # 当前激活的书
    └── writing-rules.md    # 个人写作规范
```

## 2. 防幻觉三定律（最高原则）

所有写作任务必须遵守以下三定律：

| 定律 | 说明 | 执行 |
|------|------|------|
| **大纲即法律** | 遵循大纲，不擅自发挥 | 先读本章大纲节点，偏离必须标注 |
| **设定即物理** | 遵守设定，不自相矛盾 | 禁止战力崩坏、角色OOC |
| **发明需识别** | 新实体必须入库 | 新角色/关系/事件必须更新 tracking/*.json |

## 3. Strand Weave 节奏系统

每章应包含三条线：

| 线 | 占比 | 红线 |
|---|------|------|
| Quest（主线） | 60% | 连续不超过 5 章 |
| Fire（感情线） | 20% | 断档不超过 10 章 |
| Constellation（世界观） | 20% | 断档不超过 15 章 |

## 4. 追读力系统

核心公式：`追读力 = 钩子强度 - 冷却程度 + 债务压力`

- **Hook（钩子）**：每章必须有强钩子
- **Cool-point（冷却）**：避免流水账、节奏拖沓
- **Debt（债务）**：伏笔必须回收，债务红线：微型≤5、小型≤3、大型≤2

## 5. 多书管理

```
configs/active-book.md → 记录激活书名
.cursor/rules/current-book.md → AI 读取此文件感知当前书籍上下文
```

## 6. 写作前必读（查询协议）

```
1. constitution.md               → 创作宪法
2. configs/active-book.md       → 确认当前书名
3. 00-context.md               → 当前写作状态
4. 00-characters.md            → 角色档案
5. 00-world.md                 → 世界观设定
6. 00-outline.md               → 大纲
7. tracking/plot-tracker.json  → 情节追踪
8. tracking/character-state.json → 角色状态
9. tracking/relationships.json  → 关系网络
10. tracking/timeline.json     → 时间线
11. tracking/hooks.json        → 钩子追踪
12. tracking/debts.json       → 债务追踪
13. 章节文件                  → 承上启下
14. prompts/templates/preflight-check.md → 预检清单
```

## 7. 优先级规则

| 优先级 | 来源 |
|--------|------|
| P0 | 用户即时指令 |
| P1 | `constitution.md` |
| P2 | 防幻觉三定律 |
| P3 | 书籍规格文件 |
| P4 | tracking/*.json |
| P5 | prompts/presets/ |

## 8. Skills 使用（14个）

### 核心创作

| Skill | 触发场景 |
|-------|---------|
| `write-chapter` | 写新章节 |
| `scene-plan` | 场景规划 |
| `outline-concept` | 故事构思 |

### 润色与质量

| Skill | 触发场景 |
|-------|---------|
| `humanize-text` | 去AI味/润色 |
| `quality-check` | 五维质量检查 |
| `boring-detect` | 流水账检测 |
| `opening-check` | 黄金三章检查 |

### 复核与导出

| Skill | 触发场景 |
|-------|---------|
| `novel-review` | 全面复核（六维审查） |
| `novel-export` | 平台格式导出 |

### 设计与构建

| Skill | 触发场景 |
|-------|---------|
| `worldbuilding` | 构建世界观 |
| `character-design` | 设计角色 |
| `consistency-check` | 一致性检查 |
| `inspiration` | 获取灵感 |
| `switch-book` | 切换书籍 |

## 9. 写作原则

### 核心原则

1. **防幻觉三定律**：大纲即法律、设定即物理、发明需识别
2. **一致性优先**：发现矛盾立即指出
3. **爽点节奏**：每章至少 1-2 个小高潮，章末留钩子
4. **Strand 平衡**：Quest/Fire/Constellation 交织
5. **债务管理**：伏笔必回收，债务不逾期

### 禁用词

突然、瞬间、只见、但见、不由得、情不自禁、嘴角勾起、眸光一闪

### 上下文更新

章节完成后，必须更新所有 tracking/*.json 和 00-context.md。

## 10. 完整工作流

```
构思期  → outline-concept + constitution + specify
规划期  → worldbuilding + character-design + outline
创作期  → preflight → write-chapter → boring-detect → humanize-text
复核期  → novel-review (六维) → quality-check
运维期  → 04-operations.md
导出期  → novel-export
```

## 11. 常用命令

```
写章节：        「写第 237 章」
构思：          「构思一个新故事」
场景规划：      「规划第 5-10 章」
润色：          「润色这段，去AI味」
质量检查：      「检查质量评分」
流水账检测：    「检测流水账」
开篇检查：      「检查前三章」
复核：          「复核第 1-30 章」
一致性检查：    「检查设定矛盾」
世界构建：      「设计力量体系」
切书：          「切换到星际迷途」
灵感：          「给我几个方向」
导出：          「导出番茄格式」
```

## 12. 输出格式

- 章节正文直接输出纯文本
- 用 Markdown 标题标记章节
- 非正文输出使用 Markdown
- 决策内容用【】标注
