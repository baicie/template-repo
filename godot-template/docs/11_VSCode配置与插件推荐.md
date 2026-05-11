# VSCode 配置与插件推荐

本文档介绍镇妖司项目的 VSCode 开发环境配置。

## 目录

- [推荐插件](#推荐插件)
- [配置说明](#配置说明)
- [任务（Tasks）](#任务tasks)
- [调试配置（Launch）](#调试配置launch)
- [一键安装脚本](#一键安装脚本)

---

## 推荐插件

首次打开项目时，VSCode 会提示安装推荐插件。也可以手动从插件市场搜索安装。

### 必需插件

| 插件 | 说明 |
|------|------|
| **[Godot Tools](https://marketplace.visualstudio.com/items?itemName=geequlim.godot-tools)** `geequlim.godot-tools` | Godot 官方 GDScript 支持：语法高亮、IntelliSense、自动完成、格式化、调试、符号导航。**GDScript 开发必备。** |
| **[Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)** `ms-python.python` | Python 语言支持：Pylint、flake8、代码补全、单元测试（pytest）、调试。**数据验证脚本开发必备。** |

### 推荐插件

| 插件 | 说明 |
|------|------|
| **[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)** `esbenp.prettier-vscode` | JSON、YAML、Markdown 等文件的格式化工具。配置了保存时自动格式化。 |
| **[EditorConfig](https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig)** `editorconfig.editorconfig` | 跨编辑器的代码风格统一。`.editorconfig` 文件确保所有成员缩进、换行一致。 |
| **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)** `dbaeumer.vscode-eslint` | JS/TS 代码检查。如有前端资源可启用。 |
| **[Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)** `streetsidesoftware.code-spell-checker` | 拼写检查。支持 GDScript、JSON、Markdown。已配置忽略游戏专有术语。 |
| **[Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yuzhangcotta.markdown-all-in-one)** `yzhang.markdown-all-in-one` | Markdown 增强：目录生成、快捷键、表格格式化。阅读和编写文档时推荐。 |

### 可选插件

| 插件 | 说明 |
|------|------|
| **[GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)** `eamodio.gitlens` | Git 增强：行内 blame、历史查看、对比。大型项目开发推荐。 |
| **[Error Lens](https://marketplace.visualstudio.com/items?itemName=idrabenia.errorlens)** `idrabenia.errorlens` | 将诊断信息（错误、警告）直接显示在代码行尾，提升问题发现效率。 |
| **[Todo Tree](https://marketplace.visualstudio.com/items?itemName=gruntfuggly.todo-tree)** `gruntfuggly.todo-tree` | 在侧边栏树形展示代码中的 `TODO`、`FIXME` 等标记。 |
| **[GitHub Pull Requests](https://marketplace.visualstudio.com/items?itemName=github.vscode-pull-request-github)** `github.vscode-pull-request-github` | 直接在 VSCode 中管理 PR、Code Review。 |

---

## 配置说明

`.vscode/settings.json` 中已针对项目进行了以下配置：

### 语言特定配置

| 语言/文件类型 | 配置 |
|--------------|------|
| **GDScript** | Godot Tools 格式化、4 空格缩进、100 字符标尺 |
| **Python** | Black 格式化、flake8 检查、pytest 测试集成、88/120 字符标尺 |
| **JSON** | Prettier 格式化、2 空格缩进、Schema 关联（cards.json / enemies.json） |
| **YAML** | Prettier 格式化、GitHub Actions schema 支持 |
| **Markdown** | Prettier 格式化、自动换行 |
| **INI**（Godot 场景/配置） | EditorConfig 格式化 |

### JSON Schema 关联

配置了 `cards.json` 和 `enemies.json` 的 JSON Schema 验证。打开这两个文件时会自动应用 `schemas/cards.schema.json` 和 `schemas/enemies.schema.json` 的校验规则，编辑器内会直接显示字段缺失或类型错误提示。

### Python 测试集成

配置了 pytest 为默认测试框架：

- 测试文件：`tools/validate_json.py`
- 运行参数：`-v --tb=short`
- 侧边栏会有 **Testing** 图标，点击可直接运行/调试测试

### 任务面板

在 VSCode 底部 **终端 → 运行任务** 或快捷键 `Cmd/Ctrl+Shift+P` → **Tasks: Run Task**，可看到预配置的 10 个任务（详见下文）。

---

## 任务（Tasks）

按 `Cmd/Ctrl+Shift+B` 运行默认构建任务（验证 JSON 数据）。

### 全部可用任务

| 任务名 | 快捷操作 | 说明 |
|--------|---------|------|
| **验证 JSON 数据** | `Cmd+Shift+B`（默认） | 运行 pytest 验证卡牌/敌人数据 |
| **JSON 校验（快速）** | — | 仅 JSON 语法检查，不依赖 pytest |
| **Godot 导入检查** | — | `godot --headless --import --quit` |
| **导出 Linux 二进制** | — | 导出 PCK 包 |
| **导出 Web 版本** | — | 导出 HTML5/Web 版本 |
| **完整构建** | — | JSON 校验 → 导入检查 → 导出 PCK |
| **运行 pytest** | — | 运行所有 Python 测试 |
| **Python 类型检查（mypy）** | — | 静态类型检查 |
| **安装开发依赖** | — | `pip install pytest jsonschema flake8 black mypy` |
| **格式化 GDScript** | — | 调用 Godot 格式化（需 godot-tools 扩展） |

---

## 调试配置（Launch）

按 `F5` 打开调试面板，可选择以下配置：

### JSON 相关

| 配置名 | 说明 |
|--------|------|
| **验证 JSON 数据** | 运行 pytest 验证脚本 |
| **JSON 语法检查** | 运行 validate_json.py（快速检查） |

### Python 测试

| 配置名 | 说明 |
|--------|------|
| **运行所有 pytest** | 运行项目下所有 Python 测试 |
| **Python flake8 检查** | 代码风格检查 |
| **Python black 格式化** | 格式化 Python 文件 |

### Godot 相关

| 配置名 | 说明 |
|--------|------|
| **Godot 导入检查（无头）** | Godot CLI 导入验证 |
| **Godot 导出 PCK** | 导出 Linux PCK 包 |
| **Godot 导出 Web** | 导出 Web 版本 |

### 复合任务

| 配置名 | 说明 |
|--------|------|
| **完整构建流程** | 自动运行：JSON 校验 → 导入检查 → 导出 PCK |

---

## 一键安装脚本

在新环境中快速安装所有推荐插件：

```bash
# 在 VSCode 中打开项目后，运行以下命令安装所有推荐插件
code --install-extension geequlim.godot-tools
code --install-extension ms-python.python
code --install-extension esbenp.prettier-vscode
code --install-extension editorconfig.editorconfig
code --install-extension dbaeumer.vscode-eslint
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension yzhang.markdown-all-in-one

# 安装 Python 开发依赖
pip install pytest jsonschema flake8 black mypy

# 验证安装
python -m pytest tools/validate_json.py -v
```

---

## 附录：Godot 编辑器 vs VSCode

> **重要**：GDScript 代码编写推荐使用 **VSCode + Godot Tools**。**GDScript 调试和场景编辑必须在 Godot 编辑器中完成**。

| 任务 | 推荐工具 |
|------|---------|
| 编写 GDScript 代码 | VSCode + Godot Tools |
| GDScript 调试（断点、变量） | Godot 编辑器内置调试器 |
| 场景文件编辑（.tscn） | Godot 编辑器（拖拽式可视化编辑） |
| 资源导入/管理 | Godot 编辑器 |
| 运行游戏测试 | Godot 编辑器（F5） |
| JSON 数据编写/验证 | VSCode + JSON Schema |
| Python 测试/验证 | VSCode 终端 + pytest |
