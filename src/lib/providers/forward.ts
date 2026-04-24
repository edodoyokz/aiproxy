import type { ProviderForwardRequest, ProviderForwardResponse } from './openai'
import { forwardToOpenAI } from './openai'
import { forwardToAnthropic } from './anthropic'
import { forwardToGoogle } from './google'

export class ProviderForwardError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ProviderForwardError'
    this.status = status
  }
}

export async function forwardToProvider(
  provider: string,
  apiKey: string,
  input: ProviderForwardRequest,
  options?: { requestId?: string }
): Promise<ProviderForwardResponse> {
  const normalizedProvider = provider.toLowerCase()

  switch (normalizedProvider) {
    case 'openai':
      return forwardToOpenAI(apiKey, input, options)

    case 'anthropic':
      return forwardToAnthropic(apiKey, input, options)

    case 'google':
      return forwardToGoogle(apiKey, input, options)

    default:
      throw new ProviderForwardError(`Unsupported provider: ${provider}`, 400)
  }
}
