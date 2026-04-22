# Landing Page Redesign Design

**Status:** Approved design direction  
**Date:** 2026-04-18  
**Product:** Aiproxy  
**Scope:** Marketing landing page redesign for `src/app/page.tsx`

---

## 1. Design summary

The next marketing-site pass should focus on the **landing page**, not the authenticated product UI.

The goal is to make Aiproxy immediately understandable as a **SaaS control plane for CLIProxyAPIPlus**.

The current landing page contains strong raw material, but too many sections compete for attention at the same visual intensity:

- oversized hero
- code preview
- feature grid
- embedded pricing section
- testimonial/social proof section
- large CTA band
- footer with placeholder-style links

The result is a page that feels busy before it feels clear.

The recommended design direction is a **clarity-first product narrative** rendered through a **technical systems** visual style.

This design is intended to be executed in Stitch project `9956597525360242461`.

---

## 2. Design goals

This redesign should achieve the following:

- explain what Aiproxy is within the first screen
- make the relationship between Aiproxy and CLIProxyAPIPlus easy to understand
- align the marketing story with the activation-first product experience already present in the dashboard and onboarding flow
- reduce visual noise and eliminate sections that feel generic or placeholder-driven
- preserve the current dark brand foundation while improving hierarchy, pacing, and credibility

This is a product-clarity pass first, and a premium-polish pass second.

---

## 3. Recommended approach

The recommended approach is:

### Clarity-first product narrative in a technical systems visual language

This approach reorganizes the page into a calmer sequence that answers, in order:

1. what Aiproxy is
2. how it works
3. what users do first
4. why it is trustworthy
5. where to go next

This is the best fit because the main weakness of the current page is not missing information. It is weak hierarchy. The redesign should make the product model obvious before it tries to maximize conversion pressure.

The approved visual direction is **technical systems**, not generic AI SaaS marketing. That means the page should feel like serious product software:

- structured layouts
- modular panels
- tight grid discipline
- restrained color usage
- operational, product-led visuals instead of decorative AI tropes

---

## 4. UX structure changes

### 4.1 Hero becomes a clear positioning block

The hero should stop trying to do everything at once.

It should communicate three things immediately:

- Aiproxy is a SaaS control plane
- CLIProxyAPIPlus remains the runtime core
- users can activate a workspace by connecting providers, issuing tenant keys, and making runtime-backed calls

The recommended hero structure is a split layout:

- **left:** headline, subcopy, primary CTA, secondary CTA
- **right:** one controlled product panel showing activation or runtime visibility

The right-side visual should not be a decorative code block. It should look like real product state, such as workspace activation progress, runtime readiness, or operational visibility.

Desired copy behavior:

- headline is direct, not metaphor-heavy
- subcopy explains operational value in one concise paragraph
- primary CTA supports product entry
- secondary CTA supports evaluation through docs

### 4.2 Replace the generic feature grid with a product-model explanation

The current feature grid contains valid information, but it reads like a collection of benefits rather than a system users can understand.

It should be replaced or reframed into a **how Aiproxy works** section that explains:

- runtime core below
- control plane above
- onboarding, entitlements, tenant keys, and analytics as the value layer

This section should feel like an explanatory bridge between product positioning and user activation.

### 4.3 Introduce an activation workflow section

The landing page should borrow the strongest concept from the product UI: the activation funnel.

The recommended workflow section should show 3-4 steps:

1. connect provider
2. generate tenant key
3. make first successful request
4. observe usage and workspace state

This gives visitors an immediate picture of what adoption looks like and makes the landing page consistent with the dashboard/onboarding refresh already completed.

### 4.4 Move pricing out of the homepage spotlight

Pricing should no longer dominate the landing page as a full embedded pricing table.

Instead, the landing page should:

- reference simple plan availability
- point to the dedicated pricing page for details
- keep focus on understanding the product first

This reduces cognitive load and prevents the homepage from feeling like several pages merged together.

### 4.5 Replace fake-feeling social proof with product trust signals

The current testimonial section feels generic and risks reducing credibility.

It should be replaced with restrained trust content such as:

- runtime-backed onboarding
- tenant key controls
- entitlement enforcement
- operational visibility
- admin/backoffice support
- links to docs and pricing

If real customer proof is not available, the page should prefer concrete product trust signals over invented-sounding testimonials.

### 4.6 Simplify the footer and final CTA

The final CTA should present two intentional paths:

- **Start setup** for users ready to enter the product
- **Read docs** for users still evaluating

