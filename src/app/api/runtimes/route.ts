import { NextRequest, NextResponse } from 'next/server'
import { runtimeService } from '@/integrations/runtime'

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    const runtimes = await runtimeService.getWorkspaceRuntimes(workspaceId)
    return NextResponse.json(runtimes)
  } catch (error) {
    console.error('Failed to fetch runtimes:', error)
    return NextResponse.json({ error: 'Failed to fetch runtimes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    // TODO: Validate workspace can provision more runtimes based on plan
    const runtime = await runtimeService.provisionRuntime(workspaceId)
    
    return NextResponse.json(runtime, { status: 201 })
  } catch (error) {
    console.error('Failed to provision runtime:', error)
    return NextResponse.json({ error: 'Failed to provision runtime' }, { status: 500 })
  }
}
