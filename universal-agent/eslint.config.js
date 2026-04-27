import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import antfu from '@antfu/eslint-config'

const _dirname = dirname(fileURLToPath(import.meta.url))
void _dirname

export default antfu(
  {
    typescript: true,
    rules: {
      'no-console': [
        'warn',
        { allow: ['warn', 'error', 'info', 'debug', 'log'] },
      ],
      'no-debugger': 'error',
      'node/prefer-global/process': 'off',
      'prefer-const': 'error',
      // Disable stylistic rules — Prettier owns all formatting
      '@stylistic/function-parentheses': 'off',
      '@stylistic/brace-style': 'off',
      '@typescript-eslint/brace-style': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/function-paren-style': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/quotes': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/member-delimiter-style': 'off',
      'antfu/if-newline': 'off',
      'antfu/consistent-list-newline': 'off',
      'antfu/brace-style': 'off',
      'style/brace-style': 'off',
      'style/arrow-parens': 'off',
      'style/member-delimiter-style': 'off',
      'style/operator-linebreak': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
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
