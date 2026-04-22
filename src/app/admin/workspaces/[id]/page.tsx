import { notFound, redirect } from 'next/navigation'

import { getAuthenticatedContext } from '@/lib/authz'
import { getAdminWorkspaceDetail } from '@/lib/admin/workspaces'

export default async function AdminWorkspaceDetailPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedContext()

  if (!auth) {
    redirect('/')
  }

  if (!['owner', 'admin'].includes(auth.role)) {
    redirect('/dashboard')
  }

  const { id } = await params
  const detail = await getAdminWorkspaceDetail(id)

  if (!detail) {
    notFound()
  }

  const { workspace, usage, runtimeHealth } = detail
  const runtime = workspace.runtimes[0] ?? null

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          <p className="mt-2 text-slate-400">Workspace admin detail for entitlement and runtime operations.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold">Entitlement</h2>
            <dl className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between"><dt>Plan</dt><dd>{workspace.entitlement?.effectiveTier ?? workspace.planTier}</dd></div>
              <div className="flex justify-between"><dt>Billing</dt><dd>{workspace.billingState?.billingStatus ?? 'free'}</dd></div>
              <div className="flex justify-between"><dt>API Keys</dt><dd>{usage?.apiKeys.current ?? 0} / {usage?.apiKeys.limit ?? 0}</dd></div>
              <div className="flex justify-between"><dt>Providers</dt><dd>{usage?.providers.current ?? 0} / {usage?.providers.limit ?? 0}</dd></div>
              <div className="flex justify-between"><dt>Requests</dt><dd>{usage?.requests.current ?? 0} / {usage?.requests.limit ?? 0}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold">Runtime</h2>
            <dl className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between"><dt>Status</dt><dd>{runtime?.status ?? 'No runtime'}</dd></div>
              <div className="flex justify-between"><dt>Region</dt><dd>{runtime?.region ?? '—'}</dd></div>
              <div className="flex justify-between"><dt>Endpoint</dt><dd className="max-w-[18rem] truncate">{runtime?.endpoint ?? '—'}</dd></div>
              <div className="flex justify-between"><dt>Health</dt><dd>{runtimeHealth?.status ?? 'unknown'}</dd></div>
            </dl>
          </section>
        </div>

        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold">Provider state</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            {workspace.providers.length === 0 ? (
              <p className="text-slate-400">No providers connected.</p>
            ) : (
              workspace.providers.map(provider => (
                <div key={provider.id} className="flex justify-between rounded-lg border border-slate-800 px-3 py-2">
                  <span className="capitalize">{provider.provider}</span>
                  <span>{provider.status}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
