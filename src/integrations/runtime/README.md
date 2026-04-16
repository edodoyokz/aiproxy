# Runtime Integration Module

This module provides a clean adapter architecture for integrating with CLIProxyAPIPlus runtime management.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (API Routes, Services, Business Logic)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Runtime Service Layer                       │
│  - High-level operations (provision, issue keys, sync)      │
│  - Database integration                                      │
│  - Error handling & retry logic                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Runtime Adapter Interface                  │
│  - Abstract contract for runtime operations                 │
│  - Provider-agnostic API                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐
│  Mock Adapter    │      │ CLIProxyAPIPlus      │
│  (Development)   │      │ Adapter (Production) │
└──────────────────┘      └──────────────────────┘
```

## Core Interfaces

### RuntimeAdapter
Main interface for runtime operations:
- `provisionRuntime()` - Create new runtime instance
- `deprovisionRuntime()` - Destroy runtime instance
- `getProviderStatus()` - Check provider connection health
- `issueKey()` - Coordinate API key issuance
- `revokeKey()` - Revoke API key from runtime
- `syncUsage()` - Sync usage metrics
- `healthCheck()` - Check runtime health

### RuntimeService
High-level service layer that wraps the adapter:
- Integrates with Prisma database
- Handles workspace-runtime relationships
- Provides error handling and logging
- Manages provider connections

## Current Implementation

**Status**: Mock adapter in use for development

The `MockRuntimeAdapter` simulates CLIProxyAPIPlus behavior:
- Returns realistic mock data
- Simulates latency (50-200ms)
- Provides deterministic responses for testing

## Integration Points

### 1. API Key Creation
`src/app/api/keys/route.ts`
```typescript
const runtime = await runtimeService.provisionRuntime(workspaceId)
const keyResult = await runtimeService.issueKey(runtime.id, keyId, providers)
```

### 2. API Key Revocation
`src/app/api/keys/[id]/route.ts`
```typescript
await runtimeService.revokeKey(runtimeId, keyId)
```

### 3. Request Validation
`src/app/api/proxy/chat/route.ts`
```typescript
const validation = await runtimeService.validateRequest(
  workspaceId, keyId, provider, model
)
```

### 4. Usage Tracking
`src/app/api/proxy/chat/route.ts`
```typescript
await runtimeService.syncUsage(workspaceId, {
  timestamp: new Date(),
  tokensUsed: 70,
  requestCount: 1,
  cost: 0.0001,
})
```

## Migration to CLIProxyAPIPlus

### Step 1: Implement Real Adapter
Create `src/integrations/runtime/cliproxyapi-adapter.ts`:

```typescript
import { RuntimeAdapter } from './adapter'
import { CLIProxyAPIClient } from '@cliproxyapi/sdk' // hypothetical SDK

export class CLIProxyAPIAdapter implements RuntimeAdapter {
  private client: CLIProxyAPIClient

  constructor(config: { apiKey: string; endpoint: string }) {
    this.client = new CLIProxyAPIClient(config)
  }

  async provisionRuntime(workspaceId: string, config: RuntimeConfig) {
    const response = await this.client.runtimes.create({
      workspaceId,
      region: config.region,
      providers: config.providers,
    })
    
    return {
      runtimeId: response.id,
      endpoint: response.endpoint,
      status: response.status,
    }
  }

  // ... implement other methods
}
```

### Step 2: Update Factory
Modify `src/integrations/runtime/index.ts`:

```typescript
import { CLIProxyAPIAdapter } from './cliproxyapi-adapter'

function createRuntimeAdapter(): RuntimeAdapter {
  const mode = process.env.RUNTIME_MODE || 'mock'
  
  if (mode === 'production') {
    return new CLIProxyAPIAdapter({
      apiKey: process.env.CLIPROXYAPI_KEY!,
      endpoint: process.env.CLIPROXYAPI_ENDPOINT!,
    })
  }
  
  return new MockRuntimeAdapter()
}
```

### Step 3: Environment Configuration
Add to `.env`:
```
RUNTIME_MODE=production
CLIPROXYAPI_KEY=your_api_key
CLIPROXYAPI_ENDPOINT=https://api.cliproxyapi.com
```

### Step 4: Test & Deploy
1. Run integration tests against staging environment
2. Verify all adapter methods work correctly
3. Monitor logs for errors
4. Gradually roll out to production

## Database Schema

### Runtime Table
```prisma
model Runtime {
  id           String   @id @default(cuid())
  workspaceId  String
  endpoint     String
  region       String   @default("us-east-1")
  status       RuntimeStatus
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### ProviderConnection Table
```prisma
model ProviderConnection {
  id          String   @id @default(cuid())
  runtimeId   String
  provider    String
  status      ConnectionStatus
  lastChecked DateTime @default(now())
  metadata    Json?
}
```

## Testing

### Unit Tests
Test each adapter method in isolation:
```typescript
describe('MockRuntimeAdapter', () => {
  it('should provision runtime', async () => {
    const adapter = new MockRuntimeAdapter()
    const result = await adapter.provisionRuntime('ws-123', config)
    expect(result.runtimeId).toBeDefined()
  })
})
```

### Integration Tests
Test service layer with database:
```typescript
describe('RuntimeService', () => {
  it('should create runtime and persist to database', async () => {
    const runtime = await runtimeService.provisionRuntime('ws-123')
    const dbRuntime = await prisma.runtime.findUnique({ 
      where: { id: runtime.id } 
    })
    expect(dbRuntime).toBeDefined()
  })
})
```

## Monitoring

Key metrics to track:
- Runtime provisioning time
- API key issuance latency
- Provider connection health
- Usage sync frequency
- Error rates by operation

## TODO Markers

Search codebase for these markers when implementing real adapter:
- `TODO: Replace with actual CLIProxyAPIPlus client`
- `TODO: This will eventually call CLIProxyAPIPlus`
- `TODO: Implement real health check endpoint`
- `TODO: Add retry logic for transient failures`

## Support

For questions about CLIProxyAPIPlus integration:
- Documentation: (to be added)
- API Reference: (to be added)
- Support: (to be added)
