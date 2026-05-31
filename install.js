import { readFileSync, readdirSync, statSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const CONCURRENCY = 1
const ALLOW_BUILDS_PLACEHOLDER = 'set this to true or false'

function removeNodeModules(dirPath, dirName) {
  const nodeModulesPath = join(dirPath, 'node_modules')

  if (existsSync(nodeModulesPath)) {
    try {
      rmSync(nodeModulesPath, { recursive: true, force: true })
      console.log(`🗑️  已删除 ${dirName} 的 node_modules`)
    } catch (error) {
      console.warn(`⚠️  删除 ${dirName} 的 node_modules 失败:`, error.message)
    }
  }
}

function shouldExclude(dir) {
  const excludePatterns = [
    /^\./,
    'node_modules',
    'dist',
    'build',
    '.next',
    '.nuxt',
    '.output',
    'logs',
    'uploads',
  ]

  return excludePatterns.some(pattern => {
    if (typeof pattern === 'string') {
      return dir === pattern
    }

    return pattern.test(dir)
  })
}

function hasPackageJson(dirPath) {
  return existsSync(join(dirPath, 'package.json'))
}

function readWorkspaceYaml(dirPath) {
  const workspacePath = join(dirPath, 'pnpm-workspace.yaml')

  if (!existsSync(workspacePath)) {
    return null
  }

  return {
    path: workspacePath,
    content: readFileSync(workspacePath, 'utf8'),
  }
}

function normalizeAllowBuilds(dirPath, dirName) {
  const workspace = readWorkspaceYaml(dirPath)

  if (!workspace || !workspace.content.includes(ALLOW_BUILDS_PLACEHOLDER)) {
    return false
  }

  const nextContent = workspace.content.replaceAll(ALLOW_BUILDS_PLACEHOLDER, 'true')
  writeFileSync(workspace.path, nextContent, 'utf8')
  console.log(`🔧 已将 ${dirName} 的 allowBuilds 占位符改为 true`)

  return true
}

function getPnpmInstallArgs() {
  return ['install']
}

function runCommand(command, args, cwd) {
  return new Promise(resolvePromise => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        FORCE_COLOR: '1',
      },
    })

    child.on('close', code => {
      resolvePromise(code === 0)
    })

    child.on('error', error => {
      console.error(`❌ 命令执行失败: ${command} ${args.join(' ')}`)
      console.error(error.message)
      resolvePromise(false)
    })
  })
}

async function installDependencies(dirPath, dirName) {
  console.log(`\n📦 正在处理 ${dirName}...`)

  const cwd = resolve(dirPath)

  normalizeAllowBuilds(dirPath, dirName)

  console.log(`📥 正在安装 ${dirName} 的依赖...`)
  let installSuccess = await runCommand('pnpm', getPnpmInstallArgs(), cwd)

  if (!installSuccess) {
    console.log(`🔁 ${dirName} 首次安装未通过，尝试批准构建脚本后重试...`)
    await runCommand('pnpm', ['approve-builds', '--all'], cwd)
    installSuccess = await runCommand('pnpm', getPnpmInstallArgs(), cwd)
  }

  if (installSuccess) {
    console.log(`✅ ${dirName} 依赖安装完成`)
    removeNodeModules(dirPath, dirName)

    return {
      dirName,
      success: true,
    }
  }

  console.error(`❌ ${dirName} 依赖安装失败`)

  return {
    dirName,
    success: false,
  }
}

async function runWithConcurrency(tasks, concurrency) {
  const results = []
  const executing = new Set()

  for (const task of tasks) {
    const promise = task().then(result => {
      executing.delete(promise)
      results.push(result)
    })

    executing.add(promise)

    if (executing.size >= concurrency) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)

  return results
}

async function main() {
  console.log('🚀 开始批量安装项目依赖...\n')

  const rootDir = process.cwd()
  const items = readdirSync(rootDir)

  const targetDirs = items
    .map(item => {
      const fullPath = join(rootDir, item)

      try {
        const stat = statSync(fullPath)

        return stat.isDirectory()
          ? {
              name: item,
              path: fullPath,
            }
          : null
      } catch {
        return null
      }
    })
    .filter(item => item !== null && !shouldExclude(item.name))

  console.log(`📁 发现 ${targetDirs.length} 个项目目录：`)

  targetDirs.forEach(dir => {
    console.log(`  - ${dir.name}`)
  })

  const installDirs = []
  let skippedCount = 0

  for (const dir of targetDirs) {
    if (hasPackageJson(dir.path)) {
      installDirs.push(dir)
    } else {
      console.log(`⏭️  跳过 ${dir.name}（无 package.json）`)
      skippedCount++
    }
  }

  const tasks = installDirs.map(dir => {
    return () => installDependencies(dir.path, dir.name)
  })

  const results = await runWithConcurrency(tasks, CONCURRENCY)

  const successCount = results.filter(item => item.success).length
  const failedCount = results.filter(item => !item.success).length

  console.log(`\n🎉 执行完成！`)
  console.log(`📊 统计：成功安装 ${successCount} 个项目，失败 ${failedCount} 个项目，跳过 ${skippedCount} 个项目`)
  console.log(`🧹 成功安装的项目已自动删除 node_modules`)

  if (failedCount > 0) {
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 执行异常:', error)
  process.exit(1)
})
