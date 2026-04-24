'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DisconnectProviderButton({ connectionId, provider }: { connectionId: string; provider: string }) {
  const router = useRouter()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  async function handleDisconnect() {
    if (!confirm(`Disconnect ${provider}? Active keys using this provider will stop working.`)) return
    setIsDisconnecting(true)
    try {
      const res = await fetch(`/api/providers/${connectionId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        alert(data?.error || 'Failed to disconnect')
      }
    } catch {
      alert('Unable to reach server')
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={isDisconnecting}
      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
    >
      {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
    </button>
  )
}
