import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'aiproxy_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

type SessionPayload = JWTPayload & {
  userId: string
  workspaceId: string
  expiresAt: string
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error('SESSION_SECRET is required')
  }

  // Validate secret strength in production
  if (process.env.NODE_ENV === 'production') {
    const MIN_SECRET_LENGTH = 32
    const PLACEHOLDER_VALUES = [
      'your-secret-key-here-change-in-production',
      'replace-with-a-long-random-secret',
      'secret',
      'change-me',
    ]

    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters in production. Current length: ${secret.length}`
      )
    }

    if (PLACEHOLDER_VALUES.includes(secret.toLowerCase())) {
      throw new Error(
        'SESSION_SECRET must be changed from the placeholder value in production'
      )
    }
  }

  return new TextEncoder().encode(secret)
}

export async function encrypt(input: {
  userId: string
  workspaceId: string
  expiresAt: Date
}): Promise<string> {
  return new SignJWT({
    userId: input.userId,
    workspaceId: input.workspaceId,
    expiresAt: input.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(input.expiresAt.getTime() / 1000))
    .sign(getSessionSecret())
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ['HS256'],
    })

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.workspaceId !== 'string' ||
      typeof payload.expiresAt !== 'string'
    ) {
      return null
    }

    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(userId: string, workspaceId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  const session = await encrypt({ userId, workspaceId, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return decrypt(token)
}
