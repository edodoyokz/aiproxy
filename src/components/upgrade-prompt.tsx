'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useState } from 'react'

interface UpgradePromptProps {
  type: 'limit-reached' | 'limit-warning' | 'feature-locked'
  currentUsage?: number
  limit?: number
  feature?: string
  onDismiss?: () => void
}

export function UpgradePrompt({ type, currentUsage, limit, feature, onDismiss }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const getContent = () => {
    switch (type) {
      case 'limit-reached':
        return {
          title: 'Request limit reached',
          description: `You've used ${currentUsage?.toLocaleString()} of ${limit?.toLocaleString()} requests this month. Upgrade to continue.`,
          icon: '🚫',
          color: 'red'
        }
      case 'limit-warning':
        const percentage = currentUsage && limit ? Math.round((currentUsage / limit) * 100) : 0
        return {
          title: `${percentage}% of monthly requests used`,
          description: `You've used ${currentUsage?.toLocaleString()} of ${limit?.toLocaleString()} requests. Consider upgrading to avoid interruptions.`,
          icon: '⚠️',
          color: 'yellow'
        }
      case 'feature-locked':
        return {
          title: `${feature} is a premium feature`,
          description: 'Upgrade to Starter or Pro to unlock this feature and more.',
          icon: '🔒',
          color: 'blue'
        }
    }
  }

  const content = getContent()
  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700'
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const colors = colorClasses[content.color as keyof typeof colorClasses]

  return (
    <div className={`relative rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-xl p-6`}>
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="text-3xl">{content.icon}</div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${colors.text} mb-1`}>
            {content.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {content.description}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className={`px-4 py-2 ${colors.button} text-white rounded-lg text-sm font-medium transition-colors`}
            >
              View Plans
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Compare features →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InlineUpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
      <span className="text-sm text-slate-300">
        <span className="text-blue-400 font-medium">{feature}</span> requires upgrade
      </span>
      <Link
        href="/pricing"
        className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
      >
        View Plans
      </Link>
    </div>
  )
}
