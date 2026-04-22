import {
  ApiKeyIssuanceError,
  IRuntimeAdapter,
  ProviderConnectionError,
  RuntimeHealthError,
  RuntimeProvisionError,
} from './adapter'
import {
  ConnectProviderRequest,
  ConnectProviderResponse,
  IssueApiKeyRequest,
  IssueApiKeyResponse,
  ProviderStatusResponse,
  ProvisionRuntimeRequest,
  ProvisionRuntimeResponse,
  RuntimeHealthResponse,
  SyncUsageRequest,
  SyncUsageResponse,
  TerminateRuntimeRequest,
  TerminateRuntimeResponse,
} from './types'

type CLIProxyAPIPlusAdapterConfig = {
  apiUrl: string
  apiKey: string
  timeoutMs?: number
}

export class CLIProxyAPIPlusAdapter implements IRuntimeAdapter {
  private apiUrl: string
  private apiKey: string
  private timeoutMs: number

  constructor(config: CLIProxyAPIPlusAdapterConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey
    this.timeoutMs = config.timeoutMs ?? 30000
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(`${this.apiUrl}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...(init.headers ?? {}),
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = await response.text()
        throw new RuntimeProvisionError(
          `CLIProxyAPIPlus request failed: ${body}`,
          `HTTP_${response.status}`,
        )
      }

      return (await response.json()) as T
    } finally {
      clearTimeout(timeout)
    }
  }

  async provisionRuntime(request: ProvisionRuntimeRequest): Promise<ProvisionRuntimeResponse> {
    return this.request('/runtimes', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async connectProvider(request: ConnectProviderRequest): Promise<ConnectProviderResponse> {
    try {
      return await this.request(`/runtimes/${request.runtimeId}/providers`, {
        method: 'POST',
        body: JSON.stringify(request),
      })
    } catch (error) {
      throw new ProviderConnectionError(
        error instanceof Error ? error.message : 'Provider connection failed',
        'PROVIDER_CONNECTION_FAILED',
      )
    }
  }

  async disconnectProvider(runtimeId: string, connectionId: string): Promise<void> {
    await this.request(`/runtimes/${runtimeId}/providers/${connectionId}`, {
      method: 'DELETE',
    })
  }

  async issueApiKey(request: IssueApiKeyRequest): Promise<IssueApiKeyResponse> {
    try {
      return await this.request(`/runtimes/${request.runtimeId}/keys`, {
        method: 'POST',
        body: JSON.stringify(request),
      })
    } catch (error) {
      throw new ApiKeyIssuanceError(
        error instanceof Error ? error.message : 'API key issuance failed',
        'API_KEY_ISSUANCE_FAILED',
      )
    }
  }

  async revokeApiKey(runtimeId: string, keyId: string): Promise<void> {
    await this.request(`/runtimes/${runtimeId}/keys/${keyId}`, {
      method: 'DELETE',
    })
  }

  async syncUsage(request: SyncUsageRequest): Promise<SyncUsageResponse> {
    const query = request.since ? `?since=${encodeURIComponent(request.since.toISOString())}` : ''
    return this.request(`/runtimes/${request.runtimeId}/usage${query}`, {
      method: 'GET',
    })
  }

  async checkHealth(runtimeId: string): Promise<RuntimeHealthResponse> {
    try {
      return await this.request(`/runtimes/${runtimeId}/health`, {
        method: 'GET',
      })
    } catch (error) {
      throw new RuntimeHealthError(
        error instanceof Error ? error.message : 'Runtime health check failed',
        'RUNTIME_HEALTH_FAILED',
      )
    }
  }

  async getProviderStatus(runtimeId: string, connectionId: string): Promise<ProviderStatusResponse> {
    return this.request(`/runtimes/${runtimeId}/providers/${connectionId}`, {
      method: 'GET',
    })
  }

  async listProviders(runtimeId: string): Promise<ProviderStatusResponse[]> {
    return this.request(`/runtimes/${runtimeId}/providers`, {
      method: 'GET',
    })
  }

  async terminateRuntime(request: TerminateRuntimeRequest): Promise<TerminateRuntimeResponse> {
    return this.request(`/runtimes/${request.runtimeId}/terminate`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async suspendRuntime(runtimeId: string): Promise<void> {
    await this.request(`/runtimes/${runtimeId}/suspend`, {
      method: 'POST',
    })
  }

  async resumeRuntime(runtimeId: string): Promise<void> {
    await this.request(`/runtimes/${runtimeId}/resume`, {
      method: 'POST',
    })
  }
}

export function createCLIProxyAPIPlusAdapterFromEnv(): CLIProxyAPIPlusAdapter {
  const apiUrl = process.env.CLIPROXYAPIPLUS_API_URL
  const apiKey = process.env.CLIPROXYAPIPLUS_API_KEY

  if (!apiUrl) {
    throw new RuntimeProvisionError(
      'CLIPROXYAPIPLUS_API_URL environment variable is required',
      'MISSING_CLIPROXYAPIPLUS_API_URL',
    )
  }

  if (!apiKey) {
    throw new RuntimeProvisionError(
      'CLIPROXYAPIPLUS_API_KEY environment variable is required',
      'MISSING_CLIPROXYAPIPLUS_API_KEY',
    )
  }

  return new CLIProxyAPIPlusAdapter({
    apiUrl,
    apiKey,
    timeoutMs: 30000,
  })
}
