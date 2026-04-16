'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OnboardingChecklist } from '@/components/onboarding-checklist'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import { Activity, Key, Zap, TrendingUp, Settings, Plus } from 'lucide-react'

interface UsageStats {
  currentRequests: number
  requestLimit: number
  totalCost: number
  avgLatency: number
  errorRate: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UsageStats>({
    currentRequests: 0,
    requestLimit: 1000,
    totalCost: 0,
    avgLatency: 0,
    errorRate: 0
  })

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  useEffect(() => {
    // Fetch usage stats
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        const requests = data.totalRequests || 0
        const limit = 1000 // Free tier limit
        
        setStats({
          currentRequests: requests,
          requestLimit: limit,
          totalCost: data.totalCost || 0,
          avgLatency: data.avgLatency || 0,
          errorRate: data.errorRate || 0
        })

        // Show upgrade prompt if approaching or at limit
        if (requests >= limit * 0.8) {
          setShowUpgradePrompt(true)
        }
      })
      .catch(err => console.error('Failed to load stats:', err))
  }, [])

  const usagePercentage = (stats.currentRequests / stats.requestLimit) * 100
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
              <button className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Settings className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Monitor your API usage and manage your workspace</p>
        </div>

        {/* Upgrade Prompt */}
        {showUpgradePrompt && (
          <div className="mb-6">
            <UpgradePrompt
              type={isAtLimit ? 'limit-reached' : 'limit-warning'}
              currentUsage={stats.currentRequests}
              limit={stats.requestLimit}
              onDismiss={() => setShowUpgradePrompt(false)}
            />
          </div>
        )}

        {/* Onboarding Checklist */}
        <div className="mb-8">
          <OnboardingChecklist />
        </div>

        {/* Usage Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Usage Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Free Plan</span>
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
                  {stats.currentRequests.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">
                  of {stats.requestLimit.toLocaleString()} requests
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
                  ${stats.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">
                  Total cost this month
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Avg: ${(stats.totalCost / Math.max(stats.currentRequests, 1)).toFixed(4)}/req
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
                  {stats.avgLatency.toFixed(0)}ms
                </div>
                <div className="text-sm text-slate-400">
                  Average latency
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {stats.avgLatency < 500 ? 'Excellent' : stats.avgLatency < 1000 ? 'Good' : 'Needs attention'}
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
                  {stats.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400">
                  Error rate
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {stats.errorRate < 1 ? 'Healthy' : stats.errorRate < 5 ? 'Monitor' : 'Action needed'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/keys"
              className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Key className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Generate API Key</h3>
                  <p className="text-sm text-slate-400">Create a new key for your app</p>
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
                  <h3 className="text-white font-semibold mb-1">Add Provider</h3>
                  <p className="text-sm text-slate-400">Connect OpenAI, Anthropic, etc.</p>
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
