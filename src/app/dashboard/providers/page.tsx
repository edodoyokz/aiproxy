import { redirect } from 'next/navigation'

import { getAuthenticatedContext } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { PROVIDER_CATALOG_LIST } from '@/lib/providers/catalog'
import { getWorkspaceUsage } from '@/lib/workspace'

export default async function ProvidersPage() {
  const auth = await getAuthenticatedContext()
  if (!auth) {
    redirect('/login?returnTo=%2Fdashboard%2Fproviders')
  }

  const [usage, connections] = await Promise.all([
    getWorkspaceUsage(auth.workspaceId),
    prisma.providerConnection.findMany({
      where: { workspaceId: auth.workspaceId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const remainingSlots = Math.max((usage?.providers.limit ?? 0) - (usage?.providers.current ?? 0), 0)
  const hasConnections = connections.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/20">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Activation step</p>
              <h1 className="mt-3 text-3xl font-bold text-white">Connect a provider to continue activation</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Provider connections unlock the next milestone in your workspace journey. Once a provider is connected,
                you can generate tenant key access and make your first successful call through the runtime.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-300">
                  Remaining slots: {remainingSlots}
                </span>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                  Next: Generate tenant key
                </span>
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  Then: First successful call
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Activation status</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-white">Provider connection</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {hasConnections
                      ? 'At least one provider is connected and ready for the next activation step.'
                      : 'No providers connected yet. Start here to unlock tenant keys and your first request.'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                  {hasConnections ? 'Generate tenant key to continue activation.' : 'Choose a provider below to continue activation.'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Available providers</h2>
              <p className="mt-1 text-sm text-slate-400">
                Remaining active provider slots: {remainingSlots}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PROVIDER_CATALOG_LIST.map(provider => (
              <div key={provider.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{provider.name}</h3>
                  <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-300">
                    {provider.runtime}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{provider.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-6">
          <h2 className="text-xl font-semibold text-white">Connected providers</h2>
          <div className="mt-4 space-y-3">
            {connections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-4 py-5 text-sm text-slate-400">
                No providers connected yet. Connect a provider to unlock tenant key issuance and your first successful runtime-backed call.
              </div>
            ) : (
              connections.map(connection => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3 shadow-lg shadow-slate-950/20"
                >
                  <div>
                    <p className="font-medium capitalize text-white">{connection.provider}</p>
                    <p className="text-sm text-slate-400">Connection ID: {connection.id}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                    {connection.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
