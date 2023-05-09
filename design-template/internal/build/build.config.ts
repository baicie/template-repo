import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  // Generates .d.ts declaration file
  declaration: true,
  rollup: {
    emitCJS: true,
  }
})