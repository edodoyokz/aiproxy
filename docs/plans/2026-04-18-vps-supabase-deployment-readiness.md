# VPS + Supabase Deployment Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Aiproxy ready for a budget-constrained production target: 1 VPS for Nginx + app, Supabase Postgres for the database, and local verification before any deployment.

**Architecture:** Reuse the existing Dockerfile, production compose file, deploy script, and runbooks, but remove the production assumption of a local Postgres service and replace old provider-secret deployment assumptions with runtime-integration configuration. The deployment gate must be local-first: full verification passes locally before deploy artifacts are used on the VPS.

**Tech Stack:** Next.js 15, TypeScript, Prisma, Docker Compose, Nginx, Supabase Postgres, Bash deploy scripts.

---

### Task 1: Lock production environment contract for VPS + Supabase

**Files:**
- Modify: `deploy/.env.production.example`
- Modify: `.env.example`
- Test: `tests/deployment-artifacts.test.ts`

**Step 1: Write the failing test**

Add or extend `tests/deployment-artifacts.test.ts` with assertions that:
- production env example contains `DATABASE_URL`
- production env example contains `SESSION_SECRET`
- production env example contains `APP_URL`
- production env example contains `RUNTIME_MODE`
- production env example contains `CLIPROXYAPIPLUS_API_URL`
- production env example contains `CLIPROXYAPIPLUS_API_KEY`
- production env example does **not** require `OPENAI_API_KEY` as the primary deploy secret
- root `.env.example` documents PostgreSQL/Supabase usage clearly

