import { z } from 'zod'

export const AppInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
})

export type AppInfo = z.infer<typeof AppInfoSchema>

export const WindowStateSchema = z.object({
  width: z.number().default(1200),
  height: z.number().default(800),
  x: z.number().optional(),
  y: z.number().optional(),
  isMaximized: z.boolean().default(false),
})

export type WindowState = z.infer<typeof WindowStateSchema>

export const FileFilterSchema = z.object({
  name: z.string(),
  extensions: z.array(z.string()),
})

export type FileFilter = z.infer<typeof FileFilterSchema>
