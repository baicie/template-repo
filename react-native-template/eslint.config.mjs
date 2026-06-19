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
    files: [
      '*.config.{js,mjs,ts}',
      'babel.config.js',
      'index.js',
      'metro.config.js',
      'scripts/**/*.{js,ts,mjs}',
    ],
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
      '.bundle/**',
      'android/**',
      'coverage/**',
      'ios/**',
      'node_modules/**',
      'pnpm-lock.yaml',
    ],
  },
)