The footer should stop using placeholder-style links that imply sections the product may not actually support yet. It should contain only real navigational destinations that match the current product surface.

---

## 5. Visual direction

### 5.1 Approved visual style: technical systems

The landing page should feel like a modern control-plane product, not an “AI website.”

The approved style should emphasize:

- strong alignment and grid structure
- modular, system-like card groupings
- dark matte surfaces rather than glossy or neon-heavy presentation
- restrained blue/slate accents instead of bright cyan/purple AI gradients everywhere
- typography and spacing that feel precise, calm, and operational

This should read as **fresh because it is disciplined**, not because it uses attention-seeking AI visuals.

The page should explicitly avoid:

- glowing orb heroes
- abstract AI-wave backgrounds
- floating chatbot-style bubbles
- overly soft “future AI” gradients
- decorative code rain or sci-fi visual clichés

This redesign should preserve the current visual foundation:

- deep slate background
- blue/cyan brand accents
- subtle blur and glass treatments where useful

But it should improve page quality through:

- quieter section transitions
- stronger headline-to-body hierarchy
- more disciplined spacing
- fewer competing gradients and visual focal points
- clearer distinction between primary and secondary actions

The intended feel is:

> premium SaaS control plane with operational credibility, not a generic AI marketing page

The page should feel sharper and more premium, but only in service of clarity.

### 5.2 Hero art direction

The hero should be framed like a real product surface.

Recommended treatment:

- left side for direct product positioning and CTA
- right side for a large control-plane panel that looks like actual software state
- the panel should show activation, readiness, provider status, or workspace flow state
- the visual should feel system-oriented and credible, not illustrative

The right-side hero panel should look closer to:

- a control console
- a workspace activation surface
- a runtime readiness module

and not like:

- a decorative code mockup
- a fake analytics chart wall
- a generic “AI command center” fantasy visual

### 5.3 Section styling principles

Middle sections should feel like composable product modules.

Recommended patterns:

- explanation sections arranged in consistent cards or system blocks
- activation steps rendered as a setup sequence, not a marketing timeline
- trust signals presented as operational guarantees or product capabilities
- pricing shown as a structured pointer card, not a dominant pricing-table centerpiece

Each section should feel intentionally related to the others through:

- shared border treatment
- consistent panel rhythm
- repeated spacing logic
- limited accent usage

### 5.4 Stitch generation guidance

When generating the landing page in Stitch, the prompt should explicitly ask for:

- desktop-first landing page
- technical systems / control-plane software aesthetics
- fresh, premium, product-led design
- no stereotypical AI startup visuals
- no glowing chat bubbles, no abstract AI hero art, no neon overload
- modular, system-oriented UI blocks with clear hierarchy

Stitch output should optimize for product clarity first, while making the page feel sharper and more polished than the current implementation.

---

## 6. Content direction

The page should describe Aiproxy in terms that match the current product and architecture:

- Aiproxy is the control plane
- CLIProxyAPIPlus is the runtime core
- the primary journey is signup → workspace → provider connection → tenant key → first successful call

Content should avoid:

- vague “AI gateway” phrasing that obscures the control-plane model
- hype-heavy claims without concrete product meaning
- placeholder proof or fake links

The best content tone is confident, operational, and product-specific.

---

## 7. Scope boundaries

This redesign should include:

- `src/app/page.tsx`

This redesign may lightly coordinate with, but should not redesign in this pass:

- `src/app/pricing/page.tsx`
- `src/app/docs/page.tsx`

This redesign should not include:

- dashboard UI changes
- onboarding checklist changes
- provider management UI changes
- admin UI changes
- new backend behavior or new data models

The goal is a focused landing-page clarity pass, not a full marketing-site rewrite.

---

## 8. Testing and verification expectations

The landing page implementation should be verified through:

- route or content-level tests if the page structure is covered by existing test conventions
- lint and typecheck
- production build
- local smoke verification of the homepage

Verification should confirm that the new page:

- communicates the product model clearly
- removes placeholder-style content
- keeps CTA paths coherent with the rest of the site

---

## 9. Final recommendation

Proceed with a **landing page redesign** using the **clarity-first product narrative** approach in a **technical systems** visual style.

This gives Aiproxy the highest-value marketing improvement with the least strategic risk:

- clearer explanation of the control-plane model
- better alignment with the real activation flow
- more premium and credible presentation
- less homepage clutter and less placeholder feel
- a visual identity that feels like real software infrastructure rather than generic AI marketing
