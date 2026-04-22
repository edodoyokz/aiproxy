import { PrismaClient, PlanTier, AuditAction } from '@prisma/client'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { subDays, subHours } from 'date-fns'

const prisma = new PrismaClient()
const DEMO_SEED_ENABLED = process.env.DEMO_SEED_ENABLED === 'true'

async function seedDemoData() {
  console.log('🌱 Seeding demo data...')

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

  const freeApiKey1 = await prisma.apiKey.create({
    data: {
      key: `sk_free_${randomBytes(24).toString('hex')}`,
      name: 'Development Key',
      workspaceId: freeWorkspace.id,
      createdBy: alice.id,
    },
  })

  await prisma.apiKey.create({
    data: {
      key: `sk_free_${randomBytes(24).toString('hex')}`,
      name: 'Production Key',
      workspaceId: freeWorkspace.id,
      createdBy: alice.id,
    },
  })

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
    ],
  })

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

  const starterApiKey = await prisma.apiKey.create({
    data: {
      key: `sk_starter_${randomBytes(24).toString('hex')}`,
      name: 'API Key 1',
      workspaceId: starterWorkspace.id,
      createdBy: bob.id,
    },
  })

  await seedRequests(starterWorkspace.id, starterApiKey.id, 8500, 30)

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

  const proApiKey = await prisma.apiKey.create({
    data: {
      key: `sk_pro_${randomBytes(24).toString('hex')}`,
      name: 'Production Key 1',
      workspaceId: proWorkspace.id,
      createdBy: charlie.id,
    },
  })

  await seedRequests(proWorkspace.id, proApiKey.id, 125000, 90)

  console.log('🎉 Demo seed completed')
}

async function main() {
  if (!DEMO_SEED_ENABLED) {
    console.log('Skipping demo seed. Set DEMO_SEED_ENABLED=true to populate sample data.')
    return
  }

  await seedDemoData()
}

async function seedRequests(
  workspaceId: string,
  apiKeyId: string,
  count: number,
  daysBack: number,
) {
  const models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 'claude-3-opus']
  const statuses = ['success', 'success', 'success', 'success', 'error']

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

  const batchSize = 1000
  for (let i = 0; i < requests.length; i += batchSize) {
    await prisma.request.createMany({
      data: requests.slice(i, i + batchSize),
    })
  }
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
