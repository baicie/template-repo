import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['electron-vite'] })],
    build: {
      rollupOptions: {
        external: ['electron'],
        input: {
          index: resolve(__dirname, 'src/index.ts'),
        },
      },
    },
  },
  preload: {
    build: {
      outDir: resolve(__dirname, '../preload/dist'),
      lib: {
        entry: resolve(__dirname, '../preload/src/index.ts'),
        formats: ['cjs'],
      },
      rollupOptions: {
        external: ['electron', /^node:/],
        output: {
          entryFileNames: 'index.cjs',
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, '../renderer'),
    plugins: [react(), tailwindcss()],
    base: './',
    build: {
      outDir: resolve(__dirname, '../renderer/dist'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, '../renderer/index.html'),
        },
      },
    },
  },
})
