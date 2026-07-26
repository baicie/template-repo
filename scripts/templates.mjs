import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
} from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = dirname(SCRIPT_DIR)
const DEFAULT_CATALOG_PATH = resolve(ROOT_DIR, 'catalog', 'templates.json')
const COMMIT_SHA = /^[a-f0-9]{40}$/i

function fail(message) {
  throw new Error(message)
}

function isInside(parent, child) {
  const path = relative(parent, child)

  return path !== '' && !path.startsWith('..') && !isAbsolute(path)
}

function resolveCatalogPath(catalogPath = DEFAULT_CATALOG_PATH) {
  return resolve(catalogPath)
}

export function catalogRoot(catalogPath = DEFAULT_CATALOG_PATH) {
  return dirname(dirname(resolveCatalogPath(catalogPath)))
}

export function resolveOverlayPath(catalogPath, overlay) {
  if (!overlay) return null

  const root = catalogRoot(catalogPath)
  const overlayPath = resolve(root, overlay)

  if (!isInside(root, overlayPath)) {
    fail(`Overlay path must stay inside the catalog repository: ${overlay}`)
  }

  return overlayPath
}

export function validateCatalog(catalog, catalogPath = DEFAULT_CATALOG_PATH) {
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.templates)) {
    fail('Catalog must contain schemaVersion 1 and a templates array.')
  }

  const ids = new Set()

  for (const template of catalog.templates) {
    if (!template || typeof template !== 'object') {
      fail('Catalog templates must be objects.')
    }

    if (!/^[a-z0-9][a-z0-9-]*$/.test(template.id ?? '')) {
      fail(`Invalid template id: ${template.id ?? '<missing>'}`)
    }

    if (ids.has(template.id)) {
      fail(`Duplicate template id: ${template.id}`)
    }
    ids.add(template.id)

    if (typeof template.title !== 'string' || template.title.trim() === '') {
      fail(`${template.id}: title is required.`)
    }

    if (
      !template.source ||
      typeof template.source.repository !== 'string' ||
      template.source.repository.trim() === '' ||
      typeof template.source.ref !== 'string' ||
      template.source.ref.trim() === '' ||
      !COMMIT_SHA.test(template.source.revision ?? '')
    ) {
      fail(`${template.id}: source.repository, source.ref, and source.revision are required.`)
    }

    if (template.overlay !== undefined) {
      if (typeof template.overlay !== 'string' || template.overlay.trim() === '') {
        fail(`${template.id}: overlay must be a non-empty path.`)
      }

      const overlayPath = resolveOverlayPath(catalogPath, template.overlay)
      if (!existsSync(overlayPath)) {
        fail(`${template.id}: overlay does not exist: ${template.overlay}`)
      }
    }
  }
}

export function loadCatalog(catalogPath = DEFAULT_CATALOG_PATH) {
  const resolvedPath = resolveCatalogPath(catalogPath)

  if (!existsSync(resolvedPath)) {
    fail(`Catalog does not exist: ${resolvedPath}`)
  }

  let catalog
  try {
    catalog = JSON.parse(readFileSync(resolvedPath, 'utf8'))
  } catch (error) {
    fail(`Could not parse catalog ${resolvedPath}: ${error.message}`)
  }

  validateCatalog(catalog, resolvedPath)
  return catalog
}

function findTemplate(catalog, id) {
  const template = catalog.templates.find(item => item.id === id)
  if (!template) {
    fail(`Unknown template: ${id}`)
  }

  return template
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  })

  if (result.error) {
    fail(`Could not run ${command}: ${result.error.message}`)
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr]
      .filter(Boolean)
      .join('\n')
      .trim()
    fail(`${command} ${args.join(' ')} failed.${details ? `\n${details}` : ''}`)
  }

  return result.stdout ?? ''
}

function copyOverlay(overlayPath, targetPath) {
  for (const entry of readdirSync(overlayPath, { withFileTypes: true })) {
    if (entry.name === '.git') continue

    cpSync(joinPath(overlayPath, entry.name), joinPath(targetPath, entry.name), {
      recursive: true,
      force: true,
    })
  }
}

function joinPath(...segments) {
  return resolve(...segments)
}

function assertSafeTarget(targetPath, force) {
  const target = resolve(targetPath)
  const currentDirectory = resolve(process.cwd())

  if (target === ROOT_DIR || target === currentDirectory) {
    fail('Refusing to create a template over the catalog or current working directory.')
  }

  if (existsSync(target)) {
    if (!force) {
      fail(`Target already exists: ${target}. Use --force to replace it.`)
    }

    rmSync(target, { recursive: true, force: true })
  }

  mkdirSync(dirname(target), { recursive: true })
  return target
}

