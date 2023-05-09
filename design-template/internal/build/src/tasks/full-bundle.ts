import { PKG_BRAND_NAME, PKG_CAMELCASE_LOCAL_NAME, PKG_CAMLCASE_NAME } from '@design-template/build-constants';
import { dtOutput, dtRoot, localeRoot } from "@design-template/build-utils";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import glob from 'fast-glob';
import { parallel } from "gulp";
import { basename, resolve } from 'node:path';
import { rollup, type Plugin } from "rollup";
import esbuild, { minify as minifyPlugin } from 'rollup-plugin-esbuild';
import VueMacros from 'unplugin-vue-macros/rollup';
import { version } from '../../../../packages/design-template/version';
import { target } from "../build-info";
import { camelCase, upperFirst } from 'lodash';
import { DesignTemplateAlias } from "../plugins/design-template-alias";
import { formatBundleFilename, generateExternal, withTaskName, writeBundles } from "../utils";

const banner = `/*! ${PKG_BRAND_NAME} v${version} */\n`
// 打包主项目
async function buildFullEntry(minify: boolean) {
  const plugins: Plugin[] = [
    DesignTemplateAlias(),
    VueMacros({
      setupComponent: false,
      setupSFC: false,
      plugins: {
        vue: vue({
          isProduction: true,
        }),
        vueJsx: vueJsx(),
      },
    }),
    nodeResolve({
      extensions: ['.mjs', '.js', '.json', '.ts'],
    }),
    commonjs(),
    esbuild({
      exclude: [],
      sourceMap: minify,
      target,
      loaders: {
        // 将.vue文件映射到ts加载器
        '.vue': 'ts',
      },
      define: {
        // 设置为生产环境
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      treeShaking: true,
      // 保留文件末尾的注释
      legalComments: 'eof'
    })
  ];
  // 开启压缩
  if (minify) {
    plugins.push(
      minifyPlugin({
        target,
        sourceMap: true
      })
    )
  }

  const bundle = await rollup({
    input: resolve(dtRoot, 'index.ts'),
    plugins,
    // 指定哪些模块应该被认为是外部依赖
    external: await generateExternal({ full: true }),
    treeshake: true
  })

  await writeBundles(bundle, [
    {
      format: 'umd',
      file: resolve(
        dtOutput,
        'dist',
        formatBundleFilename('index.full', minify, 'js')
      ),
      // 具名导出
      exports: 'named',
      name: PKG_CAMLCASE_NAME,
      globals: {
        vue: 'Vue',
      },
      sourcemap: minify,
      banner
    },
    {
      format: 'esm',
      file: resolve(
        dtOutput,
        'dist',
        formatBundleFilename('index.full', minify, 'mjs')
      ),
      sourcemap: minify,
      banner,
    }
  ])
}

// 打包国际化
async function buildFullLocale(minify: boolean) {
  const files = await glob(`**/*.ts`, {
    cwd: resolve(localeRoot, 'lang'),
    absolute: true
  })

  return Promise.all(
    files.map(async file => {
      const filename = basename(file, '.ts');
      // 驼峰后首字母大写AbCd
      const name = upperFirst(camelCase(filename))

      const bundle = await rollup({
        input: file,
        plugins: [
          esbuild({
            minify,
            sourceMap: minify,
            target
          })
        ]
      })

      await writeBundles(bundle, [
        {
          format: 'umd',
          file: resolve(
            dtOutput,
            'dist/locale',
            formatBundleFilename(filename, minify, 'js'),
          ),
          exports: 'default',
          name: `${PKG_CAMELCASE_LOCAL_NAME}${name}`,
          sourcemap: minify,
          banner
        },
        {
          format: 'esm',
          file: resolve(
            dtOutput,
            'dist/locale',
            formatBundleFilename(filename, minify, 'mjs'),
          ),
          sourcemap: minify,
          banner
        }
      ])
    })
  )
}



export const buildFull = (minify: boolean) => async () =>
  Promise.all([buildFullEntry(minify), buildFullLocale(minify)])


export const buildFullBundle = parallel(
  // 打包cjs与mjs 且最小化 加上map
  withTaskName('buildFullMinified', buildFull(true)),
  // 打包cjs与mjs 
  withTaskName('buildFull', buildFull(false))
)