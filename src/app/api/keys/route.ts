import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateWorkspaceLimit } from '@/lib/workspace'
import { issueWorkspaceApiKey } from '@/integrations/runtime/service'

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

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

    return NextResponse.json(apiKeys)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    const userId = request.headers.get('x-user-id')
    
    if (!workspaceId || !userId) {
      return NextResponse.json({ error: 'Workspace ID and User ID required' }, { status: 400 })
    }

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

    // Issue API key via runtime service (coordinates with CLIProxyAPIPlus)
    const { keyId, key } = await issueWorkspaceApiKey(workspaceId, userId, name)

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
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

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error('Failed to create API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
