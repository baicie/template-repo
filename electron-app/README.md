# Electron App

基于 Electron + React + Vite 的桌面应用模板，使用 Monorepo 结构管理。

## 环境要求

- Node.js: >= 22.0.0
- pnpm: >= 10.33.0
  -Electron: >= 41.2.0

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动开发服务器，支持热更新：

```bash
pnpm dev
```

### 构建

构建生产版本：

```bash
pnpm build
```

### 类型检查

```bash
pnpm type-check
```

### 代码检查

```bash
pnpm lint
```

自动修复：

```bash
pnpm lint-fix
```

### 格式化代码

```bash
pnpm format
```

### 运行测试

```bash
# 运行测试
pnpm test

# 监听模式
pnpm test:watch

# 覆盖率
pnpm test:coverage
```

### 打包发布

```bash
pnpm dist
```

### 清理

```bash
pnpm clean
```

## 项目结构

```
electron-app/
├── apps/
│   ├── main/           # Electron 主进程
│   ├── preload/        # 预加载脚本
│   └── renderer/       # 渲染进程 (React)
├── packages/
│   ├── ui/             # 共享 UI 组件库
│   ├── tsconfig/       # TypeScript 配置
│   └── types/           # 共享类型定义
├── .github/
│   └── workflows/      # GitHub Actions CI
├── turbo.json          # Turborepo 配置
└── pnpm-workspace.yaml # pnpm 工作空间
```

## 技术栈

| 类别          | 技术                 | 版本     |
| ------------- | -------------------- | -------- |
| Electron      | electron             | ^41.2.0  |
| Node.js       | node                 | ^22.0.0  |
| 包管理        | pnpm                 | ^10.33.0 |
| 构建系统      | Turborepo            | ^2.9.6   |
| 渲染框架      | React                | ^19.2.5  |
| 前端构建      | Vite                 | ^8.0.8   |
| Electron 构建 | electron-vite        | ^5.0.0   |
| 打包工具      | electron-builder     | ^26.8.1  |
| TypeScript    | typescript           | ^6.0.2   |
| 状态管理      | Zustand              | ^5.0.12  |
| CSS 框架      | Tailwind CSS         | ^4.2.2   |
| 日志          | electron-log         | ^5.4.3   |
| 测试          | vitest               | ^4.1.4   |
| 代码规范      | @antfu/eslint-config | ^8.2.0   |

## 开发指南

### IPC 通信

主进程和渲染进程通过 contextBridge 进行安全通信，详见 [开发规范](agent.md)。

### 窗口管理

应用支持窗口状��持久化、最小化、最大化、关闭等操作。

### 打包配置

electron-builder 配置位于 `electron-builder.json`，支持 macOS (.dmg/.zip)、Windows (.exe)、Linux (.AppImage) 等平台。

## License

MIT
