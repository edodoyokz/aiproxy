import 'server-only'

import { getSession } from './session'
import { getDefaultWorkspaceMembership, requireUserWorkspace } from './auth'

export async function getAuthenticatedContext() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const membership = await requireUserWorkspace(session.userId, session.workspaceId)
  if (membership) {
    return {
      userId: session.userId,
      workspaceId: session.workspaceId,
      role: membership.role,
      workspace: membership.workspace,
    }
  }

  const fallbackMembership = await getDefaultWorkspaceMembership(session.userId)
  if (!fallbackMembership) {
    return null
  }

  return {
    userId: session.userId,
    workspaceId: fallbackMembership.workspaceId,
    role: fallbackMembership.role,
    workspace: fallbackMembership.workspace,
  }
}

export async function requireAuthenticatedContext() {
  const context = await getAuthenticatedContext()

  if (!context) {
    throw new Error('Unauthorized')
  }

  return context
}
