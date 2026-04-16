import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { AuditAction } from '@prisma/client'
import { runtimeService } from '@/integrations/runtime'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    const userId = request.headers.get('x-user-id')
    
    if (!workspaceId || !userId) {
      return NextResponse.json({ error: 'Workspace ID and User ID required' }, { status: 400 })
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Revoke key from runtime if it has a runtimeId
    if (apiKey.runtimeId) {
      await runtimeService.revokeKey(apiKey.runtimeId, params.id)
    }

    await prisma.apiKey.delete({
      where: { id: params.id },
    })

    // Log audit event
    await logAudit({
      workspaceId,
      userId,
      action: AuditAction.API_KEY_REVOKED,
      resourceType: 'ApiKey',
      resourceId: params.id,
      metadata: { name: apiKey.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    const { isActive } = await request.json()

    const apiKey = await prisma.apiKey.update({
      where: {
        id: params.id,
        workspaceId,
      },
      data: { isActive },
    })

    return NextResponse.json(apiKey)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
  }
}
