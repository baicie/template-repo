# 镇妖司 (Exorcistry) — Agent 规则

## 项目背景

**镇妖司** 是一款基于 Godot 4.2 的卡牌肉鸽（deckbuilding roguelike）游戏，主题为中国古代志怪 + 修仙。

核心玩法受 *Slay the Spire* 启发：玩家通过打出卡牌、消耗能量、对敌人造成伤害或获得防御，同时管理自己的状态效果（status）和敌人的意图（intent）。

## 技术栈

| 技术 | 用途 |
|------|------|
| **Godot 4.2** | 游戏引擎 |
| **GDScript** | 游戏逻辑（强类型 Typed GDScript） |
| **JSON** | 数据驱动设计（卡牌/敌人配置） |
| **JSON Schema** | 数据验证 |
| **Python + Pytest** | 数据验证和单元测试 |
| **GitHub Actions** | CI/CD 自动化 |

## 项目结构

```
godot-template/
├── scripts/              # GDScript 源代码
│   ├── battle/          # 战斗系统（BattleController, TurnManager, DamageCalculator 等）
│   ├── cards/           # 卡牌系统（CardData, CardInstance, CardLibrary）
│   ├── core/            # 核心（EventBus, Game, Constants, RunState, RandomService）
│   ├── data/            # 数据加载（DataLoader）
│   ├── enemies/         # 敌人系统（EnemyData, EnemyInstance, EnemyLibrary）
│   └── ui/              # UI 逻辑（MainMenu）
├── resources/data/       # 游戏内容 JSON
│   ├── cards.json       # 卡牌定义（40+ 张卡）
│   └── enemies.json     # 敌人定义（15 个敌人）
├── configs/             # 游戏配置
├── schemas/             # JSON Schema 验证
├── scenes/              # Godot 场景文件
├── tools/              # 工具脚本
│   └── validate_json.py # Python 验证脚本
├── docs/               # 详细文档（10 篇）
├── .github/workflows/   # GitHub Actions
├── project.godot       # Godot 项目配置（config_version=5）
└── export_presets.cfg # 导出配置（Linux/X11, Web）
```

## 数据驱动设计

游戏内容（卡牌、敌人）完全由 JSON 定义，GDScript 仅负责逻辑执行。

- **新增/修改卡牌** → 编辑 `resources/data/cards.json`
- **新增/修改敌人** → 编辑 `resources/data/enemies.json`
- 每次修改后运行验证：`python -m pytest tools/validate_json.py -v`

## AI 助手使用规范

### 语言要求

- **所有回复都使用中文**：在与用户交互时，始终使用中文进行回复和说明

### 技能（Skills）

本项目定义了 5 个专项技能（位于 `.agents/skills/`）：

| Skill | 触发场景 |
|-------|---------|
| `gdscript` | 编写/修改 GDScript、游戏逻辑、脚本结构 |
| `godot-data` | 新增/修改卡牌、敌人、JSON 数据、数据验证 |
| `godot-battle` | 修改战斗系统、卡牌执行、敌人 AI、状态效果 |
| `godot-testing` | 运行验证测试、修改 CI 流程、Python 测试 |
| `godot-export` | 配置导出配置、修改构建流程、发布版本 |

### 开发命令

```bash
# 数据验证
cd tools && python -m pytest validate_json.py -v

# Godot headless 导入检查
godot --headless --import

# 导出 Linux 二进制
godot --headless --export-release "Linux/X11" builds/linux/zhenyaosi.x86_64

# 导出 Web
godot --headless --export-release "Web" builds/web/index.html
```

## 代码风格指南

### GDScript 规范

- 使用 **Typed GDScript**（变量声明带类型）
- 使用 `class_name` 声明类名
- 使用 `@export` 暴露节点引用
- 常量使用 `const` + 全大写下划线命名
- 函数命名：`get_` 前缀（getter）、`is_` 前缀（布尔值）、`snake_case`
- 数组使用 `Array[Type]` 泛型语法
- 信号通过 `EventBus` 单例通信

