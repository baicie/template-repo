import { describe, it, expect } from 'vitest'
import {
  IpcChannels,
  OpenFileOptionsSchema,
  SaveFileOptionsSchema,
} from '../src/ipc.ts'

describe('IpcChannels', () => {
  it('should have all expected channel values', () => {
    expect(IpcChannels.APP_GET_INFO).toBe('app:get-info')
    expect(IpcChannels.APP_MINIMIZE).toBe('app:minimize')
    expect(IpcChannels.APP_MAXIMIZE).toBe('app:maximize')
    expect(IpcChannels.APP_CLOSE).toBe('app:close')
    expect(IpcChannels.DIALOG_OPEN_FILE).toBe('dialog:open-file')
    expect(IpcChannels.DIALOG_SAVE_FILE).toBe('dialog:save-file')
    expect(IpcChannels.FS_READ_FILE).toBe('fs:read-file')
    expect(IpcChannels.FS_WRITE_FILE).toBe('fs:write-file')
  })
})

describe('OpenFileOptionsSchema', () => {
  it('should validate empty object', () => {
    const result = OpenFileOptionsSchema.parse({})
    expect(result).toEqual({})
  })

  it('should validate with all fields', () => {
    const input = {
      title: 'Open File',
      filters: [{ name: 'Images', extensions: ['png', 'jpg'] }],
      properties: ['openFile', 'multiSelections'],
    }
    const result = OpenFileOptionsSchema.parse(input)
    expect(result).toEqual(input)
  })

  it('should reject invalid property', () => {
    expect(() =>
      OpenFileOptionsSchema.parse({ properties: ['invalidProperty'] }),
    ).toThrow()
  })
})

describe('SaveFileOptionsSchema', () => {
  it('should validate empty object', () => {
    const result = SaveFileOptionsSchema.parse({})
    expect(result).toEqual({})
  })

  it('should validate with all fields', () => {
    const input = {
      title: 'Save File',
      defaultPath: '/path/to/file.txt',
      filters: [{ name: 'Text', extensions: ['txt'] }],
    }
    const result = SaveFileOptionsSchema.parse(input)
    expect(result).toEqual(input)
  })

  it('should reject invalid title type', () => {
    expect(() => SaveFileOptionsSchema.parse({ title: 123 })).toThrow()
  })
})
