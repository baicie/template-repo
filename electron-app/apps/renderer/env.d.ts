/// <reference types="vite/client" />

interface Window {
  api: {
    app: {
      getInfo: () => Promise<{
        name: string
        version: string
        platform: string
      }>
      minimize: () => Promise<void>
      maximize: () => Promise<void>
      close: () => Promise<void>
    }
    dialog: {
      openFile: (
        options?: Electron.OpenDialogOptions,
      ) => Promise<Electron.OpenDialogReturnValue>
      saveFile: (
        options?: Electron.SaveDialogOptions,
      ) => Promise<Electron.SaveDialogReturnValue>
    }
  }
}
