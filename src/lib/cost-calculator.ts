/**
 * Cost Calculator
 * 
 * Estimates API costs based on provider, model, and token usage.
 * Pricing is based on public provider pricing as of April 2026.
 * 
 * NOTE: These are estimates only. Actual costs may vary.
 * For production billing, integrate with provider billing APIs.
 */

interface ModelPricing {
  promptTokenPrice: number // Price per 1M tokens
  completionTokenPrice: number // Price per 1M tokens
}

const OPENAI_PRICING: Record<string, ModelPricing> = {
  'gpt-4': {
    promptTokenPrice: 30.0,
    completionTokenPrice: 60.0,
  },
  'gpt-4-turbo': {
    promptTokenPrice: 10.0,
    completionTokenPrice: 30.0,
  },
  'gpt-4-turbo-preview': {
    promptTokenPrice: 10.0,
    completionTokenPrice: 30.0,
  },
  'gpt-3.5-turbo': {
    promptTokenPrice: 0.5,
    completionTokenPrice: 1.5,
  },
  'gpt-3.5-turbo-16k': {
    promptTokenPrice: 3.0,
    completionTokenPrice: 4.0,
  },
}

const ANTHROPIC_PRICING: Record<string, ModelPricing> = {
  'claude-3-opus': {
    promptTokenPrice: 15.0,
    completionTokenPrice: 75.0,
  },
  'claude-3-sonnet': {
    promptTokenPrice: 3.0,
    completionTokenPrice: 15.0,
  },
  'claude-3-haiku': {
    promptTokenPrice: 0.25,
    completionTokenPrice: 1.25,
  },
}

/**
 * Calculate estimated cost for an API request
 * 
 * @param provider - Provider name (e.g., 'openai', 'anthropic')
 * @param model - Model identifier
 * @param promptTokens - Number of prompt tokens
 * @param completionTokens - Number of completion tokens
 * @returns Estimated cost in USD
 */
export function calculateCost(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = getModelPricing(provider, model)
  
  if (!pricing) {
    // Unknown model - return 0 rather than throwing
    return 0
  }

  const promptCost = (promptTokens / 1_000_000) * pricing.promptTokenPrice
  const completionCost = (completionTokens / 1_000_000) * pricing.completionTokenPrice
  
  return promptCost + completionCost
}

function getModelPricing(provider: string, model: string): ModelPricing | null {
  const normalizedProvider = provider.toLowerCase()
  const normalizedModel = model.toLowerCase()

  if (normalizedProvider === 'openai') {
    // Try exact match first
    if (OPENAI_PRICING[normalizedModel]) {
      return OPENAI_PRICING[normalizedModel]
    }
    
    // Try prefix matching for versioned models
    for (const [key, pricing] of Object.entries(OPENAI_PRICING)) {
      if (normalizedModel.startsWith(key)) {
        return pricing
      }
    }
  }

  if (normalizedProvider === 'anthropic') {
    if (ANTHROPIC_PRICING[normalizedModel]) {
      return ANTHROPIC_PRICING[normalizedModel]
    }
    
    for (const [key, pricing] of Object.entries(ANTHROPIC_PRICING)) {
      if (normalizedModel.startsWith(key)) {
        return pricing
      }
    }
  }

  return null
}
