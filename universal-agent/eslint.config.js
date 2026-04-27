import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import antfu from '@antfu/eslint-config'

const _dirname = dirname(fileURLToPath(import.meta.url))
void _dirname

export default antfu(
  {
    typescript: true,
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug', 'log'] }],
      'no-debugger': 'error',
      'node/prefer-global/process': 'off',
      'prefer-const': 'error',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/temp/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.min.js',
    ],
  },
  {
    files: ['apps/**'],
  },
  {
    files: ['packages/**'],
  },
)
