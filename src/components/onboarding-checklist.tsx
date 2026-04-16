'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  action?: {
    label: string
    href: string
  }
}

interface OnboardingChecklistProps {
  workspaceId?: string
  onComplete?: () => void
}

export function OnboardingChecklist({ workspaceId, onComplete }: OnboardingChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'create-workspace',
      title: 'Create your workspace',
      description: 'Set up your first workspace to organize your API keys',
      completed: false,
      action: { label: 'Create workspace', href: '/dashboard/workspaces/new' }
    },
    {
      id: 'connect-provider',
      title: 'Connect an AI provider',
      description: 'Add your OpenAI, Anthropic, or other provider API key',
      completed: false,
      action: { label: 'Add provider', href: '/dashboard/providers' }
    },
    {
      id: 'generate-key',
      title: 'Generate your API key',
      description: 'Create an Aiproxy API key to use in your application',
      completed: false,
      action: { label: 'Generate key', href: '/dashboard/keys' }
    },
    {
      id: 'test-request',
      title: 'Make your first request',
      description: 'Test your setup with a sample API call',
      completed: false,
      action: { label: 'View docs', href: '/docs/quickstart' }
    }
  ])

  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    // Load checklist progress from API
    if (workspaceId) {
      fetch(`/api/onboarding/progress?workspaceId=${workspaceId}`)
        .then(res => res.json())
        .then(data => {
          if (data.progress) {
            setItems(prev => prev.map(item => ({
              ...item,
              completed: data.progress[item.id] || false
            })))
          }
        })
        .catch(err => console.error('Failed to load onboarding progress:', err))
    }
  }, [workspaceId])

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length
  const progress = (completedCount / totalCount) * 100
  const isComplete = completedCount === totalCount

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete()
    }
  }, [isComplete, onComplete])

  if (isComplete && !isExpanded) {
    return null
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            {isComplete ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span className="text-white font-bold text-sm">{completedCount}/{totalCount}</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold">
              {isComplete ? 'Setup complete! 🎉' : 'Get started with Aiproxy'}
            </h3>
            <p className="text-sm text-slate-400">
              {isComplete 
                ? 'You\'re all set to build with AI' 
                : `${completedCount} of ${totalCount} steps completed`}
            </p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  item.completed
                    ? 'bg-slate-800/30 border-slate-700/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-blue-500/30'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  item.completed
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : 'bg-slate-700 border-2 border-slate-600'
                }`}>
                  {item.completed && <Check className="w-4 h-4 text-green-500" />}
                  {!item.completed && <span className="text-xs text-slate-400">{index + 1}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium mb-1 ${
                    item.completed ? 'text-slate-400 line-through' : 'text-white'
                  }`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-400 mb-3">
                    {item.description}
                  </p>
                  {!item.completed && item.action && (
                    <Link
                      href={item.action.href}
                      className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      {item.action.label}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isComplete && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-slate-300 mb-3">
                🚀 Ready to scale? Check out our Starter and Pro plans for advanced features.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                View pricing
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
