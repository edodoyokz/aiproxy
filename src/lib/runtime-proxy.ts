import { prisma } from './db'
import { normalizeOpenAIChatResponse, type ChatCompletionRequest } from './providers/proxy'

export class RuntimeProxyError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RuntimeProxyError'
    this.status = status
  }
}

export async function forwardChatCompletionToRuntime(
  workspaceId: string,
  input: ChatCompletionRequest,
  options?: {
    requestId?: string
    runtimeId?: string | null
  },
) {
  const runtime = options?.runtimeId
    ? await prisma.runtime.findFirst({
        where: {
          id: options.runtimeId,
          workspaceId,
        },
      })
    : await prisma.runtime.findFirst({
        where: {
          workspaceId,
          status: 'ACTIVE',
        },
      })

  if (!runtime?.endpoint) {
    throw new RuntimeProxyError('runtime upstream error: workspace runtime unavailable', 503)
  }

  const response = await fetch(`${runtime.endpoint.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.requestId ? { 'x-request-id': options.requestId } : {}),
    },
    body: JSON.stringify({
      provider: input.provider,
      model: input.model,
      messages: input.messages,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new RuntimeProxyError(`runtime upstream error: ${message}`, response.status)
  }

  const payload = await response.json()
  return normalizeOpenAIChatResponse(payload)
}
