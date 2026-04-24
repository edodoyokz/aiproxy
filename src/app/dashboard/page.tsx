import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OnboardingChecklist } from '@/components/onboarding-checklist'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import { LogoutButton } from '@/components/logout-button'
import { getWorkspaceStats } from '@/lib/analytics'
import { getAuthenticatedContext } from '@/lib/authz'
import { getWorkspaceUsage } from '@/lib/workspace'
import { Activity, Key, Zap, TrendingUp, Plus } from 'lucide-react'

interface UsageStats {
  currentRequests: number
  requestLimit: number
  totalCost: number
  avgLatency: number
  errorRate: number
}

export default async function DashboardPage() {
  const auth = await getAuthenticatedContext()
  if (!auth) {
    redirect('/login?returnTo=%2Fdashboard')
  }

  const [stats, usage] = await Promise.all([
    getWorkspaceStats(auth.workspaceId, 7),
    getWorkspaceUsage(auth.workspaceId),
  ])

  const usageStats: UsageStats = {
    currentRequests: stats.totalRequests,
    requestLimit: usage?.requests.limit ?? 1000,
    totalCost: stats.totalCost,
    avgLatency: stats.avgLatency,
    errorRate: 0,
  }

  const showUpgradePrompt = usageStats.currentRequests >= usageStats.requestLimit * 0.8
  const hasConnectedProvider = (usage?.providers.current ?? 0) > 0
  const hasTenantKey = (usage?.apiKeys.current ?? 0) > 0
  const hasSuccessfulRequest = usageStats.currentRequests > 0
  const activationState = !hasConnectedProvider
    ? {
        badge: 'Next required step',
        title: 'Workspace activation',
        summary: 'Complete these steps to activate your workspace.',
        description:
          'Connect a runtime-backed provider, issue a tenant key, and complete your first successful call to activate the workspace.',
        ctaLabel: 'Connect runtime provider',
        ctaHref: '/dashboard/providers',
      }
    : !hasTenantKey
    ? {
        badge: 'Current step',
        title: 'Workspace activation',
        summary: 'Complete these steps to activate your workspace.',
        description:
          'Your provider is connected. Generate a tenant key next so your workspace can accept runtime-backed requests.',
        ctaLabel: 'Generate tenant key',
        ctaHref: '/dashboard/keys',
      }
    : !hasSuccessfulRequest
    ? {
        badge: 'Current step',
        title: 'Workspace activation',
        summary: 'Complete these steps to activate your workspace.',
        description:
          'Provider and tenant key are ready. Make your first successful runtime-backed call to complete activation.',
        ctaLabel: 'View activation guide',
        ctaHref: '/docs/quickstart',
      }
    : {
        badge: 'Activation complete',
        title: 'Workspace activation',
        summary: 'Workspace activated and ready for scale.',
        description:
          'Your runtime-backed workflow is live. Track usage, review analytics, and expand your workspace with more providers or higher tiers.',
        ctaLabel: 'View analytics',
        ctaHref: '/dashboard/analytics',
      }

  const usagePercentage = (usageStats.currentRequests / usageStats.requestLimit) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = usagePercentage >= 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-semibold text-white">Aiproxy</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-white font-medium text-sm">
                  Dashboard
                </Link>
                <Link href="/dashboard/keys" className="text-slate-400 hover:text-white transition-colors text-sm">
                  API Keys
                </Link>
                <Link href="/dashboard/analytics" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Analytics
                </Link>
                <Link href="/docs" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Docs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                Upgrade
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/20">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                {activationState.badge}
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white">{activationState.title}</h1>
              <p className="mt-2 text-lg font-medium text-slate-200">{activationState.summary}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{activationState.description}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={activationState.ctaHref}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  {activationState.ctaLabel}
                </Link>
                <Link
                  href="/docs/quickstart"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
                >
                  Activation docs
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Activation overview</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Provider connected', complete: hasConnectedProvider },
                  { label: 'Tenant key issued', complete: hasTenantKey },
                  { label: 'First successful call', complete: hasSuccessfulRequest },
                ].map(step => (
                  <div key={step.label} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm">
                    <span className="text-slate-300">{step.label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${step.complete ? 'bg-green-500/10 text-green-300' : 'bg-slate-800 text-slate-400'}`}>
                      {step.complete ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!hasConnectedProvider && (
          <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Connect Provider First</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Connect a runtime-backed provider, issue a tenant key, and complete your first successful call to activate the workspace.
                </p>
              </div>
              <Link
                href="/dashboard/providers"
                className="inline-flex items-center justify-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-400"
              >
                Connect runtime provider
              </Link>
            </div>
          </div>
        )}

        {/* Upgrade Prompt */}
        {showUpgradePrompt && (
          <div className="mb-6">
            <UpgradePrompt
              type={isAtLimit ? 'limit-reached' : 'limit-warning'}
              currentUsage={usageStats.currentRequests}
              limit={usageStats.requestLimit}
            />
          </div>
        )}

        {/* Onboarding Checklist */}
        <div className="mb-8">
          <OnboardingChecklist workspaceId={auth.workspaceId} />
        </div>

        {/* Usage Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Usage Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Free Plan · Secondary until activation is complete</span>
              <Link
                href="/pricing"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Upgrade →
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Requests Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isAtLimit 
                    ? 'bg-red-500/10 text-red-400'
                    : isNearLimit 
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-green-500/10 text-green-400'
                }`}>
                  {usagePercentage.toFixed(0)}%
                </span>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">
                  {usageStats.currentRequests.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">
                  of {usageStats.requestLimit.toLocaleString()} requests
                </div>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    isAtLimit 
                      ? 'bg-red-500'
                      : isNearLimit 
                      ? 'bg-yellow-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Cost Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">
                  ${usageStats.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">
                  Total cost this month
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Avg: ${(usageStats.totalCost / Math.max(usageStats.currentRequests, 1)).toFixed(4)}/req
              </div>
            </div>

            {/* Latency Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">
                  {usageStats.avgLatency.toFixed(0)}ms
                </div>
                <div className="text-sm text-slate-400">
                  Average latency
                </div>
              </div>
              <div className="text-xs text-slate-500">
                  {usageStats.avgLatency < 500 ? 'Excellent' : usageStats.avgLatency < 1000 ? 'Good' : 'Needs attention'}
                </div>
            </div>

            {/* Error Rate Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">
                  {usageStats.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400">
                  Error rate
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {usageStats.errorRate < 1 ? 'Healthy' : usageStats.errorRate < 5 ? 'Monitor' : 'Action needed'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href={hasConnectedProvider ? '/dashboard/keys' : '/dashboard/providers'}
              className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Key className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {hasConnectedProvider ? 'Generate API Key' : 'Connect Provider First'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {hasConnectedProvider
                      ? 'Create a new tenant key for your app'
                      : 'Connect a provider before generating tenant keys or making your first request'}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/providers"
              className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Plus className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Connect Provider</h3>
                  <p className="text-sm text-slate-400">Connect OpenAI, Anthropic, and other CLIProxyAPIPlus-backed providers.</p>
                </div>
              </div>
            </Link>

            <Link
              href="/docs/quickstart"
              className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">View Docs</h3>
                  <p className="text-sm text-slate-400">Learn how to integrate</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 overflow-hidden">
            <div className="p-6 text-center text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs text-slate-500 mt-1">Make your first API call to see activity here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
