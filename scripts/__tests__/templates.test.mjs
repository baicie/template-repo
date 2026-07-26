import assert from 'node:assert/strict'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  createTemplate,
  loadCatalog,
  syncCatalog,
} from '../templates.mjs'

function runGit(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
  }).trim()
}

function writeCatalog(root, revision) {
  const catalogDirectory = join(root, 'catalog')
  mkdirSync(catalogDirectory, { recursive: true })
  mkdirSync(join(root, 'overlays', 'demo'), { recursive: true })
  writeFileSync(join(root, 'overlays', 'demo', 'AGENTS.md'), '# Overlay rules\n')

  const catalogPath = join(catalogDirectory, 'templates.json')
  writeFileSync(
    catalogPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        templates: [
          {
            id: 'demo',
            title: 'Demo',
            source: {
              repository: join(root, 'upstream'),
              ref: 'main',
              revision,
            },
            overlay: 'overlays/demo',
          },
        ],
      },
      null,
      2,
    )}\n`,
  )

  return catalogPath
}

function createUpstream(root) {
  const upstream = join(root, 'upstream')
  mkdirSync(upstream, { recursive: true })
  runGit(upstream, ['init', '--initial-branch=main'])
  runGit(upstream, ['config', 'user.email', 'tests@example.com'])
  runGit(upstream, ['config', 'user.name', 'Template tests'])
  writeFileSync(join(upstream, 'README.md'), 'first revision\n')
  runGit(upstream, ['add', 'README.md'])
  runGit(upstream, ['commit', '-m', 'first'])
  const firstRevision = runGit(upstream, ['rev-parse', 'HEAD'])

  writeFileSync(join(upstream, 'README.md'), 'second revision\n')
  runGit(upstream, ['add', 'README.md'])
  runGit(upstream, ['commit', '-m', 'second'])
  const secondRevision = runGit(upstream, ['rev-parse', 'HEAD'])

  return { firstRevision, secondRevision }
}

test('creates a pinned upstream template and applies its overlay', () => {
  const root = mkdtempSync(join(tmpdir(), 'template-catalog-test-'))
  const { firstRevision } = createUpstream(root)
  const catalogPath = writeCatalog(root, firstRevision)
  const targetPath = join(root, 'output')

  const result = createTemplate({
    id: 'demo',
    targetPath,
    catalogPath,
  })

  assert.equal(result.template.id, 'demo')
  assert.equal(
    readFileSync(join(targetPath, 'README.md'), 'utf8').replaceAll('\r\n', '\n'),
    'first revision\n',
  )
  assert.equal(readFileSync(join(targetPath, 'AGENTS.md'), 'utf8'), '# Overlay rules\n')
  assert.equal(readFileSync(join(targetPath, '.template-origin.json'), 'utf8').includes(firstRevision), true)
})

test('sync updates a catalog revision only when requested', () => {
  const root = mkdtempSync(join(tmpdir(), 'template-catalog-sync-test-'))
  const { firstRevision, secondRevision } = createUpstream(root)
  const catalogPath = writeCatalog(root, firstRevision)

  const pending = syncCatalog({ catalogPath })
  assert.deepEqual(pending.map(update => update.revision), [secondRevision])
  assert.equal(loadCatalog(catalogPath).templates[0].source.revision, firstRevision)

  const applied = syncCatalog({ catalogPath, write: true })
  assert.deepEqual(applied.map(update => update.revision), [secondRevision])
  assert.equal(loadCatalog(catalogPath).templates[0].source.revision, secondRevision)
})
