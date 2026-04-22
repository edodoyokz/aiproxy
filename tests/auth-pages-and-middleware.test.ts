import assert from 'node:assert/strict'
import test from 'node:test'

import { NextRequest } from 'next/server'

import LoginPage from '../src/app/login/page'
import SignupPage from '../src/app/signup/page'
import { middleware } from '../middleware'
import { encrypt } from '../src/lib/session'

process.env.SESSION_SECRET = 'test-session-secret-with-sufficient-length'

test('login and signup pages export route components', () => {
  assert.equal(typeof LoginPage, 'function')
  assert.equal(typeof SignupPage, 'function')
})

test('middleware redirects anonymous dashboard requests to /login', async () => {
  const request = new NextRequest('https://example.com/dashboard')

  const response = await middleware(request)

  assert.equal(response.headers.get('location'), 'https://example.com/login')
})

test('middleware redirects authenticated users away from /login to /dashboard', async () => {
  const token = await encrypt({
    userId: 'user_123',
    workspaceId: 'workspace_123',
    expiresAt: new Date('2030-01-01T00:00:00.000Z'),
  })

  const request = new NextRequest('https://example.com/login', {
    headers: {
      cookie: `aiproxy_session=${token}`,
    },
  })

  const response = await middleware(request)

  assert.equal(response.headers.get('location'), 'https://example.com/dashboard')
})
