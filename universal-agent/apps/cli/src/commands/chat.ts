import { AgentRuntime, InMemoryStore } from '@agent/core'
import pc from 'picocolors'

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧']

export async function chatCommand(prompt?: string, options: {
  workspace: string
  model: string
} = { workspace: process.cwd(), model: 'openai/gpt-4.1' }) {
  const runtime = new AgentRuntime({ memoryStore: new InMemoryStore() })

  const eventBus = runtime.getEventBus()

  let spinnerIndex = 0
  const spinner = setInterval(() => {
    process.stdout.write(`\r${pc.cyan(SPINNER[spinnerIndex++ % SPINNER.length])} Agent is thinking... `)
  }, 100)

  eventBus.on('run.started', () => {
    clearInterval(spinner)
    process.stdout.write('\r')
    console.log(pc.green('Agent:'), pc.dim('Starting...'))
  })

  eventBus.on('agent.thinking', () => {
    process.stdout.write(`\r${pc.cyan('Thinking...')}`)
  })

  eventBus.on('tool.call.started', (event) => {
    process.stdout.write(`\r${pc.yellow(`Tool: ${event.toolName}`)}`)
  })

  eventBus.on('run.finished', () => {
    process.stdout.write('\r')
  })

  try {
    const input = prompt || ''
    if (!input) {
      console.log(pc.dim('No prompt provided. Exiting.'))
      return
    }

    const result = await runtime.run({
      input,
      workspace: options.workspace,
      mode: 'chat',
    })

    clearInterval(spinner)
    process.stdout.write('\r')
    console.log()
    console.log(pc.green('Agent:'), result.finalOutput)
    console.log(pc.dim(`Session: ${result.sessionId}`))
  }
  catch (error) {
    clearInterval(spinner)
    process.stdout.write('\r')
    console.error(pc.red('Error:'), error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
