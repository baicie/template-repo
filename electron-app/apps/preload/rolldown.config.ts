import { defineConfig } from 'rolldown'

export default defineConfig({
  input: './src/index.ts',
  output: {
    format: 'cjs',
    dir: './dist',
    entryFileNames: 'index.js',
    codeSplitting: false,
  },
  external: ['electron', /^node:/],
  watch:{
    clearScreen: false,
  }
})
