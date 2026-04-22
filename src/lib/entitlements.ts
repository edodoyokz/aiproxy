import { PLAN_DEFAULTS, type PlanEntitlement, type SupportedPlanTier } from './plans'

export { PLAN_DEFAULTS }

type EntitlementOverrides = Partial<
  Pick<PlanEntitlement, 'maxApiKeys' | 'maxProviders' | 'maxRequests' | 'retentionDays'>
>

export function getEffectiveEntitlement(input: {
  planTier: SupportedPlanTier
  overrides?: EntitlementOverrides
}): PlanEntitlement {
  const base = PLAN_DEFAULTS[input.planTier]

  return {
    ...base,
    ...input.overrides,
  }
}

export function canConnectProvider(entitlement: PlanEntitlement, currentProviders: number): boolean {
  return entitlement.maxProviders === -1 || currentProviders < entitlement.maxProviders
}

export function canIssueApiKey(entitlement: PlanEntitlement, currentKeys: number): boolean {
  return entitlement.maxApiKeys === -1 || currentKeys < entitlement.maxApiKeys
}

export function hasRemainingRequests(entitlement: PlanEntitlement, currentRequests: number): boolean {
  return entitlement.maxRequests === -1 || currentRequests < entitlement.maxRequests
}
