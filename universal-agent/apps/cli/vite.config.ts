import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'node22',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.ts'),
      external: [
        'node:fs',
        'node:fs/promises',
        'node:path',
        'node:child_process',
        'node:url',
        '@agent/core',
        'commander',
        'picocolors',
      ],
    },
  },
})
