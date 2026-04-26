# 完整工作流

## 一、构思期

```
用户：构思一个新故事
↓
使用 .agents/outline-concept/ 进行构思
↓
生成一句话概括 + 五句式大纲
↓
进入创作准备
```

### 构思阶段提示词

使用 `prompts/workflow/01-constitution.md` 建立创作宪法。

使用 `prompts/workflow/02-specify.md` 定义故事规格。

使用 `prompts/workflow/03-clarify.md` 澄清关键决策。

## 二、规划期

```
根据故事规格和决策
↓
使用 prompts/worldbuilding/ 构建世界观
↓
使用 prompts/character/ 设计角色
↓
使用 prompts/outline/ 规划大纲
↓
使用 .agents/scene-plan/ 规划场景
```

### 世界观构建（prompts/worldbuilding/）

1. `01-genre-analysis.md` — 类型分析
2. `02-world-rules.md` — 世界运行规则
3. `03-power-system.md` — 力量体系（最核心）
4. `04-geography.md` — 地理设定
5. `05-factions.md` — 势力派系
6. `06-glossary.md` — 术语词典

### 角色设计（prompts/character/）

1. `01-protagonist.md` — 主角设定
2. `02-antagonist.md` — 反派设定
3. `03-supporting.md` — 配角设定
4. `04-character-web.md` — 角色关系网
5. `05-speaking-style.md` — 话风提炼

### 大纲规划（prompts/outline/）

1. `01-story-arc.md` — 主线大纲
2. `02-arc-breakdown.md` — 章节分配
3. `03-plot-twist.md` — 高潮设计
4. `04-subplot.md` — 支线铺排
5. `05-chapter-outline.md` — 单章大纲

## 三、创作期

```
用户：「写第 X 章」
↓
AI 按查询协议读取所有上下文
↓
使用 .agents/write-chapter/ 开始写作
↓
每章完成后更新 tracking/*.json
↓
进入复核期
```

### 章节写作流程（.agents/write-chapter/）

1. 读取上下文：constitution.md、00-context.md、tracking/*.json
2. 读取相关设定：角色、世界观、大纲
3. 读取前文结尾至少 500 字
4. 生成章节正文
5. 更新 tracking/*.json

## 四、复核期

```
每完成 5 章进行一次复核
↓
使用 .agents/novel-review/ 进行检查
↓
发现问题时及时修正
↓
使用 quality-check 检查内容质量
↓
使用 boring-detect 检查流水账
```

### 复核检查项（.agents/novel-review/）

| 指令 | 说明 |
|------|------|
| `--角色` | 角色一致性检查 |
| `--时间线` | 时间线检查 |
| `--设定` | 设定一致性检查 |
| `--大纲` | 大纲偏离检查 |
| `--伏笔` | 伏笔回收检查 |
| `--文风` | 文风一致性 + 流水账 |
| `--开篇` | 黄金三章（前3章） |
| `--全文` | 全面检查 |

## 五、润色期

```
初稿完成后
↓
使用 .agents/humanize-text/ 进行人语化处理
↓
使用 quality-check 检查质量
↓
使用 boring-detect 确保无流水账
```

### 人语化处理（.agents/humanize-text/）

1. 检测 24 种 AI 模式
2. 生成修改建议
3. 逐句改写
4. 输出人语化评分

## 六、导出期

```
完成所有章节后
↓
使用 .agents/novel-export/ 导出平台格式
↓
番茄小说：纯文本，无空行
↓
起点中文网：全角空格缩进
↓
晋江：段落间空一行
```

## 七、日常写作循环

```
每天写作：
1. 读取当前章节上下文
2. 使用 write-chapter 写章节
3. 使用 boring-detect 检查流水账
4. 使用 humanize-text 人语化
5. 更新 tracking/*.json
6. 发布
```

## 八、关键节点

### 黄金三章（第1-3章）

- 开篇必须强：前300字有爆点
- 第1章：抓读者
- 第2章：展设定
- 第3章：出爽点

使用 `opening-check` 检查。

### 付费卡点（30章）

- 前30章要留住读者
- 重要爽点放在付费前
- 每章结尾必须有钩子

### 推荐评估（8万字，番茄）

使用 `novel-review --全文` 进行全面检查。

## 九、检查流程图

```
┌─────────────────────────────────────┐
│              创作前                     │
│  outline-concept（构思故事）            │
│  constitution（创作宪法）                │
│  specify（故事规格）                    │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│              规划期                     │
│  worldbuilding（世界观）               │
│  character（角色设计）                 │
│  outline（大纲规划）                   │
│  scene-plan（场景规划）                │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│              创作期                     │
│  write-chapter（写章节）               │
│  boring-detect（流水账检测）           │
│  humanize-text（人语化）               │
│  更新 tracking/*.json                 │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│              复核期                     │
│  novel-review（一致性检查）             │
│  quality-check（质量检查）             │
│  opening-check（黄金三章）              │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│              导出期                     │
│  novel-export（平台格式）              │
└─────────────────────────────────────┘
```
