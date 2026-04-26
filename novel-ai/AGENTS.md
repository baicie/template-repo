---
name: ai-novel-writing
description: AI 网文小说创作助手。用于在 Cursor 内配合提示词模板库管理多本小说的创作、润色和修订。激活于任何涉及小说写作、提示词、网文创作的任务。
---

# AI Novel Writing — 项目规则

> 本项目是一个纯提示词驱动的小说创作系统，在 Cursor 内直接完成多本小说的创作。

## 1. 项目结构

```
novel-ai/
├── books/                         # 所有小说（每本一个独立目录）
│   ├── {书名}/
│   │   ├── meta.md              # 作品元信息
│   │   ├── 00-context.md        # 当前写作上下文（最重要）
│   │   ├── 00-outline.md        # 总大纲
│   │   ├── 00-characters.md     # 角色档案
│   │   ├── 00-world.md          # 世界观设定
│   │   ├── 00-glossary.md       # 术语表
│   │   ├── chapters/            # 章节正文
│   │   └── drafts/              # 废弃草稿
│   └── _shared/                 # 多本书共享资源
│
├── prompts/                       # 提示词模板库
│   ├── worldbuilding/           # 世界观构建
│   ├── character/               # 角色塑造
│   ├── outline/                 # 大纲规划
│   ├── writing/                 # 正文章节写作
│   ├── review/                  # 审核修订
│   ├── inspiration/             # 灵感发散
│   └── templates/               # 通用模板
│
├── .agents/skills/                  # Agent Skills
│   ├── write-chapter/
│   ├── polish-prose/
│   ├── worldbuilding/
│   ├── character-design/
│   ├── consistency-check/
│   ├── inspiration/
│   └── switch-book/
│
├── .cursor/rules/                   # Cursor Agent 规则
│   ├── novel-writing.md        # 写作核心规则
│   ├── ai-persona.md           # AI 写作身份
│   └── current-book.md         # 当前书籍上下文
│
├── configs/
│   ├── active-book.md          # 当前激活的书
│   └── writing-rules.md        # 个人写作规范
│
├── workflows/                   # 工作流指南
│   ├── 01-from-idea-to-book.md
│   ├── 02-chapter-writing-flow.md
│   └── 03-revision-flow.md
│
├── BOOKS.md                    # 书籍索引
└── PROMPTS.md                 # 提示词索引
```

## 2. 多书管理

### 当前书籍激活机制

```
configs/active-book.md → 记录激活书名
.cursor/rules/current-book.md → AI 读取此文件感知当前书籍上下文
```

切换书籍时：
1. 修改 `configs/active-book.md`
2. 更新 `.cursor/rules/current-book.md` 中的书名和路径
3. 确认切换成功

### 书籍索引 `BOOKS.md`

记录所有书籍的基本信息：书名、类型、字数、进度、状态。

## 3. 写作前必读文件

任何写作任务前，必须按以下顺序读取：

1. `configs/active-book.md` — 确认当前书名
2. `books/{书名}/meta.md` — 作品定位和文风
3. `books/{书名}/00-context.md` — 当前写作状态（**最重要**）
4. `books/{书名}/00-characters.md` — 角色档案
5. `books/{书名}/00-world.md` — 世界观设定
6. `books/{书名}/00-outline.md` — 大纲
7. 相关章节文件 — 确保承上启下

## 4. 核心文件：00-context.md

每本书的 `00-context.md` 是写作的核心上下文，必须包含：

```markdown
# {书名} — 当前写作上下文

## 基础信息
- 书名、类型、核心卖点、文风

## 当前写作进度
- 总字数、当前章节、当前卷、更新频率

## 本卷概要
- 主线、当前局势、核心冲突

## 角色状态（当前活跃）
- 主角：境界、身份、关键物品、当前目标、近期情感
- 女主/重要配角：同上结构

## 世界观要点（本章涉及）

## 章节上下文
- 承接上文结尾内容
- 本章任务：情节目标、核心爽点、出场人物、字数目标、章节类型、结尾钩子

## 伏笔追踪
| 伏笔 | 埋下章节 | 状态 |
```

