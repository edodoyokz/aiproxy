import { PrismaClient, PlanTier, AuditAction, RuntimeStatus, ProviderConnectionStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { subDays, subHours } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const password = await hash('password123', 10)
  
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash: password,
      name: 'Alice Johnson',
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash: password,
      name: 'Bob Smith',
    },
  })

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      passwordHash: password,
      name: 'Charlie Davis',
    },
  })

  console.log('✅ Created 3 users')

  // Workspace 1: FREE tier (Alice)
  const freeWorkspace = await prisma.workspace.create({
    data: {
      name: 'Alice Personal',
      slug: 'alice-personal',
      planTier: PlanTier.FREE,
      members: {
        create: {
          userId: alice.id,
          role: 'owner',
        },
      },
    },
  })

    // Create runtime for FREE workspace
    const freeRuntime = await prisma.runtime.create({
      data: {
        workspaceId: freeWorkspace.id,
        endpoint: 'https://runtime-free-us-east-1.cliproxyapi.com',
        region: 'us-east-1',
        status: RuntimeStatus.ACTIVE,
      },
    })

    const freeApiKey1 = await prisma.apiKey.create({
      data: {
        key: `sk_free_${randomBytes(24).toString('hex')}`,
        name: 'Development Key',
        workspaceId: freeWorkspace.id,
        createdBy: alice.id,
        runtimeId: freeRuntime.id,
      },
    })

    const freeApiKey2 = await prisma.apiKey.create({
      data: {
        key: `sk_free_${randomBytes(24).toString('hex')}`,
        name: 'Production Key',
        workspaceId: freeWorkspace.id,
        createdBy: alice.id,
        runtimeId: freeRuntime.id,
      },
    })

    await prisma.providerConnection.create({
      data: {
        workspaceId: freeWorkspace.id,
        runtimeId: freeRuntime.id,
        provider: 'openai',
        status: ProviderConnectionStatus.CONNECTED,
      },
    })

    // Seed 150 requests for FREE workspace (under 1000 limit)
  await seedRequests(freeWorkspace.id, freeApiKey1.id, 150, 7)

  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: freeWorkspace.id,
        userId: alice.id,
        action: AuditAction.API_KEY_CREATED,
        resourceType: 'ApiKey',
        resourceId: freeApiKey1.id,
        createdAt: subDays(new Date(), 7),
      },
      {
        workspaceId: freeWorkspace.id,
        userId: alice.id,
        action: AuditAction.PROVIDER_CONNECTED,
        resourceType: 'Provider',
        createdAt: subDays(new Date(), 6),
      },
      {
        workspaceId: freeWorkspace.id,
        userId: alice.id,
        action: AuditAction.API_KEY_CREATED,
        resourceType: 'ApiKey',
        resourceId: freeApiKey2.id,
        createdAt: subDays(new Date(), 2),
      },
    ],
  })

  console.log('✅ Created FREE workspace with 2 API keys, 1 provider, 150 requests')

  // Workspace 2: STARTER tier (Bob)
  const starterWorkspace = await prisma.workspace.create({
    data: {
      name: 'Bob Startup Inc',
      slug: 'bob-startup',
      planTier: PlanTier.STARTER,
      members: {
        create: {
          userId: bob.id,
          role: 'owner',
        },
      },
    },
  })

    // Create runtime for STARTER workspace
    const starterRuntime = await prisma.runtime.create({
      data: {
        workspaceId: starterWorkspace.id,
        endpoint: 'https://runtime-starter-us-east-1.cliproxyapi.com',
        region: 'us-east-1',
        status: RuntimeStatus.ACTIVE,
      },
    })

    const starterApiKeys = []
    for (let i = 1; i <= 5; i++) {
      const key = await prisma.apiKey.create({
        data: {
          key: `sk_starter_${randomBytes(24).toString('hex')}`,
          name: `API Key ${i}`,
          workspaceId: starterWorkspace.id,
          createdBy: bob.id,
          runtimeId: starterRuntime.id,
        },
      })
      starterApiKeys.push(key)
    }

    await prisma.providerConnection.createMany({
      data: [
        {
          workspaceId: starterWorkspace.id,
          runtimeId: starterRuntime.id,
          provider: 'openai',
          status: ProviderConnectionStatus.CONNECTED,
        },
        {
          workspaceId: starterWorkspace.id,
          runtimeId: starterRuntime.id,
          provider: 'anthropic',
          status: ProviderConnectionStatus.CONNECTED,
        },
      ],
    })

  // Seed 8500 requests for STARTER workspace (under 50k limit)
  await seedRequests(starterWorkspace.id, starterApiKeys[0].id, 8500, 30)

  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: starterWorkspace.id,
        userId: bob.id,
        action: AuditAction.PLAN_UPGRADED,
        createdAt: subDays(new Date(), 30),
      },
      {
        workspaceId: starterWorkspace.id,
        userId: bob.id,
        action: AuditAction.PROVIDER_CONNECTED,
        resourceType: 'Provider',
        createdAt: subDays(new Date(), 29),
      },
      {
        workspaceId: starterWorkspace.id,
        userId: bob.id,
        action: AuditAction.PROVIDER_CONNECTED,
        resourceType: 'Provider',
        createdAt: subDays(new Date(), 20),
      },
    ],
  })

  console.log('✅ Created STARTER workspace with 5 API keys, 2 providers, 8500 requests')

  // Workspace 3: PRO tier (Charlie, with team)
  const proWorkspace = await prisma.workspace.create({
    data: {
      name: 'Enterprise Corp',
      slug: 'enterprise-corp',
      planTier: PlanTier.PRO,
      members: {
        create: [
          {
            userId: charlie.id,
            role: 'owner',
          },
          {
            userId: alice.id,
            role: 'admin',
          },
          {
            userId: bob.id,
            role: 'member',
          },
        ],
      },
    },
  })

    // Create runtime for PRO workspace
    const proRuntime = await prisma.runtime.create({
      data: {
        workspaceId: proWorkspace.id,
        endpoint: 'https://runtime-pro-us-east-1.cliproxyapi.com',
        region: 'us-east-1',
        status: RuntimeStatus.ACTIVE,
      },
    })

    const proApiKeys = []
    for (let i = 1; i <= 15; i++) {
      const key = await prisma.apiKey.create({
        data: {
          key: `sk_pro_${randomBytes(24).toString('hex')}`,
          name: `${['Production', 'Staging', 'Development', 'Testing', 'Integration'][i % 5]} Key ${Math.floor(i / 5) + 1}`,
          workspaceId: proWorkspace.id,
          createdBy: charlie.id,
          runtimeId: proRuntime.id,
        },
      })
      proApiKeys.push(key)
    }

    await prisma.providerConnection.createMany({
      data: [
        {
          workspaceId: proWorkspace.id,
          runtimeId: proRuntime.id,
          provider: 'openai',
          status: ProviderConnectionStatus.CONNECTED,
        },
        {
          workspaceId: proWorkspace.id,
          runtimeId: proRuntime.id,
          provider: 'anthropic',
          status: ProviderConnectionStatus.CONNECTED,
        },
        {
          workspaceId: proWorkspace.id,
          runtimeId: proRuntime.id,
          provider: 'google',
          status: ProviderConnectionStatus.CONNECTED,
        },
      ],
    })

  // Seed 125000 requests for PRO workspace (unlimited)
  await seedRequests(proWorkspace.id, proApiKeys[0].id, 125000, 90)

  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: proWorkspace.id,
        userId: charlie.id,
        action: AuditAction.PLAN_UPGRADED,
        createdAt: subDays(new Date(), 90),
      },
      {
        workspaceId: proWorkspace.id,
        userId: charlie.id,
        action: AuditAction.USER_INVITED,
        createdAt: subDays(new Date(), 85),
      },
      {
        workspaceId: proWorkspace.id,
        userId: charlie.id,
        action: AuditAction.USER_INVITED,
        createdAt: subDays(new Date(), 80),
      },
      {
        workspaceId: proWorkspace.id,
        userId: charlie.id,
        action: AuditAction.PROVIDER_CONNECTED,
        resourceType: 'Provider',
        createdAt: subDays(new Date(), 45),
      },
    ],
  })

  console.log('✅ Created PRO workspace with 15 API keys, 3 providers, 125k requests, 3 team members')

  console.log('🎉 Seeding completed!')
}

