import { buildRoot } from '@design-template/build-utils'
import { run } from './process'

import type { TaskFunction } from 'gulp'

export function withTaskName<T extends TaskFunction>(name: string, fn: T) {
  return Object.assign(fn, { displayName: name })
}

export const runTask = (name: string) =>
  withTaskName(`shellTask:${name}`, () =>
    run(`pnpm run start ${name}`, buildRoot)
  )
