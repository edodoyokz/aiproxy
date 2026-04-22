import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuthenticatedContext } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { PROVIDER_CATALOG, PROVIDER_CATALOG_LIST, isProviderType } from '@/lib/providers/catalog'
import { validateWorkspaceLimit } from '@/lib/workspace'
import { connectWorkspaceProvider } from '@/integrations/runtime/service'

const connectProviderSchema = z.object({
  provider: z.string(),
  providerApiKey: z.string().min(1),
})

export async function GET() {
  try {
    const { workspaceId } = await requireAuthenticatedContext()

    const connections = await prisma.providerConnection.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      catalog: PROVIDER_CATALOG_LIST,
      connections: connections.map(connection => ({
        id: connection.id,
        provider: connection.provider,
        status: connection.status,
        isActive: connection.isActive,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        catalog: PROVIDER_CATALOG[connection.provider as keyof typeof PROVIDER_CATALOG] ?? null,
      })),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, userId } = await requireAuthenticatedContext()
    const body = connectProviderSchema.parse(await request.json())

    if (!isProviderType(body.provider)) {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    const limitCheck = await validateWorkspaceLimit(workspaceId, 'providers')
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Provider limit exceeded',
          message: limitCheck.reason,
        },
        { status: 403 },
      )
    }

    const connectionId = await connectWorkspaceProvider(
      workspaceId,
      userId,
      body.provider,
      body.providerApiKey,
    )

    const connection = await prisma.providerConnection.findUnique({
      where: { id: connectionId },
    })

    return NextResponse.json({
      connection,
      catalog: PROVIDER_CATALOG[body.provider],
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to connect provider' }, { status: 500 })
  }
}
