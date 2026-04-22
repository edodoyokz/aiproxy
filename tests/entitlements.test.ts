import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PLAN_DEFAULTS,
  getEffectiveEntitlement,
  canConnectProvider,
  canIssueApiKey,
} from '../src/lib/entitlements'

test('plan defaults define product entitlements per tier', () => {
  assert.equal(PLAN_DEFAULTS.FREE.maxProviders, 1)
  assert.equal(PLAN_DEFAULTS.STARTER.maxProviders, 3)
  assert.equal(PLAN_DEFAULTS.PRO.maxProviders, -1)
})

test('workspace-specific entitlement overrides base plan defaults', () => {
  const entitlement = getEffectiveEntitlement({
    planTier: 'FREE',
    overrides: {
      maxProviders: 4,
      maxApiKeys: 7,
    },
  })

  assert.equal(entitlement.maxProviders, 4)
  assert.equal(entitlement.maxApiKeys, 7)
  assert.equal(entitlement.planTier, 'FREE')
})

test('provider connection checks use effective entitlement instead of hardcoded plan only', () => {
  const entitlement = getEffectiveEntitlement({
    planTier: 'FREE',
    overrides: { maxProviders: 2 },
  })

  assert.equal(canConnectProvider(entitlement, 1), true)
  assert.equal(canConnectProvider(entitlement, 2), false)
})

test('api key issuance checks use effective entitlement instead of hardcoded plan only', () => {
  const entitlement = getEffectiveEntitlement({
    planTier: 'STARTER',
    overrides: { maxApiKeys: 4 },
  })

  assert.equal(canIssueApiKey(entitlement, 3), true)
  assert.equal(canIssueApiKey(entitlement, 4), false)
})
