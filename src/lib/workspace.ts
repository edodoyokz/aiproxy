import { prisma } from './db'
import { getEffectiveEntitlement, hasRemainingRequests, canConnectProvider, canIssueApiKey } from './entitlements'

export async function validateWorkspaceLimit(
  workspaceId: string,
  limitType: 'apiKeys' | 'requests' | 'providers'
): Promise<{ allowed: boolean; reason?: string }> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      apiKeys: true,
      entitlement: true,
      providers: {
        where: { isActive: true },
      },
      requests: {
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
  })

  if (!workspace) {
    return { allowed: false, reason: 'Workspace not found' }
  }

  if (workspace.isSuspended) {
    return { allowed: false, reason: 'Workspace is suspended' }
  }

  const entitlement = getEffectiveEntitlement({
    planTier: workspace.planTier,
    overrides: workspace.entitlement
      ? {
          maxApiKeys: workspace.entitlement.maxApiKeys,
          maxProviders: workspace.entitlement.maxProviders,
          maxRequests: workspace.entitlement.maxRequests,
          retentionDays: workspace.entitlement.retentionDays,
        }
      : undefined,
  })

  switch (limitType) {
    case 'apiKeys':
      if (!canIssueApiKey(entitlement, workspace.apiKeys.length)) {
        return {
          allowed: false,
          reason: `${entitlement.planTier} plan allows maximum ${entitlement.maxApiKeys} API keys`,
        }
      }
      break
    case 'providers':
      if (!canConnectProvider(entitlement, workspace.providers.length)) {
        return {
          allowed: false,
          reason: `${entitlement.planTier} plan allows maximum ${entitlement.maxProviders} providers`,
        }
      }
      break
    case 'requests':
      if (!hasRemainingRequests(entitlement, workspace.requests.length)) {
        return {
          allowed: false,
          reason: `${entitlement.planTier} plan monthly limit of ${entitlement.maxRequests} requests exceeded`,
        }
      }
      break
  }

  return { allowed: true }
}

export async function getWorkspaceUsage(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      apiKeys: { where: { isActive: true } },
      entitlement: true,
      providers: { where: { isActive: true } },
      requests: {
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
  })

  if (!workspace) return null

  const entitlement = getEffectiveEntitlement({
    planTier: workspace.planTier,
    overrides: workspace.entitlement
      ? {
          maxApiKeys: workspace.entitlement.maxApiKeys,
          maxProviders: workspace.entitlement.maxProviders,
          maxRequests: workspace.entitlement.maxRequests,
          retentionDays: workspace.entitlement.retentionDays,
        }
      : undefined,
  })

  return {
    planTier: entitlement.planTier,
    apiKeys: {
      current: workspace.apiKeys.length,
      limit: entitlement.maxApiKeys,
    },
    providers: {
      current: workspace.providers.length,
      limit: entitlement.maxProviders,
    },
    requests: {
      current: workspace.requests.length,
      limit: entitlement.maxRequests,
    },
  }
}

export async function checkWorkspaceLimit(workspaceId: string): Promise<boolean> {
  const result = await validateWorkspaceLimit(workspaceId, 'requests')
  return result.allowed
}
