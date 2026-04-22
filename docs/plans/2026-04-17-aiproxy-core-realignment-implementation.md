# Aiproxy Core Realignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Realign the repository so Aiproxy becomes a SaaS control plane that monetizes `CLIProxyAPIPlus` as the real runtime core, instead of acting as a direct provider proxy.

**Architecture:** Keep the existing Next.js repo as the web frontend, control-plane surface, analytics UI, and admin/backoffice. Move the primary proxy path onto the runtime integration layer, replace the mock runtime path with a real `CLIProxyAPIPlus` adapter, introduce first-class plan entitlement state, and wire onboarding/provider connection/API key issuance around workspace runtime lifecycle.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma, PostgreSQL, Zod, Docker Compose, Nginx, GitHub Actions, `CLIProxyAPIPlus` Management API / runtime integration.

---

## Planning assumptions

- The validated design source of truth is `docs/plans/2026-04-17-aiproxy-core-realignment-design.md`.
- `CLIProxyAPIPlus` stays the runtime core.
- Runtime model is hybrid: shared nodes, but one runtime/container per workspace.
- Provider scope is all providers already supported by `CLIProxyAPIPlus`.
- Monetization is fixed subscription tiers with entitlement-first activation.
- Full admin/backoffice is part of MVP.
- The existing direct provider path (`src/app/api/proxy/chat/route.ts` + `src/lib/providers/proxy.ts`) must be demoted from primary architecture.

---

## Task 1: Freeze architecture direction in code and docs

**Files:**
- Modify: `README.md`
- Modify: `src/app/page.tsx`
- Modify: `src/app/pricing/page.tsx`
- Modify: `src/app/docs/page.tsx`
- Create: `docs/architecture/runtime-boundaries.md`
- Test: `tests/runtime-route-removal.test.ts`

**Step 1: Write the failing tests for architecture messaging drift**

Create or extend `tests/runtime-route-removal.test.ts` to assert that product docs and app copy no longer describe Aiproxy as a direct provider proxy engine. Add checks that the README and docs reference `CLIProxyAPIPlus` as the runtime core and Aiproxy as the control plane.

**Step 2: Run the failing tests**

Run:

```bash
npm test -- tests/runtime-route-removal.test.ts
```

Expected: FAIL because the README and UI copy still imply direct provider behavior and generic “one API for all providers” positioning without anchoring on `CLIProxyAPIPlus`.

**Step 3: Write the minimal doc and marketing copy corrections**

- Update `README.md` so the product description, features, and deployment notes describe Aiproxy as a control plane for `CLIProxyAPIPlus`.
- Update `src/app/page.tsx`, `src/app/pricing/page.tsx`, and `src/app/docs/page.tsx` so messaging reflects provider onboarding, workspace runtime, plan entitlement, and admin operations.
- Add `docs/architecture/runtime-boundaries.md` documenting what belongs to web frontend, control-plane API, runtime provisioner, provider connection orchestration, usage ingestion, and admin backoffice.

**Step 4: Run the tests again**

Run:

```bash
npm test -- tests/runtime-route-removal.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add README.md src/app/page.tsx src/app/pricing/page.tsx src/app/docs/page.tsx docs/architecture/runtime-boundaries.md tests/runtime-route-removal.test.ts
git commit -m "docs: realign product messaging to runtime-core model"
```

---

