import path from 'node:path';
import { TaskFunction, parallel, series } from 'gulp';
import { run, runTask, withTaskName } from './src';
import { copyFile, mkdir } from 'node:fs/promises';
import { dtOutput } from '@design-template/build-utils';
import Undertaker from 'undertaker'

// export const copyFiles = () =>
//   Promise.all([
//     copyFile(epPackage, path.join(epOutput, 'package.json')),
//     copyFile(
//       path.resolve(projRoot, 'README.md'),
//       path.resolve(epOutput, 'README.md')
//     ),
//     copyFile(
//       path.resolve(projRoot, 'global.d.ts'),
//       path.resolve(epOutput, 'global.d.ts')
//     ),
//   ])

// export const copyTypesDefinitions: TaskFunction = (done) => {
//   const src = path.resolve(buildOutput, 'types', 'packages')
//   const copyTypes = (module: Module) =>
//     withTaskName(`copyTypes:${module}`, () =>
//       copy(src, buildConfig[module].output.path, { recursive: true })
//     )

//   return parallel(copyTypes('esm'), copyTypes('cjs'))(done)
// }

// export const copyFullStyle = async () => {
//   await mkdir(path.resolve(epOutput, 'dist'), { recursive: true })
//   await copyFile(
//     path.resolve(epOutput, 'theme-chalk/index.css'),
//     path.resolve(epOutput, 'dist/index.css')
//   )
// }

// 同步执行
export default series(
  // 在根目录执行pnpm run clean 进程别名clean
  withTaskName('clean', () => run('pnpm run clean')),
  // 创建输出文件夹 并且创建父文件夹
  withTaskName('createOutput', () => mkdir(dtOutput, { recursive: true })),
  // 并行执行
  parallel(
    // 打包es lib
    runTask('buildModules'),
    // 打包两种js 与mjs 全在一个文件中
    runTask('buildFullBundle'),
    // 打包types
    runTask('generateTypesDefinitions')
  )
) as Undertaker.TaskFunction

export * from './src'