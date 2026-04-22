import assert from 'node:assert/strict'
import test from 'node:test'

import { maskApiKey } from '../src/lib/api-key'

test('maskApiKey preserves only the prefix and suffix of an API key', () => {
  assert.equal(maskApiKey('sk-1234567890abcdef'), 'sk-12••••••••••cdef')
})
