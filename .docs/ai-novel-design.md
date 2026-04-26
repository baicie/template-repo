# AI 网文小说创作项目

## 项目定位

一个**在 Cursor 内直接完成小说创作的本地项目**。不依赖服务端、不打包应用，用 Markdown 文件管理多本小说的设定、正文和工作流，Cursor Agent 作为全程协作助手参与写作。

**核心理念**：Cursor Agent 通过项目规则（AgentMD）和 Skills，永远知道当前在写哪本书、什么章节、角色状态如何，实现无缝的 AI 协作写作。

---

## 项目结构

```
novel-ai/
├── AGENTS.md                        # Agent 核心规则（AgentMD 格式）
├── README.md                        # 项目说明
├── BOOKS.md                         # 书籍索引（多本管理）
├── PROMPTS.md                       # 提示词索引导航
│
├── books/                           # 所有小说（每本一个独立目录）
│   ├── 逆天改命/                    # 示例书籍
│   │   ├── meta.md                # 作品元信息
│   │   ├── 00-context.md         # 当前写作上下文（最重要！）
│   │   ├── 00-outline.md         # 总大纲
│   │   ├── 00-characters.md      # 角色档案
│   │   ├── 00-world.md           # 世界观设定
│   │   ├── 00-glossary.md        # 术语表
│   │   ├── chapters/              # 章节正文
│   │   │   ├── v01-ch01.md
│   │   │   └── ...
│   │   └── drafts/               # 废弃草稿
│   ├── 星际迷途/                   # 第二本书
│   └── _shared/                  # 多本书共享资源
│
├── prompts/                         # 提示词模板库（按阶段分类）
│   ├── worldbuilding/             # 世界观构建（6个模板）
│   │   ├── 01-genre-analysis.md
│   │   ├── 02-world-rules.md
│   │   ├── 03-power-system.md
│   │   ├── 04-geography.md
│   │   ├── 05-factions.md
│   │   └── 06-glossary.md
│   ├── character/                 # 角色塑造（5个模板）
│   │   ├── 01-protagonist.md
│   │   ├── 02-antagonist.md
│   │   ├── 03-supporting.md
│   │   ├── 04-character-web.md
│   │   └── 05-speaking-style.md
│   ├── outline/                   # 大纲规划（5个模板）
│   │   ├── 01-story-arc.md
│   │   ├── 02-arc-breakdown.md
│   │   ├── 03-plot-twist.md
│   │   ├── 04-subplot.md
│   │   └── 05-chapter-outline.md
│   ├── writing/                   # 正文章节写作（6个模板）
│   │   ├── 01-chapter-draft.md
│   │   ├── 02-dialogue-polish.md
│   │   ├── 03-action-scene.md
│   │   ├── 04-emotion-scene.md
│   │   ├── 05-description-scene.md
│   │   └── 06-prose-polish.md
│   ├── review/                    # 审核修订（4个模板）
│   │   ├── 01-consistency-check.md
│   │   ├── 02-pacing-review.md
│   │   ├── 03-character-consistency.md
│   │   └── 04-grammar-check.md
│   ├── inspiration/               # 灵感发散（4个模板）
│   │   ├── 01-scenario-gen.md
│   │   ├── 02-conflict-gen.md
│   │   ├── 03-name-gen.md
│   │   └── 04-title-gen.md
│   └── templates/                 # 通用模板（3个）
│       ├── system-prompt.md
│       ├── context-window.md
│       └── output-format.md
│
├── .agents/skills/                  # Agent Skills（7个核心技能）
│   ├── write-chapter/            # 章节写作
│   ├── polish-prose/             # 文笔润色
│   ├── worldbuilding/            # 世界观构建
│   ├── character-design/          # 角色塑造
│   ├── consistency-check/         # 一致性检查
│   ├── inspiration/               # 灵感发散
│   └── switch-book/              # 书籍切换
│
├── .cursor/
│   └── rules/                     # Cursor Agent 规则（3个）
│       ├── novel-writing.md       # 写作核心规则
│       ├── ai-persona.md         # AI 写作身份
│       └── current-book.md       # 当前书籍上下文
│
├── workflows/                     # 工作流指南（3个）
│   ├── 01-from-idea-to-book.md   # 从灵感到成书
│   ├── 02-chapter-writing-flow.md # 单章写作流程
│   └── 03-revision-flow.md      # 修订润色流程
│
└── configs/                       # 配置文件
    ├── active-book.md            # 当前激活的书籍
    └── writing-rules.md          # 个人写作规范
```

---

## 核心文件说明

### AGENTS.md — Agent 核心规则

AgentMD 格式的项目级规则，定义：
- 项目结构
- 多书管理机制
- 写作前必读文件顺序
- 写作原则
- Skills 使用规范

### .cursor/rules/ — Cursor Agent 规则

**novel-writing.md**：写作核心规则，AI 每次写作时必须遵循的流程和原则。

**ai-persona.md**：AI 写作身份设定，定义 AI 的能力范围、协作原则和输出规范。

**current-book.md**：当前书籍上下文，AI 通过此文件感知当前激活的是哪本书。

### books/{书名}/00-context.md — 写作上下文

每本书最重要的文件，让 AI 在任何时候都知道当前小说状态：

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

### .agents/skills/ — 核心写作技能

