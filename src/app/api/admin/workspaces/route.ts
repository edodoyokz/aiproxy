import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedContext } from '@/lib/authz'
import { searchAdminWorkspaces } from '@/lib/admin/workspaces'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedContext()

    if (!auth.isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const query = request.nextUrl.searchParams.get('query') ?? undefined
    const workspaces = await searchAdminWorkspaces(query)

    return NextResponse.json({ workspaces })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to search workspaces' }, { status: 500 })
  }
}
