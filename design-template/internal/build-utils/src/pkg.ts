
import type { ProjectManifest } from '@pnpm/types'

export function getPackageManifest(
  pkgPath: string,
) {
  return require(pkgPath) as ProjectManifest
}

export function getPackageDevpebdencies(
  pkgPath: string,
) {
  const manifest = getPackageManifest(pkgPath)
  const { dependencies = {}, peerDependencies = {} } = manifest

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies),
  }
}


export function excludeFiles(files: string[]) {
  const excludes = ['node_modules', 'test', 'mock', 'gulpfile', 'dist']
  return files.filter(
    (path) => !excludes.some(exclude => path.includes(exclude))
  )
}