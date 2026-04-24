/**
 * Runtime Service Layer
 *
 * High-level service that coordinates runtime operations with local database state.
 * This layer bridges the runtime adapter (CLIProxyAPIPlus) with Prisma models.
 */

import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { getRuntimeAdapter } from './adapter-instance'
import {
  ProviderType,
  ProviderConnectionStatus,
  RuntimeStatus,
} from './types'
import { logAudit } from '@/lib/audit'
import { AuditAction } from '@prisma/client'
import { hashApiKey } from '@/lib/api-key'

/**
 * Provision a new runtime for a workspace
 * Creates runtime record in database and provisions via adapter
 */
export async function provisionWorkspaceRuntime(
  workspaceId: string,
  userId: string
): Promise<string> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  })

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  // Check if runtime already exists
  const existingRuntime = await prisma.runtime.findFirst({
    where: { 
      workspaceId,
      status: { in: ['PROVISIONING', 'ACTIVE'] }
    },
  })

  if (existingRuntime) {
    return existingRuntime.id
  }

  const adapter = getRuntimeAdapter()

  // Provision via adapter
  const response = await adapter.provisionRuntime({
    workspaceId,
    planTier: workspace.planTier,
    region: 'us-east-1', // TODO: Make configurable
  })

  // Store in database
  const runtime = await prisma.runtime.create({
    data: {
      id: response.runtimeId,
      workspaceId,
      endpoint: response.endpoint,
      status: response.status,
      region: 'us-east-1',
    },
  })

  // Log audit event
  await logAudit({
    workspaceId,
    userId,
    action: AuditAction.RUNTIME_PROVISIONED,
    resourceType: 'Runtime',
    resourceId: runtime.id,
    metadata: { planTier: workspace.planTier },
  })

  return runtime.id
}

/**
 * Connect a provider to workspace runtime
 */
export async function connectWorkspaceProvider(
  workspaceId: string,
  userId: string,
  provider: ProviderType,
  apiKey: string
): Promise<string> {
  // Get or provision runtime
  let runtime = await prisma.runtime.findFirst({
    where: { 
      workspaceId,
      status: { in: ['PROVISIONING', 'ACTIVE'] }
    },
  })

  if (!runtime) {
    const runtimeId = await provisionWorkspaceRuntime(workspaceId, userId)
    runtime = await prisma.runtime.findUnique({ where: { id: runtimeId } })
    if (!runtime) throw new Error('Failed to provision runtime')
  }

  const adapter = getRuntimeAdapter()

  // Connect via adapter
  const response = await adapter.connectProvider({
    runtimeId: runtime.id,
    provider,
    apiKey,
  })

  // Store connection in database
  const connection = await prisma.providerConnection.create({
    data: {
      id: response.connectionId,
      workspaceId,
      runtimeId: runtime.id,
      provider: response.provider,
      status: response.status,
    },
  })

  // Log audit event
  await logAudit({
    workspaceId,
    userId,
    action: AuditAction.PROVIDER_CONNECTED,
    resourceType: 'ProviderConnection',
    resourceId: connection.id,
    metadata: { provider },
  })

  return connection.id
}

export async function disconnectWorkspaceProvider(
  workspaceId: string,
  userId: string,
  connectionId: string,
): Promise<void> {
  const connection = await prisma.providerConnection.findFirst({
    where: {
      id: connectionId,
      workspaceId,
      isActive: true,
    },
  })

  if (!connection) {
    throw new Error('Provider connection not found')
  }

  const adapter = getRuntimeAdapter()
  await adapter.disconnectProvider(connection.runtimeId, connection.id)

  await prisma.providerConnection.update({
    where: { id: connection.id },
    data: {
      status: ProviderConnectionStatus.DISCONNECTED,
      isActive: false,
    },
  })

  await logAudit({
    workspaceId,
    userId,
    action: AuditAction.PROVIDER_DISCONNECTED,
    resourceType: 'ProviderConnection',
    resourceId: connection.id,
    metadata: { provider: connection.provider },
  })
}

/**
 * Issue API key coordinated with runtime
 */
export async function issueWorkspaceApiKey(
  workspaceId: string,
  userId: string,
  keyName: string
): Promise<{ keyId: string; key: string }> {
  // Get or provision runtime
  let runtime = await prisma.runtime.findFirst({
    where: { 
      workspaceId,
      status: { in: ['PROVISIONING', 'ACTIVE'] }
    },
  })

  if (!runtime) {
    const runtimeId = await provisionWorkspaceRuntime(workspaceId, userId)
    runtime = await prisma.runtime.findUnique({ where: { id: runtimeId } })
    if (!runtime) throw new Error('Failed to provision runtime')
  }

  const adapter = getRuntimeAdapter()

  // Issue via adapter
  const response = await adapter.issueApiKey({
    runtimeId: runtime.id,
    workspaceId,
    keyName,
  })

  // Store in database
  const apiKey = await prisma.apiKey.create({
    data: {
      key: response.key,
      keyHash: hashApiKey(response.key),
      name: keyName,
      workspaceId,
      createdBy: userId,
      runtimeId: response.runtimeId,
    },
  })

  // Log audit event
  await logAudit({
    workspaceId,
    userId,
    action: AuditAction.API_KEY_CREATED,
    resourceType: 'ApiKey',
    resourceId: apiKey.id,
    metadata: { name: keyName },
  })

  return {
    keyId: apiKey.id,
    key: apiKey.key,
  }
}

