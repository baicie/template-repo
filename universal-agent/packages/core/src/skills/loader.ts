import type { Skill } from '../types'

export class EventBus {
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map()

  on<T extends { type: string }>(
    type: T['type'],
    handler: (event: T) => void,
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(handler as (...args: unknown[]) => void)
  }

  off<T extends { type: string }>(
    type: T['type'],
    handler: (event: T) => void,
  ): void {
    this.listeners.get(type)?.delete(handler as (...args: unknown[]) => void)
  }

  emit<T extends { type: string }>(event: T): void {
    this.listeners.get(event.type)?.forEach((handler) => {
      try {
        handler(event)
      }
      catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error)
      }
    })
  }

  removeAllListeners(): void {
    this.listeners.clear()
  }
}

export class SkillLoader {
  constructor(private skillsDir: string) {}

  async loadAll(): Promise<Skill[]> {
    const { readdir, readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')

    const skills: Skill[] = []
    const entries = await readdir(this.skillsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory())
        continue
      const skillPath = join(this.skillsDir, entry.name, 'SKILL.md')
      try {
        const content = await readFile(skillPath, 'utf-8')
        const skill = this.parseSkillMd(content, entry.name)
        skills.push(skill)
      }
      catch {
        // skip files without SKILL.md
      }
    }

    return skills
  }

  async load(name: string): Promise<Skill | null> {
    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const skillPath = join(this.skillsDir, name, 'SKILL.md')
    try {
      const content = await readFile(skillPath, 'utf-8')
      return this.parseSkillMd(content, name)
    }
    catch {
      return null
    }
  }

  private parseSkillMd(content: string, name: string): Skill {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    const body = frontmatterMatch ? content.replace(frontmatterMatch[0], '').trim() : content

    const metadata: Record<string, unknown> = {}
    if (frontmatterMatch) {
      for (const line of frontmatterMatch[1].split('\n')) {
        const [key, ...rest] = line.split(':')
        if (key && rest.length > 0) {
          const value = rest.join(':').trim()
          if (value.startsWith('[')) {
            metadata[key.trim()] = value
              .slice(1, -1)
              .split(',')
              .map(s => s.trim())
          }
          else {
            metadata[key.trim()] = value.replace(/^["']|["']$/g, '')
          }
        }
      }
    }

    return {
      name: metadata.name as string || name,
      description: metadata.description as string || '',
      triggers: (metadata.triggers as string[]) || [],
      permissions: (metadata.permissions as string[]) || [],
      tools: (metadata.tools as string[]) || [],
      content: body,
    }
  }
}

export class SkillRegistry {
  private skills: Skill[] = []
  private loader: SkillLoader

  constructor(skillsDir: string) {
    this.loader = new SkillLoader(skillsDir)
  }

  async loadAll(): Promise<void> {
    this.skills = await this.loader.loadAll()
  }

  async select(input: string): Promise<Skill[]> {
    const keywords = input.toLowerCase().split(/\s+/)
    return this.skills.filter((skill) => {
      if (skill.triggers.some(t => keywords.includes(t.toLowerCase())))
        return true
      if (skill.description.toLowerCase().includes(input.toLowerCase()))
        return true
      return false
    })
  }

  getAll(): Skill[] {
    return [...this.skills]
  }
}
