import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('runtime-aware health surfaces exist', () => {
  assert.equal(existsSync('src/app/api/health/route.ts'), true)
  assert.equal(existsSync('src/app/api/ready/route.ts'), true)
  assert.equal(existsSync('src/lib/runtime-health.ts'), true)
})

test('logger utility exists for runtime-aware structured logs', () => {
  assert.equal(existsSync('src/lib/logger.ts'), true)

  const loggerSource = readFileSync('src/lib/logger.ts', 'utf8')
  assert.match(loggerSource, /runtime/i)
  assert.match(loggerSource, /workspaceId/)
})

test('operations runbooks exist for deploy, rollback, incidents, and smoke tests', () => {
  assert.equal(existsSync('docs/runbooks/deploy.md'), true)
  assert.equal(existsSync('docs/runbooks/rollback.md'), true)
  assert.equal(existsSync('docs/runbooks/incidents.md'), true)
  assert.equal(existsSync('docs/runbooks/smoke-test.md'), true)
})

test('health endpoint mentions runtime integration and control plane status', () => {
  const healthRoute = readFileSync('src/app/api/health/route.ts', 'utf8')
  const runtimeHealth = readFileSync('src/lib/runtime-health.ts', 'utf8')

  assert.match(healthRoute, /getRuntimeHealthSnapshot/)
  assert.match(runtimeHealth, /controlPlane/)
  assert.match(runtimeHealth, /runtimeIntegration/)
})

test('readiness endpoint mentions workspace runtime readiness rather than direct provider secrets', () => {
  const readyRoute = readFileSync('src/app/api/ready/route.ts', 'utf8')
  const runtimeHealth = readFileSync('src/lib/runtime-health.ts', 'utf8')

  assert.match(readyRoute, /getRuntimeReadinessSnapshot/)
  assert.match(runtimeHealth, /workspaceRuntimeReadiness/)
  assert.doesNotMatch(readyRoute, /OPENAI_API_KEY/)
})

test('deployment runbook mentions runtime provisioning and readiness checks', () => {
  const deployRunbook = readFileSync('docs/runbooks/deploy.md', 'utf8')

  assert.match(deployRunbook, /\/api\/health/)
  assert.match(deployRunbook, /runtime provisioning/i)
  assert.match(deployRunbook, /workspace runtime readiness/i)
  assert.match(deployRunbook, /provider onboarding/i)
})

test('incident runbook mentions runtime provisioning, provider onboarding, and suspend\/resume operations', () => {
  const incidentsRunbook = readFileSync('docs/runbooks/incidents.md', 'utf8')

  assert.match(incidentsRunbook, /runtime provisioning/i)
  assert.match(incidentsRunbook, /provider onboarding/i)
  assert.match(incidentsRunbook, /suspend/i)
  assert.match(incidentsRunbook, /resume/i)
})
