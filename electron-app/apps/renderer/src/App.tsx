import type { OpenDialogResult, SaveDialogResult } from '@apps/preload'
import { Button } from '@repo/ui'
import { useEffect, useState } from 'react'
import { create } from 'zustand'

interface AppInfo {
  name: string
  version: string
  platform: string
}

interface AppStore {
  appInfo: AppInfo | null
  setAppInfo: (info: AppInfo) => void
}

const useAppStore = create<AppStore>(set => ({
  appInfo: null,
  setAppInfo: info => set({ appInfo: info }),
}))

const api: any = window.api

function App() {
  const { appInfo, setAppInfo } = useAppStore()
  const [dialogResult, setDialogResult] = useState<string>('')

  useEffect(() => {
    void api.app.getInfo().then(setAppInfo)
  }, [setAppInfo, api])

  const handleOpenFile = async () => {
    const result: OpenDialogResult = await api.dialog.openFile({
      title: '选择文件',
      filters: [
        { name: '文本文件', extensions: ['txt', 'md', 'json'] },
        { name: '所有文件', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })
    if (result.canceled === false && result.filePaths.length > 0) {
      setDialogResult(`已选择: ${result.filePaths[0]}`)
    }
  }

  const handleSaveFile = async () => {
    const result: SaveDialogResult = await api.dialog.saveFile({
      title: '保存文件',
      defaultPath: 'untitled.txt',
      filters: [
        { name: '文本文件', extensions: ['txt'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    })
    if (result.canceled === false && result.filePath !== undefined) {
      setDialogResult(`保存路径: ${result.filePath}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-800">Electron App</h1>
        {appInfo && (
          <p className="text-sm text-gray-500 mt-1">
            {appInfo.name}
            {' '}
            v
            {appInfo.version}
            {' '}
            (
            {appInfo.platform}
            )
          </p>
        )}
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">窗口控制</h2>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  void api.app.minimize()
                }}
              >
                最小化
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  void api.app.maximize()
                }}
              >
                最大化
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  void api.app.close()
                }}
              >
                关闭
              </Button>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              文件对话框
            </h2>
            <div className="flex gap-3">
              <Button onClick={() => { void handleOpenFile() }}>打开文件</Button>
              <Button variant="secondary" onClick={() => { void handleSaveFile() }}>
                保存文件
              </Button>
            </div>
            {dialogResult && (
              <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {dialogResult}
              </p>
            )}
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              组件库示例
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
