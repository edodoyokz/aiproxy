import assert from 'node:assert/strict'
import test from 'node:test'

import { RuntimeProvisionError } from '../src/integrations/runtime/adapter'
import { resetRuntimeAdapter, getRuntimeAdapter } from '../src/integrations/runtime/adapter-instance'

test('runtime package exports a real CLIProxyAPIPlus adapter class', async () => {
  const runtimeAdapterModule = await import('../src/integrations/runtime/cliproxyapiplus-adapter')

  assert.equal(typeof runtimeAdapterModule.CLIProxyAPIPlusAdapter, 'function')
})

test('adapter factory can switch to CLIProxyAPIPlus mode', async () => {
  const previousMode = process.env.RUNTIME_MODE
  const previousUrl = process.env.CLIPROXYAPIPLUS_API_URL
  const previousKey = process.env.CLIPROXYAPIPLUS_API_KEY

  process.env.RUNTIME_MODE = 'cliproxyapiplus'
  process.env.CLIPROXYAPIPLUS_API_URL = 'https://runtime.example.com'
  process.env.CLIPROXYAPIPLUS_API_KEY = 'test-key'
  resetRuntimeAdapter()

  try {
    const adapter = getRuntimeAdapter()
    assert.equal(adapter.constructor.name, 'CLIProxyAPIPlusAdapter')
  } finally {
    process.env.RUNTIME_MODE = previousMode
    process.env.CLIPROXYAPIPLUS_API_URL = previousUrl
    process.env.CLIPROXYAPIPLUS_API_KEY = previousKey
    resetRuntimeAdapter()
  }
})

test('real adapter mode fails clearly when config is missing', () => {
  const previousMode = process.env.RUNTIME_MODE
  const previousUrl = process.env.CLIPROXYAPIPLUS_API_URL
  const previousKey = process.env.CLIPROXYAPIPLUS_API_KEY

  process.env.RUNTIME_MODE = 'cliproxyapiplus'
  delete process.env.CLIPROXYAPIPLUS_API_URL
  delete process.env.CLIPROXYAPIPLUS_API_KEY
  resetRuntimeAdapter()

  try {
    assert.throws(() => getRuntimeAdapter(), (error: unknown) => {
      assert.ok(error instanceof RuntimeProvisionError)
      assert.match(error.message, /CLIPROXYAPIPLUS_API_URL|CLIPROXYAPIPLUS_API_KEY/)
      return true
    })
  } finally {
    process.env.RUNTIME_MODE = previousMode
    process.env.CLIPROXYAPIPLUS_API_URL = previousUrl
    process.env.CLIPROXYAPIPLUS_API_KEY = previousKey
    resetRuntimeAdapter()
  }
})
