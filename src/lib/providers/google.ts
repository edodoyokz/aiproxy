import type { ProviderForwardRequest, ProviderForwardResponse } from './openai'

export class GoogleForwardError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GoogleForwardError'
    this.status = status
  }
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])

export async function forwardToGoogle(
  apiKey: string,
  input: ProviderForwardRequest,
  options?: { requestId?: string }
): Promise<ProviderForwardResponse> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.requestId ? { 'x-request-id': options.requestId } : {}),
        },
        body: JSON.stringify({
          contents: input.messages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            parts: [{ text: msg.content }],
          })),
        }),
      }
    )

    if (!response.ok) {
      const message = await response.text()

      if (attempt === 0 && RETRYABLE_STATUS.has(response.status)) {
        continue
      }

      throw new GoogleForwardError(`Google error: ${message}`, response.status)
    }

    const payload = await response.json() as {
      candidates: Array<{
        content: {
          parts: Array<{ text: string }>
        }
        finishReason: string
      }>
      usageMetadata: {
        promptTokenCount: number
        candidatesTokenCount: number
        totalTokenCount: number
      }
    }

    const candidate = payload.candidates[0]
    const text = candidate?.content?.parts[0]?.text || ''

    // Normalize to OpenAI-like format
    return {
      response: {
        id: `google-${Date.now()}`,
        object: 'chat.completion',
        created: Date.now(),
        model: input.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: text
          },
          finish_reason: candidate?.finishReason || 'stop'
        }]
      },
      usage: {
        promptTokens: payload.usageMetadata?.promptTokenCount || 0,
        completionTokens: payload.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: payload.usageMetadata?.totalTokenCount || 0,
      },
    }
  }

  throw new GoogleForwardError('Google error: retry attempts exhausted', 503)
}
