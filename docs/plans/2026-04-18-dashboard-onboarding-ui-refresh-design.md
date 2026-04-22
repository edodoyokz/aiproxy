# Dashboard and Onboarding UI Refresh Design

**Status:** Approved design direction  
**Date:** 2026-04-18  
**Product:** Aiproxy  
**Scope:** Dashboard, onboarding checklist, and provider activation flow UI

---

## 1. Design summary

The next UI pass should focus on the **dashboard and onboarding flow**, not the marketing site.

The goal is to make Aiproxy feel like a real SaaS control plane by making the product experience center on the workspace activation funnel:

1. runtime exists
2. provider connected
3. tenant key issued
4. first successful runtime-backed call completed

The current UI is functional, but it still reads like an engineer-first MVP. It shows useful information, but it does not yet guide users through activation with enough visual clarity or product confidence.

The recommended design direction is an **activation-first SaaS console**.

---

## 2. Design goals

This refresh should achieve the following:

- make the dashboard immediately communicate what the user should do next
- make onboarding progress feel like the primary product workflow, not a secondary widget
- make provider connection and activation states feel trustworthy and premium
- keep the existing dark visual language and blue/cyan accents
- avoid a broad redesign of the entire application

This is a product-clarity pass first, and a visual-polish pass second.

---

## 3. Recommended approach

The recommended approach is:

### Activation-first SaaS console

This approach keeps the current visual foundation but reorganizes the dashboard so the user sees:

- current workspace activation state
- next required action
- progress through activation
- usage and analytics only after the activation state is understood

This is the best fit because it improves conversion and user understanding without forcing a costly full-system redesign.

---

## 4. UX structure changes

### 4.1 Dashboard header becomes an activation panel

The dashboard should no longer open with a generic heading plus metrics.

Instead, the top area should become a **workspace activation panel** that answers:

- is the workspace activated yet?
- what step is blocking activation?
- what action should the user take now?

This panel should support states such as:

- runtime ready, provider missing
- provider connected, tenant key missing
- tenant key ready, first call pending
- activation complete

The panel should include:

- a clear headline
- one supporting sentence
- a single primary CTA
- optional secondary guidance

### 4.2 Onboarding checklist becomes a stronger product module

The checklist should look less like a generic collapsible card and more like a purposeful activation module.

Desired behavior:

- clearer visual distinction between pending, active, and completed states
- stronger hierarchy for the current step
- more polished progress display
- more explicit CTA treatment per step
- more premium empty/complete states

The checklist should remain compact enough to sit naturally on the dashboard, but visually important enough that users cannot miss it.

### 4.3 Usage overview becomes secondary until activation is complete

If the user is not fully activated, the product should still show analytics, but they should not dominate the page.

Desired behavior:

- activation module first
- onboarding module second
- analytics overview third

Once activation is complete, the experience can feel more like an operational dashboard.

### 4.4 Provider page becomes more action-oriented

The provider page should no longer feel like a plain list of available and connected providers.

It should be structured around activation progress:

- what the user can connect
- what is already connected
- what connecting a provider unlocks next

The page should provide:

- stronger empty states
- cleaner provider cards
- clearer relationship between provider connection and activation
- a more polished status presentation for connected providers

---

## 5. Visual direction

This refresh should preserve the current brand foundation:

- dark slate surfaces
- blue/cyan accent gradients
- subtle glass/backdrop blur treatment

But it should improve the UI quality through:

- tighter hierarchy
- more consistent spacing
- more intentional card composition
- stronger contrast between primary and secondary actions
- better state visualization

The intended visual feel is:

> premium SaaS control plane, not developer demo dashboard

The UI should feel more credible and productized, but not flashy for its own sake.

---

## 6. Scope boundaries

This UI refresh should include:

- `src/app/dashboard/page.tsx`
- `src/components/onboarding-checklist.tsx`
- `src/app/dashboard/providers/page.tsx`

This UI refresh should not include, in this pass:

- landing page redesign
- pricing page redesign
- admin UI redesign
- large component library migration
- new data model behavior

The goal is focused improvement around activation and onboarding clarity.

---

## 7. Testing and verification expectations

The UI pass should be verified through:

- route/component contract tests for expected structure or copy if appropriate
- lint and typecheck
- production build
- local visual smoke verification on the dashboard and provider pages

The implementation should preserve existing activation semantics while improving presentation and hierarchy.

---

## 8. Final recommendation

Proceed with a **dashboard + onboarding refresh** using the **activation-first SaaS console** approach.

This gives Aiproxy the highest-value UI improvement for the least product risk:

- stronger first-use experience
- clearer activation funnel
- more premium control-plane feel
- minimal architecture disruption
