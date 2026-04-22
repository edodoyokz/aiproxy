import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuthenticatedContext } from '@/lib/authz'
import { maskApiKey } from '@/lib/api-key'
import { issueWorkspaceApiKey } from '@/integrations/runtime/service'
import { validateWorkspaceLimit } from '@/lib/workspace'

export async function GET() {
  try {
    const { workspaceId } = await requireAuthenticatedContext()

    const apiKeys = await prisma.apiKey.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        runtimeId: true,
      },
    })

    return NextResponse.json(
      apiKeys.map(apiKey => ({
        ...apiKey,
        key: maskApiKey(apiKey.key),
      })),
    )
  } catch {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, userId } = await requireAuthenticatedContext()

    // Check workspace limits
    const limitCheck = await validateWorkspaceLimit(workspaceId, 'apiKeys')
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'API key limit exceeded', 
        message: limitCheck.reason 
      }, { status: 403 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const created = await issueWorkspaceApiKey(workspaceId, userId, name)

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: created.keyId },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    })

    return NextResponse.json(apiKey)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Failed to create API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
