import { redirect } from 'next/navigation'

import { getAuthenticatedContext } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { maskApiKey } from '@/lib/api-key'
import { getWorkspaceUsage } from '@/lib/workspace'
import { CreateKeyForm, ApiKeyRow } from '@/components/api-key-manager'

export default async function KeysPage() {
  const auth = await getAuthenticatedContext()
  if (!auth) {
    redirect('/login?returnTo=%2Fdashboard%2Fkeys')
  }

  const [usage, apiKeys] = await Promise.all([
    getWorkspaceUsage(auth.workspaceId),
    prisma.apiKey.findMany({
      where: { workspaceId: auth.workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        runtimeId: true,
      },
    }),
  ])

  const remainingSlots = Math.max((usage?.apiKeys.limit ?? 0) - (usage?.apiKeys.current ?? 0), 0)
  const hasProvider = (usage?.providers.current ?? 0) > 0

  const maskedKeys = apiKeys.map(k => ({
    ...k,
    key: maskApiKey(k.key),
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Tenant keys</p>
          <h1 className="mt-3 text-3xl font-bold text-white">API Keys</h1>
          <p className="mt-2 text-sm text-slate-400">
            Create and manage tenant API keys for your workspace runtime.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-300">
              {apiKeys.filter(k => k.isActive).length} active · {apiKeys.length} total
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-300">
              Remaining slots: {remainingSlots}
            </span>
          </div>
        </section>

        {!hasProvider && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
            <p className="text-sm font-medium text-yellow-200">
              Connect a provider first before generating API keys.
            </p>
            <a href="/dashboard/providers" className="mt-1 inline-block text-sm font-medium text-yellow-300 hover:text-yellow-200">
              Go to providers →
            </a>
          </div>
        )}

        <section className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create new key</h2>
          <CreateKeyForm disabled={!hasProvider || remainingSlots === 0} />
        </section>

        <section className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your keys</h2>
          <div className="space-y-3">
            {maskedKeys.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-4 py-5 text-sm text-slate-400">
                No API keys yet. Create one above to start making requests.
              </div>
            ) : (
              maskedKeys.map(apiKey => (
                <ApiKeyRow key={apiKey.id} apiKey={apiKey} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
