
import { buildOutput, dtRoot, excludeFiles, pkgRoot, projRoot } from '@design-template/build-utils';
import chalk from 'chalk';
import consola from 'consola';
import glob from 'fast-glob';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, dirname } from 'node:path';
import { Project, SourceFile, type CompilerOptions } from 'ts-morph';
import vueCompiler from 'vue/compiler-sfc';
import { pathRewriter } from '../utils';

async function addSourceFiles(project: Project) {
  // 添加额外的部分
  // project.addSourceFileAtPath(
  //   resolve(projRoot, '')
  // )
  const globSourceFile = '**/*.{js?(x),ts?(x),vue}'

  // 获取周边文件
  const filePsths = excludeFiles(
    await glob([globSourceFile, '!design-template/**/*'], {
      cwd: pkgRoot,
      absolute: true,
      onlyFiles: true
    })
  )
  // 获取主要文件 不是绝对路径 需要拼接
  const dtPaths = excludeFiles(
    await glob(globSourceFile, {
      cwd: dtRoot,
      onlyFiles: true
    })
  )

  const sourceFiles: SourceFile[] = []

  await Promise.all([
    ...filePsths.map(async file => {
      if (file.endsWith('.vue')) {
        // 处理components下面的vue文件 大部分来说是的
        const content = await readFile(file, 'utf-8')
        const hasTsNoCheck = content.includes('@ts-nocheck')

        // 解析vue文件
        const sfc = vueCompiler.parse(content)
        const { script, scriptSetup } = sfc.descriptor
        if (scriptSetup || script) {
          // 如果文件有nocheck给script拼接上
          let content =
            (hasTsNoCheck ? '// @ts-nocheck' : '') + (script?.content ?? '')

          // 如果是setup语法糖
          if (scriptSetup) {
            const compild = vueCompiler.compileScript(
              sfc.descriptor,
              {
                id: 'xxx'
              }
            )
            content += compild.content
          }

          const lang = scriptSetup?.lang || script?.lang || 'js'
          const sourceFile = project.createSourceFile(
            // 拼接filepath
            `${resolve(process.cwd(), file)}.${lang}`,
            // 文件内容
            content
          )

          sourceFiles.push(sourceFile)
        }
      } else {
        // 非vue js ts 处理
        const sourceFile = project.addSourceFileAtPath(file)
        sourceFiles.push(sourceFile)
      }
    }),
    ...dtPaths.map(async file => {
      // 读取文件
      const content = await readFile(resolve(dtRoot, file), 'utf-8')
      sourceFiles.push(project.createSourceFile(resolve(dtRoot, file,), content)
      )
    })
  ])

  return sourceFiles
}

async function typeCheck(project: Project) {
  const diagnostics = project.getPreEmitDiagnostics()
  if (diagnostics.length > 0) {
    consola.error(project.formatDiagnosticsWithColorAndContext(diagnostics))
    const err = new Error('failed to type check')
    consola.error(err)
    throw err
  }
}

export async function generateTypesDefinitions() {
  const compilerOptions: CompilerOptions = {
    emitDeclarationOnly: true,
    outDir: resolve(
      buildOutput,
      'types'
    ),
    baseUrl: projRoot,
    preserveSymlinks: true,
    skipLibCheck: true,
    noImplicitAny: true,
  }

  const project = new Project({
    compilerOptions,
    tsConfigFilePath: resolve(
      projRoot, 'tsconfig.web.json'
    ),
    skipAddingFilesFromTsConfig: true,
  })

  const sourceFiles = await addSourceFiles(project)
  consola.success('addSourceFiles')

  typeCheck(project)
  consola.success('typeCheck')

  // 这块开始执行 并且只输出dts文件
  await project.emit({
    emitOnlyDtsFiles: true
  })

  const tasks = sourceFiles.map(async sourceFile => {
    // 返回从第一个路径到第二个路径的相对路径
    const relativePath = relative(pkgRoot, sourceFile.getFilePath())
    consola.trace(
      chalk.yellow(
        `Generating definition for file: ${chalk.bold(relativePath)}`
      )
    )
    // 获取编译器的输出结果
    const emitOutput = sourceFile.getEmitOutput()
    // 获取输出文件列表 OutputFile[]
    const emitFiles = emitOutput.getOutputFiles()
    if (emitFiles.length === 0) {
      throw new Error(`没有输出文件${chalk.bold(relativePath)}`)
    }

    const sunTasks = emitFiles.map(async outputFile => {
      // 获取输出文件的路径
      const filepath = outputFile.getFilePath()
      await mkdir(
        // 获取文件夹名称并且创建
        dirname(filepath), {
        // 递归创建父级
        recursive: true,
      })

      await writeFile(
        filepath,
        pathRewriter('esm')(outputFile.getText()),
        'utf8'
      )

      consola.success(
        chalk.green(
          `Definition for file: ${chalk.bold(relativePath)} generated`
        )
      )
    })

    await Promise.all(sunTasks)
  })

  await Promise.all(tasks)
} 