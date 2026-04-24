import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ProxyUpstreamError,
  normalizeOpenAIChatResponse,
  proxyChatCompletion,
} from '../src/lib/providers/proxy'
import { ProviderType } from '../src/integrations/runtime/types'

test('runtime proxy module exists as the primary request execution surface', async () => {
  const { readFile } = await import('node:fs/promises')
  const source = await readFile(new URL('../src/lib/runtime-proxy.ts', import.meta.url), 'utf8')

  assert.match(source, /export\s+async\s+function\s+forwardChatCompletionToRuntime\s*\(/)
})

test('normalizes an OpenAI-compatible upstream response into proxy metadata', () => {
  const normalized = normalizeOpenAIChatResponse({
    id: 'chatcmpl_test',
    object: 'chat.completion',
    created: 1735689600,
    model: 'gpt-4o-mini',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: 'Hello from upstream' },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 11,
      completion_tokens: 7,
      total_tokens: 18,
    },
  })

  assert.equal(normalized.response.choices[0]?.message.content, 'Hello from upstream')
  assert.equal(normalized.usage.promptTokens, 11)
  assert.equal(normalized.usage.completionTokens, 7)
  assert.equal(normalized.usage.totalTokens, 18)
})

test('proxy forwards request id header to upstream providers', async () => {
  process.env.OPENAI_API_KEY = 'test-openai-key'
  const previousFallback = process.env.ENABLE_DIRECT_PROVIDER_FALLBACK
  process.env.ENABLE_DIRECT_PROVIDER_FALLBACK = 'true'

  const originalFetch = globalThis.fetch
  let forwardedRequestId: string | null = null

  globalThis.fetch = (async (_input, init) => {
    const headers = init?.headers as Record<string, string>
    forwardedRequestId = headers['x-request-id']

    return new Response(
      JSON.stringify({
        id: 'chatcmpl_test',
        object: 'chat.completion',
        created: 1735689600,
        model: 'gpt-4o-mini',
        choices: [{ index: 0, message: { role: 'assistant', content: 'hello' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }) as typeof fetch

  try {
    await proxyChatCompletion(
      {
        provider: ProviderType.OPENAI,
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'hello' }],
      },
      { requestId: 'req_123' },
    )

    assert.equal(forwardedRequestId, 'req_123')
  } finally {
    process.env.ENABLE_DIRECT_PROVIDER_FALLBACK = previousFallback
    globalThis.fetch = originalFetch
  }
})

test('proxy wraps upstream failures with status-aware errors', async () => {
  process.env.OPENAI_API_KEY = 'test-openai-key'
  const previousFallback = process.env.ENABLE_DIRECT_PROVIDER_FALLBACK
  process.env.ENABLE_DIRECT_PROVIDER_FALLBACK = 'true'

  const originalFetch = globalThis.fetch

  globalThis.fetch = (async () =>
    new Response('upstream exploded', {
      status: 429,
      headers: { 'content-type': 'text/plain' },
    })) as typeof fetch

  try {
    await assert.rejects(
      () =>
        proxyChatCompletion({
          provider: ProviderType.OPENAI,
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'hello' }],
        }),
      (error: unknown) => {
        assert.ok(error instanceof ProxyUpstreamError)
        assert.equal(error.status, 429)
        assert.match(error.message, /upstream exploded/)
        return true
      },
    )
  } finally {
    process.env.ENABLE_DIRECT_PROVIDER_FALLBACK = previousFallback
    globalThis.fetch = originalFetch
  }
})

test('proxy retries once for transient upstream failures', async () => {
  process.env.OPENAI_API_KEY = 'test-openai-key'
  const previousFallback = process.env.ENABLE_DIRECT_PROVIDER_FALLBACK
  process.env.ENABLE_DIRECT_PROVIDER_FALLBACK = 'true'

  const originalFetch = globalThis.fetch
  let attempts = 0

  globalThis.fetch = (async () => {
    attempts += 1

    if (attempts === 1) {
      return new Response('temporary upstream failure', { status: 503 })
    }

    return new Response(
      JSON.stringify({
        id: 'chatcmpl_retry',
        object: 'chat.completion',
        created: 1735689600,
        model: 'gpt-4o-mini',
        choices: [{ index: 0, message: { role: 'assistant', content: 'retry ok' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }) as typeof fetch

  try {
    const result = await proxyChatCompletion({
      provider: ProviderType.OPENAI,
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hello' }],
    })

    assert.equal(attempts, 2)
    assert.equal(result.response.id, 'chatcmpl_retry')
  } finally {
    process.env.ENABLE_DIRECT_PROVIDER_FALLBACK = previousFallback
    globalThis.fetch = originalFetch
  }
})

test('direct provider proxy remains a compatibility fallback behind explicit config', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/lib/providers/proxy.ts', import.meta.url), 'utf8'),
  )

  assert.match(source, /DIRECT_PROVIDER_FALLBACK/)
})
