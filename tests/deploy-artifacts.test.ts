import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('deployment artifacts exist for VPS packaging', () => {
  assert.equal(existsSync('Dockerfile'), true)
  assert.equal(existsSync('docker-compose.prod.yml'), true)
  assert.equal(existsSync('deploy/nginx.conf'), true)
  assert.equal(existsSync('deploy/Caddyfile'), true)
  assert.equal(existsSync('deploy/.env.production.example'), true)
  assert.equal(existsSync('deploy/systemd/aiproxy-compose.service'), true)
  assert.equal(existsSync('scripts/deploy.sh'), true)
})

test('docker compose production file defines app and caddy services for the Supabase-backed target', () => {
  const compose = readFileSync('docker-compose.prod.yml', 'utf8')

  assert.match(compose, /app:/)
  assert.match(compose, /caddy:/)
  assert.doesNotMatch(compose, /postgres:/)
})

test('caddy config proxies application traffic', () => {
  const caddyConfig = readFileSync('deploy/Caddyfile', 'utf8')

  assert.match(caddyConfig, /reverse_proxy/)
})
