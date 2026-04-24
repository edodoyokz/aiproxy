import 'server-only'

import { getSession } from './session'
import { getDefaultWorkspaceMembership, requireUserWorkspace } from './auth'
import { isPlatformAdmin } from './platform-admin'

export async function getAuthenticatedContext() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const membership = await requireUserWorkspace(session.userId, session.workspaceId)
  if (membership) {
    const platformAdmin = await isPlatformAdmin(session.userId)
    return {
      userId: session.userId,
      workspaceId: session.workspaceId,
      role: membership.role,
      workspace: membership.workspace,
      isPlatformAdmin: platformAdmin,
    }
  }

  const fallbackMembership = await getDefaultWorkspaceMembership(session.userId)
  if (!fallbackMembership) {
    return null
  }

  const platformAdmin = await isPlatformAdmin(session.userId)
  return {
    userId: session.userId,
    workspaceId: fallbackMembership.workspaceId,
    role: fallbackMembership.role,
    workspace: fallbackMembership.workspace,
    isPlatformAdmin: platformAdmin,
  }
}

export async function requireAuthenticatedContext() {
  const context = await getAuthenticatedContext()

  if (!context) {
    throw new Error('Unauthorized')
  }

  return context
}
