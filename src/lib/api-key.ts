import { prisma } from './db'
import { randomBytes } from 'crypto'

export function generateApiKey(): string {
  return `sk-${randomBytes(32).toString('hex')}`
}

export async function createApiKey(userId: string, name: string) {
  const key = generateApiKey()
  return prisma.apiKey.create({
    data: {
      key,
      name,
      userId,
    },
  })
}

export async function validateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  })

  if (!apiKey || !apiKey.isActive) return null

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey
}

export async function revokeApiKey(keyId: string, userId: string) {
  return prisma.apiKey.updateMany({
    where: { id: keyId, userId },
    data: { isActive: false },
  })
}
