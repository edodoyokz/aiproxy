import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

test('key creation route issues tenant keys through runtime service', async () => {
  const source = await readFile(
    new URL('../src/app/api/keys/route.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /issueWorkspaceApiKey/)
  assert.doesNotMatch(source, /createApiKey\s*\(/)
})

test('key revocation route coordinates runtime and local state through runtime service', async () => {
  const source = await readFile(
    new URL('../src/app/api/keys/\[id\]/route.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /revokeWorkspaceApiKey/)
  assert.doesNotMatch(source, /prisma\.apiKey\.delete\s*\(/)
})

test('runtime service persists runtime-bound key identifiers and relationships', async () => {
  const source = await readFile(
    new URL('../src/integrations/runtime/service.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /id:\s*response\.keyId/)
  assert.match(source, /runtimeId:\s*runtime\.id/)
  assert.match(source, /await adapter\.revokeApiKey\(apiKey\.runtimeId, keyId\)/)
})

test('key listing path still masks stored key material', async () => {
  const source = await readFile(
    new URL('../src/app/api/keys/route.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /key:\s*maskApiKey\(apiKey\.key\)/)
})