Example assertion shape:

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('production env example targets runtime-backed deployment config', () => {
  const source = readFileSync('deploy/.env.production.example', 'utf8')
  assert.match(source, /^DATABASE_URL=/m)
  assert.match(source, /^RUNTIME_MODE=/m)
  assert.match(source, /^CLIPROXYAPIPLUS_API_URL=/m)
  assert.match(source, /^CLIPROXYAPIPLUS_API_KEY=/m)
  assert.doesNotMatch(source, /^OPENAI_API_KEY=/m)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: FAIL because the current production env example still uses old deployment assumptions.

**Step 3: Write minimal implementation**

Update `deploy/.env.production.example` so it documents the real runtime-backed production contract for a VPS + Supabase target, for example:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
SESSION_SECRET=replace-with-a-long-random-secret
APP_URL=https://your-domain.example
RUNTIME_MODE=cliproxyapiplus
CLIPROXYAPIPLUS_API_URL=http://127.0.0.1:3100
CLIPROXYAPIPLUS_API_KEY=replace-with-runtime-shared-secret
```

Update `.env.example` so it explicitly says PostgreSQL/Supabase is the intended staging/production target.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add deploy/.env.production.example .env.example tests/deployment-artifacts.test.ts
git commit -m "deploy: define vps and supabase env contract"
```

---

### Task 2: Remove local Postgres from the production compose assumption

**Files:**
- Modify: `docker-compose.prod.yml`
- Test: `tests/deployment-artifacts.test.ts`

**Step 1: Write the failing test**

Extend `tests/deployment-artifacts.test.ts` to assert that the production compose file:
- includes `app`
- includes `nginx`
- does **not** require a `postgres` service for the production target
- uses a real production env file rather than hard-coding a local database assumption

Example assertion shape:

```ts
test('production compose targets app and nginx without local postgres', () => {
  const source = readFileSync('docker-compose.prod.yml', 'utf8')
  assert.match(source, /^\s*app:/m)
  assert.match(source, /^\s*nginx:/m)
  assert.doesNotMatch(source, /^\s*postgres:/m)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: FAIL because the current file still defines a local `postgres` service.

**Step 3: Write minimal implementation**

Update `docker-compose.prod.yml` so it:
- keeps `app`
- keeps `nginx`
- removes the production `postgres` service
- points `app` at a real deploy env file path (for example `deploy/.env.production`)
- stops using `depends_on` for a removed local database service

Do not add extra services unless they are necessary for the chosen target.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add docker-compose.prod.yml tests/deployment-artifacts.test.ts
git commit -m "deploy: remove local postgres from production compose"
```

---

### Task 3: Enforce local verification before deployment

**Files:**
- Modify: `scripts/deploy.sh`
- Test: `tests/deployment-artifacts.test.ts`

**Step 1: Write the failing test**

Extend `tests/deployment-artifacts.test.ts` to assert that `scripts/deploy.sh` runs local verification before starting the production compose deployment. At minimum, assert the script contains commands for:
- install dependencies
- Prisma generate
- lint
- typecheck
- tests
- build
- docker compose production up

Example assertion shape:

```ts
test('deploy script enforces local verification before compose deploy', () => {
  const source = readFileSync('scripts/deploy.sh', 'utf8')
  assert.match(source, /npm run lint/)
  assert.match(source, /npm run typecheck/)
  assert.match(source, /npm test/)
  assert.match(source, /npm run build/)
  assert.match(source, /docker compose -f docker-compose.prod.yml up -d --build/)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: FAIL because the current script does not enforce the full local verification gate.

**Step 3: Write minimal implementation**

Update `scripts/deploy.sh` to run, in order:

```bash
npm ci
npx prisma generate
npm run lint
npm run typecheck
npm test
npm run build
docker compose -f docker-compose.prod.yml up -d --build
```

Keep it simple. Do not add remote-SSH deployment automation yet unless absolutely necessary.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/deploy.sh tests/deployment-artifacts.test.ts
git commit -m "deploy: require local verification before deploy"
```

---

### Task 4: Update deploy and smoke-test runbooks for the real target

**Files:**
- Modify: `docs/runbooks/deploy.md`
- Modify: `docs/runbooks/smoke-test.md`
- Test: `tests/deployment-artifacts.test.ts`

**Step 1: Write the failing test**

Extend `tests/deployment-artifacts.test.ts` to assert that:
- deploy runbook mentions Supabase/Postgres connection setup
- deploy runbook mentions local verification before deployment
- deploy runbook mentions copying the real production env file to the VPS
- smoke test mentions login, dashboard load, provider connection, tenant key issuance, first successful call, and health/readiness checks

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: FAIL because the runbooks are still too generic.

**Step 3: Write minimal implementation**

Update `docs/runbooks/deploy.md` so it clearly documents:
- Supabase `DATABASE_URL`
- env file preparation on VPS
- local verification before deployment
- deploy command
- post-deploy checks

Update `docs/runbooks/smoke-test.md` so it reflects the actual activation funnel:
- open app
- login
- dashboard loads
- connect provider
- generate tenant key
- send first successful runtime-backed request
- verify analytics and `/api/health` + `/api/ready`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/runbooks/deploy.md docs/runbooks/smoke-test.md tests/deployment-artifacts.test.ts
git commit -m "docs: align vps deployment and smoke test runbooks"
```

---

### Task 5: Verify the full deployment-readiness slice locally

**Files:**
- Verify all files changed in Tasks 1-4

**Step 1: Run targeted test**

Run: `npm test -- tests/deployment-artifacts.test.ts`
Expected: PASS.

**Step 2: Run full local verification gate**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: PASS.

**Step 3: Run deploy-artifact sanity checks**

Run:

```bash
npx prisma generate
docker compose -f docker-compose.prod.yml config
```

Expected: both commands succeed.

**Step 4: Review final deployment assumptions**

Confirm all of the following:
- production compose does not depend on local Postgres
- production env example is Supabase/runtime-backed
- deploy script enforces local verification first
- smoke-test runbook matches the actual activation funnel
- the repo is ready for a 1 VPS + Supabase deployment pass

**Step 5: Commit**

```bash
git add .
git commit -m "deploy: prepare vps and supabase production path"
```

---

Plan complete and saved to `docs/plans/2026-04-18-vps-supabase-deployment-readiness.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
