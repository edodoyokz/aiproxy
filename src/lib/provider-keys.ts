import { prisma } from './db'
import { decrypt } from './encryption'

/**
 * Get and decrypt a provider's API key for use in proxy requests
 */
export async function getProviderApiKey(connectionId: string): Promise<string | null> {
  const connection = await prisma.providerConnection.findUnique({
    where: { id: connectionId },
    select: { encryptedApiKey: true, isActive: true },
  })

  if (!connection || !connection.encryptedApiKey || !connection.isActive) {
    return null
  }

  return decrypt(connection.encryptedApiKey)
}

/**
 * Get and decrypt a provider's API key by workspace and provider type
 */
export async function getProviderApiKeyByWorkspace(
  workspaceId: string,
  provider: string
): Promise<string | null> {
  const connection = await prisma.providerConnection.findFirst({
    where: {
      workspaceId,
      provider,
      isActive: true,
    },
    select: { encryptedApiKey: true, id: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!connection || !connection.encryptedApiKey) {
    return null
  }

  return decrypt(connection.encryptedApiKey)
}
