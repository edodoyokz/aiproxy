import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedContext } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { disconnectWorkspaceProvider } from '@/integrations/runtime/service'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { workspaceId, userId } = await requireAuthenticatedContext()

    const connection = await prisma.providerConnection.findFirst({
      where: {
        id,
        workspaceId,
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Provider connection not found' }, { status: 404 })
    }

    await disconnectWorkspaceProvider(workspaceId, userId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to disconnect provider' }, { status: 500 })
  }
}
