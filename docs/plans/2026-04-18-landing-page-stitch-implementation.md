# Landing Page Stitch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the landing page using the approved technical-systems visual direction, generate the direction in Stitch project `9956597525360242461`, and translate the approved result into the live `src/app/page.tsx` implementation without slipping back into generic AI-style UI.

**Architecture:** Treat Stitch as the visual design source and the repo as the implementation target. Keep the marketing structure aligned with the approved clarity-first narrative, then implement the resulting layout in `src/app/page.tsx` through small TDD-backed steps so product positioning, CTA behavior, and visual structure stay verifiable. Preserve the existing login/signup/dashboard redirect fixes while replacing the page’s current visual treatment with the Stitch-approved technical-systems design.

**Tech Stack:** Stitch MCP, Next.js 15 App Router, React, TypeScript, Tailwind CSS, Node test runner (`tsx --test`).

---

### Task 1: Generate the approved technical-systems landing concept in Stitch

**Files:**
- Read: `docs/plans/2026-04-18-landing-page-redesign-design.md`
- Modify externally: Stitch project `9956597525360242461`
- Reference: `src/app/page.tsx`

**Step 1: Write the failing test surrogate**

Because Stitch generation is external design work, the “test” for this task is a written acceptance checklist derived from the approved design doc. Before generating anything, create a short checklist in your working notes with these required outcomes:

- technical systems visual language
- no generic AI neon/glow visual tropes
- control-plane hero panel instead of decorative code block
- modular system explanation blocks
- activation workflow as structured setup sequence
- restrained pricing pointer instead of dominant pricing table

**Step 2: Run the red phase**

Inspect the current landing page and confirm it does **not** yet satisfy that acceptance checklist visually.

Expected: FAIL against the checklist because the current page is an intermediate implementation, not the Stitch-backed technical-systems redesign.

**Step 3: Write minimal implementation in Stitch**

Use Stitch MCP to generate or edit the landing screen in project `9956597525360242461` with a prompt that explicitly includes:

- desktop-first landing page
- technical systems / control-plane software feel
- fresh and premium for a tech app
- dark matte base, restrained blue/slate accents
- modular panels, strong grid, disciplined spacing
- no generic AI landing visuals, no glowing orb hero, no abstract AI-wave art, no neon overload

If multiple variants are needed, generate them and pick the closest fit to the approved design doc.

**Step 4: Run the green phase**

Review the Stitch output against the checklist. It should now satisfy every required visual direction item.

Expected: PASS by visual inspection.

**Step 5: Commit**

Do not create a git commit yet unless explicitly requested by the user. Instead, record the selected Stitch screen ID and summarize why it matches the design.

---

### Task 2: Lock the Stitch-derived visual structure in a failing content contract

**Files:**
- Modify: `tests/landing-page-content.test.ts`
- Reference: selected Stitch screen from project `9956597525360242461`
- Reference: `src/app/page.tsx`

**Step 1: Write the failing test**

Extend `tests/landing-page-content.test.ts` with assertions for the key structural markers that will represent the approved Stitch design in code. Add tests for:

- technical systems hero framing
- control-plane product panel language
- system-style section labels / modular panel semantics
- activation workflow wording
- reduced marketing fluff / no AI-trope vocabulary

Example assertion direction:

```ts
test('landing page reflects the technical-systems design language', () => {
  const source = readFileSync('src/app/page.tsx', 'utf8')

  assert.match(source, /control plane/i)
  assert.match(source, /Workspace activation/i)
  assert.match(source, /Runtime core/i)
  assert.doesNotMatch(source, /AI gateway|future of AI|intelligent automation/i)
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: FAIL because the current landing page will not yet reflect the final Stitch-driven structure and wording exactly.

**Step 3: Write minimal implementation**

Only make the smallest source-level adjustments needed to bring `src/app/page.tsx` in line with the approved Stitch structure markers. Do not do full polish yet.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add tests/landing-page-content.test.ts src/app/page.tsx
git commit -m "test: lock stitch landing structure contract"
```

---

### Task 3: Rebuild the hero and top fold to match the approved Stitch screen

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Write the failing test**

Extend the content contract so it asserts the final top-fold implementation includes:

