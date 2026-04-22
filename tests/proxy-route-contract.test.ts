import assert from 'node:assert/strict'
import test from 'node:test'

import { POST } from '../src/app/api/proxy/chat/route'

test('proxy route exports a POST handler', () => {
  assert.equal(typeof POST, 'function')
})

test('proxy route delegates happy path execution to runtime proxy helper', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/app/api/proxy/chat/route.ts', import.meta.url), 'utf8'),
  )

  assert.match(source, /forwardChatCompletionToRuntime/)
  assert.doesNotMatch(source, /proxyChatCompletion/) 
})

test('proxy route no longer treats direct provider proxy as the default architecture', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/app/api/proxy/chat/route.ts', import.meta.url), 'utf8'),
  )

  assert.doesNotMatch(source, /OPENAI_API_KEY/)
})

test('proxy provider library still exports status-aware upstream error for fallback compatibility', async () => {
  const proxy = await import('../src/lib/providers/proxy')

  assert.equal(typeof proxy.ProxyUpstreamError, 'function')
})
