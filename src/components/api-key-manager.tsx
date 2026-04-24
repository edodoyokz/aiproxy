'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Trash2, Plus } from 'lucide-react'

type ApiKeyItem = {
  id: string
  name: string
  key: string
  isActive: boolean
  createdAt: string
  lastUsedAt: string | null
  runtimeId: string | null
}

export function CreateKeyForm({ disabled }: { disabled: boolean }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || 'Failed to create key')
        return
      }

      setCreatedKey(data.key)
      setName('')
      router.refresh()
    } catch {
      setError('Unable to reach server')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopy() {
    if (!createdKey) return
    await navigator.clipboard.writeText(createdKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name (e.g. production-v1)"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
          disabled={isSubmitting || disabled}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || disabled || !name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Creating...' : 'Create Key'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {createdKey && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <p className="mb-2 text-sm font-medium text-green-200">
            Key created. Copy it now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-slate-950/70 px-3 py-2 text-xs text-green-300 font-mono break-all">
              {createdKey}
            </code>
            <button
              onClick={handleCopy}
              className="rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-slate-300 transition hover:bg-slate-800"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ApiKeyRow({ apiKey }: { apiKey: ApiKeyItem }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  async function handleDelete() {
    if (!confirm(`Revoke key "${apiKey.name}"? This cannot be undone.`)) return
    setIsDeleting(true)
    try {
      await fetch(`/api/keys/${apiKey.id}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      alert('Failed to revoke key')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleToggle() {
    setIsToggling(true)
    try {
      await fetch(`/api/keys/${apiKey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !apiKey.isActive }),
      })
      router.refresh()
    } catch {
      alert('Failed to update key')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{apiKey.name}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            apiKey.isActive
              ? 'bg-green-500/10 text-green-300 border border-green-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {apiKey.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="mt-1 text-xs font-mono text-slate-500">{apiKey.key}</p>
        <p className="mt-1 text-xs text-slate-500">
          Created {new Date(apiKey.createdAt).toLocaleDateString()}
          {apiKey.lastUsedAt && ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isToggling ? '...' : apiKey.isActive ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
