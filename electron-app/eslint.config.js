import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import defineConfig from '@antfu/eslint-config'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DOMGlobals = ['window', 'document', 'navigator', 'location', 'fetch']
const NodeGlobals = ['module', 'require', '__dirname', '__filename']

const ignores = [
  '**/dist/',
  '**/temp/',
  '**/coverage/',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '.idea/',
  '*.md',
  '**/vite.config.ts',
  '**/electron.vite.config.ts',
  '**/vitest.config.ts',
  'dts-build/packages',
  'playground',
  'node_modules',
  '.docs/**',
]

export default defineConfig(
  {
    typescript: {
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    },
    rules: {
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // Electron main process
  {
    name: 'electron-main',
    files: ['apps/main/**/*.{ts,tsx}'],
    rules: {
      // 禁止 DOM globals，但允许 Node.js globals 和 process
      'no-restricted-globals': ['error', ...DOMGlobals],
      'no-console': 'off',
    },
  },

  // Electron preload scripts
  {
    name: 'electron-preload',
    files: ['apps/preload/**/*.{ts,tsx}'],
    rules: {
      // Preload 脚本允许使用 window（contextBridge fallback）
      'no-restricted-globals': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // React renderer process
  {
    name: 'electron-renderer',
    files: ['apps/renderer/**/*.{ts,tsx}'],
    rules: {
      // 禁止 Node.js globals，允许 DOM globals
      'no-restricted-globals': ['error', ...NodeGlobals],
      'no-console': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  // React component library
  {
    name: 'ui-library',
    files: ['packages/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': ['error', ...NodeGlobals],
      'no-console': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },

  // Pure types package
  {
    name: 'types-package',
    files: ['packages/types/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-restricted-globals': ['error', ...DOMGlobals, ...NodeGlobals],
    },
  },

  // Ignores last
  {
    ignores,
  },
)
