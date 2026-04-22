'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AuthFormMode = 'login' | 'signup'

type AuthFormProps = {
  mode: AuthFormMode
  returnTo?: string
}

export function AuthForm({ mode, returnTo }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSignup = mode === 'signup'
  const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login'
  const heading = isSignup ? 'Create your workspace' : 'Welcome back'
  const subheading = isSignup
    ? 'Create an account to manage workspace-scoped API keys and analytics.'
    : 'Sign in to access your workspace dashboard and API keys.'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...(isSignup && name.trim() ? { name: name.trim() } : {}),
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; retryAfterSeconds?: number }
        | null

      if (!response.ok) {
        const retryMessage =
          payload?.retryAfterSeconds && payload.retryAfterSeconds > 0
            ? ` Try again in ${payload.retryAfterSeconds} seconds.`
            : ''

        setError((payload?.error ?? 'Authentication failed') + retryMessage)
        return
      }

      router.push(returnTo ?? '/dashboard')
      router.refresh()
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800/60 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-lg font-bold text-white">
          AI
        </div>
        <h1 className="text-3xl font-semibold text-white">{heading}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subheading}</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {isSignup ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Name</span>
            <input
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
            placeholder={isSignup ? 'At least 10 chars, mixed case, number' : 'Your password'}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
        </label>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="font-medium text-blue-400 transition hover:text-blue-300"
        >
          {isSignup ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </div>
  )
}
