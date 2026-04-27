import { isAbsolute, resolve } from 'node:path'

export class SandboxError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SandboxError'
  }
}

export function assertSafePath(workspace: string, targetPath: string): string {
  let resolved: string
  if (isAbsolute(targetPath)) {
    resolved = targetPath
  } else {
    resolved = resolve(workspace, targetPath)
  }

  const workspaceResolved = resolve(workspace)
  if (!resolved.startsWith(workspaceResolved)) {
    throw new SandboxError(`Path escape is not allowed: ${targetPath}`)
  }

  return resolved
}

const DANGEROUS_PATTERNS = [
  /rm\s+-rf/i,
  /git\s+reset\s+--hard/i,
  /curl\s+(?:\S.*)?-X\s+DELETE/i,
  /npm\s+publish/i,
  /:\/\/localhost.*delete/i,
]

const DANGEROUS_COMMANDS = ['sudo rm', 'dd if=', 'mkfs', ':(){ :|:& };:']

export function assertSafeCommand(command: string): void {
  if (DANGEROUS_PATTERNS.some(p => p.test(command))) {
    throw new SandboxError(`Dangerous command detected: ${command}`)
  }
  if (DANGEROUS_COMMANDS.some(c => command.includes(c))) {
    throw new SandboxError(`Dangerous command detected: ${command}`)
  }
}

export function assertSafeUrl(url: string): void {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new SandboxError(`Invalid protocol: ${parsed.protocol}`)
    }
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0']
    if (blocked.includes(parsed.hostname)) {
      throw new SandboxError(
        `Access to internal hosts is not allowed: ${parsed.hostname}`,
      )
    }
  } catch (e) {
    if (e instanceof SandboxError) throw e
    throw new SandboxError(`Invalid URL: ${url}`)
  }
}
