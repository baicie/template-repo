# AI 网文小说创作项目

> 在 Cursor 内直接完成小说创作——纯提示词驱动，多书管理，AI 协作写作。

## 快速开始

### 1. 创建新书

```
1. 在 books/ 下创建新书目录
2. 填写 books/{书名}/meta.md
3. 填写 books/{书名}/00-context.md
4. 修改 configs/active-book.md，激活新书
```

### 2. 开始写作

```
直接告诉 Cursor：「写第 1 章」
Cursor Agent 会自动读取上下文开始写作
```

### 3. 常用命令

| 命令 | 说明 |
|------|------|
| 「写第 X 章」 | 开始写新章节 |
| 「润色这段」 | 润色选中的文字 |
| 「检查一致性」 | 检查章节与设定是否矛盾 |
| 「给我灵感」 | 获取创意方向 |
| 「切换到 XX」 | 切换到另一本书 |

## 项目结构

```
novel-ai/
├── books/              # 所有小说
│   └── {书名}/
│       ├── meta.md     # 作品信息
│       ├── 00-context.md # 写作上下文
│       ├── 00-characters.md # 角色
│       ├── 00-world.md  # 世界观
│       ├── 00-outline.md # 大纲
│       └── chapters/   # 章节
│
├── .agents/skills/     # Agent Skills
│   ├── write-chapter/
│   ├── polish-prose/
│   ├── worldbuilding/
│   ├── character-design/
│   ├── consistency-check/
│   ├── inspiration/
│   └── switch-book/
│
├── prompts/            # 提示词模板库
├── workflows/          # 工作流指南
├── configs/            # 配置文件
└── .cursor/rules/      # Cursor 规则
```

## 文档索引

| 文档 | 说明 |
|------|------|
| `AGENTS.md` | Agent 核心规则 |
| `BOOKS.md` | 书籍索引 |
| `PROMPTS.md` | 提示词导航 |
| `.agents/skills/*/SKILL.md` | 各技能详细说明 |
| `workflows/*` | 工作流指南 |
| `configs/writing-rules.md` | 个人写作规范 |

## 多书管理

修改 `configs/active-book.md` 切换当前书籍：

```markdown
active_book: 逆天改命
book_path: ./books/逆天改命/
```

## 写作原则

1. **一致性优先** — 严格遵循已有设定
2. **爽点节奏** — 每章至少 1-2 个小高潮
3. **作者意志优先** — AI 是协作者，最终决定权在作者
4. **上下文感知** — 每次写作前读取相关设定
