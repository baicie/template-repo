import { describe, expect, it } from 'vitest'
import { AgentRuntime } from '.'
import { InMemoryStore } from '../memory'

describe('agentRuntime', () => {
  it('should create a runtime instance', () => {
    const runtime = new AgentRuntime({ memoryStore: new InMemoryStore() })
    expect(runtime).toBeDefined()
  })

  it('should run and return result', async () => {
    const runtime = new AgentRuntime({ memoryStore: new InMemoryStore() })
    const result = await runtime.run({
      input: 'hello',
      workspace: '/tmp',
    })
    expect(result.sessionId).toBeDefined()
    expect(result.finalOutput).toContain('hello')
  })

  it('should emit events', async () => {
    const runtime = new AgentRuntime({ memoryStore: new InMemoryStore() })
    const events: string[] = []
    runtime.getEventBus().on('run.started', () => events.push('started'))
    runtime.getEventBus().on('run.finished', () => events.push('finished'))

    await runtime.run({ input: 'test', workspace: '/tmp' })
    expect(events).toContain('started')
    expect(events).toContain('finished')
  })
})
