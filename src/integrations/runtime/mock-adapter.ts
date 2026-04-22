/**
 * Mocked Runtime Adapter Implementation
 * 
 * TODO: Replace this with real CLIProxyAPIPlus management API client
 * 
 * This mock simulates the behavior of a real runtime management system.
 * It provides deterministic responses for development and testing.
 * 
 * Integration checklist:
 * 1. Install CLIProxyAPIPlus SDK: npm install @cliproxyapiplus/client
 * 2. Configure API credentials in environment variables
 * 3. Replace MockRuntimeAdapter with CLIProxyAPIPlusAdapter
 * 4. Update dependency injection in src/integrations/runtime/index.ts
 * 5. Test all operations against staging environment
 * 6. Update integration tests to use real API
 */

import { randomBytes } from 'crypto'
import {
  IRuntimeAdapter,
  RuntimeProvisionError,
  ProviderConnectionError,
  ApiKeyIssuanceError,
} from './adapter'
import {
  ProvisionRuntimeRequest,
  ProvisionRuntimeResponse,
  ConnectProviderRequest,
  ConnectProviderResponse,
  IssueApiKeyRequest,
  IssueApiKeyResponse,
  SyncUsageRequest,
  SyncUsageResponse,
  RuntimeHealthResponse,
  TerminateRuntimeRequest,
  TerminateRuntimeResponse,
  ProviderStatusResponse,
  RuntimeStatus,
  ProviderConnectionStatus,
  HealthStatus,
} from './types'

/**
 * Mock implementation of runtime adapter
 * Simulates CLIProxyAPIPlus behavior with in-memory state
 */
export class MockRuntimeAdapter implements IRuntimeAdapter {
  private runtimes = new Map<string, {
    runtimeId: string
    workspaceId: string
    status: RuntimeStatus
    endpoint: string
    provisionedAt: Date
    planTier: ProvisionRuntimeRequest['planTier']
    region: string
  }>()
  private connections = new Map<string, {
    connectionId: string
    runtimeId: string
    provider: ConnectProviderRequest['provider']
    status: ProviderConnectionStatus
    connectedAt: Date
    config?: Record<string, unknown>
  }>()
  private apiKeys = new Map<string, {
    keyId: string
    key: string
    runtimeId: string
    workspaceId: string
    keyName: string
    scopes: string[]
    issuedAt: Date
  }>()

  async provisionRuntime(request: ProvisionRuntimeRequest): Promise<ProvisionRuntimeResponse> {
    // TODO: Replace with real API call
    // const client = new CLIProxyAPIPlusClient(process.env.CLIPROXYAPIPLUS_API_KEY)
    // return await client.runtimes.provision(request)

    // Simulate provisioning delay
    await this.delay(100)

    const runtimeId = `rt_${randomBytes(16).toString('hex')}`
    const endpoint = `https://runtime-${runtimeId}.cliproxyapiplus.io`

    const runtime = {
      runtimeId,
      workspaceId: request.workspaceId,
      status: RuntimeStatus.ACTIVE,
      endpoint,
      provisionedAt: new Date(),
      planTier: request.planTier,
      region: request.region || 'us-east-1',
    }

    this.runtimes.set(runtimeId, runtime)

    return {
      runtimeId: runtime.runtimeId,
      workspaceId: runtime.workspaceId,
      status: runtime.status,
      endpoint: runtime.endpoint,
      provisionedAt: runtime.provisionedAt,
    }
  }

  async connectProvider(request: ConnectProviderRequest): Promise<ConnectProviderResponse> {
    // TODO: Replace with real API call
    // return await client.providers.connect(request)

    await this.delay(50)

    const runtime = this.runtimes.get(request.runtimeId)
    if (!runtime) {
      throw new ProviderConnectionError('Runtime not found', 'RUNTIME_NOT_FOUND')
    }

    const connectionId = `conn_${randomBytes(16).toString('hex')}`

    const connection = {
      connectionId,
      runtimeId: request.runtimeId,
      provider: request.provider,
      status: ProviderConnectionStatus.CONNECTED,
      connectedAt: new Date(),
      config: request.config,
    }

    this.connections.set(connectionId, connection)

    return {
      connectionId: connection.connectionId,
      provider: connection.provider,
      status: connection.status,
      connectedAt: connection.connectedAt,
    }
  }

