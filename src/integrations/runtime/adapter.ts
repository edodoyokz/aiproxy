/**
 * CLIProxyAPIPlus Runtime Adapter Interface
 * 
 * This interface defines the contract for runtime management operations.
 * Implementations can be mocked (for development) or real (production CLIProxyAPIPlus client).
 */

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
  ProviderType,
} from './types'

/**
 * Runtime adapter interface for CLIProxyAPIPlus integration
 */
export interface IRuntimeAdapter {
  /**
   * Provision a new runtime instance for a workspace
   * @throws RuntimeProvisionError if provisioning fails
   */
  provisionRuntime(request: ProvisionRuntimeRequest): Promise<ProvisionRuntimeResponse>

  /**
   * Connect a provider to an existing runtime
   * @throws ProviderConnectionError if connection fails
   */
  connectProvider(request: ConnectProviderRequest): Promise<ConnectProviderResponse>

  /**
   * Disconnect a provider from runtime
   */
  disconnectProvider(runtimeId: string, connectionId: string): Promise<void>

  /**
   * Issue a new API key coordinated with the runtime
   * @throws ApiKeyIssuanceError if issuance fails
   */
  issueApiKey(request: IssueApiKeyRequest): Promise<IssueApiKeyResponse>

  /**
   * Revoke an API key at the runtime level
   */
  revokeApiKey(runtimeId: string, keyId: string): Promise<void>

  /**
   * Sync usage events from runtime to local database
   */
  syncUsage(request: SyncUsageRequest): Promise<SyncUsageResponse>

  /**
   * Check runtime health status
   */
  checkHealth(runtimeId: string): Promise<RuntimeHealthResponse>

  /**
   * Get provider connection status
   */
  getProviderStatus(runtimeId: string, connectionId: string): Promise<ProviderStatusResponse>

  /**
   * List all providers connected to a runtime
   */
  listProviders(runtimeId: string): Promise<ProviderStatusResponse[]>

  /**
   * Terminate a runtime instance
   */
  terminateRuntime(request: TerminateRuntimeRequest): Promise<TerminateRuntimeResponse>

  /**
   * Suspend a runtime (soft termination, can be resumed)
   */
  suspendRuntime(runtimeId: string): Promise<void>

  /**
   * Resume a suspended runtime
   */
  resumeRuntime(runtimeId: string): Promise<void>
}

/**
 * Custom error types for runtime operations
 */
export class RuntimeProvisionError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: unknown) {
    super(message)
    this.name = 'RuntimeProvisionError'
  }
}

export class ProviderConnectionError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: unknown) {
    super(message)
    this.name = 'ProviderConnectionError'
  }
}

export class ApiKeyIssuanceError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: unknown) {
    super(message)
    this.name = 'ApiKeyIssuanceError'
  }
}

export class RuntimeHealthError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: unknown) {
    super(message)
    this.name = 'RuntimeHealthError'
  }
}
