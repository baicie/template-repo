import type { Plugin } from 'rollup'
import { PKG_NAME, PKG_PREFIX } from '@design-template/build-constants';

export function DesignTemplateAlias(): Plugin {
  const themcChalk = `theme-chalk`
  const sourceThemeChalk = `${PKG_PREFIX}/${themcChalk}` as const
  const bundleThemeChalk = `${PKG_NAME}/${themcChalk}` as const

  return {
    name: 'design-template-alias-plugin',
    resolveId(id) {
      if (!id.startsWith(sourceThemeChalk)) return
      return {
        id: id.replaceAll(sourceThemeChalk, bundleThemeChalk),
        external: 'absolute'
      }
    }
  }
}