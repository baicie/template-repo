import { dtPackage, getPackageDevpebdencies } from '@design-template/build-utils';
import { OutputOptions, RollupBuild } from 'rollup';

// 为false时依赖更多
export async function generateExternal(options: { full: boolean }) {
  // 获取依赖
  const { dependencies, peerDependencies } = getPackageDevpebdencies(dtPackage)

  return (id: string) => {
    const packages: string[] = [...peerDependencies]

    if (!options.full) {
      packages.push('@vue', ...dependencies)
    }

    return [...new Set(packages)].some(
      (pkg) => id === pkg || id.startsWith(`${pkg}/`)
    )
  }
}


// 将公用设置写入bundle
export function writeBundles(
  bundle: RollupBuild,
  options: OutputOptions[]
) {
  return Promise.all(options.map(option => bundle.write(option)))
}

export function formatBundleFilename(
  name: string,
  minify: boolean,
  ext: string
) {
  return `${name}${minify ? 'min' : ''}.${ext}`
}