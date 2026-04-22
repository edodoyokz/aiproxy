import { ProviderType } from '@/integrations/runtime/types'

export type ProviderCatalogEntry = {
  id: ProviderType
  name: string
  description: string
  runtime: 'CLIProxyAPIPlus'
}

export const PROVIDER_CATALOG: Record<ProviderType, ProviderCatalogEntry> = {
  [ProviderType.OPENAI]: {
    id: ProviderType.OPENAI,
    name: 'OpenAI',
    description: 'Connect OpenAI models through the CLIProxyAPIPlus-backed workspace runtime.',
    runtime: 'CLIProxyAPIPlus',
  },
  [ProviderType.ANTHROPIC]: {
    id: ProviderType.ANTHROPIC,
    name: 'Anthropic',
    description: 'Connect Anthropic models through the CLIProxyAPIPlus-backed workspace runtime.',
    runtime: 'CLIProxyAPIPlus',
  },
  [ProviderType.GOOGLE]: {
    id: ProviderType.GOOGLE,
    name: 'Google',
    description: 'Connect Google models through the CLIProxyAPIPlus-backed workspace runtime.',
    runtime: 'CLIProxyAPIPlus',
  },
  [ProviderType.COHERE]: {
    id: ProviderType.COHERE,
    name: 'Cohere',
    description: 'Connect Cohere models through the CLIProxyAPIPlus-backed workspace runtime.',
    runtime: 'CLIProxyAPIPlus',
  },
  [ProviderType.MISTRAL]: {
    id: ProviderType.MISTRAL,
    name: 'Mistral',
    description: 'Connect Mistral models through the CLIProxyAPIPlus-backed workspace runtime.',
    runtime: 'CLIProxyAPIPlus',
  },
}

export const PROVIDER_CATALOG_LIST = Object.values(PROVIDER_CATALOG)

export function isProviderType(value: string): value is ProviderType {
  return Object.values(ProviderType).includes(value as ProviderType)
}
