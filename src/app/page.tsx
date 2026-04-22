import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-semibold text-white">Aiproxy</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Docs
              </Link>
              <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Pricing
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-8">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                System v2.4 operational
              </div>
              <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                The control plane for CLIProxyAPIPlus.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-300">
                Aiproxy gives your team a structured control plane for activation, provider routing, tenant access,
                and operational visibility across the CLIProxyAPIPlus runtime core.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/signup" className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-blue-700 shadow-lg shadow-blue-500/25">
                  Start setup
                </Link>
                <Link href="/docs" className="rounded-lg border border-slate-700 bg-slate-800 px-8 py-4 font-semibold text-white transition-colors hover:bg-slate-700">
                  Read docs
                </Link>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                Connect providers, issue a tenant key, and complete the first successful call without exposing
                raw runtime complexity.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <div>
                  <p className="text-sm font-medium text-slate-300">System Status</p>
                  <p className="mt-1 text-sm text-slate-500">Control-plane readiness across the active runtime surface</p>
                </div>
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  Live
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: 'Active Nodes',
                    value: '1,402',
                    detail: 'Across 12 regions',
                  },
                  {
                    label: 'Global Latency',
                    value: '12ms',
                    detail: 'Edge-to-runtime median',
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Recent Events</p>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    Synced
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {[
                    'provider_attach.us-east · success',
                    'tenant_key.issue · success',
                    'runtime_probe.edge-04 · healthy',
                  ].map((event) => (
                    <div key={event} className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
                      {event}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How Aiproxy works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Understand the runtime core, the control plane, and the activation path before you scale usage.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                title: 'Runtime core',
                description:
                  'CLIProxyAPIPlus remains the runtime core that handles provider-backed traffic execution and request routing.',
              },
              {
                title: 'Control plane',
                description:
                  'Aiproxy sits above the runtime to manage workspace onboarding, provider connections, and entitlement state.',
              },
              {
                title: 'Tenant keys',
                description:
                  'Each workspace issues tenant keys through the control plane so access stays tied to plans, activation, and lifecycle controls.',
              },
              {
                title: 'Analytics and admin',
                description:
                  'Operational visibility, runtime awareness, and backoffice support stay in one SaaS surface instead of being scattered across tools.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 backdrop-blur-xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300/80">{item.title}</p>
                <p className="mt-3 text-base leading-relaxed text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800/60 bg-slate-900/50 p-8 text-center shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-300/80">Pricing</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Simple plans that match workspace growth</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
            Start free while you validate the activation flow, then move to the pricing page when you need higher
            request volume, more provider slots, and expanded operational controls.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/pricing" className="rounded-lg bg-slate-800 px-8 py-4 font-semibold text-white transition-colors hover:bg-slate-700 border border-slate-700">
              View pricing
            </Link>
            <Link href="/signup" className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-blue-700 shadow-lg shadow-blue-500/25">
              Start setup
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Activation workflow
            </h2>
            <p className="text-lg text-slate-400">
              Connect provider, issue a tenant key, make your first successful request, and observe usage from one control plane.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
            <div className="space-y-4">
              {[
                {
                  step: '01',
                  title: 'Connect provider',
                  detail:
                    'Attach the provider your workspace runtime will use so the control plane can unlock the traffic path.',
                },
                {
                  step: '02',
                  title: 'Generate tenant key',
                  detail:
                    'Issue a tenant-scoped key that keeps access tied to the workspace, plan limits, and activation state.',
                },
                {
                  step: '03',
                  title: 'First successful request',
                  detail:
                    'Send the first runtime-backed call and confirm the workspace is ready for real usage.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-blue-300">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 leading-relaxed text-slate-400">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'Operational visibility',
                  detail: 'See runtime readiness, first-call progress, and workspace state without leaving the control plane.',
                },
                {
                  title: 'Entitlement enforcement',
                  detail: 'Provider slots, key issuance, and activation behavior stay connected to the workspace plan.',
                },
                {
                  title: 'Admin support path',
                  detail: 'Backoffice and analytics stay close to the activation flow so support and operations share the same context.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-6">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to activate your workspace?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start setup when you are ready, or read the docs if you want to evaluate the control plane first.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-block rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all hover:scale-[1.02] hover:bg-slate-100">
                Start setup
              </Link>
              <Link href="/docs" className="inline-block rounded-lg border border-white/30 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10">
                Read docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-semibold text-white">Aiproxy</span>
              </div>
              <p className="text-slate-400 text-sm">
                The SaaS control plane for teams running CLIProxyAPIPlus.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Overview</Link></li>
                <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="text-slate-400 hover:text-white transition-colors">Docs</Link></li>
                <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Activation</h4>
              <ul className="space-y-2 text-sm">
                    <li><Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Start setup</Link></li>
                <li><Link href="/dashboard/providers" className="text-slate-400 hover:text-white transition-colors">Connect provider</Link></li>
                <li><Link href="/docs" className="text-slate-400 hover:text-white transition-colors">Read docs</Link></li>
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Log in</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Workspace</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Create workspace</Link></li>
                <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Open dashboard</Link></li>
                <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Compare plans</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 text-center text-sm text-slate-500">
            © 2026 Aiproxy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
