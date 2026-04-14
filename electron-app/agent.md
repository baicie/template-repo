# Electron 应用开发规范

## 项目概述

本项目使用 Monorepo 结构，基于 pnpm workspaces 和 Turborepo 构建系统。

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
├── turbo.json             # Turborepo 配置
└── pnpm-workspace.yaml    # pnpm 工作空间
```

---

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
| 路由          | react-router-dom     | ^7.14.0  |
| CSS 框架      | Tailwind CSS         | ^4.2.2   |
| 日志          | electron-log         | ^5.4.3   |
| 工具包        | @electron-toolkit    | ^4.0.0   |
| Schema 验证   | zod                  | ^4.3.6   |
| 测试          | vitest               | ^4.1.4   |
| 代码规范      | @antfu/eslint-config | ^8.2.0   |

---

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 构建生产版本
pnpm build

# 打包分发
pnpm dist

# 清理
pnpm clean
```

---

## IPC 通信规范

### 安全原则

1. **始终启用上下文隔离** (`contextIsolation: true`)
2. **禁用 Node 集成** (`nodeIntegration: false`)
3. **启用沙箱** (`sandbox: true`)
4. **使用 contextBridge 暴露 API**

### IPC 通道定义

```typescript
// packages/types/src/ipc.ts
export const IpcChannels = {
  APP_GET_INFO: 'app:get-info',
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  APP_CLOSE: 'app:close',
  DIALOG_OPEN_FILE: 'dialog:open-file',
  DIALOG_SAVE_FILE: 'dialog:save-file',
} as const
```

### 主进程 IPC 处理

```typescript
// apps/main/src/index.ts
import { ipcMain, dialog } from 'electron'

function setupIpcHandlers(): void {
  ipcMain.handle('app:get-info', () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
    }
  })

  ipcMain.handle('dialog:open-file', async (_, options) => {
    const result = await dialog.showOpenDialog(mainWindow!, options)
    return result
  })
}
```

### 预加载脚本 API 暴露

```typescript
// apps/preload/src/index.ts
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  app: {
    getInfo: () => ipcRenderer.invoke('app:get-info'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
  },
  dialog: {
    openFile: options => ipcRenderer.invoke('dialog:open-file', options),
  },
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore
  window.api = api
}
```

### 渲染进程调用

```typescript
// apps/renderer/src/App.tsx
function App() {
  useEffect(() => {
    // 获取应用信息
    const info = await window.api.app.getInfo();
    console.log(info);

    // 打开文件对话框
    const result = await window.api.dialog.openFile({
      title: "选择文件",
      filters: [{ name: "文本", extensions: ["txt"] }],
    });
  }, []);

  return <div>...</div>;
}
```

---

## 窗口管理

### 创建窗口

```typescript
// apps/main/src/index.ts
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/dist/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })
}
```

### 窗口状态持久化

```typescript
import Store from 'electron-store'

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

const store = new Store<WindowState>({
  defaults: {
    width: 1200,
    height: 800,
    isMaximized: false,
  },
})

function createWindow(): void {
  const windowState = store.store

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
  })

  if (windowState.isMaximized) {
    mainWindow.maximize()
  }

  mainWindow.on('close', () => {
    if (!mainWindow.isMaximized()) {
      store.set('width', mainWindow.getBounds().width)
      store.set('height', mainWindow.getBounds().height)
    }
    store.set('isMaximized', mainWindow.isMaximized())
  })
}
```

---

## 预加载脚本规范

### 目录结构

```
apps/preload/
├── src/
│   ├── index.ts       # 入口，暴露 API
│   ├── api/           # API 模块化
│   └── context/       # 上下文定义
└── package.json
```

### API 模块化示例

```typescript
// apps/preload/src/api/app.ts
import { ipcRenderer } from 'electron'

export const appApi = {
  getInfo: () => ipcRenderer.invoke('app:get-info'),
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),
}

// apps/preload/src/index.ts
import { appApi } from './api/app'
import { dialogApi } from './api/dialog'

contextBridge.exposeInMainWorld('api', {
  app: appApi,
  dialog: dialogApi,
})
```

---

## 渲染进程规范

### 目录结构

```
apps/renderer/
├── src/
│   ├── main.tsx        # React 入口
│   ├── App.tsx         # 根组件
│   ├── components/      # 本地组件
│   ├── pages/          # 页面组件
│   ├── hooks/          # 自定义 Hooks
│   ├── stores/         # Zustand Store
│   └── styles/         # 样式文件
├── index.html
└── vite.config.ts
```

### 状态管理 (Zustand)

```typescript
// apps/renderer/src/stores/appStore.ts
import { create } from "zustand";

interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// 使用
import { useAppStore } from "@/stores/appStore";

function Counter() {
  const { count, increment, decrement } = useAppStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

---

## 共享 UI 组件规范

### 组件开发

```typescript
// packages/ui/src/Button.tsx
import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center font-medium rounded-lg",
          // variant styles
          {
            "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
            "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
          },
          // size styles
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

### 导出规范

```typescript
// packages/ui/src/index.ts
export { Button, type ButtonProps } from './Button'
export { Input, type InputProps } from './Input'
```

---

## 构建配置

### Turborepo 任务管道

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### electron-vite 配置

```typescript
// apps/main/electron.vite.config.ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {},
})
```

---

## 打包配置

### electron-builder 配置

```json
// electron-builder.json
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

## 安全最佳实践

### 1. 内容安全策略 (CSP)

```html
<!-- apps/renderer/index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self';
              script-src 'self';
              style-src 'self' 'unsafe-inline';"
/>
```

### 2. 禁用远程模块

```typescript
// apps/main/src/index.ts
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    // 防止导航到未知 URL
    if (!url.startsWith('file://')) {
      event.preventDefault()
    }
  })
})
```

### 3. 验证 IPC 输入

```typescript
import { z } from 'zod'

const OpenFileSchema = z.object({
  title: z.string().optional(),
  filters: z
    .array(
      z.object({
        name: z.string(),
        extensions: z.array(z.string()),
      }),
    )
    .optional(),
})

ipcMain.handle('dialog:open-file', async (_, rawOptions) => {
  const options = OpenFileSchema.parse(rawOptions)
  return dialog.showOpenDialog(mainWindow!, options)
})
```

---

## 日志管理

### electron-log 配置

```typescript
// apps/main/src/index.ts
import log from 'electron-log/main'

log.initialize()
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

log.info('Application starting...')
log.error('Error occurred:', error)

// 捕获未处理异常
process.on('uncaughtException', error => {
  log.error('Uncaught exception:', error)
})
```

---

## 调试技巧

### 主进程调试

```bash
# 启动时添加调试端口
ELECTRON_ENABLE_LOGGING=true npx electron . --remote-debugging-port=9222
```

### 渲染进程调试

- 使用 DevTools (Cmd+Option+I on macOS)
- 在渲染进程中查看 `window.api` 对象

### 预加载调试

```typescript
// 在预加载脚本中添加日志
console.log('Preload script loaded')

if (process.contextIsolated) {
  console.log('Context isolation enabled')
}
```

---

## 常见问题

### 1. 预加载脚本未加载

检查 `BrowserWindow` 配置中的 `preload` 路径是否正确：

```typescript
webPreferences: {
  preload: join(__dirname, "../preload/dist/index.js"),
}
```

### 2. contextBridge 报错

确保在 `contextBridge` 调用前检查 `contextIsolated`：

```typescript
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore
  window.api = api
}
```

### 3. 模块导入错误

使用正确的路径别名：

```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": resolve(__dirname, "src"),
  },
}
```