## 5. 写作原则

### 核心原则

1. **一致性优先**：严格遵循已有设定，发现矛盾立即指出，不盲目续写
2. **爽点节奏**：每章至少 1-2 个小高潮，章末留悬念
3. **作者意志优先**：AI 输出是素材建议，最终决定权在作者
4. **待决策标注**：需要作者决策的内容用【】标注
5. **上下文感知**：每次续写必须读取前文结尾 500 字

### 文风规范

- 玄幻类：动作描写简洁有力，善用对比凸显实力差距
- 情感类：内心描写细腻，对话自然生活化
- 战斗描写：过程精炼，高潮处适度放大
- **禁用词**：突然、瞬间、只见、但见、不由得、情不自禁、嘴角勾起、眸光一闪

### 章节规范

- 直接输出小说正文，不输出提示语
- 章节开头承上启下，结尾留悬念或情绪高点
- 玄幻/都市单章 3000-5000 字
- 禁止在章节中写"作者有话说"等打破沉浸感的内容

### 上下文更新

章节完成后，如果内容涉及角色状态变化、情节推进，必须更新 `00-context.md` 中的相关字段。

## 6. 提示词使用规范

### 分层注入架构

```
┌──────────────────────────────────┐
│  AI 身份层（ai-persona.md）       │
├──────────────────────────────────┤
│  项目上下文层（00-context.md）    │
├──────────────────────────────────┤
│  本次任务层（prompts/）          │
└──────────────────────────────────┘
```

### 模板变量

| 变量 | 说明 |
|------|------|
| `{{book_title}}` | 书名 |
| `{{genre}}` | 小说类型 |
| `{{current_chapter}}` | 当前章节号 |
| `{{word_count_target}}` | 目标字数 |
| `{{outline_node}}` | 本章大纲节点 |
| `{{world_rules}}` | 世界规则（引用 world.md） |
| `{{characters}}` | 角色设定（引用 characters.md） |
| `{{previous_content}}` | 前文结尾 500 字 |
| `{{scene_type}}` | 场景类型 |
| `{{pacing}}` | 节奏要求 |

## 7. Skills 使用

本项目提供以下 Skills：

| Skill | 触发场景 | 使用方式 |
|-------|---------|---------|
| `write-chapter` | 写新章节 | 「用 write-chapter 帮我写第 X 章」 |
| `polish-prose` | 润色文笔 | 「用 polish-prose 润色这段」 |
| `worldbuilding` | 构建世界观 | 「帮我用 worldbuilding 设计力量体系」 |
| `character-design` | 设计角色 | 「帮我用 character-design 设计主角」 |
| `consistency-check` | 一致性检查 | 「用 consistency-check 检查第 X 章」 |
| `inspiration` | 获取灵感 | 「卡文了，用 inspiration 给我几个方向」 |
| `switch-book` | 切换书籍 | 「切换到 {书名}」 |

## 8. 常用命令

```
写章节：        「写第 237 章，承接上文，主角刚突破」
润色：          「润色这段对话」
一致性检查：    「检查第 37 章和前面的设定是否矛盾」
世界构建：      「帮我设计一套修仙力量体系」
角色设计：      「帮我设计一个亦正亦邪的配角」
切书：          「切换到星际迷途」
获取灵感：      「给我一个 boss 战的灵感」
生成大纲：      「帮我生成第 107 卷的大纲」
命名：          「帮我给这个势力起个霸气的名字」
```

## 9. 输出格式规范

- 章节正文直接输出纯文本
- 用 Markdown 标题标记章节（如 `## 第 237 章`）
- 非正文输出（分析、建议、问题）使用 Markdown 格式
- 需要决策的内容用【作者决定】或【待定】标注
