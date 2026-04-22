import { prisma } from '@/lib/db'

export async function getRuntimeHealthSnapshot() {
  const database = await isDatabaseReachable()
  const runtimeIntegration = Boolean(process.env.RUNTIME_MODE) && hasRuntimeIntegrationConfig()

  return {
    status: database ? 'ok' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    controlPlane: 'healthy',
    database,
    runtimeIntegration,
  }
}

export async function getRuntimeReadinessSnapshot() {
  const database = await isDatabaseReachable()
  const sessionSecret = Boolean(process.env.SESSION_SECRET)
  const runtimeIntegration = hasRuntimeIntegrationConfig()
  const workspaceRuntimeReadiness = database && sessionSecret && runtimeIntegration

  return {
    status: workspaceRuntimeReadiness ? 'ready' : 'degraded',
    checks: {
      controlPlane: true,
      database,
      sessionSecret,
      runtimeIntegration,
      workspaceRuntimeReadiness,
    },
  }
}

async function isDatabaseReachable() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

function hasRuntimeIntegrationConfig() {
  const mode = process.env.RUNTIME_MODE || 'mock'

  if (mode === 'cliproxyapiplus') {
    return Boolean(process.env.CLIPROXYAPIPLUS_API_URL) && Boolean(process.env.CLIPROXYAPIPLUS_API_KEY)
  }

  return true
}
