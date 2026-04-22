import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const failedLoginAttempts = new Map<string, { count: number; lastFailedAt: number }>()
const LOGIN_BACKOFF_THRESHOLD = 3

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters long')
  .regex(/[a-z]/, 'Password must include lowercase, uppercase, and numeric characters')
  .regex(/[A-Z]/, 'Password must include lowercase, uppercase, and numeric characters')
  .regex(/[0-9]/, 'Password must include lowercase, uppercase, and numeric characters')

function slugifyWorkspaceName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function createUniqueWorkspaceSlug(baseValue: string): Promise<string> {
  const baseSlug = slugifyWorkspaceName(baseValue) || 'workspace'
  let slug = baseSlug
  let suffix = 1

  while (await prisma.workspace.findUnique({ where: { slug } })) {
    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  return slug
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, name?: string) {
  passwordSchema.parse(password)
  const passwordHash = await hashPassword(password)
  const workspaceName = name?.trim() ? `${name.trim()}'s Workspace` : email.split('@')[0]
  const slug = await createUniqueWorkspaceSlug(workspaceName)

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      workspaces: {
        create: {
          role: 'owner',
          workspace: {
            create: {
              name: workspaceName,
              slug,
            },
          },
        },
      },
    },
    include: {
      workspaces: {
        include: {
          workspace: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      workspaces: {
        include: {
          workspace: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  return user
}

export async function recordFailedLoginAttempt(email: string, failedAttempts = 1) {
  const now = Date.now()
  const existing = failedLoginAttempts.get(email)
  const nextCount = existing ? Math.max(existing.count + 1, failedAttempts) : failedAttempts

  failedLoginAttempts.set(email, {
    count: nextCount,
    lastFailedAt: now,
  })

  if (nextCount <= LOGIN_BACKOFF_THRESHOLD) {
    return { retryAfterSeconds: 0 }
  }

  return {
    retryAfterSeconds: Math.min(30, (nextCount - LOGIN_BACKOFF_THRESHOLD) * 5),
  }
}

export async function clearFailedLoginAttempts(email: string) {
  failedLoginAttempts.delete(email)
}

export async function getDefaultWorkspaceMembership(userId: string) {
  return prisma.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function requireUserWorkspace(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId,
    },
    include: {
      workspace: true,
    },
  })
}
