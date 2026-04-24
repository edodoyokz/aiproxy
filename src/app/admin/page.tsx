import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getAuthenticatedContext } from '@/lib/authz'
import { searchAdminWorkspaces } from '@/lib/admin/workspaces'

export default async function AdminPage() {
  const auth = await getAuthenticatedContext()

  if (!auth) {
    redirect('/')
  }

  if (!auth.isPlatformAdmin) {
    redirect('/dashboard')
  }

  const workspaces = await searchAdminWorkspaces()

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin backoffice</h1>
          <p className="mt-2 text-slate-400">Inspect workspaces, adjust entitlements, and control runtime state.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Workspace</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-left font-medium">Billing</th>
                <th className="px-4 py-3 text-left font-medium">Runtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {workspaces.map(workspace => (
                <tr key={workspace.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{workspace.name}</div>
                    <div className="text-xs text-slate-400">{workspace.slug}</div>
                    <Link
                      href={`/admin/workspaces/${workspace.id}`}
                      className="mt-2 inline-flex text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      View detail
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {workspace.entitlement?.effectiveTier ?? workspace.planTier}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {workspace.billingState?.billingStatus ?? 'free'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {workspace.runtimes[0]?.status ?? 'No runtime'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
