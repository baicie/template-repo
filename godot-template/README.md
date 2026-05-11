# 镇妖司 / Exorcistry Starter Template

Godot 4 卡牌肉鸽项目启动模板，适用于私有仓库。当前模板目标是先跑通核心闭环：

```txt
主菜单 → 开始战斗 → 抽牌 → 出牌 → 敌人行动 → 胜负结算
```

## 技术栈

- Godot 4.x
- GDScript
- JSON 数据驱动
- GitHub Actions CI

## 快速开始

> 详细指南请阅读 [docs/00_快速开始.md](docs/00_快速开始.md)。

1. 安装 Godot 4.x（推荐 4.2.2）。
2. 下载后用 Godot 打开本仓库根目录（选择 `project.godot`）。
3. 按 **F5** 或点击 ▶️ 运行主场景 `res://scenes/Main.tscn`。
4. 点击 **Start Test Battle** 进入测试战斗。

## 目录说明

```txt
assets/                  资源占位
addons/                  插件目录
configs/                 游戏配置
scripts/                 核心代码
scenes/                  Godot 场景
schemas/                 JSON Schema
resources/data/          卡牌、敌人、遗物等配置
.github/                 GitHub Actions 与模板
docs/                    文档体系
tests/                   测试与校验脚本
tools/                   本地工具脚本
```

## 私有仓库建议

- 不要提交 Steam 密钥、签名证书、发行平台 token。
- GitHub Secrets 只在仓库 Settings → Secrets and variables → Actions 配置。
- 发布前再补正式 `export_presets.cfg`。

## 当前已实现

- 数据加载
- 卡牌实例
- 抽牌/弃牌/洗牌
- 能量系统
- 格挡/伤害
- 国运/妖蚀/镇压/燃烧/虚弱/易伤/力量
- 敌人意图与行动
- 简单 UI
- JSON 校验脚本
- GitHub Actions：lint、JSON 校验、Godot 导入检查、PCK 打包示例

## CI 说明

Godot 官方支持命令行导出，CI 常用 `--headless --export-release`；导出依赖 `export_presets.cfg` 和导出模板。Godot 文档明确说明 CI 等无 GPU 环境需要 `--headless`。参考：Godot 命令行导出文档、GitHub Marketplace 的 Godot Export Action。

