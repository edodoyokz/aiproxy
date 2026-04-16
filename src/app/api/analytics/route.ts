import { NextRequest, NextResponse } from 'next/server'
import { getWorkspaceStats } from '@/lib/analytics'
import { getWorkspaceUsage } from '@/lib/workspace'

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.headers.get('x-workspace-id')
    const days = parseInt(request.nextUrl.searchParams.get('days') || '7')
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    const [stats, usage] = await Promise.all([
      getWorkspaceStats(workspaceId, days),
      getWorkspaceUsage(workspaceId),
    ])

    return NextResponse.json({
      stats,
      usage,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
