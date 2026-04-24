import { NextRequest, NextResponse } from 'next/server'
import {
  authenticateUser,
  clearFailedLoginAttempts,
  getDefaultWorkspaceMembership,
  recordFailedLoginAttempt,
} from '@/lib/auth'
import { createSession } from '@/lib/session'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/security/rate-limit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: NextRequest) {
  // Rate limit by IP address
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const rateLimit = checkRateLimit(`login:${ip}`, 10, 60 * 1000) // 10 requests per minute

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await authenticateUser(email, password)

    if (!user) {
      const retry = await recordFailedLoginAttempt(email)
      return NextResponse.json(
        { error: 'Invalid credentials', retryAfterSeconds: retry.retryAfterSeconds },
        { status: 401 },
      )
    }

    await clearFailedLoginAttempts(email)

    const membership = user.workspaces[0] ?? await getDefaultWorkspaceMembership(user.id)
    if (!membership) {
      return NextResponse.json({ error: 'Workspace membership required' }, { status: 403 })
    }

    await createSession(user.id, membership.workspaceId)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspace: {
        id: membership.workspaceId,
        name: membership.workspace.name,
        role: membership.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
