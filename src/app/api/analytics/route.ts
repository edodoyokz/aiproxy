import { NextRequest, NextResponse } from 'next/server'
import { getWorkspaceStats } from '@/lib/analytics'
import { requireAuthenticatedContext } from '@/lib/authz'
import { getWorkspaceUsage } from '@/lib/workspace'

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await requireAuthenticatedContext()
    const days = parseInt(request.nextUrl.searchParams.get('days') || '7')

    const [stats, usage] = await Promise.all([
      getWorkspaceStats(workspaceId, days),
      getWorkspaceUsage(workspaceId),
    ])

    return NextResponse.json({
      stats,
      usage,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
