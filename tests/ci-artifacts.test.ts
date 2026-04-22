import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('github actions workflow exists for CI gating', () => {
  assert.equal(existsSync('.github/workflows/ci.yml'), true)
})

test('ci workflow runs core verification commands', () => {
  const workflow = readFileSync('.github/workflows/ci.yml', 'utf8')

  assert.match(workflow, /npm ci/)
  assert.match(workflow, /npx prisma generate/)
  assert.match(workflow, /npm run lint/)
  assert.match(workflow, /npm run typecheck/)
  assert.match(workflow, /npm test/)
  assert.match(workflow, /npm run build/)
})