## Task 2: Introduce first-class entitlement and billing-state models

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/entitlements.ts`
- Create: `src/lib/plans.ts`
- Create: `src/lib/admin/entitlements.ts`
- Test: `tests/entitlements.test.ts`
- Test: `tests/schema-contract.test.ts`

**Step 1: Write the failing tests for entitlement behavior**

Create `tests/entitlements.test.ts` with concrete assertions for Free, Starter, and Pro workspace behavior:

- provider slot counts differ by tier
- API key limits differ by tier
- request/quota behavior differs by tier
- admin-assigned entitlement state overrides default assumptions

Create or extend `tests/schema-contract.test.ts` to assert the schema includes first-class plan/entitlement state beyond `Workspace.planTier`.

**Step 2: Run the failing tests**

Run:

```bash
npm test -- tests/entitlements.test.ts tests/schema-contract.test.ts
```

Expected: FAIL because there is no `workspace_entitlements` model or equivalent first-class billing/entitlement state.

**Step 3: Extend the schema minimally**

Add models that support the entitlement-first MVP without overbuilding:

- `Plan` or static-compatible plan metadata table if needed
- `WorkspaceEntitlement` for effective tier/limits/state
- `WorkspaceBillingState` for manual/semi-manual paid activation state
- `EntitlementChangeEvent` for admin changes and auditability

Do not implement live billing provider tables yet unless the shape is required for later extensibility.

**Step 4: Add runtime-safe entitlement helpers**

- `src/lib/plans.ts` should define normalized plan defaults.
- `src/lib/entitlements.ts` should expose functions like `getWorkspaceEntitlement()`, `canConnectProvider()`, `canIssueApiKey()`, and `getWorkspaceQuotaState()`.
- `src/lib/admin/entitlements.ts` should expose manual admin update helpers.

**Step 5: Replace implicit plan logic with helpers in one narrow path**

Update only the smallest existing consumers first, such as `src/lib/workspace.ts`, to read effective entitlement instead of hardcoded `planTier` assumptions.

**Step 6: Re-run tests**

Run:

```bash
npm test -- tests/entitlements.test.ts tests/schema-contract.test.ts
```

Expected: PASS.

**Step 7: Regenerate Prisma client and verify types**

Run:

```bash
npx prisma generate
npm run typecheck
```

Expected: PASS.

**Step 8: Commit**

```bash
git add prisma/schema.prisma src/lib/entitlements.ts src/lib/plans.ts src/lib/admin/entitlements.ts src/lib/workspace.ts tests/entitlements.test.ts tests/schema-contract.test.ts
git commit -m "feat: add first-class workspace entitlement model"
```

---

## Task 3: Replace mock runtime wiring with a real CLIProxyAPIPlus adapter shell

**Files:**
- Create: `src/integrations/runtime/cliproxyapiplus-adapter.ts`
- Modify: `src/integrations/runtime/adapter-instance.ts`
- Modify: `src/integrations/runtime/index.ts`
- Modify: `src/integrations/runtime/service.ts`
- Create: `tests/runtime-adapter-contract.test.ts`
- Test: `tests/task3-runtime-contract.test.ts`

**Step 1: Write the failing adapter contract tests**

Create `tests/runtime-adapter-contract.test.ts` that asserts:

- a real adapter class exists
- adapter instance selection can switch between mock and real modes via environment
- missing `CLIPROXYAPIPLUS_*` config in real mode produces a clear failure

Extend `tests/task3-runtime-contract.test.ts` if needed so runtime integration is verified through the adapter boundary instead of direct mock assumptions.

**Step 2: Run the failing tests**

Run:

```bash
npm test -- tests/runtime-adapter-contract.test.ts tests/task3-runtime-contract.test.ts
```

Expected: FAIL because no real adapter implementation exists.

**Step 3: Implement the adapter shell**

Create `src/integrations/runtime/cliproxyapiplus-adapter.ts` implementing the existing `IRuntimeAdapter` contract. It does not need every production detail yet, but it must:

- validate required env vars such as `CLIPROXYAPIPLUS_API_URL` and `CLIPROXYAPIPLUS_API_KEY`
- define the request/response translation surface to the Management API
- map provisioning, provider connection, API key issuance, usage sync, and health checks into adapter methods
- use real HTTP client calls or thin fetch wrappers rather than mock returns

**Step 4: Update the adapter factory**

Modify `src/integrations/runtime/adapter-instance.ts` so adapter selection supports `mock` and `cliproxyapiplus` modes, with `cliproxyapiplus` intended for real execution.

**Step 5: Align runtime service imports and status handling**

Update `src/integrations/runtime/index.ts` and `src/integrations/runtime/service.ts` so the service consistently routes through the adapter and uses correct audit actions like `RUNTIME_PROVISIONED` and `PROVIDER_CONNECTED`.

**Step 6: Re-run tests**

Run:

```bash
npm test -- tests/runtime-adapter-contract.test.ts tests/task3-runtime-contract.test.ts
```

Expected: PASS.

**Step 7: Commit**

```bash
git add src/integrations/runtime/cliproxyapiplus-adapter.ts src/integrations/runtime/adapter-instance.ts src/integrations/runtime/index.ts src/integrations/runtime/service.ts tests/runtime-adapter-contract.test.ts tests/task3-runtime-contract.test.ts
git commit -m "feat: add CLIProxyAPIPlus runtime adapter path"
```

---

## Task 4: Move provider onboarding onto runtime-backed flows

**Files:**
- Create: `src/app/dashboard/providers/page.tsx`
- Create: `src/app/api/providers/route.ts`
- Create: `src/app/api/providers/[id]/route.ts`
- Create: `src/lib/providers/catalog.ts`
- Modify: `src/integrations/runtime/service.ts`
- Modify: `src/app/dashboard/page.tsx`
- Test: `tests/provider-onboarding-contract.test.ts`

**Step 1: Write the failing provider onboarding tests**

Create `tests/provider-onboarding-contract.test.ts` asserting:

- a provider list/config route exists
- provider connection creation is gated by entitlement
- runtime-backed provider connection status can be read for dashboard rendering

**Step 2: Run the failing tests**

Run:

```bash
npm test -- tests/provider-onboarding-contract.test.ts
```

Expected: FAIL because provider onboarding routes and UI are missing.

**Step 3: Add a provider catalog tied to the core**

Create `src/lib/providers/catalog.ts` that defines the provider inventory surfaced by Aiproxy. This inventory must be explicitly framed as “providers supported by `CLIProxyAPIPlus`” rather than an ad hoc direct-provider list.

**Step 4: Add provider management routes**

- `POST /api/providers` should create/initiate a provider connection through runtime service.
- `GET /api/providers` should list workspace provider connections and statuses.
- `DELETE` or reconnect behaviors in `src/app/api/providers/[id]/route.ts` should coordinate with runtime service.

**Step 5: Add provider onboarding UI**

Create `src/app/dashboard/providers/page.tsx` to show available providers, connected providers, remaining slots, connection status, and reconnect/disconnect actions.

**Step 6: Surface provider onboarding in dashboard journey**

Update `src/app/dashboard/page.tsx` and onboarding checklist components so “connect provider” becomes a required activation step before first successful call.

**Step 7: Re-run tests**

Run:

```bash
npm test -- tests/provider-onboarding-contract.test.ts
```

Expected: PASS.

**Step 8: Commit**

```bash
git add src/app/dashboard/providers/page.tsx src/app/api/providers/route.ts src/app/api/providers/[id]/route.ts src/lib/providers/catalog.ts src/integrations/runtime/service.ts src/app/dashboard/page.tsx tests/provider-onboarding-contract.test.ts
git commit -m "feat: add runtime-backed provider onboarding"
```

---

## Task 5: Move tenant API key issuance onto runtime-backed key orchestration

**Files:**
- Modify: `src/app/api/keys/route.ts`
- Modify: `src/app/api/keys/[id]/route.ts`
- Modify: `src/lib/api-key.ts`
- Modify: `src/integrations/runtime/service.ts`
- Test: `tests/api-key-runtime-contract.test.ts`
- Test: `tests/api-key-masking.test.ts`

**Step 1: Write the failing tests for runtime-backed key issuance**

Create `tests/api-key-runtime-contract.test.ts` asserting:

- key creation routes issue tenant keys through the runtime service
- revocation routes revoke both local and runtime state
- key listing remains masked except immediately after creation

**Step 2: Run the failing tests**

Run:

```bash
npm test -- tests/api-key-runtime-contract.test.ts tests/api-key-masking.test.ts
```

Expected: FAIL because key creation currently uses local generation behavior rather than guaranteed runtime-backed issuance.

**Step 3: Update the key issuance path**

- Route key creation through `issueWorkspaceApiKey()`.
- Ensure runtime-bound key identifiers and workspace runtime relationships are persisted correctly.
- Keep masked display behavior for non-creation listing paths.

**Step 4: Update revocation and update flows**

Ensure revoke/update paths verify workspace ownership and synchronize runtime state when required.

**Step 5: Re-run tests**

Run:

```bash
npm test -- tests/api-key-runtime-contract.test.ts tests/api-key-masking.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/app/api/keys/route.ts src/app/api/keys/[id]/route.ts src/lib/api-key.ts src/integrations/runtime/service.ts tests/api-key-runtime-contract.test.ts tests/api-key-masking.test.ts
git commit -m "feat: issue tenant api keys through workspace runtime"
```

---

## Task 6: Replace direct provider proxy path with runtime-backed request path

**Files:**
- Modify: `src/app/api/proxy/chat/route.ts`
- Modify: `src/lib/proxy-http.ts`
- Demote: `src/lib/providers/proxy.ts`
- Create: `src/lib/runtime-proxy.ts`
- Test: `tests/provider-proxy.test.ts`
- Test: `tests/proxy-http.test.ts`
- Test: `tests/proxy-route-contract.test.ts`

**Step 1: Write the failing tests for runtime-backed request execution**

Update or add tests asserting:

- the primary request execution path does not directly call provider-specific secrets from the web app
- request validation, request ID propagation, and error mapping remain intact
- runtime-backed request forwarding is the default behavior

**Step 2: Run the failing tests**

Run:

```bash
npm test -- tests/provider-proxy.test.ts tests/proxy-http.test.ts tests/proxy-route-contract.test.ts
```

Expected: FAIL once the tests are updated to expect runtime-backed forwarding rather than direct `OPENAI_API_KEY` usage.

**Step 3: Introduce a runtime-backed proxy execution helper**

Create `src/lib/runtime-proxy.ts` to coordinate:

- workspace API key validation
- runtime lookup
- request forwarding into the workspace runtime endpoint
- request ID propagation
- upstream error mapping

**Step 4: Demote direct provider logic**

Change `src/lib/providers/proxy.ts` from the primary execution path into either:

- a dev-only fallback behind explicit configuration, or
- a temporary compatibility shim marked for removal

The route must stop presenting direct provider fetches as the normal architecture.

**Step 5: Update the proxy route**

Modify `src/app/api/proxy/chat/route.ts` so its happy path delegates to runtime-backed execution. Preserve analytics logging, request IDs, and entitlement checks.

**Step 6: Re-run tests**

Run:

```bash
npm test -- tests/provider-proxy.test.ts tests/proxy-http.test.ts tests/proxy-route-contract.test.ts
```

Expected: PASS.

**Step 7: Commit**

```bash
git add src/app/api/proxy/chat/route.ts src/lib/proxy-http.ts src/lib/providers/proxy.ts src/lib/runtime-proxy.ts tests/provider-proxy.test.ts tests/proxy-http.test.ts tests/proxy-route-contract.test.ts
git commit -m "refactor: route proxy requests through workspace runtime"
```

---

## Task 7: Build admin/backoffice MVP around entitlement and runtime operations

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/workspaces/[id]/page.tsx`
- Create: `src/app/api/admin/workspaces/route.ts`
- Create: `src/app/api/admin/workspaces/[id]/entitlement/route.ts`
- Create: `src/app/api/admin/workspaces/[id]/runtime/route.ts`
- Create: `src/lib/admin/workspaces.ts`
- Test: `tests/admin-backoffice-contract.test.ts`

