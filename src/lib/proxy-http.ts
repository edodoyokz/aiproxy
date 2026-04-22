import { randomUUID } from 'node:crypto'

import { ProxyUpstreamError } from './providers/proxy'
import { RuntimeProxyError } from './runtime-proxy'

export function resolveRequestId(headerValue: string | null): string {
  const trimmed = headerValue?.trim()
  return trimmed ? trimmed : randomUUID()
}

export function getProxyErrorResponse(error: unknown, requestId: string) {
  if (error instanceof ProxyUpstreamError || error instanceof RuntimeProxyError) {
    return {
      status: error.status,
      body: {
        error: error.message,
        requestId,
      },
    }
  }

  return {
    status: 500,
    body: {
      error: 'Internal server error',
      requestId,
    },
  }
}
