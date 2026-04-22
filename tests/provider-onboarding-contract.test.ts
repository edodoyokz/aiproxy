import assert from 'node:assert/strict'
import test from 'node:test'
import { access, readFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'

import { ProviderType, ProviderConnectionStatus } from '../src/integrations/runtime/types'

test('provider catalog exposes CLIProxyAPIPlus-backed provider inventory', async () => {
  const path = new URL('../src/lib/providers/catalog.ts', import.meta.url)

  await access(path, fsConstants.F_OK)

  const source = await readFile(path, 'utf8')
  for (const provider of Object.keys(ProviderType)) {
    assert.match(source, new RegExp(`ProviderType\\.${provider}`))
  }
})

test('providers API route exports GET and POST handlers', async () => {
  const path = new URL('../src/app/api/providers/route.ts', import.meta.url)

  await access(path, fsConstants.F_OK)

  const source = await readFile(path, 'utf8')
  assert.match(source, /export\s+async\s+function\s+GET\s*\(/)
  assert.match(source, /export\s+async\s+function\s+POST\s*\(/)
})

test('provider detail route exports DELETE handler for disconnect flow', async () => {
  const path = new URL('../src/app/api/providers/[id]/route.ts', import.meta.url)

  await access(path, fsConstants.F_OK)

  const source = await readFile(path, 'utf8')
  assert.match(source, /export\s+async\s+function\s+DELETE\s*\(/)
})

test('runtime service exposes provider connect and disconnect helpers for route handlers', async () => {
  const source = await readFile(
    new URL('../src/integrations/runtime/service.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /export\s+async\s+function\s+connectWorkspaceProvider\s*\(/)
  assert.match(source, /export\s+async\s+function\s+disconnectWorkspaceProvider\s*\(/)
})

test('workspace provider limit checks only count active provider connections', async () => {
  const source = await readFile(
    new URL('../src/lib/workspace.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /providers:\s*\{[\s\S]*where:\s*\{\s*isActive:\s*true\s*\}/)
})

test('dashboard providers page exists for onboarding flow', async () => {
  await access(
    new URL('../src/app/dashboard/providers/page.tsx', import.meta.url),
    fsConstants.F_OK,
  )
})

test('provider status type supports dashboard connection state rendering', () => {
  assert.ok(Object.values(ProviderConnectionStatus).includes(ProviderConnectionStatus.CONNECTED))
  assert.ok(Object.values(ProviderConnectionStatus).includes(ProviderConnectionStatus.DISCONNECTED))
})

test('dashboard journey frames provider connection as the activation step before key usage', async () => {
  const source = await readFile(
    new URL('../src/app/dashboard/page.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /Workspace activation/)
  assert.match(source, /Complete these steps to activate your workspace/)
  assert.match(source, /Connect a runtime-backed provider, issue a tenant key, and complete your first successful call to activate the workspace\./)
  assert.match(source, /Connect runtime provider|Generate tenant key|View activation guide/)
})

test('provider page frames connection as part of the activation flow', async () => {
  const source = await readFile(
    new URL('../src/app/dashboard/providers/page.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /Connect a provider to continue activation/)
  assert.match(source, /Generate tenant key|first successful call/)
  assert.match(source, /Available providers/)
  assert.match(source, /Connected providers/)
})

test('onboarding checklist makes provider connection the required runtime-backed setup step', async () => {
  const source = await readFile(
    new URL('../src/components/onboarding-checklist.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /Connect an AI provider first/)
  assert.match(source, /Required before you can generate a tenant key and make your first successful call/)
  assert.match(source, /Connect provider/) 
})

test('onboarding progress counts only active provider connections', async () => {
  const source = await readFile(
    new URL('../src/app/api/onboarding/progress/route.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /providers:\s*\{\s*where:\s*\{\s*isActive:\s*true\s*\}/)
})
