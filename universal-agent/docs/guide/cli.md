# CLI

## 概述

`@agent/cli` 是 Universal Agent 的命令行入口，支持交互式聊天、单次任务、Skill 管理和配置。

## 使用方式

### 交互式聊天

```bash
agent chat "帮我分析这个 bug"
```

### 单次任务

```bash
agent run "读取 package.json 并总结项目依赖"
```

### 查看可用 Skills

```bash
agent skill list
```

### 配置管理

```bash
# 初始化配置文件
agent config init

# 查看当前配置
agent config show
```

## 全局选项

| Option                   | Description                       |
| ------------------------ | --------------------------------- |
| `-w, --workspace <path>` | 工作目录，默认为当前目录          |
| `-m, --model <name>`     | 使用的模型，默认 `openai/gpt-4.1` |
| `-V, --version`          | 显示版本号                        |
| `-h, --help`             | 显示帮助信息                      |

## 权限确认

默认情况下，**写入文件、执行 shell 命令、发送网络请求**需要用户确认：

```bash
agent run "帮我修改 src/index.ts"
# 输出：
# Agent：我准备修改 src/index.ts，是否确认？
# 用户：确认
# Agent：继续写文件
```
