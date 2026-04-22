import assert from 'node:assert/strict'
import test from 'node:test'

import { POST as login } from '../src/app/api/auth/login/route'
import { POST as signup } from '../src/app/api/auth/signup/route'
import * as session from '../src/lib/session'

test('signup route exports a POST handler', () => {
  assert.equal(typeof signup, 'function')
})

test('login route exports a POST handler', () => {
  assert.equal(typeof login, 'function')
})

test('session module exposes create and delete helpers for auth routes', () => {
  assert.equal(typeof session.createSession, 'function')
  assert.equal(typeof session.deleteSession, 'function')
})
