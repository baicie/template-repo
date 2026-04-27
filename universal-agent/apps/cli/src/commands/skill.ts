import { readdir } from 'node:fs/promises'
import { Command } from 'commander'
import pc from 'picocolors'

const listCommand = new Command('list')
  .description('List all available skills')
  .action(async () => {
    try {
      const entries = await readdir('./skills', { withFileTypes: true })
      const skills = entries.filter(e => e.isDirectory())

      if (skills.length === 0) {
        console.log(pc.dim('No skills found in ./skills'))
        return
      }

      console.log(pc.green('Available skills:'))
      for (const skill of skills) {
        console.log(`  ${pc.cyan(skill.name)}`)
      }
      console.log()
      console.log(pc.dim(`Total: ${skills.length} skill(s)`))
    }
    catch (error) {
      console.error(pc.red('Error listing skills:'), error instanceof Error ? error.message : String(error))
    }
  })

export const skillCommand = new Command('skill')
  .description('Manage skills')
  .addCommand(listCommand)
