import type { MemoryItem } from '../types'

export interface MemoryStore {
  searchRelevant: (query: string) => Promise<MemoryItem[]>
  saveTaskResult: (input: {
    sessionId: string
    input: string
    output: string
  }) => Promise<void>
  addMemory: (memory: MemoryItem) => Promise<void>
  getHistory: (sessionId: string) => Promise<MemoryItem[]>
}

export class InMemoryStore implements MemoryStore {
  private memories: MemoryItem[] = []
  private taskHistory: Map<string, MemoryItem[]> = new Map()

  async searchRelevant(_query: string): Promise<MemoryItem[]> {
    return this.memories.slice(0, 10)
  }

  async saveTaskResult(input: { sessionId: string, input: string, output: string }): Promise<void> {
    const item: MemoryItem = {
      id: `task-${Date.now()}`,
      type: 'task_history',
      content: `Task: ${input.input}\nResult: ${input.output}`,
      createdAt: new Date().toISOString(),
    }
    this.memories.push(item)

    const history = this.taskHistory.get(input.sessionId) || []
    history.push(item)
    this.taskHistory.set(input.sessionId, history)
  }

  async addMemory(memory: MemoryItem): Promise<void> {
    this.memories.push({ ...memory, createdAt: memory.createdAt || new Date().toISOString() })
  }

  async getHistory(sessionId: string): Promise<MemoryItem[]> {
    return this.taskHistory.get(sessionId) || []
  }
}
