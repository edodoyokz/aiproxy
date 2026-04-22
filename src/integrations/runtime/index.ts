/**
 * Runtime Integration Module
 *
 * Central export point for runtime adapter and related utilities.
 * Switch between mock and real implementation here.
 */

import { prisma } from '@/lib/db'
import { getRuntimeAdapter } from './adapter-instance'
import { provisionWorkspaceRuntime, syncWorkspaceUsage } from './service'

/**
 * TODO: Replace with real CLIProxyAPIPlus adapter when ready
 * 
 * To integrate real CLIProxyAPIPlus client:
 * 1. Create CLIProxyAPIPlusAdapter class implementing IRuntimeAdapter
 * 2. Import it here: import { CLIProxyAPIPlusAdapter } from './cliproxyapiplus-adapter'
 * 3. Update getRuntimeAdapter() to return new CLIProxyAPIPlusAdapter()
 * 4. Configure environment variables for API credentials
 * 
 * Example real adapter initialization:
 * ```typescript
 * export function getRuntimeAdapter(): IRuntimeAdapter {
 *   const apiKey = process.env.CLIPROXYAPIPLUS_API_KEY
 *   const apiUrl = process.env.CLIPROXYAPIPLUS_API_URL || 'https://api.cliproxyapiplus.io'
 *   
 *   if (!apiKey) {
 *     throw new Error('CLIPROXYAPIPLUS_API_KEY environment variable is required')
 *   }
 *   
 *   return new CLIProxyAPIPlusAdapter({
 *     apiKey,
 *     apiUrl,
 *     timeout: 30000,
 *   })
 * }
 * ```
 */

export const runtimeService = {
  async validateRequest(
    workspaceId: string,
    apiKeyId: string,
    provider: string,
    model: string,
  ) {
    return {
      allowed: true,
      reason: undefined,
      workspaceId,
      apiKeyId,
      provider,
      model,
    }
  },

  async syncUsage(workspaceId: string, usage: Record<string, unknown>) {
    void usage
    await syncWorkspaceUsage(workspaceId)
  },

  async revokeKey(runtimeId: string, keyId: string) {
    await getRuntimeAdapter().revokeApiKey(runtimeId, keyId)
  },

  async checkHealth(runtimeId: string) {
    return getRuntimeAdapter().checkHealth(runtimeId)
  },

  async getWorkspaceRuntimes(workspaceId: string) {
    return prisma.runtime.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async provisionRuntime(workspaceId: string) {
    const runtimeId = await provisionWorkspaceRuntime(workspaceId, 'system')
    const runtime = await prisma.runtime.findUnique({ where: { id: runtimeId } })

    if (!runtime) {
      throw new Error('Failed to provision runtime')
    }

    return runtime
  },
}

// Re-export types and interfaces
export * from './types'
export * from './adapter'
export * from './adapter-instance'
export * from './service'
export { MockRuntimeAdapter } from './mock-adapter'
export { CLIProxyAPIPlusAdapter, createCLIProxyAPIPlusAdapterFromEnv } from './cliproxyapiplus-adapter'
