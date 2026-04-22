# Dashboard and Onboarding UI Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the dashboard, onboarding checklist, and provider page so Aiproxy feels like an activation-first SaaS control plane instead of an engineer-first MVP.

**Architecture:** Keep the current data model and route behavior intact, but reorganize the UI hierarchy around activation state and next actions. The implementation should stay focused on three surfaces: `src/app/dashboard/page.tsx`, `src/components/onboarding-checklist.tsx`, and `src/app/dashboard/providers/page.tsx`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, lucide-react, existing server-side data fetching.

---

### Task 1: Add contract tests for the new activation-first dashboard hierarchy

**Files:**
- Modify: `tests/provider-onboarding-contract.test.ts`
- Test: `tests/provider-onboarding-contract.test.ts`

**Step 1: Write the failing test**

Extend `tests/provider-onboarding-contract.test.ts` with assertions that `src/app/dashboard/page.tsx` includes:
- an activation panel heading such as `Workspace activation`
- state-oriented copy such as `Complete these steps to activate your workspace`
- a primary CTA that points the user toward the next activation step
- usage overview still present, but positioned as secondary product information

Example test shape:

```ts
test('dashboard introduces an activation-first hero panel', async () => {
  const source = await readFile(new URL('../src/app/dashboard/page.tsx', import.meta.url), 'utf8')
  assert.match(source, /Workspace activation/)
  assert.match(source, /Complete these steps to activate your workspace/)
  assert.match(source, /View activation guide|Connect runtime provider|Generate tenant key/)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/provider-onboarding-contract.test.ts`
Expected: FAIL because the current dashboard still starts with a generic page title and metrics-first flow.

**Step 3: Write minimal implementation**

Update `src/app/dashboard/page.tsx` to add a stronger activation-first top section that:
- sits above the checklist
- summarizes current activation intent
- uses one clear primary CTA
- keeps the existing usage cards below the activation content

Do not redesign unrelated parts of the app in this task.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/provider-onboarding-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx tests/provider-onboarding-contract.test.ts
git commit -m "ui: add activation-first dashboard hero"
```

---

### Task 2: Refresh onboarding checklist presentation and state emphasis

**Files:**
- Modify: `src/components/onboarding-checklist.tsx`
- Test: `tests/onboarding-flow-contract.test.ts`

**Step 1: Write the failing test**

Extend `tests/onboarding-flow-contract.test.ts` with assertions that the checklist component now includes:
- stronger activation module framing such as `Workspace activation checklist`
- clearer current-state copy such as `Current step` or `Next required step`
- improved completion state messaging such as `Activation complete`

Example test shape:

```ts
test('onboarding checklist uses activation-focused product framing', async () => {
  const source = await readFile(new URL('../src/components/onboarding-checklist.tsx', import.meta.url), 'utf8')
  assert.match(source, /Workspace activation checklist/)
  assert.match(source, /Next required step|Current step/)
  assert.match(source, /Activation complete|Workspace activated/)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/onboarding-flow-contract.test.ts`
Expected: FAIL because the checklist still uses more generic MVP framing.

**Step 3: Write minimal implementation**

Refactor `src/components/onboarding-checklist.tsx` to:
- improve header hierarchy
- visually emphasize the current incomplete step
- make completed states feel more polished
- keep existing step semantics and API usage intact

Do not change onboarding logic or API contracts in this task.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/onboarding-flow-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/onboarding-checklist.tsx tests/onboarding-flow-contract.test.ts
git commit -m "ui: polish onboarding checklist hierarchy"
```

---

### Task 3: Rework provider page into an activation-oriented control panel

**Files:**
- Modify: `src/app/dashboard/providers/page.tsx`
- Test: `tests/provider-onboarding-contract.test.ts`

**Step 1: Write the failing test**

Extend `tests/provider-onboarding-contract.test.ts` with assertions that the provider page includes:
- a clearer activation-oriented hero, such as `Connect a provider to continue activation`
- a relationship between provider connection and the next step (`Generate tenant key` or `Make your first successful call`)
- stronger distinction between available providers and connected providers

Example test shape:

```ts
test('provider page frames connection as part of activation flow', async () => {
  const source = await readFile(new URL('../src/app/dashboard/providers/page.tsx', import.meta.url), 'utf8')
  assert.match(source, /Connect a provider to continue activation/)
  assert.match(source, /Generate tenant key|first successful call/)
  assert.match(source, /Available providers/)
  assert.match(source, /Connected providers/)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/provider-onboarding-contract.test.ts`
Expected: FAIL because the page is currently more list-like than activation-oriented.

**Step 3: Write minimal implementation**

Update `src/app/dashboard/providers/page.tsx` so it:
- opens with a clearer activation message
- adds a summary panel for remaining provider slots and what happens after connection
- improves empty state treatment for connected providers
- preserves existing data loading and connection listing behavior

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/provider-onboarding-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/dashboard/providers/page.tsx tests/provider-onboarding-contract.test.ts
git commit -m "ui: make provider page activation-oriented"
```

---

### Task 4: Run local visual-quality verification for the refreshed UI

**Files:**
- Verify: `src/app/dashboard/page.tsx`
- Verify: `src/components/onboarding-checklist.tsx`
- Verify: `src/app/dashboard/providers/page.tsx`

**Step 1: Run targeted tests**

Run:

```bash
npm test -- tests/provider-onboarding-contract.test.ts tests/onboarding-flow-contract.test.ts
```

Expected: PASS.

**Step 2: Run static verification**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: PASS.

**Step 3: Run local UI smoke verification**

Start the app locally and verify manually:
- `/dashboard` has activation-first hierarchy
- onboarding checklist looks more premium and more guided
- `/dashboard/providers` presents a clearer activation path

Use the FE-focused execution path and browser verification tooling for this step.

**Step 4: Review scope boundaries**

Confirm that:
- landing page is unchanged
- pricing page is unchanged
- admin UI is unchanged
- no activation semantics were changed accidentally

**Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/onboarding-checklist.tsx src/app/dashboard/providers/page.tsx tests/provider-onboarding-contract.test.ts tests/onboarding-flow-contract.test.ts
git commit -m "ui: refresh dashboard onboarding flow"
```

---

Plan complete and saved to `docs/plans/2026-04-18-dashboard-onboarding-ui-refresh.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
