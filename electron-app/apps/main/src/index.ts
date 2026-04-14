import type { OpenDialogResult, SaveDialogResult } from '@apps/preload'
import { join } from 'node:path'
import process from 'node:process'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import log from 'electron-log/main'

log.initialize()
log.info('Application starting...')

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../../../preload/dist/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    log.info('Window ready to show')
    mainWindow?.show()
    if (is.dev) {
      mainWindow?.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (is.dev && rendererUrl !== undefined) {
    void mainWindow.loadURL(rendererUrl)
  } else {
    void mainWindow.loadFile(join(__dirname, '../../../renderer/dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        { type: 'separator' as const },
        { role: 'close' as const },
      ],
    },
    {
      role: 'help' as const,
      submenu: [
        {
          label: 'Learn More',
          click: () => {
            void shell.openExternal('https://electronjs.org')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function setupIpcHandlers(): void {
  ipcMain.handle('app:get-info', () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
    }
  })

  ipcMain.handle('app:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('app:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('app:close', () => {
    mainWindow?.close()
  })

  ipcMain.handle(
    'dialog:open-file',
    async (_, options): Promise<OpenDialogResult> => {
      const dialogOptions = options as Partial<Electron.OpenDialogOptions>
      const result = await dialog.showOpenDialog(mainWindow!, dialogOptions)
      return result as OpenDialogResult
    },
  )

  ipcMain.handle(
    'dialog:save-file',
    async (_, options): Promise<SaveDialogResult> => {
      const dialogOptions = options as Partial<Electron.SaveDialogOptions>
      const result = await dialog.showSaveDialog(mainWindow!, dialogOptions)
      return result as SaveDialogResult
    },
  )
}

app
  .whenReady()
  .then(() => {
    log.info('App ready')

    electronApp.setAppUserModelId('com.electron.app')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    setupIpcHandlers()
    createMenu()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  .catch(error => {
    log.error('Failed to initialize app:', error)
  })

app.on('window-all-closed', () => {
  log.info('All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.on('uncaughtException', error => {
  log.error('Uncaught exception:', error)
})

process.on('unhandledRejection', reason => {
  log.error('Unhandled rejection:', reason)
})
