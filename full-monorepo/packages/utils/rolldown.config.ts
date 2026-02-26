import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
      },
      {
        dir: 'dist/esm',
        format: 'esm',
      },
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/types',
        format: 'esm',
      },
    ],
    plugins: [
      dts({
        tsconfig: 'tsconfig.json',
        emitDtsOnly: true,
      }),
    ]
  }
]);
