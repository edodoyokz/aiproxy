import { z } from 'zod'
import { ProviderType } from '@/integrations/runtime/types'

const providerSchema = z.nativeEnum(ProviderType)

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
})

export const chatCompletionRequestSchema = z.object({
  provider: providerSchema.default(ProviderType.OPENAI),
  model: z.string().min(1),
  messages: z.array(messageSchema).min(1),
})

export type ChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>

export const DIRECT_PROVIDER_FALLBACK = 'DIRECT_PROVIDER_FALLBACK'

export class ProxyUpstreamError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ProxyUpstreamError'
    this.status = status
  }
}

const RETRYABLE_UPSTREAM_STATUS = new Set([408, 429, 500, 502, 503, 504])

type OpenAIChatResponse = {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: { role: string; content: string }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

export function normalizeOpenAIChatResponse(response: OpenAIChatResponse) {
  return {
    response,
    usage: {
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    },
  }
}

export async function proxyChatCompletion(
  input: ChatCompletionRequest,
  options?: { requestId?: string },
) {
  if (process.env.ENABLE_DIRECT_PROVIDER_FALLBACK !== 'true') {
    throw new Error(`${DIRECT_PROVIDER_FALLBACK} is disabled`)
  }

  if (input.provider !== 'openai') {
    throw new Error(`Unsupported provider: ${input.provider}`)
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required')
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(options?.requestId ? { 'x-request-id': options.requestId } : {}),
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
      }),
    })

    if (!response.ok) {
      const message = await response.text()

      if (attempt === 0 && RETRYABLE_UPSTREAM_STATUS.has(response.status)) {
        continue
      }

      throw new ProxyUpstreamError(`OpenAI upstream error: ${message}`, response.status)
    }

    const payload = (await response.json()) as OpenAIChatResponse
    return normalizeOpenAIChatResponse(payload)
  }

  throw new ProxyUpstreamError('OpenAI upstream error: retry attempts exhausted', 503)
}
