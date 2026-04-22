# Aiproxy Production Readiness for VPS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the current repository into a buildable, testable, secure Aiproxy deployment that can run reliably on a VPS behind a reverse proxy with persistent storage, migrations, monitoring, and rollback procedures.

**Architecture:** Stabilize the codebase first by aligning the schema, auth model, runtime integration, and API contracts with the code that actually exists. After that, harden the data layer, add automated validation, package the app for VPS deployment, and finish with operational controls such as backups, health checks, logging, TLS, and rollback.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma, SQLite/libsql today with recommended move to PostgreSQL for production, Docker Compose, Nginx, GitHub Actions, Node.js LTS.

---

## Current blockers observed on 2026-04-16

- `node_modules` is missing, so the local Next.js docs required by `AGENTS.md` could not be consulted yet and the app could not be validated with a real build.
- The repository contract is inconsistent: `README.md` says PostgreSQL, `prisma/schema.prisma` uses SQLite, `package.json` includes `@libsql/*`, and `.env.example` contains `NEXTAUTH_*` variables even though no session system is wired in.
- The runtime path is not production-ready: `src/app/api/proxy/chat/route.ts` still returns a mock response and the runtime integration is still wired to the mock adapter.
- Several API routes import `runtimeService.*`, but `src/integrations/runtime/service.ts` exports functions, not a `runtimeService` object; this is a likely build blocker.
- `src/lib/api-key.ts` references fields/relations that are not present in `prisma/schema.prisma`, which is another likely type/build blocker.
- The app currently trusts `x-workspace-id` and `x-user-id` request headers for privileged actions; there is no real session or server-side tenant resolution.
- `src/app/dashboard/page.tsx` calls `/api/analytics` without the headers the backend requires, so the default dashboard flow is not aligned with the current API contract.
- There are no test files, no CI workflow, and no deploy artifacts such as `Dockerfile`, `docker-compose`, `nginx`, `systemd`, or PM2 configs.
- `.env` exists in the repo and `.gitignore` explicitly allows `.env*`, which must be treated as a secret-management risk until proven otherwise.

### Task 1: Establish a reproducible local baseline

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Create: `.nvmrc`
- Remove or keep exactly one: `package-lock.json`, `bun.lock`

**Step 1: Choose one package manager**

Recommendation: keep `npm` because `package-lock.json` already exists and the scripts are npm-oriented. Remove `bun.lock` unless Bun is a deliberate runtime choice for production.

**Step 2: Install dependencies and restore the local Next.js docs**

Run:

```bash
npm install
```

Expected:
- `node_modules/` exists
- `node_modules/next/dist/docs/` becomes available for reference before editing Next-specific behavior

**Step 3: Add a deterministic local Node version**

Use Node 20 LTS unless a dependency forces a different version.

**Step 4: Normalize developer scripts**

Add these scripts to `package.json` if missing:
- `typecheck`
- `test`
- `check` (lint + typecheck + test + build)
- `db:migrate`
- `db:migrate:deploy`

**Step 5: Capture the initial failure baseline**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected:
- Failures are recorded and then used as the stabilization checklist for Task 2

**Step 6: Commit**

```bash
git add package.json package-lock.json bun.lock README.md .nvmrc
git commit -m "chore: normalize local toolchain and scripts"
```

### Task 2: Align the environment contract and database target

**Files:**
- Modify: `.env.example`
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `prisma/schema.prisma`
- Remove from repo or ignore: `.env`, `prisma/dev.db`

**Step 1: Pick the production database strategy**

Recommendation: use PostgreSQL on the VPS for production. Keep SQLite only for throwaway local development if needed, but do not run the SaaS production workload on SQLite.

**Step 2: Make the env file match reality**

Update `.env.example` so it only contains variables the app really uses, for example:
- `DATABASE_URL`
- `APP_URL`
- `SESSION_SECRET` or `AUTH_SECRET`
- provider credentials
- runtime integration credentials if the external runtime path is kept

Remove `NEXTAUTH_*` unless Auth.js is actually adopted in Task 4.

**Step 3: Stop committing secrets and local databases**

Update `.gitignore` to ignore:
- `.env`
- `.env.local`
- `.env.production`
- `prisma/*.db`
- `prisma/*.db-journal`

