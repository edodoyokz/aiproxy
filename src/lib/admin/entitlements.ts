import { prisma } from '../db'
import { PLAN_DEFAULTS, type SupportedPlanTier } from '../plans'

export async function setWorkspaceEntitlement(input: {
  workspaceId: string
  actorUserId?: string
  planTier: SupportedPlanTier
  reason?: string
}) {
  const defaults = PLAN_DEFAULTS[input.planTier]
  const existing = await prisma.workspaceEntitlement.findUnique({
    where: { workspaceId: input.workspaceId },
  })

  const entitlement = await prisma.workspaceEntitlement.upsert({
    where: { workspaceId: input.workspaceId },
    create: {
      workspaceId: input.workspaceId,
      effectiveTier: defaults.planTier,
      maxApiKeys: defaults.maxApiKeys,
      maxProviders: defaults.maxProviders,
      maxRequests: defaults.maxRequests,
      retentionDays: defaults.retentionDays,
    },
    update: {
      effectiveTier: defaults.planTier,
      maxApiKeys: defaults.maxApiKeys,
      maxProviders: defaults.maxProviders,
      maxRequests: defaults.maxRequests,
      retentionDays: defaults.retentionDays,
    },
  })

  await prisma.entitlementChangeEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      previousTier: existing?.effectiveTier,
      newTier: defaults.planTier,
      reason: input.reason,
    },
  })

  await prisma.workspaceBillingState.upsert({
    where: { workspaceId: input.workspaceId },
    create: {
      workspaceId: input.workspaceId,
      billingStatus: input.planTier === 'FREE' ? 'free' : 'manual-paid',
    },
    update: {
      billingStatus: input.planTier === 'FREE' ? 'free' : 'manual-paid',
    },
  })

  return entitlement
}
