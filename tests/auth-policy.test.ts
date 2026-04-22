import assert from 'node:assert/strict'
import test from 'node:test'

import { passwordSchema, recordFailedLoginAttempt } from '../src/lib/auth'

test('password policy rejects passwords without mixed character classes', () => {
  assert.throws(() => passwordSchema.parse('alllowercase1'), /Password must include/)
  assert.throws(() => passwordSchema.parse('ALLUPPERCASE1'), /Password must include/)
  assert.throws(() => passwordSchema.parse('NoDigitsHere'), /Password must include/)
})

test('password policy accepts strong passwords', () => {
  const password = passwordSchema.parse('StrongPass123')
  assert.equal(password, 'StrongPass123')
})

test('failed login tracking returns a retry delay after repeated failures', async () => {
  const result = await recordFailedLoginAttempt('person@example.com', 4)
  assert.equal(typeof result.retryAfterSeconds, 'number')
  assert.ok((result.retryAfterSeconds ?? 0) > 0)
})
