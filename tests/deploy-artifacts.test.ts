import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('deployment artifacts exist for VPS packaging', () => {
  assert.equal(existsSync('Dockerfile'), true)
  assert.equal(existsSync('docker-compose.prod.yml'), true)
  assert.equal(existsSync('deploy/nginx.conf'), true)
  assert.equal(existsSync('deploy/.env.production.example'), true)
  assert.equal(existsSync('deploy/systemd/aiproxy-compose.service'), true)
  assert.equal(existsSync('scripts/deploy.sh'), true)
})

test('docker compose production file defines app and nginx services for the Supabase-backed target', () => {
  const compose = readFileSync('docker-compose.prod.yml', 'utf8')

  assert.match(compose, /app:/)
  assert.match(compose, /nginx:/)
  assert.doesNotMatch(compose, /postgres:/)
})

test('nginx config proxies application traffic and exposes health endpoint support', () => {
  const nginxConfig = readFileSync('deploy/nginx.conf', 'utf8')

  assert.match(nginxConfig, /proxy_pass/)
  assert.match(nginxConfig, /\/api\/health/)
})