export function createTemplate({
  id,
  targetPath,
  catalogPath = DEFAULT_CATALOG_PATH,
  force = false,
  skipOverlay = false,
}) {
  const resolvedCatalogPath = resolveCatalogPath(catalogPath)
  const catalog = loadCatalog(resolvedCatalogPath)
  const template = findTemplate(catalog, id)
  const target = assertSafeTarget(targetPath, force)

  try {
    run('git', ['clone', '--filter=blob:none', '--no-checkout', template.source.repository, target])
    run('git', ['-C', target, 'checkout', '--detach', template.source.revision])
    rmSync(joinPath(target, '.git'), { recursive: true, force: true })

    const overlayPath = skipOverlay
      ? null
      : resolveOverlayPath(resolvedCatalogPath, template.overlay)
    if (overlayPath) {
      copyOverlay(overlayPath, target)
    }

    writeFileSync(
      joinPath(target, '.template-origin.json'),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          templateId: template.id,
          source: template.source,
          overlay: skipOverlay ? null : template.overlay ?? null,
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
  } catch (error) {
    rmSync(target, { recursive: true, force: true })
    throw error
  }

  return { template, target }
}

export function remoteRevision(source) {
  const output = run('git', [
    'ls-remote',
    '--exit-code',
    source.repository,
    source.ref,
  ])
  const match = output.match(/^([a-f0-9]{40})\s+/im)

  if (!match) {
    fail(`Could not resolve ${source.ref} from ${source.repository}.`)
  }

  return match[1]
}

export function syncCatalog({
  catalogPath = DEFAULT_CATALOG_PATH,
  write = false,
} = {}) {
  const resolvedCatalogPath = resolveCatalogPath(catalogPath)
  const catalog = loadCatalog(resolvedCatalogPath)
  const revisions = new Map()
  const updates = []

  for (const template of catalog.templates) {
    const key = `${template.source.repository}\u0000${template.source.ref}`
    let revision = revisions.get(key)

    if (!revision) {
      revision = remoteRevision(template.source)
      revisions.set(key, revision)
    }

    if (revision !== template.source.revision) {
      updates.push({
        id: template.id,
        previous: template.source.revision,
        revision,
      })
      template.source.revision = revision
    }
  }

  if (write && updates.length > 0) {
    writeFileSync(resolvedCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
  }

  return updates
}

function printUsage() {
  console.log(`Usage:
  node scripts/templates.mjs list [--catalog <path>]
  node scripts/templates.mjs verify [--catalog <path>]
  node scripts/templates.mjs sync [--write] [--catalog <path>]
  node scripts/templates.mjs create <id> <directory> [--force] [--skip-overlay] [--catalog <path>]`)
}

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      catalog: { type: 'string' },
      force: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      'skip-overlay': { type: 'boolean', default: false },
      write: { type: 'boolean', default: false },
    },
  })

  if (values.help) {
    printUsage()
    return
  }

  const command = positionals[0] ?? 'list'
  const catalogPath = values.catalog ? resolve(values.catalog) : DEFAULT_CATALOG_PATH

  if (command === 'list') {
    const catalog = loadCatalog(catalogPath)
    for (const template of catalog.templates) {
      console.log(`${template.id}\t${template.source.ref}\t${template.source.revision}\t${template.overlay ?? '-'}`)
    }
    return
  }

  if (command === 'verify') {
    const catalog = loadCatalog(catalogPath)
    console.log(`Verified ${catalog.templates.length} upstream template entries.`)
    return
  }

  if (command === 'sync') {
    const updates = syncCatalog({ catalogPath, write: values.write })
    if (updates.length === 0) {
      console.log('All upstream template revisions are current.')
      return
    }

    for (const update of updates) {
      console.log(`${update.id}: ${update.previous} -> ${update.revision}`)
    }

    if (!values.write) {
      process.exitCode = 1
    }
    return
  }

  if (command === 'create') {
    const id = positionals[1]
    const targetPath = positionals[2]
    if (!id || !targetPath) {
      printUsage()
      process.exitCode = 1
      return
    }

    const result = createTemplate({
      id,
      targetPath,
      catalogPath,
      force: values.force,
      skipOverlay: values['skip-overlay'],
    })
    console.log(`Created ${result.template.id} in ${result.target}`)
    return
  }

  printUsage()
  process.exitCode = 1
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  try {
    main()
  } catch (error) {
    console.error(`Template catalog error: ${error.message}`)
    process.exitCode = 1
  }
}
