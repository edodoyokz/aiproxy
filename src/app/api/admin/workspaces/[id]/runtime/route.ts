import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuthenticatedContext } from '@/lib/authz'
import { getAdminWorkspaceDetail, updateAdminWorkspaceRuntime } from '@/lib/admin/workspaces'

const runtimeActionSchema = z.object({
  action: z.enum(['suspend', 'resume']),
  reason: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuthenticatedContext()

    if (!['owner', 'admin'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const detail = await getAdminWorkspaceDetail(id)

    if (!detail) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    return NextResponse.json({
      runtime: detail.workspace.runtimes[0] ?? null,
      runtimeHealth: detail.runtimeHealth,
      usage: detail.usage,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to fetch runtime detail' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuthenticatedContext()

    if (!['owner', 'admin'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = runtimeActionSchema.parse(await request.json())

    const detail = await updateAdminWorkspaceRuntime({
      workspaceId: id,
      actorUserId: auth.userId,
      action: body.action,
      reason: body.reason,
    })

    return NextResponse.json({ detail })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update runtime state' }, { status: 500 })
  }
}
