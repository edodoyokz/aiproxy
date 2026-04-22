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
      title: 'Create your workspace runtime',
      description: 'Provision the workspace runtime that will host providers, tenant keys, and requests.',
      completed: false,
      action: { label: 'View dashboard', href: '/dashboard' }
    },
    {
      id: 'connect-provider',
      title: 'Connect an AI provider first',
      description: 'Required before you can generate a tenant key and make your first successful call.',
      completed: false,
      action: { label: 'Connect provider', href: '/dashboard/providers' }
    },
    {
      id: 'generate-key',
      title: 'Generate your API key',
      description: 'Create an Aiproxy tenant API key after a provider is connected to your runtime.',
      completed: false,
      action: { label: 'Generate key', href: '/dashboard/keys' }
    },
    {
      id: 'test-request',
      title: 'Make your first successful runtime-backed request',
      description: 'Send a successful request through the workspace runtime to complete activation.',
      completed: false,
      action: { label: 'View docs', href: '/docs/quickstart' }
    }
  ])

  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
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
  const nextItem = items.find(item => !item.completed)

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete()
    }
  }, [isComplete, onComplete])

  if (isComplete && !isExpanded) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-slate-950/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 transition-colors hover:bg-slate-800/30"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
              {isComplete ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <span className="text-sm font-bold text-white">{completedCount}/{totalCount}</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                Workspace activation checklist
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                {isComplete ? 'Activation complete' : 'Get started with Aiproxy'}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {isComplete
                  ? 'Workspace activated. You can now focus on usage, analytics, and scaling.'
                  : `${completedCount} of ${totalCount} steps completed`}
              </p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-6 px-6 pb-6">
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current step</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {nextItem ? nextItem.title : 'Workspace activated'}
                </p>
              </div>
              {!isComplete && nextItem?.action && (
                <Link
                  href={nextItem.action.href}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
                >
                  {nextItem.action.label}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <p className="text-sm text-slate-400">
              {isComplete
                ? 'Activation complete. Your workspace is ready for runtime-backed requests.'
                : nextItem?.description ?? 'Complete the remaining steps to activate your workspace.'}
            </p>
          </div>

          <div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  item.completed
                    ? 'border-slate-700/50 bg-slate-800/30'
                    : item.id === nextItem?.id
                    ? 'border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-950/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-blue-500/30'
                }`}
              >
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                  item.completed
                    ? 'border-2 border-green-500 bg-green-500/20'
                    : item.id === nextItem?.id
                    ? 'border-2 border-blue-400 bg-blue-500/20'
                    : 'border-2 border-slate-600 bg-slate-700'
                }`}>
                  {item.completed && <Check className="h-4 w-4 text-green-500" />}
                  {!item.completed && (
                    <span className={`text-xs ${item.id === nextItem?.id ? 'text-blue-200' : 'text-slate-400'}`}>
                      {index + 1}
                    </span>
                  )}
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
                  {!item.completed && item.id === nextItem?.id && (
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
                      Next required step
                    </p>
                  )}
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
            <div className="mt-6 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4">
              <p className="text-sm text-slate-300 mb-3">
                🚀 Workspace activated. Check out our Starter and Pro plans for advanced features.
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