async function seedRequests(
  workspaceId: string,
  apiKeyId: string,
  count: number,
  daysBack: number
) {
  const models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 'claude-3-opus']
  const providers = ['openai', 'anthropic']
  const statuses = ['success', 'success', 'success', 'success', 'error'] // 80% success rate

  const requests = []
  for (let i = 0; i < count; i++) {
    const model = models[Math.floor(Math.random() * models.length)]
    const provider = model.startsWith('gpt') ? 'openai' : 'anthropic'
    const promptTokens = Math.floor(Math.random() * 2000) + 100
    const completionTokens = Math.floor(Math.random() * 1000) + 50
    const totalTokens = promptTokens + completionTokens
    const cost = (promptTokens / 1000) * 0.001 + (completionTokens / 1000) * 0.002
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const latencyMs = Math.floor(Math.random() * 3000) + 200

    // Distribute requests over the past N days with realistic patterns
    const hoursBack = Math.floor(Math.random() * daysBack * 24)
    const createdAt = subHours(new Date(), hoursBack)

    requests.push({
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
      createdAt,
    })
  }

  // Batch insert for performance
  const batchSize = 1000
  for (let i = 0; i < requests.length; i += batchSize) {
    await prisma.request.createMany({
      data: requests.slice(i, i + batchSize),
    })
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
