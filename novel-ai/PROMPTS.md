# 提示词索引导航

## 七步方法论（workflow/）

七步方法论是创作的核心流程。

| 步骤 | 文件 | 说明 |
|------|------|------|
| 1. constitution | `workflow/01-constitution.md` | 建立不可违背的创作原则 |
| 2. specify | `workflow/02-specify.md` | 像 PRD 一样定义故事 |
| 3. clarify | `workflow/03-clarify.md` | 通过问答澄清模糊点 |
| 4. plan | `workflow/04-plan.md` | 制定技术实现方案 |
| 5. tasks | `workflow/05-tasks.md` | 分解为可执行任务 |
| 6. write | `writing/01-chapter-draft.md` | 基于任务写作 |
| 7. analyze | `workflow/07-analyze.md` | 七维度质量验证 |

## 通用模板（templates/）

| 文件 | 说明 |
|------|------|
| **writing-methods.md** | 三大派系方法论（乌贼/起点/唐神） |
| **genres.md** | 7种题材速启模板 |
| **character-template.md** | 人设六维模板 |
| **shuangdian.md** | 爽点设计手册 |
| **anti-hallucination.md** | 防幻觉三定律 |
| **strand-weave.md** | Strand Weave 节奏系统 |
| **reader-pull.md** | 追读力系统 |
| **preflight-check.md** | 写前预检 |
| **chapter-checklist.md** | 章节自检清单 |
| **writing-pitfalls.md** | 写作避雷指南 |
| system-prompt.md | AI 角色设定 |
| context-window.md | 上下文注入模板 |
| output-format.md | 输出格式模板 |

## 按阶段分类

### 构思期

| 文件 | 用途 |
|------|------|
| `inspiration/01-scenario-gen.md` | 场景灵感生成 |
| `inspiration/02-conflict-gen.md` | 冲突设计 |
| `inspiration/03-name-gen.md` | 命名灵感 |
| `inspiration/04-title-gen.md` | 章节标题 |
| `templates/system-prompt.md` | AI 角色设定 |

### 世界观构建（plan 阶段）

| 文件 | 用途 |
|------|------|
| `worldbuilding/01-genre-analysis.md` | 类型分析 |
| `worldbuilding/02-world-rules.md` | 世界运行规则 |
| `worldbuilding/03-power-system.md` | 力量体系（最核心） |
| `worldbuilding/04-geography.md` | 地理设定 |
| `worldbuilding/05-factions.md` | 势力派系 |
| `worldbuilding/06-glossary.md` | 术语词典 |

### 角色塑造（plan 阶段）

| 文件 | 用途 |
|------|------|
| `character/01-protagonist.md` | 主角设定 |
| `character/02-antagonist.md` | 反派设定 |
| `character/03-supporting.md` | 配角设定 |
| `character/04-character-web.md` | 角色关系网 |
| `character/05-speaking-style.md` | 话风提炼 |

### 大纲规划（plan 阶段）

| 文件 | 用途 |
|------|------|
| `outline/01-story-arc.md` | 主线大纲 |
| `outline/02-arc-breakdown.md` | 章节分配 |
| `outline/03-plot-twist.md` | 高潮设计 |
| `outline/04-subplot.md` | 支线铺排 |
| `outline/05-chapter-outline.md` | 单章大纲 |

### 正文写作（write 阶段）

| 文件 | 用途 |
|------|------|
| `writing/01-chapter-draft.md` | 章节草稿 |
| `writing/02-dialogue-polish.md` | 对话润色 |
| `writing/03-action-scene.md` | 战斗场景 |
| `writing/04-emotion-scene.md` | 情感场景 |
| `writing/05-description-scene.md` | 景物描写 |
| `writing/06-prose-polish.md` | 文笔润色 |

### 审核修订（analyze 阶段）

| 文件 | 用途 |
|------|------|
| `review/01-consistency-check.md` | 前后一致性检查 |
| `review/02-pacing-review.md` | 节奏审视 |
| `review/03-character-consistency.md` | 角色行为一致性 |
| `review/04-grammar-check.md` | 语病检查 |

## 模板变量速查

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

## 核心公式速查

```
好题材 = 熟悉类型 + 新鲜设定
好开篇 = 主角困境 + 明确目标 + 特殊优势 + 第一个冲突
好章节 = 推进剧情 + 提供爽点 + 留下期待
好长篇 = 世界规则 + 升级体系 + 地图扩张 + 持续反馈
追读力 = 钩子强度 - 冷却程度 + 债务压力
爽点 = 期待的情绪 × 足够的压抑 × 合理的逆转
```
