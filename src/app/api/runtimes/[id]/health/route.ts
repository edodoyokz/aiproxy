import { NextRequest, NextResponse } from 'next/server'
import { runtimeService } from '@/integrations/runtime'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    // TODO: Implement real health check against CLIProxyAPIPlus
    const health = await runtimeService.checkHealth(params.id)
    
    return NextResponse.json(health)
  } catch (error) {
    console.error('Failed to check runtime health:', error)
    return NextResponse.json({ error: 'Failed to check runtime health' }, { status: 500 })
  }
}
