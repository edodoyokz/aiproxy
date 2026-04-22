import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

test('onboarding progress requires a runtime, active provider, tenant key, and first successful call', async () => {
  const source = await readFile(
    new URL('../src/app/api/onboarding/progress/route.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /runtimes:\s*\{[\s\S]*where:\s*\{\s*status:\s*'ACTIVE'\s*\}/)
  assert.match(source, /providers:\s*\{[\s\S]*where:\s*\{\s*isActive:\s*true\s*\}/)
  assert.match(source, /apiKeys:\s*\{[\s\S]*where:\s*\{\s*isActive:\s*true\s*\}/)
  assert.match(source, /status:\s*'success'/)
  assert.match(source, /'create-workspace':\s*true/)
  assert.match(source, /'connect-provider':\s*hasActiveRuntime\s*&&\s*workspace\.providers\.length\s*>\s*0/)
  assert.match(source, /'generate-key':\s*hasActiveRuntime\s*&&\s*workspace\.apiKeys\.length\s*>\s*0/)
  assert.match(source, /'test-request':\s*hasSuccessfulRequest/)
})

test('onboarding checklist frames runtime-backed first call as the activation milestone', async () => {
  const source = await readFile(
    new URL('../src/components/onboarding-checklist.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /Workspace activation checklist/)
  assert.match(source, /Next required step|Current step/)
  assert.match(source, /Activation complete|Workspace activated/)
  assert.match(source, /Create your workspace runtime/)
  assert.match(source, /Provision the workspace runtime that will host providers, tenant keys, and requests/)
  assert.match(source, /Make your first successful runtime-backed request/)
})

test('dashboard guidance highlights the full runtime-backed activation funnel', async () => {
  const source = await readFile(
    new URL('../src/app/dashboard/page.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /Connect a runtime-backed provider, issue a tenant key, and complete your first successful call to activate the workspace\./)
})
