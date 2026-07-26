import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = dirname(SCRIPT_DIR)
const DEFAULT_MANIFEST_PATH = resolve(ROOT_DIR, 'catalog', 'local-templates.json')
const RESERVED_DIRECTORIES = new Set(['catalog', 'overlays', 'scripts'])
const TIERS = new Set(['metadata', 'core', 'extended'])

function fail(message) {
  throw new Error(message)
}

function isInside(parent, child) {
  const path = relative(parent, child)

  return path !== '' && !path.startsWith('..') && !isAbsolute(path)
}

export function localTemplateDirectories(rootDir = ROOT_DIR) {
  return readdirSync(rootDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => !entry.name.startsWith('.'))
    .filter(entry => !RESERVED_DIRECTORIES.has(entry.name))
    .map(entry => entry.name)
    .sort()
}

export function loadSmokeManifest(manifestPath = DEFAULT_MANIFEST_PATH) {
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    fail(`Could not parse smoke manifest ${manifestPath}: ${error.message}`)
  }
}

export function validateSmokeManifest(
  manifest,
  { rootDir = ROOT_DIR } = {},
) {
  if (!manifest || manifest.schemaVersion !== 1 || !Array.isArray(manifest.templates)) {
    fail('Smoke manifest must contain schemaVersion 1 and a templates array.')
  }

  const ids = new Set()
  const paths = []

  for (const template of manifest.templates) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(template.id ?? '')) {
      fail(`Invalid smoke template id: ${template.id ?? '<missing>'}`)
    }
    if (ids.has(template.id)) {
      fail(`Duplicate smoke template id: ${template.id}`)
    }
    ids.add(template.id)

    if (typeof template.path !== 'string' || template.path.trim() === '') {
      fail(`${template.id}: path is required.`)
    }
    if (!['node', 'static'].includes(template.kind)) {
      fail(`${template.id}: kind must be node or static.`)
    }
    if (!TIERS.has(template.tier)) {
      fail(`${template.id}: tier must be metadata, core, or extended.`)
    }

    const sourcePath = resolve(rootDir, template.path)
    if (!isInside(rootDir, sourcePath) || !existsSync(sourcePath)) {
      fail(`${template.id}: template path does not exist: ${template.path}`)
    }
    paths.push(template.path)

    if (template.kind === 'node') {
      const packagePath = resolve(sourcePath, 'package.json')
      if (!existsSync(packagePath)) {
        fail(`${template.id}: node template must contain package.json.`)
      }

      const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
      if (template.build && !pkg.scripts?.[template.build]) {
        fail(`${template.id}: package.json is missing scripts.${template.build}.`)
      }
    }
  }

  const expected = localTemplateDirectories(rootDir)
  const actual = [...paths].sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`Smoke manifest must cover every local template. Expected ${expected.join(', ')}; found ${actual.join(', ')}.`)
  }

  return manifest.templates
}

function run(command, args, cwd) {
  const options = {
    cwd,
    stdio: 'inherit',
  }
  let result

  if (process.platform === 'win32') {
    const invocation = [command, ...args]
    if (!invocation.every(value => /^[a-zA-Z0-9._:@/\\=-]+$/.test(value))) {
      fail(`Unsafe package-manager invocation: ${invocation.join(' ')}`)
    }

    result = spawnSync(
      process.env.ComSpec ?? 'cmd.exe',
      ['/d', '/s', '/c', invocation.join(' ')],
      options,
    )
  } else {
    result = spawnSync(command, args, options)
  }

  if (result.error) {
    fail(`Could not run ${command}: ${result.error.message}`)
  }
  if (result.status !== 0) {
    fail(`${command} ${args.join(' ')} failed for ${cwd}.`)
  }
}

function copyTemplate(sourcePath, id) {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'baicie-template-smoke-'))
  const targetPath = resolve(temporaryRoot, id)
  cpSync(sourcePath, targetPath, {
    recursive: true,
    filter: source => basename(source) !== 'node_modules',
  })

  return { temporaryRoot, targetPath }
}

export function runSmoke({
  manifestPath = DEFAULT_MANIFEST_PATH,
  rootDir = ROOT_DIR,
  tier = 'metadata',
  templateId,
  execute = false,
  keep = false,
} = {}) {
  const manifest = loadSmokeManifest(manifestPath)
  const templates = validateSmokeManifest(manifest, { rootDir })
  const selected = templates.filter(template => {
    if (templateId) return template.id === templateId
    if (tier === 'metadata') return true
    return template.tier === tier
  })

  if (selected.length === 0) {
    fail(`No templates selected for tier ${tier}${templateId ? ` and id ${templateId}` : ''}.`)
  }

  for (const template of selected) {
    const sourcePath = resolve(rootDir, template.path)
    const { temporaryRoot, targetPath } = copyTemplate(sourcePath, template.id)

    try {
      if (!existsSync(targetPath)) {
        fail(`${template.id}: copied template was not created.`)
      }

      if (execute && template.kind === 'node') {
        if (template.install) {
          run('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts'], targetPath)
        }
        if (template.build) {
          run('pnpm', ['run', template.build], targetPath)
        }
      }

      console.log(`Smoke passed: ${template.id}`)
    } finally {
      if (!keep) {
        rmSync(temporaryRoot, { recursive: true, force: true })
      }
    }
  }
}

function main() {
  const { values } = parseArgs({
    options: {
      keep: { type: 'boolean', default: false },
      manifest: { type: 'string' },
      run: { type: 'boolean', default: false },
      template: { type: 'string' },
      tier: { type: 'string', default: 'metadata' },
    },
  })

  if (!TIERS.has(values.tier)) {
    fail(`Unknown tier: ${values.tier}`)
  }

  runSmoke({
    manifestPath: values.manifest ? resolve(values.manifest) : DEFAULT_MANIFEST_PATH,
    tier: values.tier,
    templateId: values.template,
    execute: values.run,
    keep: values.keep,
  })
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  try {
    main()
  } catch (error) {
    console.error(`Template smoke error: ${error.message}`)
    process.exitCode = 1
  }
}
