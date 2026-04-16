import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

      // Check onboarding progress
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          apiKeys: true,
          providers: true,
        }
      })

      if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
      }

      // Check if user has made any requests
      const hasRequests = await prisma.request.count({
        where: { workspaceId }
      })

      const progress = {
        'create-workspace': true, // If we found the workspace, it exists
        'connect-provider': workspace.providers.length > 0,
        'generate-key': workspace.apiKeys.length > 0,
        'test-request': hasRequests > 0
      }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, step } = body

    if (!workspaceId || !step) {
      return NextResponse.json({ error: 'Workspace ID and step required' }, { status: 400 })
    }

    // This endpoint can be used to manually mark steps as complete
    // For now, we auto-detect progress, but this allows for future flexibility
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
