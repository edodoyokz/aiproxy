import { NextRequest, NextResponse } from 'next/server'
import { createUser, passwordSchema } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/security/rate-limit'

function hasPrismaErrorCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
}

const signupSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Rate limit by IP address
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const rateLimit = checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000) // 5 requests per hour

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
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
    const { email, password, name } = signupSchema.parse(body)

    const user = await createUser(email, password, name)
    const membership = user.workspaces[0]

    if (!membership) {
      return NextResponse.json({ error: 'Workspace bootstrap failed' }, { status: 500 })
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
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    
    if (hasPrismaErrorCode(error) && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
