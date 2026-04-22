import assert from 'node:assert/strict'
import test from 'node:test'

import * as analytics from '../src/lib/analytics'
import * as runtimeIntegration from '../src/integrations/runtime'
import * as workspace from '../src/lib/workspace'

test('workspace module exposes request limit checker used by proxy route', () => {
  assert.equal(typeof workspace.checkWorkspaceLimit, 'function')
})

test('analytics module exposes usage event logger used by proxy route', () => {
  assert.equal(typeof analytics.logUsageEvent, 'function')
})

test('runtime integration exposes runtimeService facade expected by routes', () => {
  assert.equal(typeof runtimeIntegration.runtimeService, 'object')
  assert.equal(typeof runtimeIntegration.runtimeService.validateRequest, 'function')
  assert.equal(typeof runtimeIntegration.runtimeService.syncUsage, 'function')
  assert.equal(typeof runtimeIntegration.runtimeService.revokeKey, 'function')
  assert.equal(typeof runtimeIntegration.runtimeService.checkHealth, 'function')
  assert.equal(typeof runtimeIntegration.runtimeService.getWorkspaceRuntimes, 'function')
  assert.equal(typeof runtimeIntegration.runtimeService.provisionRuntime, 'function')
})
