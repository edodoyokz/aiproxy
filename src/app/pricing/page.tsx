'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Free',
      description: 'Try the hosted CLIProxyAPIPlus control plane with one workspace runtime',
      price: { monthly: 0, annual: 0 },
      features: [
        'Workspace entitlement on shared infrastructure',
        '1 tenant API key',
        '1 provider connection',
        'Basic analytics',
        'Community support',
        '7-day log retention'
      ],
      limitations: [
        'No custom rate limits',
        'No webhook notifications',
        'No SSO/SAML'
      ],
      cta: 'Start Free',
      highlighted: false
    },
    {
      name: 'Starter',
      description: 'For active users who need more providers and stronger runtime operations',
      price: { monthly: 29, annual: 290 },
      features: [
        'Higher quota entitlement',
        '10 tenant API keys',
        '3 provider connections',
        'Advanced analytics',
        'Email support',
        '30-day log retention',
        'Custom rate limits',
        'Webhook notifications'
      ],
      limitations: [
        'No SSO/SAML',
        'No dedicated runtime',
        'No SLA guarantee'
      ],
      cta: 'Start 14-day Trial',
      highlighted: true
    },
    {
      name: 'Pro',
      description: 'For production workloads that need broad provider access and premium operations',
      price: { monthly: 99, annual: 990 },
      features: [
        'Highest quota entitlement',
        '50 tenant API keys',
        'Multi-provider workspace runtime',
        'Real-time analytics',
        'Priority support',
        '90-day log retention',
        'Custom rate limits',
        'Webhook notifications',
        'SSO & SAML',
        'Dedicated runtime',
        '99.9% SLA guarantee',
        'Custom contracts available'
      ],
      limitations: [],
      cta: 'Start 14-day Trial',
      highlighted: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-semibold text-white">Aiproxy</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Docs
              </Link>
              <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Subscription tiers package the CLIProxyAPIPlus runtime experience into a hosted SaaS control plane.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-900/50 backdrop-blur-xl rounded-full p-1 border border-slate-800/50">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-600/20 to-slate-900/50 border-2 border-blue-500/50 shadow-xl shadow-blue-500/10 relative'
                  : 'bg-slate-900/50 border border-slate-800/50'
              } backdrop-blur-xl`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">
                    ${plan.price[billingCycle]}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-slate-400">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                {billingCycle === 'annual' && plan.price.annual > 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    ${(plan.price.annual / 12).toFixed(0)}/month billed annually
                  </p>
                )}
              </div>

              <Link
                href="/dashboard"
                className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all mb-6 ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Included
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Not included
                    </p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm">
                          <span className="text-slate-600">×</span>
                          <span className="text-slate-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Compare all features
          </h2>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left p-4 text-white font-semibold">Feature</th>
                  <th className="text-center p-4 text-white font-semibold">Free</th>
                  <th className="text-center p-4 text-white font-semibold">Starter</th>
                  <th className="text-center p-4 text-white font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Monthly requests', free: '1,000', starter: '50,000', pro: 'Unlimited' },
                  { feature: 'API keys', free: '2', starter: '10', pro: '50' },
                  { feature: 'Provider connections', free: '1', starter: '3', pro: 'Unlimited' },
                  { feature: 'Analytics', free: 'Basic', starter: 'Advanced', pro: 'Real-time' },
                  { feature: 'Support', free: 'Community', starter: 'Email', pro: 'Priority' },
                  { feature: 'Log retention', free: '7 days', starter: '30 days', pro: '90 days' },
                  { feature: 'Custom rate limits', free: false, starter: true, pro: true },
                  { feature: 'Webhook notifications', free: false, starter: true, pro: true },
                  { feature: 'SSO & SAML', free: false, starter: false, pro: true },
                  { feature: 'Dedicated runtime', free: false, starter: false, pro: true },
                  { feature: 'SLA guarantee', free: false, starter: false, pro: true }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 last:border-0">
                    <td className="p-4 text-slate-300">{row.feature}</td>
                    <td className="p-4 text-center text-slate-400">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <Check className="w-5 h-5 text-blue-500 mx-auto" /> : '—'
                      ) : row.free}
                    </td>
                    <td className="p-4 text-center text-slate-400">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check className="w-5 h-5 text-blue-500 mx-auto" /> : '—'
                      ) : row.starter}
                    </td>
                    <td className="p-4 text-center text-slate-400">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="w-5 h-5 text-blue-500 mx-auto" /> : '—'
                      ) : row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
              },
              {
                q: 'What happens if I exceed my request limit?',
                a: 'On the Free plan, requests will be throttled once you hit the limit. On paid plans, you can set up overage billing or automatic upgrades.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.'
              },
              {
                q: 'Can I use my own API keys?',
                a: 'Yes! Aiproxy is a proxy service. You bring your own API keys from OpenAI, Anthropic, etc., and we handle routing, caching, and analytics.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start with 1,000 free requests. No credit card required.
            </p>
            <Link href="/dashboard" className="inline-block px-8 py-4 bg-white hover:bg-slate-100 text-blue-600 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg">
              Start Building Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
