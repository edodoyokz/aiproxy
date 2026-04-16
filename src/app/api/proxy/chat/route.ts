import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/api-key'
import { checkWorkspaceLimit } from '@/lib/workspace'
import { logUsageEvent } from '@/lib/analytics'
import { runtimeService } from '@/integrations/runtime'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
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

    const body = await request.json()
    const { model, messages, provider = 'openai' } = body

    // Validate request through runtime service
    // TODO: This will eventually call CLIProxyAPIPlus to validate and route the request
    const validation = await runtimeService.validateRequest(
      apiKey.workspaceId,
      apiKey.id,
      provider,
      model || 'gpt-3.5-turbo'
    )

    if (!validation.allowed) {
      return NextResponse.json({ 
        error: validation.reason || 'Request not allowed' 
      }, { status: 403 })
    }

    // Mock LLM response
    // TODO: Replace with actual CLIProxyAPIPlus request forwarding
    const mockResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'gpt-3.5-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a mock response from the Aiproxy service.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 20,
        total_tokens: 70,
      },
    }

    const latencyMs = Date.now() - startTime

    // Log usage event
    await logUsageEvent({
      workspaceId: apiKey.workspaceId,
      apiKeyId: apiKey.id,
      provider,
      model: model || 'gpt-3.5-turbo',
      promptTokens: mockResponse.usage.prompt_tokens,
      completionTokens: mockResponse.usage.completion_tokens,
      totalTokens: mockResponse.usage.total_tokens,
      cost: 0.0001, // Mock cost
      latencyMs,
      status: 'success',
    })

    // Sync usage to runtime
    // TODO: This will eventually sync to CLIProxyAPIPlus for real-time monitoring
    await runtimeService.syncUsage(apiKey.workspaceId, {
      timestamp: new Date(),
      tokensUsed: mockResponse.usage.total_tokens,
      requestCount: 1,
      cost: 0.0001,
    })

    return NextResponse.json(mockResponse)
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
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
