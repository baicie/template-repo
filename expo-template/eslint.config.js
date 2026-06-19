import defineConfig from '@antfu/eslint-config'

export default defineConfig(
  {
    react: true,
    typescript: true,
    rules: {
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}', 'scripts/**/*.{js,ts,mjs}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      '.expo/**',
      'assets/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'pnpm-lock.yaml',
    ],
  },
)
