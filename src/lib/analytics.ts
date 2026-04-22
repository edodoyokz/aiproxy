import { prisma } from './db'
import { startOfDay, subDays } from 'date-fns'

export async function logRequest(data: {
  apiKeyId: string
  workspaceId: string
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  status: string
  latencyMs: number
  errorMessage?: string
}) {
  const {
    apiKeyId,
    workspaceId,
    provider,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    cost,
    status,
    latencyMs,
    errorMessage,
  } = data

  void errorMessage

  return prisma.request.create({
    data: {
      apiKeyId,
      workspaceId,
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      cost,
      status,
      latencyMs,
    },
  })
}

export const logUsageEvent = logRequest

export async function getWorkspaceStats(workspaceId: string, days: number = 7) {
  const startDate = startOfDay(subDays(new Date(), days))
  
  const requests = await prisma.request.findMany({
    where: {
      workspaceId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  })

  const totalRequests = requests.length
  const totalTokens = requests.reduce((sum, r) => sum + r.totalTokens, 0)
  const totalCost = requests.reduce((sum, r) => sum + r.cost, 0)
  const avgLatency = requests.length > 0
    ? requests.reduce((sum, r) => sum + r.latencyMs, 0) / requests.length
    : 0

  const dailyStats = requests.reduce((acc, req) => {
    const day = startOfDay(req.createdAt).toISOString()
    if (!acc[day]) {
      acc[day] = { requests: 0, tokens: 0, cost: 0 }
    }
    acc[day].requests++
    acc[day].tokens += req.totalTokens
    acc[day].cost += req.cost
    return acc
  }, {} as Record<string, { requests: number; tokens: number; cost: number }>)

  const modelBreakdown = requests.reduce((acc, req) => {
    if (!acc[req.model]) {
      acc[req.model] = { requests: 0, tokens: 0, cost: 0 }
    }
    acc[req.model].requests++
    acc[req.model].tokens += req.totalTokens
    acc[req.model].cost += req.cost
    return acc
  }, {} as Record<string, { requests: number; tokens: number; cost: number }>)

  return {
    totalRequests,
    totalTokens,
    totalCost,
    avgLatency,
    dailyStats,
    modelBreakdown,
  }
}

export async function getApiKeyStats(apiKeyId: string, days: number = 7) {
  const startDate = startOfDay(subDays(new Date(), days))
  
  const requests = await prisma.request.findMany({
    where: {
      apiKeyId,
      createdAt: { gte: startDate },
    },
  })

  return {
    totalRequests: requests.length,
    totalTokens: requests.reduce((sum, r) => sum + r.totalTokens, 0),
    totalCost: requests.reduce((sum, r) => sum + r.cost, 0),
  }
}