/**
 * Revoke API key at runtime level
 */
export async function revokeWorkspaceApiKey(
  workspaceId: string,
  userId: string,
  keyId: string
): Promise<void> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: keyId },
    include: { runtime: true },
  })

  if (!apiKey || apiKey.workspaceId !== workspaceId) {
    throw new Error('API key not found')
  }

  if (apiKey.runtimeId) {
    const adapter = getRuntimeAdapter()
    await adapter.revokeApiKey(apiKey.runtimeId, keyId)
  }

  // Update database
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  })

  // Log audit event
  await logAudit({
    workspaceId,
    userId,
    action: AuditAction.API_KEY_REVOKED,
    resourceType: 'ApiKey',
    resourceId: keyId,
    metadata: { name: apiKey.name },
  })
}

/**
 * Sync usage events from runtime to database
 */
export async function syncWorkspaceUsage(workspaceId: string): Promise<number> {
  const runtime = await prisma.runtime.findFirst({
    where: { 
      workspaceId,
      status: 'ACTIVE'
    },
  })

  if (!runtime) {
    return 0
  }

  const adapter = getRuntimeAdapter()

  // Get last sync time
  const lastSync = await prisma.usageEvent.findFirst({
    where: { workspaceId },
    orderBy: { timestamp: 'desc' },
    select: { timestamp: true },
  })

  const response = await adapter.syncUsage({
    runtimeId: runtime.id,
    workspaceId,
    since: lastSync?.timestamp,
  })

  // Store events in database
  if (response.events.length > 0) {
    await prisma.usageEvent.createMany({
      data: response.events.map(event => ({
        id: event.eventId,
        apiKeyId: event.apiKeyId,
        workspaceId,
        provider: event.provider,
        model: event.model,
        promptTokens: event.promptTokens,
        completionTokens: event.completionTokens,
        totalTokens: event.totalTokens,
        cost: event.cost,
        status: event.status,
        latencyMs: event.latencyMs,
        timestamp: event.timestamp,
        metadata: event.metadata
          ? (event.metadata as Prisma.InputJsonValue)
          : undefined,
      })),
      skipDuplicates: true,
    })
  }

  return response.events.length
}

/**
 * Check runtime health
 */
export async function checkRuntimeHealth(workspaceId: string) {
  const runtime = await prisma.runtime.findFirst({
    where: { workspaceId },
  })

  if (!runtime) {
    return null
  }

  const adapter = getRuntimeAdapter()
  return await adapter.checkHealth(runtime.id)
}

/**
 * Suspend workspace runtime
 */
export async function suspendWorkspaceRuntime(
  workspaceId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const runtime = await prisma.runtime.findFirst({
    where: { workspaceId },
  })

  if (!runtime) {
    throw new Error('Runtime not found')
  }

  const adapter = getRuntimeAdapter()
  await adapter.suspendRuntime(runtime.id)

  // Update database
  await prisma.runtime.update({
    where: { id: runtime.id },
    data: { status: RuntimeStatus.SUSPENDED },
  })

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { isSuspended: true },
  })

  // Log audit event
  await logAudit({
    workspaceId,
    userId,
    action: AuditAction.WORKSPACE_SUSPENDED,
    resourceType: 'Runtime',
    resourceId: runtime.id,
    metadata: { reason },
  })
}

/**
 * Resume workspace runtime
 */
export async function resumeWorkspaceRuntime(
  workspaceId: string,
  userId: string
): Promise<void> {
  const runtime = await prisma.runtime.findFirst({
    where: { workspaceId },
  })

  if (!runtime) {
    throw new Error('Runtime not found')
  }

  const adapter = getRuntimeAdapter()
  await adapter.resumeRuntime(runtime.id)

  // Update database
  await prisma.runtime.update({
    where: { id: runtime.id },
    data: { status: RuntimeStatus.ACTIVE },
  })

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { isSuspended: false },
  })

  // Log audit event
  await logAudit({
    workspaceId,
    userId,
    action: AuditAction.WORKSPACE_REACTIVATED,
    resourceType: 'Runtime',
    resourceId: runtime.id,
    metadata: {},
  })
}