### 文件命名

- 脚本：PascalCase.gd（如 `BattleController.gd`）
- 场景：PascalCase.tscn（如 `BattleScene.tscn`）
- 数据：snake_case.json（如 `cards.json`）

### 架构原则

- **数据与逻辑分离**：JSON 定义内容，GDScript 执行逻辑
- **单例通信**：通过 `EventBus` autoload 进行跨节点通信
- **状态管理**：`BattleState` 统一管理战斗状态
- **效果解析**：`EffectResolver` 统一处理所有卡牌效果

## 状态效果系统

| 状态 | 归属 | 效果 |
|------|------|------|
| 格挡 (block) | 玩家 | 吸收伤害 |
| 国运 (guoyun) | 玩家 | 特定卡牌的增益资源 |
| 妖蚀 (yaoshi) | 玩家 | 每3回合若层数≥3则失去生命 |
| 镇压 (zhenya) | 敌人 | 敌人伤害降低 25% |
| 燃烧 (burn) | 敌人 | 敌人回合开始时受到伤害 |
| 虚弱 (weak) | 双方 | 造成的伤害降低 25% |
| 易伤 (vulnerable) | 双方 | 受到的伤害增加 50% |
| 力量 (strength) | 双方 | 每层 +2 伤害 |

## 卡牌体系

- **类型**：`attack`（攻击）、`skill`（技能）、`power`（能力，未实现）
- **稀有度**：`starter`（起始）→ `common`（普通）→ `uncommon`（优秀）→ `rare`（稀有）
- **目标**：`enemy`（单体）、`self`（自身）、`all_enemies`（全体）、`random_enemy`（随机）
- **能量消耗**：起始能量 3 点/回合

## 敌人难度递进

| 区域 | 敌人 | HP 范围 |
|------|------|---------|
| 1 | 饿殍, 狐妖, 山贼, 邪道童子, 纸人兵 | 28-35 |
| 2 | 贪官, 厂卫叛徒, 黑莲教徒, 铁甲尸, 白骨弓手 | 40-50 |
| 3 | 河伯残魂, 龙脉蛀虫, 百目妖, 无头将军, 天灾化身 | 60+ |

## 质量保证

- **JSON 数据**：通过 JSON Schema + Pytest 验证
- **Python 测试**：`tools/validate_json.py` 和 `tests/` 目录
- **Godot 导入检查**：`godot --headless --import`
- **导出冒烟测试**：`godot --headless --export-release`

## CI/CD

| Job | 用途 |
|-----|------|
| `validate-json` | Python/Pytest JSON 数据验证 |
| `python-tests` | Python 单元测试 |
| `godot-import` | Godot headless 导入检查 |
| `export-smoke` | 导出 PCK 验证构建流程 |

## 开发路线图

| 里程碑 | 目标 |
|--------|------|
| **1: 战斗原型** | 卡牌 UI、敌人 UI、抽卡/出牌、胜负判定 |
| **2: 内容 MVP** | 40 张卡、15 个敌人、1 个 Boss、奖励选择 |
| **3: 完整跑图** | 地图、事件、商店、休息、存档系统 |
| **4: Steam Demo** | 美术、音效、设置、教程、Steam 页面素材 |

## 参考文档

详细技术文档位于 `docs/` 目录：

- `00_INDEX.md` — 文档索引
- `01_GAME_DESIGN.md` — 游戏设计概述
- `02_TECH_ARCHITECTURE.md` — 技术架构
- `03_DATA_DRIVEN_DESIGN.md` — 数据驱动设计
- `04_CARD_DESIGN.md` — 卡牌设计规范
- `05_BATTLE_SYSTEM.md` — 战斗系统详解
- `06_PIPELINE_AND_CI.md` — 流水线与 CI
- `07_PRIVATE_REPO_SECURITY.md` — 私有仓库安全
- `08_ROADMAP.md` — 开发路线图
- `09_RELEASE_CHECKLIST.md` — 发布检查清单
- `10_CONTRIBUTING.md` — 贡献指南