- concise product headline
- runtime-core subcopy
- primary CTA for signup
- secondary CTA for docs
- control-plane panel terminology matching the approved Stitch design

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: FAIL until the hero copy/layout is updated to match the Stitch-approved design language.

**Step 3: Write minimal implementation**

Update the hero in `src/app/page.tsx` to match the selected Stitch design as closely as practical in Tailwind/React. Keep the CTA behavior already fixed:

- `Get Started` / `Start setup` for anonymous users should still route to `/signup`
- dashboard links may remain visible but should not look like the primary conversion path

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing-page-content.test.ts
git commit -m "feat: align landing hero with stitch design"
```

---

### Task 4: Implement the modular system sections from the Stitch design

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Write the failing test**

Add or extend tests to assert the middle sections match the approved modular system narrative:

- how-it-works explanation blocks
- activation flow sequence
- trust/operational cards
- restrained pricing pointer block

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: FAIL until the middle sections reflect the approved Stitch composition.

**Step 3: Write minimal implementation**

Implement the section-level layout and copy updates in `src/app/page.tsx` to match the approved Stitch screen:

- consistent panel styling
- technical systems rhythm
- calmer spacing and hierarchy
- no decorative AI clichés

Do not touch unrelated pages.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing-page-content.test.ts
git commit -m "feat: implement stitch-inspired landing system sections"
```

---

### Task 5: Preserve auth and CTA behavior while applying the new visual design

**Files:**
- Modify: `src/app/page.tsx`
- Verify: `src/app/dashboard/page.tsx`
- Verify: `src/app/dashboard/providers/page.tsx`
- Verify: `src/app/login/page.tsx`
- Verify: `src/app/signup/page.tsx`
- Verify: `src/components/auth-form.tsx`
- Test: `tests/landing-page-content.test.ts`

**Step 1: Write the failing test**

Add or preserve tests that assert:

- anonymous landing CTAs go to `/signup`
- anonymous dashboard access redirects to `/login?returnTo=...`
- auth form still respects `returnTo ?? '/dashboard'`

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: FAIL if the new landing implementation accidentally regresses auth entry behavior.

**Step 3: Write minimal implementation**

Adjust only the landing page and related auth entry text/links as needed to preserve the already-fixed auth flow while the visual redesign lands.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/dashboard/page.tsx src/app/dashboard/providers/page.tsx src/app/login/page.tsx src/app/signup/page.tsx src/components/auth-form.tsx tests/landing-page-content.test.ts
git commit -m "fix: preserve auth entry flow in redesigned landing page"
```

---

### Task 6: Run final verification on the redesigned landing page slice

**Files:**
- Verify: `src/app/page.tsx`
- Verify: `src/app/dashboard/page.tsx`
- Verify: `src/app/dashboard/providers/page.tsx`
- Verify: `src/app/login/page.tsx`
- Verify: `src/app/signup/page.tsx`
- Verify: `src/components/auth-form.tsx`
- Verify: `tests/landing-page-content.test.ts`

**Step 1: Run the targeted test suite**

Run: `npm test -- tests/landing-page-content.test.ts`

Expected: PASS.

**Step 2: Run repo verification for the changed slice**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: PASS.

**Step 3: Restart and verify runtime behavior**

Run the built app locally and confirm:

- `/` loads the redesigned landing page
- primary anonymous CTA goes to `/signup`
- `/dashboard` redirects to `/login?returnTo=%2Fdashboard`
- `/dashboard/providers` redirects to `/login?returnTo=%2Fdashboard%2Fproviders`

Suggested commands:

```bash
npm start
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/dashboard
curl -I http://127.0.0.1:3000/dashboard/providers
```

Use browser verification when needed to confirm the CTA text and route behavior visually.

**Step 4: Compare against the design doc and Stitch output**

Confirm the implementation still matches:

- technical systems look and feel
- control-plane hero visual language
- modular mid-page panels
- non-generic-AI presentation
- clarity-first narrative structure

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/dashboard/page.tsx src/app/dashboard/providers/page.tsx src/app/login/page.tsx src/app/signup/page.tsx src/components/auth-form.tsx tests/landing-page-content.test.ts docs/plans/2026-04-18-landing-page-redesign-design.md docs/plans/2026-04-18-landing-page-stitch-implementation.md
git commit -m "feat: ship stitch-guided landing redesign"
```
