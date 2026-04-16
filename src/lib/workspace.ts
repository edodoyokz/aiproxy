import { prisma } from './db'
import { PlanTier } from '@prisma/client'

const PLAN_LIMITS = {
  FREE: {
    maxApiKeys: 2,
    maxRequests: 1000,
    maxProviders: 1,
  },
  STARTER: {
    maxApiKeys: 10,
    maxRequests: 50000,
    maxProviders: 3,
  },
  PRO: {
    maxApiKeys: 50,
    maxRequests: -1, // unlimited
    maxProviders: -1, // unlimited
  },
}

export async function validateWorkspaceLimit(
  workspaceId: string,
  limitType: 'apiKeys' | 'requests' | 'providers'
): Promise<{ allowed: boolean; reason?: string }> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      apiKeys: true,
      providers: true,
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

  const limits = PLAN_LIMITS[workspace.planTier]

  switch (limitType) {
    case 'apiKeys':
      if (workspace.apiKeys.length >= limits.maxApiKeys) {
        return {
          allowed: false,
          reason: `${workspace.planTier} plan allows maximum ${limits.maxApiKeys} API keys`,
        }
      }
      break
    case 'providers':
      if (limits.maxProviders !== -1 && workspace.providers.length >= limits.maxProviders) {
        return {
          allowed: false,
          reason: `${workspace.planTier} plan allows maximum ${limits.maxProviders} providers`,
        }
      }
      break
    case 'requests':
      if (limits.maxRequests !== -1 && workspace.requests.length >= limits.maxRequests) {
        return {
          allowed: false,
          reason: `${workspace.planTier} plan monthly limit of ${limits.maxRequests} requests exceeded`,
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

  const limits = PLAN_LIMITS[workspace.planTier]

  return {
    planTier: workspace.planTier,
    apiKeys: {
      current: workspace.apiKeys.length,
      limit: limits.maxApiKeys,
    },
    providers: {
      current: workspace.providers.length,
      limit: limits.maxProviders,
    },
    requests: {
      current: workspace.requests.length,
      limit: limits.maxRequests,
    },
  }
}
