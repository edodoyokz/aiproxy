import type { ProviderForwardRequest, ProviderForwardResponse } from './openai'

export class AnthropicForwardError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AnthropicForwardError'
    this.status = status
  }
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])

export async function forwardToAnthropic(
  apiKey: string,
  input: ProviderForwardRequest,
  options?: { requestId?: string }
): Promise<ProviderForwardResponse> {
  // Anthropic uses a different API format
  const anthropicMessages = input.messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }))

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        ...(options?.requestId ? { 'x-request-id': options.requestId } : {}),
      },
      body: JSON.stringify({
        model: input.model,
        messages: anthropicMessages,
        max_tokens: 4096, // Required by Anthropic
      }),
    })

    if (!response.ok) {
      const message = await response.text()

      if (attempt === 0 && RETRYABLE_STATUS.has(response.status)) {
        continue
      }

      throw new AnthropicForwardError(`Anthropic error: ${message}`, response.status)
    }

    const payload = await response.json() as {
      id: string
      type: string
      role: string
      content: Array<{ type: string; text: string }>
      model: string
      stop_reason: string | null
      usage: {
        input_tokens: number
        output_tokens: number
      }
    }

    // Normalize to OpenAI-like format
    return {
      response: {
        id: payload.id,
        object: 'chat.completion',
        created: Date.now(),
        model: payload.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: payload.content[0]?.text || ''
          },
          finish_reason: payload.stop_reason
        }]
      },
      usage: {
        promptTokens: payload.usage.input_tokens,
        completionTokens: payload.usage.output_tokens,
        totalTokens: payload.usage.input_tokens + payload.usage.output_tokens,
      },
    }
  }

  throw new AnthropicForwardError('Anthropic error: retry attempts exhausted', 503)
}