If `.env` or `prisma/dev.db` are tracked, remove them from git history later if they contain sensitive data.

**Step 4: Make the docs truthful**

Update `README.md` so setup, database choice, migration flow, and deploy instructions describe the real architecture instead of a mixed SQLite/Postgres/libsql story.

**Step 5: Verify**

Run:

```bash
npx prisma validate
npx prisma format
```

Expected:
- Schema is valid and reflects the chosen database target

**Step 6: Commit**

```bash
git add .env.example .gitignore README.md prisma/schema.prisma
git commit -m "chore: align environment and database contract"
```

### Task 3: Fix code-schema divergence and build blockers

**Files:**
- Modify: `src/lib/api-key.ts`
- Modify: `src/lib/analytics.ts`
- Modify: `src/lib/workspace.ts`
- Modify: `src/integrations/runtime/service.ts`
- Modify: `src/integrations/runtime/index.ts`
- Modify: `src/app/api/keys/[id]/route.ts`
- Modify: `src/app/api/runtimes/route.ts`
- Modify: `src/app/api/runtimes/[id]/health/route.ts`
- Modify: `src/app/api/proxy/chat/route.ts`
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Remove invalid Prisma assumptions**

Examples already visible in the repo:
- `src/lib/api-key.ts` uses `userId` and `include: { user: true }`, but `ApiKey` does not have that relation in `prisma/schema.prisma`
- `src/app/api/keys/[id]/route.ts` uses `prisma.apiKey.update({ where: { id, workspaceId } })`, which is not a valid unique selector

Fix these first so type generation and the build have a chance to pass.

**Step 2: Pick one runtime service API surface**

Either:
- export a real `runtimeService` object from `src/integrations/runtime/service.ts`, or
- update all callers to import named functions directly

Do not leave the current mixed state.

**Step 3: Remove or implement missing runtime methods**

Current callers reference methods like:
- `validateRequest`
- `syncUsage` with a non-adapter signature
- `getWorkspaceRuntimes`
- `checkHealth`
- `provisionRuntime`
- `revokeKey`

These must either exist for real or the callers must be rewritten.

**Step 4: Align frontend and backend contracts**

`src/app/dashboard/page.tsx` currently fetches `/api/analytics` without any tenant context, but the API expects `x-workspace-id`. This mismatch must be eliminated before production.

**Step 5: Regenerate Prisma client and re-run the baseline**

Run:

```bash
npx prisma generate
npm run typecheck
npm run build
```

Expected:
- The repository builds without the obvious schema/service mismatches

**Step 6: Commit**

```bash
git add src/lib src/app/api src/app/dashboard src/integrations/runtime
git commit -m "fix: resolve schema and service mismatches"
```

### Task 4: Implement real authentication and server-side tenant resolution

**Files:**
- Modify: `src/lib/auth.ts`
- Create: `src/lib/session.ts`
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/auth/signup/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `middleware.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/api/keys/route.ts`
- Modify: `src/app/api/keys/[id]/route.ts`
- Modify: `src/app/api/analytics/route.ts`
- Modify: `src/app/api/runtimes/route.ts`

**Step 1: Choose the auth implementation**

Recommendation: use secure HTTP-only cookie sessions, either via Auth.js or a small custom session layer. The key requirement is that the server, not the browser, determines the current user and workspace membership.

**Step 2: Replace spoofable headers**

Delete the assumption that clients can provide `x-user-id` and `x-workspace-id` for privileged operations. All such values must be derived from the authenticated session plus the membership table.

**Step 3: Protect routes**

Use middleware or route-level guards for:
- `/dashboard/**`
- write-capable `/api/**` endpoints

**Step 4: Harden auth flows**

Add:
- password policy
- login rate limiting
- secure cookie flags
- logout
- session expiry
- basic account lockout or backoff for repeated failures

**Step 5: Verify**

Run targeted tests for:
- signup
- login
- logout
- unauthorized access
- cross-workspace access denial

**Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/session.ts middleware.ts src/app/api/auth src/app/api src/app/layout.tsx src/app/dashboard/page.tsx
git commit -m "feat: add real auth and tenant-aware access control"
```

### Task 5: Decide and implement the production proxy/runtime path

**Files:**
- Modify: `src/app/api/proxy/chat/route.ts`
- Modify: `src/integrations/runtime/index.ts`
- Modify: `src/integrations/runtime/service.ts`
- Modify: `src/integrations/runtime/README.md`
- Create if keeping external runtime: `src/integrations/runtime/cliproxyapiplus-adapter.ts`
- Create if simplifying scope: `src/lib/providers/*.ts`

**Step 1: Make an explicit architecture decision**

Choose one of these before writing code:

1. **External runtime path**: this app manages workspaces, keys, analytics, and delegates real proxy/runtime work to CLIProxyAPIPlus.
2. **Direct provider proxy path**: this app proxies directly to providers from the VPS and drops the unfinished runtime management layer.

Do not ship the current hybrid state.

**Step 2: Remove the mock response**

`src/app/api/proxy/chat/route.ts` must stop returning a fake completion in production mode.

**Step 3: Add request validation and resilience**

Validate with Zod:
- `provider`
- `model`
- `messages`
- optional settings

Add:
- upstream timeouts
- retry policy for safe failures
- clear error mapping
- request IDs in logs

**Step 4: Make usage accounting real**

Persist real provider/runtime usage instead of fixed mock values.

**Step 5: Verify against staging credentials**

Required smoke flow:
- create key
- call proxy
- see usage event
- see analytics update

**Step 6: Commit**

```bash
git add src/app/api/proxy/chat/route.ts src/integrations/runtime src/lib/providers
git commit -m "feat: implement production proxy path"
```

### Task 6: Productionize the database lifecycle

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Create/modify: `prisma/migrations/**`
- Create: `scripts/db-backup.sh`
- Create: `scripts/db-restore.sh`
- Create: `docs/runbooks/database.md`

**Step 1: Replace `db push` with migrations**

Do not rely on `prisma db push` for production. Add and use:
- `prisma migrate dev` for development
- `prisma migrate deploy` for VPS deployment

**Step 2: Separate demo seed from production bootstrap**

`prisma/seed.ts` currently creates demo users and fake data. Keep that for local demos only. Create a production-safe bootstrap path that does not seed fake tenants or fake analytics.

**Step 3: Review indexes and retention**

Validate indexing for:
- `UsageEvent(workspaceId, timestamp)`
- `Request(workspaceId, createdAt)`
- `ApiKey(workspaceId, isActive)`

Add retention or archival notes for high-volume usage tables.

**Step 4: Add backup/restore procedures**

For PostgreSQL on VPS:
- scheduled `pg_dump`
- encrypted backup destination
- restore test procedure

**Step 5: Verify**

Run:

```bash
npx prisma migrate deploy
npm run db:seed
```

Expected:
- production migrations succeed on an empty database
- dev/demo seed remains explicitly opt-in

**Step 6: Commit**

```bash
git add prisma scripts docs/runbooks/database.md package.json README.md
git commit -m "chore: productionize database migrations and backups"
```

### Task 7: Harden security and secret handling

**Files:**
- Modify: `.gitignore`
- Modify: `next.config.ts`
- Create: `src/lib/security/rate-limit.ts`
- Create: `src/lib/security/headers.ts`
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/proxy/chat/route.ts`
- Modify: `src/app/api/keys/route.ts`
- Modify: `src/app/api/keys/[id]/route.ts`
- Modify: `src/lib/audit.ts`

**Step 1: Treat the current `.env` file as sensitive**

Rotate any credentials that may already be stored in `.env`. After rotation, keep local env files out of git.

**Step 2: Stop returning raw secrets unnecessarily**

Review whether API key values are exposed too broadly. A safe default is:
- return the full key only once at creation time
- return masked values on subsequent reads

**Step 3: Add basic HTTP hardening**

Add:
- HSTS
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- starter CSP appropriate for the app

**Step 4: Add rate limiting**

At minimum:
- auth endpoints
- proxy endpoints
- key creation endpoints

**Step 5: Expand audit coverage**

Ensure all privileged actions emit audit events with actor, workspace, resource, and metadata.

**Step 6: Verify**

Run manual negative checks:
- brute-force login attempt behavior
- unauthorized workspace access
- masked key listing
- audit event creation on key create/revoke

**Step 7: Commit**

```bash
git add .gitignore next.config.ts src/lib/security src/app/api src/lib/audit.ts
git commit -m "feat: harden security headers rate limits and secret handling"
```

### Task 8: Add automated tests and CI gating

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tests/unit/**`
- Create: `tests/integration/**`
- Create: `tests/e2e/**`
- Create: `.github/workflows/ci.yml`

**Step 1: Add unit tests**

Cover:
- auth helpers
- workspace limit logic
- analytics reducers
- runtime adapter behavior

**Step 2: Add integration tests**

Cover:
- auth routes
- key management routes
- analytics route
- proxy route with mocked upstream provider/runtime

**Step 3: Add one e2e smoke path**

Minimum user path:
- sign up
- log in
- create workspace context
- generate API key
- submit one proxy request
- confirm usage visible in dashboard

**Step 4: Add CI**

GitHub Actions should run on every PR:

```bash
npm ci
npx prisma generate
npm run lint
npm run typecheck
npm test
npm run build
```

**Step 5: Verify**

Break a test intentionally once and confirm CI fails.

**Step 6: Commit**

```bash
git add package.json vitest.config.ts playwright.config.ts tests .github/workflows/ci.yml
git commit -m "test: add automated test suite and ci gate"
```

### Task 9: Package the app for VPS deployment

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.prod.yml`
- Create: `deploy/nginx.conf`
- Create: `deploy/.env.production.example`
- Create: `deploy/systemd/aiproxy-compose.service`
- Create: `scripts/deploy.sh`
- Modify: `next.config.ts`

**Step 1: Build the app in a production-friendly form**

Recommendation: use a multi-stage Docker build and Next standalone output if supported by the installed local Next docs for this exact version.

**Step 2: Define the Compose stack**

Recommended services:
- `app`
- `postgres`
- `nginx`

Add:
- restart policies
- persistent volumes
- healthchecks
- resource limits
- log rotation or log size caps

**Step 3: Add reverse proxy configuration**

`deploy/nginx.conf` should include:
- TLS termination
- proxy pass to the Next app
- gzip/brotli if appropriate
- security headers
- basic rate limiting on public auth/proxy endpoints

**Step 4: Make startup resilient**

Use a `systemd` unit to keep the Docker Compose stack running across VPS reboots.

**Step 5: Verify locally**

Run:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Expected:
- app is reachable through nginx
- health endpoint returns success
- database persists across restarts

**Step 6: Commit**

```bash
git add Dockerfile docker-compose.prod.yml deploy scripts/deploy.sh next.config.ts
git commit -m "ops: add containerized vps deployment artifacts"
```

### Task 10: Add health checks, observability, and launch runbooks

**Files:**
- Create: `src/app/api/health/route.ts`
- Create: `src/app/api/ready/route.ts`
- Create: `src/lib/logger.ts`
- Create: `docs/runbooks/deploy.md`
- Create: `docs/runbooks/rollback.md`
- Create: `docs/runbooks/incidents.md`
- Create: `docs/runbooks/smoke-test.md`

**Step 1: Add health and readiness endpoints**

`/api/health`:
- process is up

`/api/ready`:
- database reachable
- auth/session secret present
- provider/runtime path reachable enough for startup

**Step 2: Add structured logs**

Every request should log at least:
- request ID
- route
- workspace ID if authenticated
- upstream provider/runtime
- latency
- result class

**Step 3: Add external monitoring**

Minimum production setup:
- uptime probe against `/api/health`
- error reporting tool (for example Sentry)
- alerting destination

**Step 4: Document operator flows**

Runbooks must cover:
- first deploy
- migration deploy
- rollback
- backup/restore
- post-deploy smoke
- incident triage

**Step 5: Final verification**

Complete this checklist on staging before production:
- deploy from clean checkout
- run migrations
- log in
- create key
- proxy a real request
- inspect analytics
- inspect audit logs
- restart the VPS and verify services recover automatically

**Step 6: Commit**

```bash
git add src/app/api/health src/app/api/ready src/lib/logger.ts docs/runbooks
git commit -m "ops: add health checks logging and production runbooks"
```

## Recommended execution order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10

## Non-goals for this plan

- Kubernetes or multi-region deployment
- enterprise billing automation
- advanced data warehouse analytics
- marketplace-grade provider management beyond the chosen production path

Plan complete and saved to `docs/plans/2026-04-16-production-readiness-vps.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
