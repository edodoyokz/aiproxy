import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuthenticatedContext } from '@/lib/authz'
import { updateAdminWorkspaceEntitlement } from '@/lib/admin/workspaces'

const entitlementSchema = z.object({
  planTier: z.enum(['FREE', 'STARTER', 'PRO']),
  reason: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuthenticatedContext()

    if (!auth.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = entitlementSchema.parse(await request.json())

    const entitlement = await updateAdminWorkspaceEntitlement({
      workspaceId: id,
      actorUserId: auth.userId,
      planTier: body.planTier,
      reason: body.reason,
    })

    return NextResponse.json({ entitlement })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update workspace entitlement' }, { status: 500 })
  }
}
