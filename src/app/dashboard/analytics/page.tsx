import { redirect } from 'next/navigation'

import { getAuthenticatedContext } from '@/lib/authz'
import { getWorkspaceStats } from '@/lib/analytics'
import { getWorkspaceUsage } from '@/lib/workspace'

export default async function AnalyticsPage() {
  const auth = await getAuthenticatedContext()
  if (!auth) {
    redirect('/login?returnTo=%2Fdashboard%2Fanalytics')
  }

  const [stats, usage] = await Promise.all([
    getWorkspaceStats(auth.workspaceId, 30),
    getWorkspaceUsage(auth.workspaceId),
  ])

  const requestUsage = usage?.requests ?? { current: 0, limit: 1000 }
  const providerUsage = usage?.providers ?? { current: 0, limit: 1 }
  const keyUsage = usage?.apiKeys ?? { current: 0, limit: 2 }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Analytics</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Workspace Analytics</h1>
          <p className="mt-2 text-sm text-slate-400">
            Usage stats for the last 30 days. Plan: {usage?.planTier ?? 'FREE'}
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Requests (this month)" value={requestUsage.current} limit={requestUsage.limit} />
          <StatCard label="Total Cost" value={`$${stats.totalCost.toFixed(2)}`} />
          <StatCard label="Avg Latency" value={`${stats.avgLatency.toFixed(0)}ms`} />
          <StatCard label="Total Requests (30d)" value={stats.totalRequests} />
        </div>

        <section className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Resource Usage</h2>
          <div className="space-y-4">
            <UsageBar label="Requests" current={requestUsage.current} limit={requestUsage.limit} />
            <UsageBar label="Providers" current={providerUsage.current} limit={providerUsage.limit} />
            <UsageBar label="API Keys" current={keyUsage.current} limit={keyUsage.limit} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h2>
          {stats.totalRequests === 0 ? (
            <p className="text-sm text-slate-400">No requests recorded yet. Make your first API call to see cost analytics.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs text-slate-500">Total Cost</p>
                <p className="mt-1 text-2xl font-bold text-white">${stats.totalCost.toFixed(4)}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs text-slate-500">Avg Cost / Request</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  ${(stats.totalCost / Math.max(stats.totalRequests, 1)).toFixed(6)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs text-slate-500">Total Tokens</p>
                <p className="mt-1 text-2xl font-bold text-white">{stats.totalTokens.toLocaleString()}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, limit }: { label: string; value: string | number; limit?: number }) {
  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {limit !== undefined && (
        <p className="mt-1 text-xs text-slate-500">of {limit === -1 ? 'unlimited' : limit.toLocaleString()}</p>
      )}
    </div>
  )
}

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100)
  const isHigh = percentage >= 80
  const isMax = percentage >= 100

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs text-slate-500">
          {current} / {isUnlimited ? 'unlimited' : limit}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isMax ? 'bg-red-500' : isHigh ? 'bg-yellow-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
          style={{ width: isUnlimited ? '0%' : `${percentage}%` }}
        />
      </div>
    </div>
  )
}
