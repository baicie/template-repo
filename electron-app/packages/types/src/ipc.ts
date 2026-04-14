import { z } from 'zod'

export const IpcChannels = {
  APP_GET_INFO: 'app:get-info',
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  APP_CLOSE: 'app:close',
  DIALOG_OPEN_FILE: 'dialog:open-file',
  DIALOG_SAVE_FILE: 'dialog:save-file',
  FS_READ_FILE: 'fs:read-file',
  FS_WRITE_FILE: 'fs:write-file',
} as const

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels]

export const OpenFileOptionsSchema = z.object({
  title: z.string().optional(),
  filters: z
    .array(
      z.object({
        name: z.string(),
        extensions: z.array(z.string()),
      }),
    )
    .optional(),
  properties: z
    .array(z.enum(['openFile', 'openDirectory', 'multiSelections']))
    .optional(),
})

export type OpenFileOptions = z.infer<typeof OpenFileOptionsSchema>

export const SaveFileOptionsSchema = z.object({
  title: z.string().optional(),
  defaultPath: z.string().optional(),
  filters: z
    .array(
      z.object({
        name: z.string(),
        extensions: z.array(z.string()),
      }),
    )
    .optional(),
})

export type SaveFileOptions = z.infer<typeof SaveFileOptionsSchema>
