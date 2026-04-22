import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-key'
import { checkWorkspaceLimit } from '@/lib/workspace'
import { logUsageEvent } from '@/lib/analytics'
import { chatCompletionRequestSchema } from '@/lib/providers/proxy'
import { getProxyErrorResponse, resolveRequestId } from '@/lib/proxy-http'
import { forwardChatCompletionToRuntime } from '@/lib/runtime-proxy'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = resolveRequestId(request.headers.get('x-request-id'))
  
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const apiKey = await validateApiKey(token)

    if (!apiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check workspace limits
    const canProceed = await checkWorkspaceLimit(apiKey.workspaceId)
    if (!canProceed) {
      return NextResponse.json({ 
        error: 'Workspace limit exceeded. Upgrade your plan to continue.' 
      }, { status: 429 })
    }

    const parsed = chatCompletionRequestSchema.parse(await request.json())
    const upstream = await forwardChatCompletionToRuntime(apiKey.workspaceId, parsed, {
      requestId,
      runtimeId: apiKey.runtimeId,
    })

    const latencyMs = Date.now() - startTime

    // Log usage event
    await logUsageEvent({
      workspaceId: apiKey.workspaceId,
      apiKeyId: apiKey.id,
      provider: parsed.provider,
      model: parsed.model,
      promptTokens: upstream.usage.promptTokens,
      completionTokens: upstream.usage.completionTokens,
      totalTokens: upstream.usage.totalTokens,
      cost: 0,
      latencyMs,
      status: 'success',
    })

    return NextResponse.json(upstream.response, {
      headers: {
        'x-request-id': requestId,
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    
    // Log failed usage event
    const latencyMs = Date.now() - startTime
    try {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const apiKey = await validateApiKey(token)
        if (apiKey) {
          await logUsageEvent({
            workspaceId: apiKey.workspaceId,
            apiKeyId: apiKey.id,
            provider: 'openai',
            model: 'unknown',
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0,
            latencyMs,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    } catch (logError) {
      console.error('Failed to log error event:', logError)
    }

    const errorResponse = getProxyErrorResponse(error, requestId)

    return NextResponse.json(errorResponse.body, {
      status: errorResponse.status,
      headers: {
        'x-request-id': requestId,
      },
    })
  }
}
