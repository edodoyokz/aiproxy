import { NextRequest, NextResponse } from 'next/server'
import { requireAuthenticatedContext } from '@/lib/authz'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const { workspaceId } = await requireAuthenticatedContext()

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        apiKeys: {
          where: { isActive: true },
        },
        providers: {
          where: { isActive: true },
        },
        runtimes: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const successfulRequests = await prisma.request.count({
      where: {
        workspaceId,
        status: 'success',
      },
    })

    const hasActiveRuntime = workspace.runtimes.length > 0
    const hasSuccessfulRequest = successfulRequests > 0

    const progress = {
      'create-workspace': true,
      'connect-provider': hasActiveRuntime && workspace.providers.length > 0,
      'generate-key': hasActiveRuntime && workspace.apiKeys.length > 0,
      'test-request': hasSuccessfulRequest,
    }

    return NextResponse.json({ progress })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticatedContext()
    const body = await request.json()
    const { workspaceId, step } = body

    if (!workspaceId || !step) {
      return NextResponse.json({ error: 'Workspace ID and step required' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error updating onboarding progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
