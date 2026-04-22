import assert from 'node:assert/strict'
import test from 'node:test'

import { decrypt, encrypt } from '../src/lib/session'

process.env.SESSION_SECRET = 'test-session-secret-with-sufficient-length'

test('encrypt produces a session token that decrypt restores', async () => {
  const expiresAt = new Date('2030-01-01T00:00:00.000Z')
  const token = await encrypt({
    userId: 'user_123',
    workspaceId: 'workspace_123',
    expiresAt,
  })

  const payload = await decrypt(token)

  assert.equal(payload?.userId, 'user_123')
  assert.equal(payload?.workspaceId, 'workspace_123')
  assert.ok(payload?.expiresAt)
})

test('decrypt returns null for an invalid token', async () => {
  const payload = await decrypt('not-a-valid-session')
  assert.equal(payload, null)
})