| Skill | 触发场景 |
|-------|---------|
| `write-chapter` | 写新章节、续写章节 |
| `polish-prose` | 润色对话、动作、心理、整体文笔 |
| `worldbuilding` | 构建世界观、力量体系、势力派系 |
| `character-design` | 设计主角、反派、配角、关系网 |
| `consistency-check` | 检查章节与设定的矛盾 |
| `inspiration` | 获取场景灵感、冲突设计、命名 |
| `switch-book` | 切换当前激活的书籍 |

---

## 多书管理

### 核心机制：当前书籍切换

```
configs/active-book.md        → 记录激活书名
.cursor/rules/current-book.md → AI 读取这个文件知道上下文
```

切换书籍时：
1. 修改 `configs/active-book.md`
2. 更新 `.cursor/rules/current-book.md`
3. 确认切换成功

### BOOKS.md — 全量书籍索引

```markdown
| 书名 | 类型 | 字数 | 进度 | 状态 |
|------|------|------|------|------|
| 逆天改命 | 玄幻·穿越 | 87 万 | 第 237 章 | 连载中 |
| 星际迷途 | 科幻·星际 | 23 万 | 第 68 章 | 连载中 |
```

---

## 写作前必读顺序

任何写作任务前，必须按顺序读取：

```
1. configs/active-book.md        → 确认当前书名
2. books/{书名}/meta.md         → 作品定位和文风
3. books/{书名}/00-context.md   → 当前写作状态（最重要！）
4. books/{书名}/00-characters.md → 角色档案
5. books/{书名}/00-world.md     → 世界观设定
6. books/{书名}/00-outline.md   → 大纲
7. 相关章节文件                  → 承上启下
```

---

## 工作流

### 日常写作流程

```
1. 确认当前书籍（Cursor Agent 自动读取）
2. 更新 00-context.md 的本章信息
3. 开始写作：「写第 237 章」
4. AI 读取上下文 → 生成草稿
5. 审阅修改
6. 定稿存入 chapters/
7. 更新 00-context.md（角色状态、情节推进、伏笔回收）
```

### 从灵感到成书

```
构思期（1-3天）
  → 确定类型和核心卖点
  → 在 books/ 下创建新书目录

世界观构建（3-7天）
  → prompts/worldbuilding/ 顺序构建
  → 力量体系是核心

角色塑造（2-5天）
  → prompts/character/ 顺序构建
  → 主角 → 反派 → 配角 → 关系网

大纲规划（3-7天）
  → prompts/outline/ 顺序构建
  → 主线 → 章节分配 → 高潮 → 支线

正文写作（持续）
  → .agents/skills/write-chapter/
  → 每章写完后更新 00-context.md

修订润色（完成初稿后）
  → .agents/skills/consistency-check/
  → .agents/skills/polish-prose/
```

---

## 使用方法

### 第一次使用

```
1. 克隆/创建 novel-ai 项目
2. 修改 configs/active-book.md，填入第一本书的书名
3. 在 books/ 下创建第一本书的目录
4. 开始填写 meta.md 和 00-context.md
5. 打开 Cursor，直接说「开始写书」
```

### 日常使用

```
写章节：        「写第 237 章」
润色：          「润色这段」
一致性检查：    「检查第 37 章和前面的设定是否矛盾」
世界构建：      「帮我设计一套修仙力量体系」
角色设计：      「帮我设计一个亦正亦邪的配角」
切书：          「切换到星际迷途」
获取灵感：      「卡文了，给我几个方向」
命名：          「帮我给这个势力起个霸气的名字」
```

---

## 提示词模板设计

### 分层注入架构

```
┌──────────────────────────────────┐
│  AI 身份层（ai-persona.md）       │  ← .cursor/rules/ai-persona.md
├──────────────────────────────────┤
│  项目上下文层（00-context.md）    │  ← 每次写作前读取
├──────────────────────────────────┤
│  本次任务层（prompts/）          │  ← 从 prompts/ 目录选取模板
└──────────────────────────────────┘
```

### 模板变量表

| 变量 | 说明 |
|------|------|
| `{{book_title}}` | 书名 |
| `{{genre}}` | 小说类型 |
| `{{current_chapter}}` | 当前章节号 |
| `{{word_count_target}}` | 目标字数 |
| `{{outline_node}}` | 本章大纲节点 |
| `{{world_rules}}` | 世界规则 |
| `{{characters}}` | 角色设定 |
| `{{previous_content}}` | 前文结尾 500 字 |
| `{{scene_type}}` | 场景类型 |
| `{{pacing}}` | 节奏要求 |

---

## 写作原则

### 核心原则

1. **一致性优先**：严格遵循已有设定，不自相矛盾，发现矛盾立即指出
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

- 直接输出小说正文，不输出解释说明
- 章节开头承上启下，结尾留悬念或情绪高点
- 玄幻/都市单章 3000-5000 字
- 禁止在章节中写"作者有话说"等打破沉浸感的内容

### 上下文更新

章节完成后，必须更新 `00-context.md`：
- 推进当前章节号
- 更新角色状态变化
- 标记伏笔回收情况
- 记录本章结束时的关键状态

---

## 配置说明

### configs/writing-rules.md

定义个人写作规范：
- 文风偏好（战斗、情感、对话）
- 章节结构（高潮频率、钩子类型）
- 字数参考
- 禁用词清单

### configs/active-book.md

记录当前激活的书籍：

```markdown
active_book: 逆天改命
book_path: ./books/逆天改命/
```
