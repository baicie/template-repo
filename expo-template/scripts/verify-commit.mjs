import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'

const commitMessagePath = process.argv[2] ?? '.git/COMMIT_EDITMSG'

if (!existsSync(commitMessagePath)) {
  process.exit(0)
}

const message = readFileSync(commitMessagePath, 'utf8').trim()
const pattern
  = /^(?:feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(?:\(.+\))?: .{1,72}$/

if (!pattern.test(message)) {
  console.error(
    'Invalid commit message. Use Conventional Commits, e.g. feat(app): add login',
  )
  process.exit(1)
}
