export type SupportedPlanTier = 'FREE' | 'STARTER' | 'PRO'

export type PlanEntitlement = {
  planTier: SupportedPlanTier
  maxApiKeys: number
  maxProviders: number
  maxRequests: number
  retentionDays: number | null
}

export const PLAN_DEFAULTS: Record<SupportedPlanTier, PlanEntitlement> = {
  FREE: {
    planTier: 'FREE',
    maxApiKeys: 2,
    maxProviders: 1,
    maxRequests: 1000,
    retentionDays: 7,
  },
  STARTER: {
    planTier: 'STARTER',
    maxApiKeys: 10,
    maxProviders: 3,
    maxRequests: 50000,
    retentionDays: 30,
  },
  PRO: {
    planTier: 'PRO',
    maxApiKeys: 50,
    maxProviders: -1,
    maxRequests: -1,
    retentionDays: 90,
  },
}
