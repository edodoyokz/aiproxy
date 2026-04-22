import assert from 'node:assert/strict'
import test from 'node:test'
import { access, readFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'

test('admin workspace service exposes search and detail helpers', async () => {
  const path = new URL('../src/lib/admin/workspaces.ts', import.meta.url)

  await access(path, fsConstants.F_OK)

  const source = await readFile(path, 'utf8')
  assert.match(source, /export\s+async\s+function\s+searchAdminWorkspaces\s*\(/)
  assert.match(source, /export\s+async\s+function\s+getAdminWorkspaceDetail\s*\(/)
})

test('admin workspace search route exists', async () => {
  const path = new URL('../src/app/api/admin/workspaces/route.ts', import.meta.url)

  await access(path, fsConstants.F_OK)

  const source = await readFile(path, 'utf8')
  assert.match(source, /export\s+async\s+function\s+GET\s*\(/)
})

test('admin entitlement update route exists', async () => {
  const path = new URL('../src/app/api/admin/workspaces/\[id\]/entitlement/route.ts', import.meta.url)

  await access(path, fsConstants.F_OK)

  const source = await readFile(path, 'utf8')
  assert.match(source, /export\s+async\s+function\s+PATCH\s*\(/)
  assert.match(source, /updateAdminWorkspaceEntitlement/)
})

test('admin runtime control route exists with status and suspend or resume controls', async () => {
  const path = new URL('../src/app/api/admin/workspaces/\[id\]/runtime/route.ts', import.meta.url)

  await access(path, fsConstants.F_OK)

  const source = await readFile(path, 'utf8')
  assert.match(source, /export\s+async\s+function\s+GET\s*\(/)
  assert.match(source, /export\s+async\s+function\s+PATCH\s*\(/)
  assert.match(source, /updateAdminWorkspaceRuntime/)
})

test('admin backoffice pages exist for list and detail views', async () => {
  await access(new URL('../src/app/admin/page.tsx', import.meta.url), fsConstants.F_OK)
  await access(new URL('../src/app/admin/workspaces/\[id\]/page.tsx', import.meta.url), fsConstants.F_OK)
})
