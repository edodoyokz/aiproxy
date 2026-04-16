'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-semibold text-white">Aiproxy</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Docs
              </Link>
              <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                Pricing
              </Link>
              <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Production-ready AI API gateway
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Ship AI features
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                without the complexity
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              One API for all LLM providers. Built-in caching, rate limiting, and analytics. 
              Deploy in minutes, not weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
                Start Building Free
              </Link>
              <a href="#demo" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors border border-slate-700">
                View Demo
              </a>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              No credit card required • 1,000 requests/month free • 2 minute setup
            </p>
          </div>

          {/* Code Preview */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <span className="text-xs text-slate-500 ml-2">app.ts</span>
              </div>
              <pre className="p-6 text-sm overflow-x-auto">
                <code className="text-slate-300 font-mono">
{`import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.AIPROXY_KEY,
  baseURL: 'https://api.aiproxy.io/v1'
})

// Works with any provider: OpenAI, Anthropic, Google...
const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
})

// Automatic caching, rate limiting, and analytics ✨`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to ship AI
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Stop building infrastructure. Start building features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔌',
                title: 'Universal API',
                description: 'One interface for OpenAI, Anthropic, Google, Cohere, and more. Switch providers without changing code.'
              },
              {
                icon: '⚡',
                title: 'Smart Caching',
                description: 'Automatic response caching reduces costs by up to 90% and improves latency for repeated queries.'
              },
              {
                icon: '🛡️',
                title: 'Rate Limiting',
                description: 'Built-in rate limiting and quota management. Protect your API keys and control costs.'
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                description: 'Track usage, costs, latency, and errors in real-time. Understand your AI spend at a glance.'
              },
              {
                icon: '🔐',
                title: 'Secure by Default',
                description: 'API key rotation, workspace isolation, and audit logs. Enterprise-grade security out of the box.'
              },
              {
                icon: '🚀',
                title: 'Edge Runtime',
                description: 'Deploy globally with sub-50ms latency. Automatic failover and load balancing included.'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6 hover:border-blue-500/30 transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Social Proof */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by developers worldwide
            </h2>
            <p className="text-lg text-slate-400">
              Join thousands of teams shipping AI features faster
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Aiproxy cut our AI infrastructure work from weeks to hours. The caching alone saved us $2k/month.",
                author: "Sarah Chen",
                role: "CTO, TechStart"
              },
              {
                quote: "Finally, a proxy that just works. No vendor lock-in, great DX, and the analytics are incredibly useful.",
                author: "Marcus Rodriguez",
                role: "Lead Engineer, DataFlow"
              },
              {
                quote: "We switched all our AI calls to Aiproxy. The rate limiting and cost controls give us peace of mind.",
                author: "Emily Watson",
                role: "VP Engineering, CloudScale"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                <p className="text-slate-300 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                  <div>
                    <div className="text-white font-medium">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to ship AI features?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start with 1,000 free requests. No credit card required.
            </p>
            <Link href="/dashboard" className="inline-block px-8 py-4 bg-white hover:bg-slate-100 text-blue-600 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-semibold text-white">Aiproxy</span>
              </div>
              <p className="text-slate-400 text-sm">
                The AI API gateway for modern developers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Docs</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 text-center text-sm text-slate-500">
            © 2026 Aiproxy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for side projects and testing',
      price: { monthly: 0, annual: 0 },
      features: [
        '1,000 requests/month',
        '2 API keys',
        '1 provider connection',
        'Basic analytics',
        'Community support',
        '7-day log retention'
      ],
      cta: 'Start Free',
      highlighted: false
    },
    {
      name: 'Starter',
      description: 'For growing products and teams',
      price: { monthly: 29, annual: 290 },
      features: [
        '50,000 requests/month',
        '10 API keys',
        '3 provider connections',
        'Advanced analytics',
        'Email support',
        '30-day log retention',
        'Custom rate limits',
        'Webhook notifications'
      ],
      cta: 'Start Trial',
      highlighted: true
    },
    {
      name: 'Pro',
      description: 'For production apps at scale',
      price: { monthly: 99, annual: 990 },
      features: [
        'Unlimited requests',
        '50 API keys',
        'Unlimited providers',
        'Real-time analytics',
        'Priority support',
        '90-day log retention',
        'Custom rate limits',
        'Webhook notifications',
        'SSO & SAML',
        'Dedicated runtime',
        'SLA guarantee'
      ],
      cta: 'Start Trial',
      highlighted: false
    }
  ]

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Start free, scale as you grow. No hidden fees.
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

        <div className="grid md:grid-cols-3 gap-8">
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

              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            All plans include SSL, automatic backups, and 99.9% uptime SLA.
          </p>
        </div>
      </div>
    </section>
  )
}
