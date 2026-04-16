/**
 * CLIProxyAPIPlus Runtime Integration Types
 * 
 * This module defines the contract for integrating with CLIProxyAPIPlus runtime management API.
 * All interfaces represent the expected behavior when a real management client is plugged in.
 */

export enum RuntimeStatus {
  PROVISIONING = 'provisioning',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  FAILED = 'failed',
  TERMINATED = 'terminated',
}

export enum ProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  COHERE = 'cohere',
  MISTRAL = 'mistral',
}

export enum ProviderConnectionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  FAILED = 'failed',
  DISCONNECTED = 'disconnected',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * Runtime provisioning request
 */
export interface ProvisionRuntimeRequest {
  workspaceId: string
  planTier: 'FREE' | 'STARTER' | 'PRO'
  region?: string
  metadata?: Record<string, unknown>
}

/**
 * Runtime provisioning response
 */
export interface ProvisionRuntimeResponse {
  runtimeId: string
  workspaceId: string
  status: RuntimeStatus
  endpoint: string
  provisionedAt: Date
}

/**
 * Provider connection request
 */
export interface ConnectProviderRequest {
  runtimeId: string
  provider: ProviderType
  apiKey: string
  config?: Record<string, unknown>
}

/**
 * Provider connection response
 */
export interface ConnectProviderResponse {
  connectionId: string
  provider: ProviderType
  status: ProviderConnectionStatus
  connectedAt: Date
}

/**
 * API key issuance coordination request
 */
export interface IssueApiKeyRequest {
  runtimeId: string
  workspaceId: string
  keyName: string
  scopes?: string[]
}

/**
 * API key issuance response
 */
export interface IssueApiKeyResponse {
  keyId: string
  key: string
  runtimeId: string
  issuedAt: Date
}

/**
 * Usage sync request
 */
export interface SyncUsageRequest {
  runtimeId: string
  workspaceId: string
  since?: Date
}

/**
 * Usage event from runtime
 */
export interface RuntimeUsageEvent {
  eventId: string
  runtimeId: string
  apiKeyId: string
  provider: ProviderType
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  status: 'success' | 'error'
  latencyMs: number
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Usage sync response
 */
export interface SyncUsageResponse {
  events: RuntimeUsageEvent[]
  syncedAt: Date
  nextCursor?: string
}

/**
 * Runtime health check response
 */
export interface RuntimeHealthResponse {
  runtimeId: string
  status: HealthStatus
  uptime: number
  activeConnections: number
  requestsPerMinute: number
  errorRate: number
  lastCheckedAt: Date
  issues?: string[]
}

/**
 * Runtime termination request
 */
export interface TerminateRuntimeRequest {
  runtimeId: string
  reason?: string
}

/**
 * Runtime termination response
 */
export interface TerminateRuntimeResponse {
  runtimeId: string
  status: RuntimeStatus
  terminatedAt: Date
}

/**
 * Provider status query response
 */
export interface ProviderStatusResponse {
  connectionId: string
  provider: ProviderType
  status: ProviderConnectionStatus
  lastHealthCheck: Date
  errorCount: number
  lastError?: string
}
