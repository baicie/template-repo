import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function grepDir(
  dir: string,
  pattern: string,
  depth = 3,
): Promise<string> {
  const results: string[] = []
  const maxFiles = 50
  let fileCount = 0

  async function walk(currentDir: string, currentDepth: number) {
    if (currentDepth > depth || fileCount >= maxFiles) return

    try {
      const entries = await readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules')
          continue
        const fullPath = join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await walk(fullPath, currentDepth + 1)
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop() || ''
          if (
            ![
              'ts',
              'js',
              'json',
              'md',
              'yaml',
              'yml',
              'txt',
              'html',
              'css',
            ].includes(ext)
          ) {
            continue
          }
          fileCount++
          try {
            const content = await readFile(fullPath, 'utf-8')
            const lines = content.split('\n')
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(pattern)) {
                results.push(`${fullPath}:${i + 1}: ${lines[i].trim()}`)
              }
            }
          } catch {
            // skip unreadable files
          }
        }
      }
    } catch {
      // skip inaccessible directories
    }
  }

  await walk(dir, 0)
  return results.length > 0 ? results.join('\n') : 'No matches found.'
}
