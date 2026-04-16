# CLIProxyAPIPlus Runtime Integration

## Overview

This module provides a clean adapter architecture for integrating with CLIProxyAPIPlus runtime management API. The current implementation uses mocked adapters for development, with a clear path to production integration.

## Architecture

```
src/integrations/runtime/
├── types.ts           # TypeScript interfaces for all runtime operations
├── adapter.ts         # IRuntimeAdapter interface and error types
├── mock-adapter.ts    # Mocked implementation (current)
├── service.ts         # High-level service layer (Prisma integration)
└── index.ts           # Module exports and dependency injection
```

## Key Concepts

### Runtime
A runtime is a provisioned instance of CLIProxyAPIPlus that handles API requests for a workspace. Each workspace can have one active runtime.

### Provider Connection
Represents a connection between a runtime and an AI provider (OpenAI, Anthropic, etc.). Multiple providers can be connected to a single runtime.

### API Key Coordination
API keys are issued at both the application level (Prisma) and runtime level (CLIProxyAPIPlus), ensuring synchronized access control.

### Usage Sync
Usage events are tracked by the runtime and periodically synced to the local database for analytics and billing.

## Integration Checklist

### Phase 1: Preparation (Current)
- [x] Define typed interfaces for all runtime operations
- [x] Create IRuntimeAdapter interface
- [x] Implement MockRuntimeAdapter for development
- [x] Build service layer with Prisma integration
- [x] Update database schema with Runtime and ProviderConnection models
- [ ] Update API routes to use runtime service
- [ ] Add integration tests with mocked adapter

