import { prisma } from './db'
import { randomBytes } from 'crypto'

export function generateApiKey(): string {
  return `sk-${randomBytes(32).toString('hex')}`
}

export function maskApiKey(key: string): string {
  if (key.length <= 10) {
    return `${key.slice(0, 2)}••••`
  }

  return `${key.slice(0, 5)}••••••••••${key.slice(-4)}`
}

export async function validateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { workspace: true },
  })

  if (!apiKey || !apiKey.isActive) return null

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey
}

export async function getOwnedApiKeyForUpdate(workspaceId: string, keyId: string) {
  return prisma.apiKey.findFirst({
    where: {
      id: keyId,
      workspaceId,
    },
  })
}

export async function revokeApiKey(keyId: string, userId: string) {
  return prisma.apiKey.updateMany({
    where: { id: keyId, createdBy: userId },
    data: { isActive: false },
  })
}
