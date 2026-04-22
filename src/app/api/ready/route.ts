import { NextResponse } from 'next/server'
import { getRuntimeReadinessSnapshot } from '@/lib/runtime-health'

export async function GET() {
  const snapshot = await getRuntimeReadinessSnapshot()

  return NextResponse.json(
    snapshot,
    { status: snapshot.status === 'ready' ? 200 : 503 },
  )
}