**Step 1: Write the failing admin contract tests**

Create `tests/admin-backoffice-contract.test.ts` asserting:

- admin workspace search route exists
- entitlement update route exists
- runtime suspend/resume/status route exists
- admin detail view surface exists

**Step 2: Run the failing tests**

Run:

```bash
npm test -- tests/admin-backoffice-contract.test.ts
```

Expected: FAIL because admin/backoffice routes and pages are missing.

**Step 3: Add admin service layer helpers**

Create `src/lib/admin/workspaces.ts` for workspace search, entitlement changes, runtime inspection, and suspend/resume workflows.

**Step 4: Add admin API routes**

- workspace search/list
- entitlement update
- runtime control/status

**Step 5: Add admin UI**

- `src/app/admin/page.tsx` for workspace search/list
- `src/app/admin/workspaces/[id]/page.tsx` for workspace detail including entitlement, provider state, runtime state, and usage summary

**Step 6: Re-run tests**

Run:

```bash
npm test -- tests/admin-backoffice-contract.test.ts
```

Expected: PASS.

**Step 7: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/workspaces/[id]/page.tsx src/app/api/admin/workspaces/route.ts src/app/api/admin/workspaces/[id]/entitlement/route.ts src/app/api/admin/workspaces/[id]/runtime/route.ts src/lib/admin/workspaces.ts tests/admin-backoffice-contract.test.ts
git commit -m "feat: add admin backoffice for entitlement and runtime ops"
```

---

## Task 8: Complete first-successful-call onboarding flow

**Files:**
- Modify: `src/components/onboarding-checklist.tsx`
- Modify: `src/app/api/onboarding/progress/route.ts`
- Modify: `src/app/dashboard/page.tsx`
- Create: `tests/onboarding-flow-contract.test.ts`

**Step 1: Write the failing onboarding contract test**

Create `tests/onboarding-flow-contract.test.ts` asserting that onboarding progress requires:

- workspace exists
- runtime exists
- at least one provider is connected
- at least one tenant API key is issued
- first successful call is tracked

**Step 2: Run the failing test**

Run:

```bash
npm test -- tests/onboarding-flow-contract.test.ts
```

Expected: FAIL because current onboarding is not fully aligned to runtime-backed first-successful-call activation.

**Step 3: Update onboarding calculation and UI**

Modify the onboarding progress route and checklist UI so the activation funnel mirrors the validated product journey.

**Step 4: Re-run test**

Run:

```bash
npm test -- tests/onboarding-flow-contract.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/onboarding-checklist.tsx src/app/api/onboarding/progress/route.ts src/app/dashboard/page.tsx tests/onboarding-flow-contract.test.ts
git commit -m "feat: align onboarding to runtime-backed first call flow"
```

---

## Task 9: Strengthen operational visibility around workspace runtimes

**Files:**
- Modify: `src/app/api/health/route.ts`
- Modify: `src/app/api/ready/route.ts`
- Modify: `src/lib/logger.ts`
- Create: `src/lib/runtime-health.ts`
- Modify: `docs/runbooks/deploy.md`
- Modify: `docs/runbooks/incidents.md`
- Test: `tests/ops-artifacts.test.ts`

**Step 1: Write the failing ops tests**

Update `tests/ops-artifacts.test.ts` to assert that operational endpoints and runbooks mention runtime health, provisioning state, and workspace runtime readiness—not just app/process readiness.

**Step 2: Run the failing test**

Run:

```bash
npm test -- tests/ops-artifacts.test.ts
```

Expected: FAIL because current health/readiness checks are app-centric and do not clearly represent runtime-control-plane operational readiness.

**Step 3: Add runtime-aware health helpers**

Create `src/lib/runtime-health.ts` and use it in health/readiness flows to distinguish:

- control plane healthy
- database reachable
- runtime integration configured
- optional workspace runtime health where appropriate

**Step 4: Improve structured logging and runbooks**

Ensure deploy and incident runbooks reference runtime provisioning failures, provider onboarding failures, and runtime suspend/resume operations.

**Step 5: Re-run test**

Run:

```bash
npm test -- tests/ops-artifacts.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/app/api/health/route.ts src/app/api/ready/route.ts src/lib/logger.ts src/lib/runtime-health.ts docs/runbooks/deploy.md docs/runbooks/incidents.md tests/ops-artifacts.test.ts
git commit -m "ops: add runtime-aware health and incident visibility"
```

---

## Task 10: Final repo-wide realignment verification

**Files:**
- Verify all changed files
- Update: `docs/plans/2026-04-17-aiproxy-core-realignment-design.md` only if implementation revealed necessary corrections

**Step 1: Run targeted tests**

Run:

```bash
npm test -- tests/runtime-route-removal.test.ts tests/entitlements.test.ts tests/schema-contract.test.ts tests/runtime-adapter-contract.test.ts tests/task3-runtime-contract.test.ts tests/provider-onboarding-contract.test.ts tests/api-key-runtime-contract.test.ts tests/provider-proxy.test.ts tests/proxy-http.test.ts tests/proxy-route-contract.test.ts tests/admin-backoffice-contract.test.ts tests/onboarding-flow-contract.test.ts tests/ops-artifacts.test.ts
```

Expected: PASS.

**Step 2: Run full suite**

Run:

```bash
npm test
```

Expected: PASS.

**Step 3: Run lint, typecheck, and build**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: PASS.

**Step 4: Run Prisma generation/migration sanity checks**

Run:

```bash
npx prisma generate
npm run db:migrate:deploy
```

Expected: Prisma generation succeeds and migrations apply cleanly in a safe environment.

**Step 5: Review architecture drift one last time**

Confirm all of the following:

- the default proxy path is runtime-backed
- entitlement is first-class and not hardcoded-only
- admin/backoffice exists and can operate manual entitlement workflows
- onboarding requires real provider connection before first successful call
- direct-provider web-app proxying is no longer the product’s primary identity

**Step 6: Commit final integration batch**

```bash
git add .
git commit -m "feat: realign aiproxy around CLIProxyAPIPlus core"
```

---

## Notes for execution

- Use `@superpowers:test-driven-development` for every feature or behavior change.
- Use `@superpowers:verification-before-completion` before claiming any batch is complete.
- Use small commits after each task; do not bundle the full realignment into one giant diff.
- Keep the direct provider path only if explicitly fenced as temporary fallback/dev-only behavior.
- Prefer evolving existing control-plane pieces over rewriting them.
