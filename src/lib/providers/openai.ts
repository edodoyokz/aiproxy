export interface ProviderForwardRequest {
  model: string
  messages: Array<{ role: string; content: string }>
}

export interface ProviderForwardResponse {
  response: unknown
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class ProviderForwardError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ProviderForwardError'
    this.status = status
  }
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])

export async function forwardToOpenAI(
  apiKey: string,
  input: ProviderForwardRequest,
  options?: { requestId?: string }
): Promise<ProviderForwardResponse> {
  for (let attempt = 0; attempt < 2; attempt++) {
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

      if (attempt === 0 && RETRYABLE_STATUS.has(response.status)) {
        continue
      }

      throw new ProviderForwardError(`OpenAI error: ${message}`, response.status)
    }

    const payload = await response.json() as {
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

    return {
      response: payload,
      usage: {
        promptTokens: payload.usage?.prompt_tokens ?? 0,
        completionTokens: payload.usage?.completion_tokens ?? 0,
        totalTokens: payload.usage?.total_tokens ?? 0,
      },
    }
  }

  throw new ProviderForwardError('OpenAI error: retry attempts exhausted', 503)
}
