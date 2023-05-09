import { dtRoot, excludeFiles, pkgRoot } from "@design-template/build-utils";
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import glob from 'fast-glob';
import { rollup } from 'rollup';
import VueMacros from 'unplugin-vue-macros/rollup';
import { DesignTemplateAlias } from "../plugins/design-template-alias";
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import { buildConfigEntries, target } from "../build-info";
import { generateExternal, writeBundles } from "../utils";

export async function buildModules() {
  // 输入数组 去除不需要的如node_modules
  const input = excludeFiles(
    await glob('**/*.{js,ts,vue}', {
      cwd: pkgRoot,
      // 绝对路径
      absolute: true,
      // 仅要文件
      onlyFiles: true
    })
  )
  const bundle = await rollup({
    input,
    plugins: [
      DesignTemplateAlias(),
      VueMacros({
        setupComponent: false,
        setupSFC: false,
        plugins: {
          vue: vue({
            isProduction: false,
          }),
          vueJsx: vueJsx()
        }
      }),
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.ts'],
      }),
      commonjs(),
      esbuild({
        sourceMap: true,
        target,
        loaders: {
          '.vue': 'ts',
        },
      }),
    ],
    external: await generateExternal({ full: false }),
    treeshake: true,
  })

  await writeBundles(
    bundle,
    buildConfigEntries.map(([model, config]) => {
      return {
        format: config.format,
        dir: config.output.path,
        exports: model === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: dtRoot,
        sourcemap: true,
        entryFileNames: `[name].${config.ext}`,
      }
    })
  )
}