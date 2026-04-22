# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the marketing landing page so Aiproxy is immediately understandable as a SaaS control plane for CLIProxyAPIPlus, with clearer hierarchy, calmer pacing, and CTA paths that match the real product journey.

**Architecture:** Keep the implementation focused on `src/app/page.tsx` and avoid broad site-wide churn. Replace the current all-in-one homepage composition with a clarity-first sequence built from small local sections in the same file unless a reusable extraction becomes obviously necessary. Validate the redesign with route/content-level tests where practical, then run lint, typecheck, and build.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS, Node test runner.

---

### Task 1: Lock the new landing page information hierarchy in a failing test

**Files:**
- Create: `tests/landing-page-content.test.ts`
- Read: `docs/plans/2026-04-18-landing-page-redesign-design.md`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Write the failing test**

Add a route/content-level test that reads `src/app/page.tsx` as text and asserts the redesigned page structure will include the clarity-first narrative elements. At minimum, assert the source includes markers or copy for:

- control-plane positioning
- a product-model explanation section
- an activation workflow section
- docs/pricing/dashboard CTA paths
- removal of fake testimonial language if those strings currently exist

Example assertion shape:

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('landing page follows clarity-first structure', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /SaaS control plane/i)
  assert.match(source, /How Aiproxy works/i)
  assert.match(source, /Connect provider/i)
  assert.match(source, /Read docs/i)
  assert.doesNotMatch(source, /Trusted by developers worldwide/i)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: FAIL because the current landing page still contains the old structure and placeholder-style social proof.

**Step 3: Write minimal implementation for the test contract**

Only add enough new section labels/copy in `src/app/page.tsx` to satisfy the initial content contract if that helps stage the redesign incrementally. Do not attempt final styling yet.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/landing-page-content.test.ts src/app/page.tsx
git commit -m "test: lock landing page clarity-first structure"
```

---

### Task 2: Replace the hero with a clarity-first positioning layout

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Extend the failing test**

Extend `tests/landing-page-content.test.ts` so it asserts the hero now supports:

- direct control-plane headline
- subcopy naming CLIProxyAPIPlus as runtime core
- primary CTA to `/dashboard`
- secondary CTA to `/docs`
- a right-side product-state panel instead of the existing code-preview framing

Example assertion shape:

```ts
test('hero positions Aiproxy clearly', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /CLIProxyAPIPlus.*runtime core/i)
  assert.match(source, /href="\/dashboard"|href='\/dashboard'/)
  assert.match(source, /href="\/docs"|href='\/docs'/)
  assert.doesNotMatch(source, /app\.ts/)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: FAIL because the current hero still relies on the old code preview and weaker CTA mix.

**Step 3: Write minimal implementation**

Refactor the hero in `src/app/page.tsx` so it:

- uses a left/right layout on larger screens
- presents the approved direct positioning copy
- uses `/dashboard` as primary CTA and `/docs` as secondary CTA
- replaces the code sample with a compact activation/runtime panel

Keep the existing dark visual language and avoid introducing new dependencies.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing-page-content.test.ts
git commit -m "feat: redesign landing hero around control-plane positioning"
```

---

### Task 3: Replace the feature grid with a product-model explanation section

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Extend the failing test**

Extend the landing-page test to assert the page includes a section that explains the relationship between:

- runtime core
- control plane
- onboarding/tenant keys/analytics value layer

Example assertion shape:

```ts
test('landing page explains the product model', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /How Aiproxy works/i)
  assert.match(source, /runtime core/i)
  assert.match(source, /control plane/i)
  assert.match(source, /tenant key/i)
  assert.match(source, /analytics/i)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: FAIL until the section is explicitly added in the new structure.

**Step 3: Write minimal implementation**

Replace or substantially reframe the current generic feature grid in `src/app/page.tsx` into a product-model explanation section. Make it read like a system explanation, not a list of marketing bullets.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing-page-content.test.ts
git commit -m "feat: add landing page product model section"
```

---

### Task 4: Add the activation workflow and trust sections

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Extend the failing test**

Extend the test so it asserts the page includes the approved activation sequence and concrete trust signals. At minimum, assert content for:

- connect provider
- generate tenant key
- first successful request
- observe usage or runtime state
- operational trust signals instead of testimonial placeholders

Example assertion shape:

```ts
test('landing page shows activation workflow and product trust', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /Connect provider/i)
  assert.match(source, /Generate tenant key/i)
  assert.match(source, /First successful request/i)
  assert.match(source, /Operational visibility|runtime visibility/i)
  assert.doesNotMatch(source, /Sarah Chen|Marcus Rodriguez|Emily Watson/)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: FAIL because the current page still contains the testimonial section and lacks the explicit activation workflow.

**Step 3: Write minimal implementation**

Update `src/app/page.tsx` so the middle/lower sections:

- add the 3-4 step activation workflow
- replace testimonials with product trust signals
- keep the visual treatment calm and structured

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing-page-content.test.ts
git commit -m "feat: add landing activation workflow and trust section"
```

---

### Task 5: Simplify pricing emphasis, final CTA, and footer navigation

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Extend the failing test**

Extend the landing-page test to assert:

- the full pricing table is no longer embedded as the homepage centerpiece
- the final CTA offers both setup and docs paths
- the footer uses real site destinations instead of placeholder `#` links

Example assertion shape:

```ts
test('landing page uses focused CTA and real navigation', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.doesNotMatch(source, /function PricingSection\(/)
  assert.match(source, /Start setup|Get started/i)
  assert.match(source, /Read docs/i)
  assert.doesNotMatch(source, /href="#"/)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: FAIL because the current page still embeds `PricingSection` and uses placeholder footer links.

**Step 3: Write minimal implementation**

Update `src/app/page.tsx` so it:

- removes the embedded pricing table from the homepage
- replaces it with a lighter pricing pointer or summary block linked to `/pricing`
- provides a final CTA with `/dashboard` and `/docs`
- cleans the footer so every link points to a real destination

If the obsolete `PricingSection` helper is no longer used, delete it from the file.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing-page-content.test.ts
git commit -m "feat: simplify landing page pricing and footer flows"
```

---

### Task 6: Verify the complete landing-page redesign slice

**Files:**
- Verify: `src/app/page.tsx`
- Verify: `tests/landing-page-content.test.ts`

**Step 1: Run targeted test**

Run: `npm test -- tests/landing-page-content.test.ts`
Expected: PASS.

**Step 2: Run local verification for the changed slice**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: PASS.

**Step 3: Run local smoke verification of the homepage**

Run the app locally and verify the redesigned homepage loads without runtime errors.

Suggested commands:

```bash
npm run dev
```

Then verify the homepage visually or via HTTP request:

```bash
curl -I http://localhost:3000/
```

Expected: homepage returns `200 OK`, and the page visually reflects the approved clarity-first structure.

**Step 4: Review against the design doc**

Confirm all of the following:

- hero clearly positions Aiproxy as the control plane
- CLIProxyAPIPlus remains explicitly described as runtime core
- activation workflow is visible
- trust signals are concrete and non-placeholder
- pricing is supportive, not dominant
- footer only contains real navigation

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing-page-content.test.ts
git commit -m "feat: complete clarity-first landing page redesign"
```
