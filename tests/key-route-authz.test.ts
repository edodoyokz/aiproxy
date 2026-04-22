import assert from 'node:assert/strict'
import test from 'node:test'

import { getOwnedApiKeyForUpdate } from '../src/lib/api-key'
import { prisma } from '../src/lib/db'

test('api key mutation helper checks workspace ownership before allowing updates', async () => {
  const originalFindFirst = prisma.apiKey.findFirst

  Object.defineProperty(prisma.apiKey, 'findFirst', {
    value: async (args: { where: { id: string; workspaceId: string } }) => {
      assert.equal(args.where.id, 'key_123')
      assert.equal(args.where.workspaceId, 'workspace_123')
      return null
    },
    configurable: true,
  })

  try {
    const ownedKey = await getOwnedApiKeyForUpdate('workspace_123', 'key_123')
    assert.equal(ownedKey, null)
  } finally {
    Object.defineProperty(prisma.apiKey, 'findFirst', {
      value: originalFindFirst,
      configurable: true,
    })
  }
})
