import assert from 'node:assert/strict'
import test from 'node:test'

import { getProxyErrorResponse, resolveRequestId } from '../src/lib/proxy-http'
import { ProxyUpstreamError } from '../src/lib/providers/proxy'

test('resolveRequestId prefers incoming request id headers', () => {
  assert.equal(resolveRequestId('req_123'), 'req_123')
})

test('resolveRequestId generates a fallback request id when header is absent', () => {
  const requestId = resolveRequestId(null)

  assert.equal(typeof requestId, 'string')
  assert.ok(requestId.length > 10)
})

test('getProxyErrorResponse preserves upstream status codes and request ids', () => {
  const response = getProxyErrorResponse(
    new ProxyUpstreamError('OpenAI upstream error: rate limited', 429),
    'req_123',
  )

  assert.equal(response.status, 429)
  assert.equal(response.body.requestId, 'req_123')
  assert.match(response.body.error, /rate limited/)
})

test('getProxyErrorResponse hides unknown errors behind a 500 response', () => {
  const response = getProxyErrorResponse(new Error('secret stack leak'), 'req_456')

  assert.equal(response.status, 500)
  assert.equal(response.body.requestId, 'req_456')
  assert.equal(response.body.error, 'Internal server error')
})

test('getProxyErrorResponse preserves runtime-forwarding upstream failures', async () => {
  const { readFile } = await import('node:fs/promises')
  const source = await readFile(new URL('../src/lib/runtime-proxy.ts', import.meta.url), 'utf8')

  assert.match(source, /export\s+class\s+RuntimeProxyError\s+extends\s+Error/)
  assert.match(source, /constructor\(message:\s*string,\s*status:\s*number\)/)
})
