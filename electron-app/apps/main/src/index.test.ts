import { describe, it, expect } from 'vitest'
import { IpcChannels } from '../../../packages/types/src/ipc.ts'

describe('IPC Channels', () => {
  it('should have all expected channels defined in @repo/types', () => {
    expect(IpcChannels.APP_GET_INFO).toBe('app:get-info')
    expect(IpcChannels.APP_MINIMIZE).toBe('app:minimize')
    expect(IpcChannels.APP_MAXIMIZE).toBe('app:maximize')
    expect(IpcChannels.APP_CLOSE).toBe('app:close')
    expect(IpcChannels.DIALOG_OPEN_FILE).toBe('dialog:open-file')
    expect(IpcChannels.DIALOG_SAVE_FILE).toBe('dialog:save-file')
    expect(IpcChannels.FS_READ_FILE).toBe('fs:read-file')
    expect(IpcChannels.FS_WRITE_FILE).toBe('fs:write-file')
  })

  it('should have correct channel count', () => {
    const channels = Object.values(IpcChannels)
    expect(channels).toHaveLength(8)
  })

  it('should be usable as IPC channel keys', () => {
    const channel: string = IpcChannels.APP_GET_INFO
    expect(typeof channel).toBe('string')
    expect(channel).toContain(':')
  })
})
