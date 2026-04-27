import type { AgentRunState, MemoryStore } from '../types'
import { randomUUID } from 'node:crypto'
import { EventBus } from '../skills'

export interface RunInput {
  input: string
  workspace: string
  sessionId?: string
  mode?: 'chat' | 'task'
}

export interface ToolCallRecord {
  name: string
  input: unknown
  output: unknown
}

export interface RunResult {
  sessionId: string
  finalOutput: string
  toolCalls: ToolCallRecord[]
  usedSkills: string[]
  state: AgentRunState
}

export class AgentRuntime {
  private eventBus: EventBus
  private memoryStore: MemoryStore

  constructor(options: {
    eventBus?: EventBus
    memoryStore: MemoryStore
  }) {
    this.eventBus = options.eventBus || new EventBus()
    this.memoryStore = options.memoryStore
  }

  getEventBus(): EventBus {
    return this.eventBus
  }

  async run(input: RunInput): Promise<RunResult> {
    const sessionId = input.sessionId || randomUUID()
    const toolCalls: ToolCallRecord[] = []

    this.eventBus.emit({ type: 'run.started', sessionId, input: input.input })

    try {
      this.eventBus.emit({ type: 'agent.thinking', sessionId })

      // placeholder: actual implementation composes @openai/agents
      // - select skills
      // - build context
      // - call model
      // - execute tools
      // - return result

      const finalOutput = `[Agent] Received: ${input.input}`

      this.eventBus.emit({ type: 'run.finished', sessionId, output: finalOutput })

      return {
        sessionId,
        finalOutput,
        toolCalls,
        usedSkills: [],
        state: 'finalizing',
      }
    }
    catch (error) {
      this.eventBus.emit({
        type: 'run.failed',
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      })
      return {
        sessionId,
        finalOutput: '',
        toolCalls,
        usedSkills: [],
        state: 'failed',
      }
    }
  }
}
