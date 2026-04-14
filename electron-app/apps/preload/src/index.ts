import process from 'node:process'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

export interface AppInfo {
  name: string
  version: string
  platform: string
}

export interface DialogOpenOptions {
  title?: string
  filters?: Array<{ name: string; extensions: string[] }>
  properties?: string[]
}

export interface DialogSaveOptions {
  title?: string
  defaultPath?: string
  filters?: Array<{ name: string; extensions: string[] }>
}

export interface OpenDialogResult {
  canceled: boolean
  filePaths: string[]
}

export interface SaveDialogResult {
  canceled: boolean
  filePath?: string
}

export interface ElectronAPI {
  app: {
    getInfo: () => Promise<AppInfo>
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
  }
  dialog: {
    openFile: (options?: DialogOpenOptions) => Promise<OpenDialogResult>
    saveFile: (options?: DialogSaveOptions) => Promise<SaveDialogResult>
  }
}

const api: ElectronAPI = {
  app: {
    getInfo: async () =>
      ipcRenderer.invoke<AppInfo>('app:get-info') as Promise<AppInfo>,
    minimize: async () =>
      ipcRenderer.invoke<void>('app:minimize') as Promise<void>,
    maximize: async () =>
      ipcRenderer.invoke<void>('app:maximize') as Promise<void>,
    close: async () => ipcRenderer.invoke<void>('app:close') as Promise<void>,
  },
  dialog: {
    openFile: async options =>
      ipcRenderer.invoke<OpenDialogResult>(
        'dialog:open-file',
        options,
      ) as Promise<OpenDialogResult>,
    saveFile: async options =>
      ipcRenderer.invoke<SaveDialogResult>(
        'dialog:save-file',
        options,
      ) as Promise<SaveDialogResult>,
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error fallback for non-isolated context
  const win = window as Window & typeof globalThis
  // @ts-expect-error fallback for non-isolated context
  win.electron = electronAPI
  // @ts-expect-error fallback for non-isolated context
  win.api = api
}
