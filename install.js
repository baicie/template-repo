import { readdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

/**
 * 删除 node_modules 目录
 */
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

/**
 * 检查目录是否应该被排除
 */
function shouldExclude(dir) {
  const excludePatterns = [
    /^\./, // 以点开头的目录（如 .git, .vscode 等）
    'node_modules',
    'dist',
    'build',
    '.next',
    '.nuxt',
    '.output',
    'logs',
    'uploads'
  ]

  return excludePatterns.some(pattern => {
    if (typeof pattern === 'string') {
      return dir === pattern
    }
    return pattern.test(dir)
  })
}

/**
 * 检查目录是否包含 package.json
 */
function hasPackageJson(dirPath) {
  const packageJsonPath = join(dirPath, 'package.json')
  return existsSync(packageJsonPath)
}

/**
 * 在指定目录执行安装命令
 */
function installDependencies(dirPath, dirName) {
  console.log(`\n📦 正在安装 ${dirName} 的依赖...`)

  try {
    const cwd = resolve(dirPath)
    execSync('pnpm install', {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    })
    console.log(`✅ ${dirName} 依赖安装完成`)

    removeNodeModules(dirPath, dirName)
  } catch (error) {
    console.error(`❌ ${dirName} 依赖安装失败:`, error.message)
  }
}

/**
 * 主函数：遍历根目录下的所有项目并安装依赖
 */
function main() {
  console.log('🚀 开始批量安装项目依赖...\n')

  const rootDir = process.cwd()
  const items = readdirSync(rootDir)

  // 过滤出目录且不应该被排除的
  const targetDirs = items
    .map(item => {
      const fullPath = join(rootDir, item)
      try {
        const stat = statSync(fullPath)
        return stat.isDirectory() ? { name: item, path: fullPath } : null
      } catch (error) {
        // 如果无法读取目录信息，跳过
        return null
      }
    })
    .filter(item => {
      return item !== null && !shouldExclude(item.name)
    })

  console.log(`📁 发现 ${targetDirs.length} 个项目目录：`)
  targetDirs.forEach(dir => {
    console.log(`  - ${dir?.name}`)
  })

  let installedCount = 0
  let skippedCount = 0

  // 为每个目录安装依赖
  for (const dir of targetDirs) {
    if (hasPackageJson(dir?.path)) {
      installDependencies(dir?.path, dir?.name)
      installedCount++
    } else {
      console.log(`⏭️  跳过 ${dir?.name}（无 package.json）`)
      skippedCount++
    }
  }

  console.log(`\n🎉 安装完成！`)
  console.log(`📊 统计：安装了 ${installedCount} 个项目（已自动删除 node_modules），跳过了 ${skippedCount} 个项目`)
}

main()