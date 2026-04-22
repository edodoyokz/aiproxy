import { prisma } from '@/lib/db'
import { setWorkspaceEntitlement } from './entitlements'
import { checkRuntimeHealth, resumeWorkspaceRuntime, suspendWorkspaceRuntime } from '@/integrations/runtime/service'
import { getWorkspaceUsage } from '@/lib/workspace'
import type { SupportedPlanTier } from '@/lib/plans'

export async function searchAdminWorkspaces(query?: string) {
  const trimmed = query?.trim()

  return prisma.workspace.findMany({
    where: trimmed
      ? {
          OR: [
            { id: { contains: trimmed, mode: 'insensitive' } },
            { name: { contains: trimmed, mode: 'insensitive' } },
            { slug: { contains: trimmed, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      entitlement: true,
      billingState: true,
      runtimes: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })
}

export async function getAdminWorkspaceDetail(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      entitlement: true,
      billingState: true,
      providers: {
        orderBy: { createdAt: 'desc' },
      },
      runtimes: {
        orderBy: { createdAt: 'desc' },
      },
      apiKeys: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!workspace) {
    return null
  }

  const [usage, runtimeHealth] = await Promise.all([
    getWorkspaceUsage(workspaceId),
    checkRuntimeHealth(workspaceId),
  ])

  return {
    workspace,
    usage,
    runtimeHealth,
  }
}

export async function updateAdminWorkspaceEntitlement(input: {
  workspaceId: string
  actorUserId: string
  planTier: SupportedPlanTier
  reason?: string
}) {
  return setWorkspaceEntitlement(input)
}

export async function updateAdminWorkspaceRuntime(input: {
  workspaceId: string
  actorUserId: string
  action: 'suspend' | 'resume'
  reason?: string
}) {
  if (input.action === 'suspend') {
    await suspendWorkspaceRuntime(input.workspaceId, input.actorUserId, input.reason)
  } else {
    await resumeWorkspaceRuntime(input.workspaceId, input.actorUserId)
  }

  return getAdminWorkspaceDetail(input.workspaceId)
}
