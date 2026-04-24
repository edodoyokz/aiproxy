import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

test('platform-admin module exists and exports isPlatformAdmin', async () => {
  const path = new URL('../src/lib/platform-admin.ts', import.meta.url)
  const source = await readFile(path, 'utf8')
  assert.match(source, /export async function isPlatformAdmin/)
})

test('platform-admin email comparison is case-insensitive', async () => {
  const source = await readFile(new URL('../src/lib/platform-admin.ts', import.meta.url), 'utf8')
  assert.ok(
    source.includes('toLowerCase()') && source.includes('user.email.toLowerCase()'),
    'email comparison should use toLowerCase() for case-insensitive matching',
  )
})

test('platform-admin checks database flag before env allowlist', async () => {
  const source = await readFile(new URL('../src/lib/platform-admin.ts', import.meta.url), 'utf8')
  const dbFlagIndex = source.indexOf('isPlatformAdmin')
  const envCheckIndex = source.indexOf('PLATFORM_ADMIN_EMAILS')
  assert.ok(dbFlagIndex > -1, 'should check database isPlatformAdmin flag')
  assert.ok(envCheckIndex > -1, 'should check PLATFORM_ADMIN_EMAILS env')
  assert.ok(dbFlagIndex < envCheckIndex, 'database flag should be checked before env allowlist')
})

test('authz context includes isPlatformAdmin field', async () => {
  const source = await readFile(new URL('../src/lib/authz.ts', import.meta.url), 'utf8')
  assert.match(source, /isPlatformAdmin/)
  assert.match(source, /import.*isPlatformAdmin.*from.*platform-admin/)
})

test('admin page gates on isPlatformAdmin, not workspace role', async () => {
  const source = await readFile(new URL('../src/app/admin/page.tsx', import.meta.url), 'utf8')
  assert.match(source, /auth\.isPlatformAdmin/)
  assert.doesNotMatch(source, /\['owner',\s*'admin'\]\.includes\(auth\.role\)/)
})

test('admin workspace detail page gates on isPlatformAdmin, not workspace role', async () => {
  const source = await readFile(new URL('../src/app/admin/workspaces/\[id\]/page.tsx', import.meta.url), 'utf8')
  assert.match(source, /auth\.isPlatformAdmin/)
  assert.doesNotMatch(source, /\['owner',\s*'admin'\]\.includes\(auth\.role\)/)
})

test('admin workspace search API gates on isPlatformAdmin, not workspace role', async () => {
  const source = await readFile(new URL('../src/app/api/admin/workspaces/route.ts', import.meta.url), 'utf8')
  assert.match(source, /auth\.isPlatformAdmin/)
  assert.doesNotMatch(source, /\['owner',\s*'admin'\]\.includes\(auth\.role\)/)
})

test('admin entitlement API gates on isPlatformAdmin, not workspace role', async () => {
  const source = await readFile(new URL('../src/app/api/admin/workspaces/\[id\]/entitlement/route.ts', import.meta.url), 'utf8')
  assert.match(source, /auth\.isPlatformAdmin/)
  assert.doesNotMatch(source, /\['owner',\s*'admin'\]\.includes\(auth\.role\)/)
})

test('admin runtime API GET gates on isPlatformAdmin, not workspace role', async () => {
  const source = await readFile(new URL('../src/app/api/admin/workspaces/\[id\]/runtime/route.ts', import.meta.url), 'utf8')
  const occurrences = source.match(/auth\.isPlatformAdmin/g)
  assert.ok(occurrences && occurrences.length >= 2, 'runtime route should check isPlatformAdmin in both GET and PATCH')
  assert.doesNotMatch(source, /\['owner',\s*'admin'\]\.includes\(auth\.role\)/)
})

test('middleware protects /admin routes for unauthenticated users', async () => {
  const source = await readFile(new URL('../middleware.ts', import.meta.url), 'utf8')
  assert.match(source, /\/admin/)
  assert.match(source, /protectedPrefixes/, 'admin should be in protected prefixes')
})

test('middleware matcher includes /admin/:path*', async () => {
  const source = await readFile(new URL('../middleware.ts', import.meta.url), 'utf8')
  assert.match(source, /\/admin\/:path\*/)
})

test('prisma schema includes isPlatformAdmin on User model', async () => {
  const source = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8')
  assert.match(source, /isPlatformAdmin\s+Boolean\s+@default\(false\)/)
})

test('no admin surface uses workspace role for admin gating', async () => {
  const adminFiles = [
    '../src/app/admin/page.tsx',
    '../src/app/admin/workspaces/[id]/page.tsx',
    '../src/app/api/admin/workspaces/route.ts',
    '../src/app/api/admin/workspaces/[id]/entitlement/route.ts',
    '../src/app/api/admin/workspaces/[id]/runtime/route.ts',
  ]

  for (const file of adminFiles) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8')
    assert.doesNotMatch(
      source,
      /\['owner',\s*'admin'\]\.includes\(auth\.role\)/,
      `${file} must not use workspace role for admin gating`,
    )
  }
})
