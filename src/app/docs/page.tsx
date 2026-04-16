'use client'

import Link from 'next/link'

export default function DocsPage() {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6 sticky top-24">
              <h3 className="text-white font-semibold mb-4">Documentation</h3>
              <nav className="space-y-2">
                <a href="#quickstart" className="block text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  Quickstart
                </a>
                <a href="#authentication" className="block text-slate-400 hover:text-white text-sm transition-colors">
                  Authentication
                </a>
                <a href="#providers" className="block text-slate-400 hover:text-white text-sm transition-colors">
                  Providers
                </a>
                <a href="#examples" className="block text-slate-400 hover:text-white text-sm transition-colors">
                  Examples
                </a>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Quickstart */}
            <section id="quickstart">
              <h1 className="text-4xl font-bold text-white mb-4">Quickstart</h1>
              <p className="text-lg text-slate-400 mb-8">
                Get started with Aiproxy in under 2 minutes.
              </p>

              <div className="space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1. Create an account</h3>
                  <p className="text-slate-400 mb-4">
                    Sign up for a free account at <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">dashboard</Link>. 
                    No credit card required.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">2. Add your provider API key</h3>
                  <p className="text-slate-400 mb-4">
                    Connect your OpenAI, Anthropic, or other provider API key in the dashboard.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">3. Generate an Aiproxy API key</h3>
                  <p className="text-slate-400 mb-4">
                    Create an API key to use in your application.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">4. Make your first request</h3>
                  <p className="text-slate-400 mb-4">
                    Use the OpenAI SDK with your Aiproxy key:
                  </p>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-300 font-mono">
{`import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.AIPROXY_KEY,
  baseURL: 'https://api.aiproxy.io/v1'
})

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Hello, world!' }
  ]
})

console.log(response.choices[0].message.content)`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <h2 className="text-3xl font-bold text-white mb-4">Authentication</h2>
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                <p className="text-slate-400 mb-4">
                  Aiproxy uses API keys for authentication. Include your key in the Authorization header:
                </p>
                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-300 font-mono">
{`Authorization: Bearer YOUR_AIPROXY_KEY`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Providers */}
            <section id="providers">
              <h2 className="text-3xl font-bold text-white mb-4">Supported Providers</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {['OpenAI', 'Anthropic', 'Google AI', 'Cohere'].map((provider) => (
                  <div key={provider} className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{provider}</h3>
                    <p className="text-slate-400 text-sm">
                      Full support for all {provider} models and features.
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Examples */}
            <section id="examples">
              <h2 className="text-3xl font-bold text-white mb-4">Examples</h2>
              <div className="space-y-4">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Streaming responses</h3>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-300 font-mono">
{`const stream = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '')
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Error handling</h3>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-300 font-mono">
{`try {
  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
} catch (error) {
  if (error.status === 429) {
    console.error('Rate limit exceeded')
  } else {
    console.error('API error:', error.message)
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
