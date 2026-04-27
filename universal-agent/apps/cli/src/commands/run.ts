import { AgentRuntime, InMemoryStore } from '@agent/core'
import pc from 'picocolors'

export async function runCommand(task: string, options: {
  workspace: string
  model: string
} = { workspace: process.cwd(), model: 'openai/gpt-4.1' }) {
  console.log(pc.blue('Universal Agent'), pc.dim('v0.1.0'))
  console.log()
  console.log(pc.cyan('Task:'), task)
  console.log(pc.cyan('Workspace:'), options.workspace)
  console.log(pc.cyan('Model:'), options.model)
  console.log()

  const runtime = new AgentRuntime({ memoryStore: new InMemoryStore() })

  const eventBus = runtime.getEventBus()

  eventBus.on('run.started', () => console.log(pc.dim('[started]')))
  eventBus.on('agent.thinking', () => process.stdout.write(`${pc.dim('[thinking] ')}`))
  eventBus.on('tool.call.started', e => process.stdout.write(pc.yellow(`[tool:${e.toolName}] `)))
  eventBus.on('tool.call.finished', e => process.stdout.write(pc.green(`[done:${e.toolName}] `)))
  eventBus.on('run.finished', () => console.log(pc.dim('\n[finished]')))
  eventBus.on('run.failed', e => console.error(pc.red('\n[failed]'), e.error))

  const result = await runtime.run({
    input: task,
    workspace: options.workspace,
    mode: 'task',
  })

  console.log()
  console.log(pc.green('Result:'), result.finalOutput)
  console.log()
  console.log(pc.dim(`Session: ${result.sessionId}`))
  console.log(pc.dim(`State: ${result.state}`))
}
