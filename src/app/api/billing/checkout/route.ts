import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuthenticatedContext } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO']),
  billingCycle: z.enum(['monthly', 'annual']),
})

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await requireAuthenticatedContext()
    const body = checkoutSchema.parse(await request.json())

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let stripeCustomerId = workspace.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: `${workspaceId}@aiproxy.temp`, // Will update with real email later
        metadata: { workspaceId },
      })
      stripeCustomerId = customer.id
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { stripeCustomerId },
      })
    }

    // Map plan to Stripe price ID
    const priceId = body.billingCycle === 'annual'
      ? process.env[`STRIPE_${body.plan}_ANNUAL_PRICE_ID`]
      : process.env[`STRIPE_${body.plan}_MONTHLY_PRICE_ID`]

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?checkout=success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        workspaceId,
        plan: body.plan,
        billingCycle: body.billingCycle,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
