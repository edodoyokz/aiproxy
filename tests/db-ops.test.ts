import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('database backup and restore scripts exist', () => {
  assert.equal(existsSync('scripts/db-backup.sh'), true)
  assert.equal(existsSync('scripts/db-restore.sh'), true)
})

test('database runbook exists', () => {
  assert.equal(existsSync('docs/runbooks/database.md'), true)
})

test('seed script requires explicit demo mode before creating sample data', () => {
  const seed = readFileSync('prisma/seed.ts', 'utf8')
  assert.match(seed, /DEMO_SEED_ENABLED/)
})

test('database runbook documents migration deploy flow', () => {
  const runbook = readFileSync('docs/runbooks/database.md', 'utf8')
  assert.match(runbook, /db:migrate:deploy/)
})

test('backup and restore scripts use postgres tooling', () => {
  const backupScript = readFileSync('scripts/db-backup.sh', 'utf8')
  const restoreScript = readFileSync('scripts/db-restore.sh', 'utf8')

  assert.match(backupScript, /pg_dump/)
  assert.match(restoreScript, /psql/)
})
