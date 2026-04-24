import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('production env example targets runtime-backed deployment config', () => {
  const source = readFileSync('deploy/.env.production.example', 'utf8')

  assert.match(source, /^DATABASE_URL=/m)
  assert.match(source, /^SESSION_SECRET=/m)
  assert.match(source, /^APP_URL=/m)
  assert.match(source, /^RUNTIME_MODE=/m)
  assert.match(source, /^APP_DOMAIN=/m)
  assert.doesNotMatch(source, /^OPENAI_API_KEY=/m)
})

test('root env example documents PostgreSQL and Supabase as the intended deployment target', () => {
  const source = readFileSync('.env.example', 'utf8')

  assert.match(source, /Supabase/i)
  assert.match(source, /PostgreSQL/i)
  assert.match(source, /^DATABASE_URL=/m)
})

test('production compose targets app and caddy without local postgres', () => {
  const source = readFileSync('docker-compose.prod.yml', 'utf8')

  assert.match(source, /^\s*app:/m)
  assert.match(source, /^\s*caddy:/m)
  assert.doesNotMatch(source, /^\s*postgres:/m)
  assert.match(source, /deploy\/.env\.production/)
})

test('deploy script pulls code and runs docker compose', () => {
  const source = readFileSync('scripts/deploy.sh', 'utf8')

  assert.match(source, /git pull/)
  assert.match(source, /docker compose -f docker-compose\.prod\.yml up -d --build/)
  assert.match(source, /health/)
})

test('deploy runbook documents Supabase setup and local verification before deploy', () => {
  const source = readFileSync('docs/runbooks/deploy.md', 'utf8')

  assert.match(source, /Supabase/i)
  assert.match(source, /DATABASE_URL/)
  assert.match(source, /local verification/i)
  assert.match(source, /deploy\/.env\.production/i)
})

test('smoke-test runbook documents the runtime-backed activation funnel', () => {
  const source = readFileSync('docs/runbooks/smoke-test.md', 'utf8')

  assert.match(source, /log in/i)
  assert.match(source, /dashboard/i)
  assert.match(source, /connect provider/i)
  assert.match(source, /tenant key/i)
  assert.match(source, /first successful runtime-backed request/i)
  assert.match(source, /\/api\/health/)
  assert.match(source, /\/api\/ready/)
})
