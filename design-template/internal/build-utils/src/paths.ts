import { resolve } from 'node:path';

// 各种根目录 
export const projRoot = resolve(__dirname, '..', '..', '..')
// 包目录
export const pkgRoot = resolve(projRoot, 'packages')
// 打包程序
export const buildRoot = resolve(projRoot, 'internal', 'build')
// 主项目目录
export const dtRoot = resolve(pkgRoot, 'design-template')
// 国际化根目录
export const localeRoot = resolve(pkgRoot, 'locale')


/** `/dist` */
export const buildOutput = resolve(projRoot, 'dist')
/** `/dist/element-plus` */
export const dtOutput = resolve(buildOutput, 'design-template')



// package
export const dtPackage = resolve(dtRoot, 'package.json')