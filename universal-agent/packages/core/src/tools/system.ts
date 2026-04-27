import { tool } from '@openai/agents'
import { z } from 'zod'

export function createSystemTools() {
  return {
    runCommand: tool({
      name: 'run_command',
      description: 'Run a shell command in the workspace',
      parameters: z.object({
        command: z.string(),
        cwd: z.string().optional(),
      }),
      async execute({ command, cwd }) {
        const { exec } = await import('node:child_process')
        return new Promise((resolve) => {
          exec(command, { cwd, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            resolve({
              stdout,
              stderr,
              success: !error,
              error: error?.message,
            })
          })
        })
      },
      needsApproval: true,
    }),

    httpGet: tool({
      name: 'http_get',
      description: 'Make an HTTP GET request',
      parameters: z.object({
        url: z.string().url(),
      }),
      async execute({ url }) {
        const { exec } = await import('node:child_process')
        return new Promise((resolve) => {
          exec(`curl -s "${url}"`, { maxBuffer: 5 * 1024 * 1024 }, (error, stdout, stderr) => {
            resolve({
              content: stdout,
              error: stderr || error?.message,
              success: !error,
            })
          })
        })
      },
      needsApproval: true,
    }),
  }
}
