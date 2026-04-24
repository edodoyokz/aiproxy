import { NextResponse } from 'next/server'

import { requireAuthenticatedContext } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const { workspaceId } = await requireAuthenticatedContext()

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace || !workspace.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripeCustomerId,
      return_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 })
  }
}
