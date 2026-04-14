# Electron 模板项目设计方案

## 一、项目架构设计

采用 **Monorepo** 结构，使用 **pnpm workspaces** + **Turborepo** 构建系统。

```
electron-app/
├── apps/
│   ├── main/              # Electron 主进程
│   ├── preload/           # 预加载脚本
│   └── renderer/          # 渲染进程 (React + Vite)
├── packages/
│   ├── ui/                # 共享 UI 组件库
│   ├── config/            # ESLint/Prettier 共享配置
│   ├── tsconfig/          # TypeScript 基础配置
│   └── types/             # 共享类型定义
├── turbo.json             # Turborepo 构建配置
├── pnpm-workspace.yaml    # pnpm 工作空间配置
└── package.json
```

---

## 二、技术栈选型

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| Electron | electron | ^35.0.0 | 最新稳定版 |
| Node.js | node | ^22.0.0 | 最新 LTS |
| 包管理 | pnpm | ^10.0.0 | 高效磁盘占用 |
| 构建系统 | Turborepo | ^2.0.0 | 增量构建缓存 |
| 渲染框架 | React | ^19.0.0 | 最新版本 |
| 前端构建 | Vite | ^6.0.0 | 极速 HMR |
| Electron 构建 | electron-vite | ^3.0.0 | 专为 Electron 优化的 Vite |
| 打包工具 | electron-builder | ^25.0.0 | 应用打包分发 |
| TypeScript | typescript | ^5.6.0 | 类型安全 |
| 代码规范 | ESLint 9 + Flat Config | ^9.0.0 | 最新配置格式 |
| 代码格式化 | Prettier | ^3.4.0 | 统一代码风格 |
| 测试 | Vitest | ^2.0.0 | 快速单元测试 |
| IPC 类型 | electron-trpc | ^1.0.0 | 类型安全的 IPC 通信 |

---

## 三、核心特性设计

### 3.1 主进程 (`apps/main`)

- 窗口管理 (BrowserWindow)
- 系统级 IPC 处理
- 原生菜单
- 自动更新
- 应用生命周期管理

### 3.2 预加载脚本 (`apps/preload`)

- 安全的上下文隔离
- 暴露有限的 API 给渲染进程
- 使用 `contextBridge` 双向通信

### 3.3 渲染进程 (`apps/renderer`)

- React 19 + TypeScript
- Vite 6 开发服务器
- Tailwind CSS 4.0 (可选)
- React Router
- 状态管理 (Zustand / Jotai)

### 3.4 IPC 安全通信架构

```
┌─────────────┐     contextBridge      ┌─────────────┐
│   Renderer  │ ◄──────────────────►   │   Preload   │
│   (React)   │     暴露安全 API        │  (TypeScript)│
└─────────────┘                        └──────┬──────┘
                                             │  ipcRenderer.invoke
                                             ▼
                                      ┌─────────────┐
                                      │    Main     │
                                      │  (Node.js)  │
                                      └─────────────┘
```

---

## 四、开发工作流

### 4.1 脚本命令

```bash
# 安装依赖
pnpm install

# 开发模式 (主进程 + 渲染进程热重载)
pnpm dev

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 单元测试
pnpm test

# 构建生产版本
pnpm build

# 打包分发
pnpm dist
```

### 4.2 构建流程 (Turborepo)

```
build (主进程)     build (预加载)     build (渲染进程)
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                    dist 产出
                          │
                    electron-builder 打包
                          │
                     可执行文件 (.app / .exe)
```

---

## 五、安全考虑

1. **上下文隔离**: 启用 `contextIsolation: true`
2. **Node 隔离**: 启用 `nodeIntegration: false`
3. **沙箱**: 启用 `sandbox: true`
4. **CSP**: 配置严格的内容安全策略
5. **IPC 验证**: 所有 IPC 调用进行参数校验

---

## 六、共享包设计

### 6.1 `@repo/tsconfig`

共享的 TypeScript 配置包，统一 tsconfig.json 的 extends 来源。

```
packages/tsconfig/
├── base.json          # 基础配置
├── react.json         # React 配置
├── electron.json      # Electron 配置
└── package.json
```

### 6.2 `@repo/config`

共享的 ESLint/Prettier 配置。

```
packages/config/
├── eslint/            # ESLint 配置
├── prettier/          # Prettier 配置
└── package.json
```

### 6.3 `@repo/types`

共享的 TypeScript 类型定义。

```
packages/types/
├── index.ts           # 导出入口
├── ipc.ts             # IPC 类型定义
└── package.json
```

### 6.4 `@repo/ui`

共享的 UI 组件库。

```
packages/ui/
├── src/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── index.ts
└── package.json
```

---

## 七、应用包设计

### 7.1 `main` - 主进程

```
apps/main/
├── src/
│   ├── index.ts       # 入口文件
│   ├── windows/       # 窗口管理
│   ├── ipc/           # IPC 处理
│   ├── menu/          # 原生菜单
│   └── updater/       # 自动更新
├── electron.vite.config.ts
└── package.json
```

### 7.2 `preload` - 预加载脚本

```
apps/preload/
├── src/
│   ├── index.ts       # 入口文件
│   ├── api/           # 暴露的 API
│   └── context/       # 上下文定义
├── electron.vite.config.ts
└── package.json
```

### 7.3 `renderer` - 渲染进程

```
apps/renderer/
├── src/
│   ├── main.tsx       # React 入口
│   ├── App.tsx        # 根组件
│   ├── pages/         # 页面组件
│   └── components/   # 本地组件
├── index.html
├── electron.vite.config.ts
└── package.json
```

---

## 八、构建配置

### 8.1 Turborepo 配置 (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 8.2 pnpm 工作空间 (`pnpm-workspace.yaml`)

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 九、打包分发配置

### 9.1 electron-builder 配置

```json
{
  "appId": "com.electron.app",
  "productName": "ElectronApp",
  "directories": {
    "output": "release"
  },
  "files": [
    "apps/main/dist/**",
    "apps/preload/dist/**",
    "apps/renderer/dist/**"
  ],
  "mac": {
    "target": ["dmg", "zip"],
    "category": "public.app-category.developer-tools"
  },
  "win": {
    "target": ["nsis"]
  },
  "linux": {
    "target": ["AppImage"]
  }
}
```

---

## 十、依赖版本锁定策略

在根目录 `package.json` 中使用 `pnpm.overrides` 确保所有子包使用一致版本：

```json
{
  "pnpm": {
    "overrides": {
      "electron": "^35.0.0",
      "typescript": "^5.6.0"
    }
  }
}
```

---

## 十一、下一步计划

1. 创建项目目录结构
2. 初始化 pnpm workspaces
3. 配置 Turborepo
4. 创建共享配置包
5. 实现主进程
6. 实现预加载脚本
7. 实现渲染进程
8. 配置 electron-builder
9. 创建 agent.md 开发规范