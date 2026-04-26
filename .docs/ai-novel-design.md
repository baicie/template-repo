# AI 网文小说创作项目

## 项目定位

在 Cursor 内直接完成小说创作的本地项目。融合三大体系：

| 来源 | 核心贡献 |
|------|---------|
| **novel-writer** | 七步方法论、查询协议、JSON追踪 |
| **snowflake-fiction** | 24种AI检测、五维质量、流水账、黄金三章 |
| **webnovel-writer** | 防幻觉三定律、Strand Weave、六维审查、追读力 |
| **乌贼/起点/唐神** | 世界观驱动、商业工程、爽点节奏实战方法论 |

---

## 项目结构

```
novel-ai/
├── books/{书名}/           # 每本书独立目录
│   ├── constitution.md     # 创作宪法
│   ├── meta.md
│   ├── 00-context.md
│   ├── tracking/*.json    # 8个追踪文件
│   └── chapters/
│
├── prompts/               # 提示词（44个）
│   ├── workflow/          # 七步方法论
│   ├── worldbuilding/      # 世界观
│   ├── character/          # 角色
│   ├── outline/            # 大纲
│   ├── writing/            # 正文
│   ├── review/             # 复核
│   ├── inspiration/        # 灵感
│   └── templates/          # 15个通用模板
│
├── .agents/skills/        # 14个Skills
├── workflows/             # 4个工作流
├── configs/               # 配置
└── .cursor/rules/         # 3个规则
```

---

## 核心机制

### 防幻觉三定律

| 定律 | 约束 |
|------|------|
| 大纲即法律 | 偏离必须标注，3处偏离暂停 |
| 设定即物理 | 禁止战力崩坏、角色OOC |
| 发明需识别 | 新实体必须入库 tracking/*.json |

### Strand Weave 节奏系统

| 线 | 占比 | 红线 |
|---|------|------|
| Quest（主线） | 60% | 连续≤5章 |
| Fire（感情线） | 20% | 断档≤10章 |
| Constellation（世界观） | 20% | 断档≤15章 |

### 追读力系统

```
追读力 = 钩子强度 - 冷却程度 + 债务压力
```

### 六维审查

爽点审查 · 一致性审查 · 节奏审查 · 人设审查 · 连贯性审查 · 追读力审查

---

## 写作方法论（templates/）

| 文件 | 内容 |
|------|------|
| `writing-methods.md` | 三大派系方法论（乌贼/起点/唐神） |
| `genres.md` | 7种题材速启模板 |
| `character-template.md` | 人设六维模板 |
| `shuangdian.md` | 爽点设计手册 |
| `anti-hallucination.md` | 防幻觉三定律 |
| `strand-weave.md` | 节奏系统 |
| `reader-pull.md` | 追读力系统 |
| `preflight-check.md` | 写前预检 |
| `chapter-checklist.md` | 章节自检清单 |
| `writing-pitfalls.md` | 写作避雷指南 |

---

## 完整工作流

```
构思期 → outline-concept + constitution + specify + writing-methods
规划期 → worldbuilding + character-design + outline + genres
创作期 → preflight → write-chapter → boring-detect → humanize-text
复核期 → novel-review（六维）+ quality-check
运维期 → 04-operations.md
导出期 → novel-export
```

---

## 文件数

```
novel-ai/           95 files total
├── books/           12 files（逆天改命完整示例）
├── prompts/         44 files
│   └── templates/   15 files
├── .agents/         16 files
├── workflows/        4 files
├── configs/          2 files
├── .cursor/rules/     3 files
└── 根目录             4 files
```
