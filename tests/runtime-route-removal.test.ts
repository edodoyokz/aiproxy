import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('runtime management routes are removed from the App Router surface', () => {
  assert.equal(existsSync('src/app/api/runtimes/route.ts'), false)
  assert.equal(existsSync('src/app/api/runtimes/[id]/health/route.ts'), false)
})

test('repository messaging positions Aiproxy as a CLIProxyAPIPlus control plane', () => {
  const readme = readFileSync('README.md', 'utf8')
  const landing = readFileSync('src/app/page.tsx', 'utf8')
  const pricing = readFileSync('src/app/pricing/page.tsx', 'utf8')
  const docs = readFileSync('src/app/docs/page.tsx', 'utf8')

  assert.match(readme, /CLIProxyAPIPlus/)
  assert.match(readme, /control plane/i)
  assert.match(landing, /CLIProxyAPIPlus/)
  assert.match(landing, /control plane/i)
  assert.match(pricing, /runtime/i)
  assert.match(pricing, /provider/i)
  assert.match(docs, /CLIProxyAPIPlus/)
  assert.match(docs, /connect provider/i)
  assert.equal(existsSync('docs/architecture/runtime-boundaries.md'), true)
})