  async disconnectProvider(_runtimeId: string, connectionId: string): Promise<void> {
    // TODO: Replace with real API call
    // await client.providers.disconnect(runtimeId, connectionId)

    await this.delay(50)

    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.status = ProviderConnectionStatus.DISCONNECTED
    }
  }

  async issueApiKey(request: IssueApiKeyRequest): Promise<IssueApiKeyResponse> {
    // TODO: Replace with real API call
    // return await client.apiKeys.issue(request)

    await this.delay(50)

    const runtime = this.runtimes.get(request.runtimeId)
    if (!runtime) {
      throw new ApiKeyIssuanceError('Runtime not found', 'RUNTIME_NOT_FOUND')
    }

    const keyId = `key_${randomBytes(16).toString('hex')}`
    const key = `sk_${randomBytes(32).toString('hex')}`

    const apiKey = {
      keyId,
      key,
      runtimeId: request.runtimeId,
      workspaceId: request.workspaceId,
      keyName: request.keyName,
      scopes: request.scopes || [],
      issuedAt: new Date(),
    }

    this.apiKeys.set(keyId, apiKey)

    return {
      keyId: apiKey.keyId,
      key: apiKey.key,
      runtimeId: apiKey.runtimeId,
      issuedAt: apiKey.issuedAt,
    }
  }

  async revokeApiKey(runtimeId: string, keyId: string): Promise<void> {
    // TODO: Replace with real API call
    // await client.apiKeys.revoke(runtimeId, keyId)

    void runtimeId
    await this.delay(50)
    this.apiKeys.delete(keyId)
  }

  async syncUsage(request: SyncUsageRequest): Promise<SyncUsageResponse> {
    // TODO: Replace with real API call
    // return await client.usage.sync(request)

    void request
    await this.delay(100)

    // Mock: return empty events for now
    // Real implementation will fetch usage events from runtime
    return {
      events: [],
      syncedAt: new Date(),
    }
  }

  async checkHealth(runtimeId: string): Promise<RuntimeHealthResponse> {
    // TODO: Replace with real API call
    // return await client.runtimes.health(runtimeId)

    await this.delay(50)

    const runtime = this.runtimes.get(runtimeId)
    if (!runtime) {
      throw new RuntimeProvisionError('Runtime not found', 'RUNTIME_NOT_FOUND')
    }

    return {
      runtimeId,
      status: HealthStatus.HEALTHY,
      uptime: 3600000, // 1 hour in ms
      activeConnections: 5,
      requestsPerMinute: 120,
      errorRate: 0.01,
      lastCheckedAt: new Date(),
    }
  }

  async getProviderStatus(runtimeId: string, connectionId: string): Promise<ProviderStatusResponse> {
    // TODO: Replace with real API call
    // return await client.providers.status(runtimeId, connectionId)

    await this.delay(50)

    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new ProviderConnectionError('Connection not found', 'CONNECTION_NOT_FOUND')
    }

    return {
      connectionId,
      provider: connection.provider,
      status: connection.status,
      lastHealthCheck: new Date(),
      errorCount: 0,
    }
  }

  async listProviders(runtimeId: string): Promise<ProviderStatusResponse[]> {
    // TODO: Replace with real API call
    // return await client.providers.list(runtimeId)

    await this.delay(50)

    const providers: ProviderStatusResponse[] = []
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.runtimeId === runtimeId) {
        providers.push({
          connectionId,
          provider: connection.provider,
          status: connection.status,
          lastHealthCheck: new Date(),
          errorCount: 0,
        })
      }
    }

    return providers
  }

  async terminateRuntime(request: TerminateRuntimeRequest): Promise<TerminateRuntimeResponse> {
    // TODO: Replace with real API call
    // return await client.runtimes.terminate(request)

    await this.delay(100)

    const runtime = this.runtimes.get(request.runtimeId)
    if (!runtime) {
      throw new RuntimeProvisionError('Runtime not found', 'RUNTIME_NOT_FOUND')
    }

    runtime.status = RuntimeStatus.TERMINATED
    const terminatedAt = new Date()

    return {
      runtimeId: request.runtimeId,
      status: RuntimeStatus.TERMINATED,
      terminatedAt,
    }
  }

  async suspendRuntime(runtimeId: string): Promise<void> {
    // TODO: Replace with real API call
    // await client.runtimes.suspend(runtimeId)

    await this.delay(50)

    const runtime = this.runtimes.get(runtimeId)
    if (runtime) {
      runtime.status = RuntimeStatus.SUSPENDED
    }
  }

  async resumeRuntime(runtimeId: string): Promise<void> {
    // TODO: Replace with real API call
    // await client.runtimes.resume(runtimeId)

    await this.delay(50)

    const runtime = this.runtimes.get(runtimeId)
    if (runtime) {
      runtime.status = RuntimeStatus.ACTIVE
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
