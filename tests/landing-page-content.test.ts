import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('tailwind content config exists for app sources', () => {
  const source = readFileSync('tailwind.config.ts', 'utf8')

  assert.match(source, /content:\s*\[/)
  assert.match(source, /\.\/src\/app\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/)
  assert.match(source, /\.\/src\/components\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/)
})

test('landing page remains a server component', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.doesNotMatch(source, /^'use client'/)
})

test('landing page follows clarity-first structure', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /SaaS control plane/i)
  assert.match(source, /How Aiproxy works/i)
  assert.match(source, /Activation workflow/i)
  assert.match(source, /href="\/dashboard"|href='\/dashboard'/)
  assert.match(source, /href="\/docs"|href='\/docs'/)
  assert.match(source, /href="\/pricing"|href='\/pricing'/)
  assert.doesNotMatch(source, /Trusted by developers worldwide/i)
})

test('landing page reflects the approved technical-systems design language', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /Operational visibility/i)
  assert.match(source, /control plane/i)
  assert.match(source, /System Status/i)
  assert.match(source, /Active Nodes/i)
  assert.match(source, /Global Latency/i)
  assert.match(source, /Recent Events/i)
  assert.doesNotMatch(source, /future of ai connectivity/i)
  assert.doesNotMatch(source, /semantic cache/i)
  assert.doesNotMatch(source, /trusted by engineers/i)
})

test('hero positions Aiproxy as the control plane above the runtime core', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /CLIProxyAPIPlus/i)
  assert.match(source, /Read docs/i)
  assert.match(source, /System Status/i)
  assert.doesNotMatch(source, /app\.ts/)
})

test('landing page explains the product model', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /How Aiproxy works/i)
  assert.match(source, /Runtime core/i)
  assert.match(source, /Control plane/i)
  assert.match(source, /Tenant keys/i)
  assert.match(source, /Analytics and admin/i)
  assert.doesNotMatch(source, /Everything you need to ship AI/i)
})

test('landing page shows activation workflow and product trust', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /Connect provider/i)
  assert.match(source, /Generate tenant key/i)
  assert.match(source, /First successful request/i)
  assert.match(source, /Operational visibility/i)
  assert.doesNotMatch(source, /Sarah Chen|Marcus Rodriguez|Emily Watson/)
})

test('landing page uses focused CTA and real navigation', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.doesNotMatch(source, /function PricingSection\(/)
  assert.match(source, /Start setup/i)
  assert.match(source, /Read docs/i)
  assert.doesNotMatch(source, /href="#"/)
})

test('landing page primary auth entry points send anonymous users to signup', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /href="\/signup"|href='\/signup'/)
  assert.doesNotMatch(source, /<Link href="\/dashboard"[^>]*>\s*Get Started\s*<\/Link>/)
  assert.doesNotMatch(source, /<Link href="\/dashboard"[^>]*>\s*Start setup\s*<\/Link>/)
})

test('protected dashboard routes redirect anonymous users to login', () => {
  const dashboardSource = readFileSync('src/app/dashboard/page.tsx', 'utf8')
  const providersSource = readFileSync('src/app/dashboard/providers/page.tsx', 'utf8')

  assert.match(dashboardSource, /redirect\('\/login(?:\?returnTo=%2Fdashboard)?'\)|redirect\("\/login(?:\?returnTo=%2Fdashboard)?"\)/)
  assert.match(providersSource, /redirect\('\/login(?:\?returnTo=%2Fdashboard%2Fproviders)?'\)|redirect\("\/login(?:\?returnTo=%2Fdashboard%2Fproviders)?"\)/)
  assert.doesNotMatch(dashboardSource, /redirect\('\/'\)|redirect\("\/"\)/)
  assert.doesNotMatch(providersSource, /redirect\('\/'\)|redirect\("\/"\)/)
})

test('protected dashboard routes preserve returnTo and auth form honors it', () => {
  const dashboardSource = readFileSync('src/app/dashboard/page.tsx', 'utf8')
  const providersSource = readFileSync('src/app/dashboard/providers/page.tsx', 'utf8')
  const authFormSource = readFileSync('src/components/auth-form.tsx', 'utf8')
  const loginPageSource = readFileSync('src/app/login/page.tsx', 'utf8')
  const signupPageSource = readFileSync('src/app/signup/page.tsx', 'utf8')

  assert.match(dashboardSource, /redirect\('\/login\?returnTo=%2Fdashboard'\)|redirect\("\/login\?returnTo=%2Fdashboard"\)/)
  assert.match(
    providersSource,
    /redirect\('\/login\?returnTo=%2Fdashboard%2Fproviders'\)|redirect\("\/login\?returnTo=%2Fdashboard%2Fproviders"\)/,
  )
  assert.match(authFormSource, /returnTo\?: string/)
  assert.match(authFormSource, /router\.push\(returnTo \?\? '\/dashboard'\)|router\.push\(returnTo \?\? "\/dashboard"\)/)
  assert.match(loginPageSource, /<AuthForm mode="login" returnTo=\{returnTo\} \/>/)
  assert.match(signupPageSource, /<AuthForm mode="signup" returnTo=\{returnTo\} \/>/)
})