### Phase 2: Real Integration
- [ ] Install CLIProxyAPIPlus SDK: `npm install @cliproxyapiplus/client`
- [ ] Create CLIProxyAPIPlusAdapter implementing IRuntimeAdapter
- [ ] Configure environment variables:
  - `CLIPROXYAPIPLUS_API_KEY` - API key for management API
  - `CLIPROXYAPIPLUS_API_URL` - API endpoint (default: https://api.cliproxyapiplus.io)
- [ ] Update `src/integrations/runtime/index.ts` to use real adapter
- [ ] Test against staging environment
- [ ] Update integration tests to use real API (with test credentials)

### Phase 3: Production Deployment
- [ ] Configure production API credentials
- [ ] Set up monitoring for runtime health checks
- [ ] Implement usage sync cron job
- [ ] Add alerting for runtime failures
- [ ] Document operational procedures

## API Operations

### Runtime Provisioning
```typescript
import { provisionWorkspaceRuntime } from '@/integrations/runtime/service'

const runtimeId = await provisionWorkspaceRuntime(workspaceId, userId)
```

### Provider Connection
```typescript
import { connectWorkspaceProvider } from '@/integrations/runtime/service'
import { ProviderType } from '@/integrations/runtime'

await connectWorkspaceProvider(
  workspaceId,
  userId,
  ProviderType.OPENAI,
  'sk-...'
)
```

### API Key Issuance
```typescript
import { issueWorkspaceApiKey } from '@/integrations/runtime/service'

const { keyId, key } = await issueWorkspaceApiKey(
  workspaceId,
  userId,
  'Production Key'
)
```

### Usage Sync
```typescript
import { syncWorkspaceUsage } from '@/integrations/runtime/service'

const eventCount = await syncWorkspaceUsage(workspaceId)
console.log(`Synced ${eventCount} usage events`)
```

### Health Check
```typescript
import { checkRuntimeHealth } from '@/integrations/runtime/service'

const health = await checkRuntimeHealth(workspaceId)
console.log(`Runtime status: ${health.status}`)
```

## Error Handling

The adapter defines custom error types for different failure scenarios:

- `RuntimeProvisionError` - Runtime provisioning failed
- `ProviderConnectionError` - Provider connection failed
- `ApiKeyIssuanceError` - API key issuance failed
- `RuntimeHealthError` - Health check failed

All errors include a `code` field for programmatic handling and optional `details` for debugging.

## Testing

### Unit Tests
```typescript
import { MockRuntimeAdapter } from '@/integrations/runtime'

const adapter = new MockRuntimeAdapter()
const response = await adapter.provisionRuntime({
  workspaceId: 'ws_123',
  planTier: 'PRO',
})
```

### Integration Tests
```typescript
// TODO: Add integration tests once real adapter is implemented
// Tests should cover:
// - Runtime provisioning and termination
// - Provider connection lifecycle
// - API key issuance and revocation
// - Usage sync with pagination
// - Health check monitoring
```

## Migration Path

### Current State (Mock)
All runtime operations use `MockRuntimeAdapter` which simulates CLIProxyAPIPlus behavior with in-memory state.

### Transition to Production
1. Implement `CLIProxyAPIPlusAdapter` class
2. Update `getRuntimeAdapter()` in `src/integrations/runtime/index.ts`
3. Configure environment variables
4. Test against staging environment
5. Deploy to production

### Example Real Adapter
```typescript
// src/integrations/runtime/cliproxyapiplus-adapter.ts
import { CLIProxyAPIPlusClient } from '@cliproxyapiplus/client'
import { IRuntimeAdapter } from './adapter'

export class CLIProxyAPIPlusAdapter implements IRuntimeAdapter {
  private client: CLIProxyAPIPlusClient

  constructor(config: { apiKey: string; apiUrl?: string }) {
    this.client = new CLIProxyAPIPlusClient({
      apiKey: config.apiKey,
      baseUrl: config.apiUrl || 'https://api.cliproxyapiplus.io',
    })
  }

  async provisionRuntime(request: ProvisionRuntimeRequest) {
    return await this.client.runtimes.provision(request)
  }

  // ... implement other methods
}
```

## Environment Variables

```bash
# Required for production
CLIPROXYAPIPLUS_API_KEY=your_api_key_here

# Optional (defaults to production URL)
CLIPROXYAPIPLUS_API_URL=https://api.cliproxyapiplus.io

# Optional (timeout in milliseconds)
CLIPROXYAPIPLUS_TIMEOUT=30000
```

## Monitoring

### Health Checks
Run periodic health checks on all active runtimes:

```typescript
import { prisma } from '@/lib/db'
import { checkRuntimeHealth } from '@/integrations/runtime/service'

async function monitorRuntimes() {
  const runtimes = await prisma.runtime.findMany({
    where: { status: 'ACTIVE' },
  })

  for (const runtime of runtimes) {
    try {
      const health = await checkRuntimeHealth(runtime.workspaceId)
      if (health.status !== 'HEALTHY') {
        // Alert operations team
        console.error(`Runtime ${runtime.id} is ${health.status}`)
      }
    } catch (error) {
      console.error(`Health check failed for runtime ${runtime.id}`, error)
    }
  }
}
```

### Usage Sync
Run periodic usage sync for billing and analytics:

```typescript
import { syncWorkspaceUsage } from '@/integrations/runtime/service'

async function syncAllWorkspaces() {
  const workspaces = await prisma.workspace.findMany({
    where: { isSuspended: false },
  })

  for (const workspace of workspaces) {
    try {
      const count = await syncWorkspaceUsage(workspace.id)
      console.log(`Synced ${count} events for workspace ${workspace.id}`)
    } catch (error) {
      console.error(`Sync failed for workspace ${workspace.id}`, error)
    }
  }
}
```

## TODO Markers in Code

Search for `TODO:` comments in the codebase to find integration points:

```bash
grep -r "TODO:" src/integrations/runtime/
```

Key TODO items:
- Replace MockRuntimeAdapter with real CLIProxyAPIPlusAdapter
- Add new AuditAction enum values (RUNTIME_PROVISIONED, etc.)
- Implement usage sync cron job
- Add runtime health monitoring
- Create integration tests for real API
