'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProviderCatalogEntry } from '@/lib/providers/catalog'

type ConnectProviderCardProps = {
  provider: ProviderCatalogEntry
  remainingSlots: number
  isAlreadyConnected: boolean
}

export function ConnectProviderCard({ provider, remainingSlots, isAlreadyConnected }: ConnectProviderCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [providerApiKey, setProviderApiKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isDisabled = remainingSlots === 0 || isAlreadyConnected || isSubmitting || success

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider.id,
          providerApiKey,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null

      if (!response.ok) {
        setError(payload?.error || payload?.message || 'Failed to connect provider')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-white">{provider.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{provider.description}</p>
        </div>
        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-300">
          {provider.runtime}
        </span>
      </div>

      {success ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          ✓ Provider connected successfully
        </div>
      ) : isExpanded ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {provider.name} API Key
            </label>
            <input
              type="password"
              value={providerApiKey}
              onChange={(e) => setProviderApiKey(e.target.value)}
              placeholder={`sk-...`}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !providerApiKey.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Connecting...' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false)
                setProviderApiKey('')
                setError(null)
              }}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          disabled={isDisabled}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAlreadyConnected ? 'Connected' : remainingSlots === 0 ? 'No slots available' : 'Connect'}
        </button>
      )}
    </div>
  )
}
