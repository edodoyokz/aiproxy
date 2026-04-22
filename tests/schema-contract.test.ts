import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('schema includes first-class entitlement and billing-state models', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')

  assert.match(schema, /model WorkspaceEntitlement\s+{/)
  assert.match(schema, /model WorkspaceBillingState\s+{/)
  assert.match(schema, /model EntitlementChangeEvent\s+{/)
})
