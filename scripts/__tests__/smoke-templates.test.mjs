import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  loadSmokeManifest,
  localTemplateDirectories,
  validateSmokeManifest,
} from '../smoke-templates.mjs'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const manifestPath = resolve(rootDir, 'catalog', 'local-templates.json')

test('the smoke manifest covers every local template', () => {
  const manifest = loadSmokeManifest(manifestPath)
  const templates = validateSmokeManifest(manifest, { rootDir })

  assert.deepEqual(
    templates.map(template => template.path).sort(),
    localTemplateDirectories(rootDir),
  )
})
