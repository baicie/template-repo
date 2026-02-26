import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

const external = ['react', 'react-dom', 'react/jsx-runtime'];

export default defineConfig([
  {
    input: 'src/index.tsx',
    external,
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
    input: 'src/index.tsx',
    external,
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
    ],
  }
]);
