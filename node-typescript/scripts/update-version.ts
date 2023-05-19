import path from 'node:path'
import { fileURLToPath } from 'node:url'
import consola from 'consola'
import chalk from 'chalk'
import { findWorkspacePackages } from '@pnpm/find-workspace-packages'
import type { Project } from '@pnpm/find-workspace-packages'
import { version } from '../packages/cli/version'
import {} from '@baicie/cli'

export const projectRoot = path.resolve(fileURLToPath(import.meta.url), '..', '..')
const getWorkspacePackages = () => findWorkspacePackages(projectRoot)

function errorAndExit(err: Error): never {
  consola.error(err)
  process.exit(1)
}

async function main() {
  if (!version) {
    errorAndExit(
      new Error('No version'),
    )
  }

  consola.log(chalk.cyan(`$new version: ${version}`))

  consola.debug(chalk.yellow('Updating package.json for @baicie/cli'))

  const pkgs = Object.fromEntries(
    (await getWorkspacePackages()).map(pkg => [pkg.manifest.name!, pkg]),
  )

  const BaicieCli = pkgs['@baicie/cli']

  const writeVersion = async (project: Project) => {
    await project.writeProjectManifest({
      ...project.manifest,
      version,
    })
  }

  try {
    await writeVersion(BaicieCli)
  }
  catch (error) {
    errorAndExit(error as Error)
  }

  consola.success(chalk.green(`package @baicie/cli updated successfully to version ${version}`))
}

main()
