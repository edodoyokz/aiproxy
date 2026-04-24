import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { setWorkspaceEntitlement } from '@/lib/admin/entitlements'
import { PlanTier } from '@prisma/client'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { id: string; subscription: string | null; metadata?: { workspaceId?: string; plan?: string } }
        const workspaceId = session.metadata?.workspaceId
        const plan = session.metadata?.plan as PlanTier | undefined

        if (workspaceId && plan) {
          // Update workspace entitlement
          await setWorkspaceEntitlement({
            workspaceId,
            planTier: plan,
            reason: 'Stripe checkout completed',
          })

          // Update workspace with subscription ID
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              stripeSubscriptionId: session.subscription,
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as { id: string; items: { data: Array<{ price?: { id?: string } }> }; metadata?: { workspaceId?: string } }
        const workspaceId = subscription.metadata?.workspaceId

        if (workspaceId) {
          // Determine plan from subscription items
          const priceId = subscription.items.data[0]?.price?.id
          let plan: PlanTier = 'FREE'

          if (priceId === process.env.STRIPE_STARTER_PRICE_ID || priceId === process.env.STRIPE_STARTER_ANNUAL_PRICE_ID) {
            plan = 'STARTER'
          } else if (priceId === process.env.STRIPE_PRO_PRICE_ID || priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) {
            plan = 'PRO'
          }

          await setWorkspaceEntitlement({
            workspaceId,
            planTier: plan,
            reason: 'Stripe subscription updated',
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as { id: string; metadata?: { workspaceId?: string } }
        const workspaceId = subscription.metadata?.workspaceId

        if (workspaceId) {
          // Downgrade to FREE
          await setWorkspaceEntitlement({
            workspaceId,
            planTier: 'FREE',
            reason: 'Stripe subscription deleted',
          })

          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              stripeSubscriptionId: null,
            },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as { subscription_details?: { metadata?: { workspaceId?: string } } }
        const workspaceId = invoice.subscription_details?.metadata?.workspaceId

        if (workspaceId) {
          // Log payment failure (could suspend workspace after retry period)
          console.error(`Payment failed for workspace ${workspaceId}`)
          // TODO: Implement suspension logic after retry period
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
