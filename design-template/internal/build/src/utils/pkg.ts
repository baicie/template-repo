import { PKG_NAME, PKG_PREFIX } from "@design-template/build-constants";
import { Module, buildConfig } from "../build-info";

export function pathRewriter(module: Module) {
  const config = buildConfig[module]

  return (content: string) => {
    content = content.replaceAll(`${PKG_PREFIX}/theme-chalk`, `${PKG_NAME}/theme-chalk`)
    content = content.replaceAll(`${PKG_PREFIX}/`, `${config.bundle.path}`)
    return content
  }
}