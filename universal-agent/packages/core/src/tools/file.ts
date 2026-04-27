import { tool } from '@openai/agents'
import { z } from 'zod'
import { assertSafePath } from '../guardrails/sandbox'

export function createFileTools(workspace: string) {
  return {
    readFile: tool({
      name: 'read_file',
      description: 'Read the contents of a file from the workspace',
      parameters: z.object({
        path: z.string(),
        lines: z
          .number()
          .optional()
          .describe('Number of lines to read (optional)'),
      }),
      async execute({ path, lines }) {
        assertSafePath(workspace, path)
        const { readFile } = await import('node:fs/promises')
        const content = await readFile(path, 'utf-8')
        if (lines) {
          return content.split('\n').slice(0, lines).join('\n')
        }
        return content
      },
      needsApproval: false,
    }),

    writeFile: tool({
      name: 'write_file',
      description: 'Write content to a file in the workspace',
      parameters: z.object({
        path: z.string(),
        content: z.string(),
      }),
      async execute({ path, content }) {
        assertSafePath(workspace, path)
        const { writeFile, mkdir } = await import('node:fs/promises')
        const { dirname } = await import('node:path')
        await mkdir(dirname(path), { recursive: true })
        await writeFile(path, content, 'utf-8')
        return { success: true, path }
      },
      needsApproval: true,
    }),

    listDir: tool({
      name: 'list_dir',
      description: 'List files and directories in a given path',
      parameters: z.object({
        path: z.string().optional().default('.'),
      }),
      async execute({ path }) {
        const targetPath = path ? assertSafePath(workspace, path) : workspace
        const { readdir } = await import('node:fs/promises')
        const entries = await readdir(targetPath, { withFileTypes: true })
        return entries.map(e => ({
          name: e.name,
          type: e.isDirectory() ? 'directory' : 'file',
        }))
      },
      needsApproval: false,
    }),

    searchFiles: tool({
      name: 'search_files',
      description:
        'Search for text content within files using grep-like pattern',
      parameters: z.object({
        pattern: z.string(),
        path: z.string().optional().default('.'),
      }),
      async execute({ pattern, path }) {
        const targetPath = path ? assertSafePath(workspace, path) : workspace
        const { grepDir } = await import('./grep')
        return grepDir(targetPath, pattern)
      },
      needsApproval: false,
    }),
  }
}
