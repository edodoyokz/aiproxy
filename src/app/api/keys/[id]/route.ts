import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuthenticatedContext } from '@/lib/authz'
import { getOwnedApiKeyForUpdate } from '@/lib/api-key'
import { revokeWorkspaceApiKey } from '@/integrations/runtime/service'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void _request
    const { id } = await params
    const { workspaceId, userId } = await requireAuthenticatedContext()

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id,
        workspaceId,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    await revokeWorkspaceApiKey(workspaceId, userId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { workspaceId } = await requireAuthenticatedContext()

    const { isActive } = await request.json()

    const ownedApiKey = await getOwnedApiKeyForUpdate(workspaceId, id)

    if (!ownedApiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json(apiKey)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
  }
}
