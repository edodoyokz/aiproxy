import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('security modules exist for rate limiting and headers', () => {
  assert.equal(existsSync('src/lib/security/rate-limit.ts'), true)
  assert.equal(existsSync('src/lib/security/headers.ts'), true)
})

test('next config includes security headers configuration', () => {
  const nextConfig = readFileSync('next.config.ts', 'utf8')
  const headersModule = readFileSync('src/lib/security/headers.ts', 'utf8')

  assert.match(nextConfig, /headers\(/)
  assert.match(headersModule, /X-Frame-Options/)
  assert.match(headersModule, /X-Content-Type-Options/)
  assert.match(headersModule, /Referrer-Policy/)
})
