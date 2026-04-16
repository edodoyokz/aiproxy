import { prisma } from './db'
import { AuditAction } from '@prisma/client'

export async function logAudit(data: {
  workspaceId: string
  userId?: string
  action: AuditAction
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
}) {
  return prisma.auditLog.create({
    data: {
      workspaceId: data.workspaceId,
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      metadata: data.metadata || {},
    },
  })
}

export async function getAuditLogs(workspaceId: string, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
