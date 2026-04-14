import { describe, it, expect } from 'vitest'

describe('AppInfo interface', () => {
  it('should have required fields', () => {
    const info = {
      name: 'test-app',
      version: '1.0.0',
      platform: 'darwin',
    }
    expect(info.name).toBe('test-app')
    expect(info.version).toBe('1.0.0')
    expect(info.platform).toBe('darwin')
  })
})

describe('ElectronAPI interface', () => {
  it('should have app and dialog namespaces', () => {
    const api = {
      app: {
        getInfo: () => Promise.resolve({ name: '', version: '', platform: '' }),
        minimize: () => Promise.resolve(),
        maximize: () => Promise.resolve(),
        close: () => Promise.resolve(),
      },
      dialog: {
        openFile: options => Promise.resolve({ canceled: true, filePaths: [] }),
        saveFile: options =>
          Promise.resolve({ canceled: true, filePath: undefined }),
      },
    }
    expect(api.app).toBeDefined()
    expect(api.dialog).toBeDefined()
    expect(typeof api.app.getInfo).toBe('function')
    expect(typeof api.app.minimize).toBe('function')
    expect(typeof api.dialog.openFile).toBe('function')
  })
})
