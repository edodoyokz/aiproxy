# Aiproxy Core Realignment Design

**Status:** Validated design direction  
**Date:** 2026-04-17  
**Product:** Aiproxy  
**Primary goal:** Monetize `CLIProxyAPIPlus` as the core runtime by turning it into a SaaS product that is easy for end users to adopt and operate through a web control plane.

---

## 1. Design summary

Aiproxy must be treated as a **commercial SaaS control plane** built on top of `CLIProxyAPIPlus`, not as a replacement proxy engine.

The product promise is:

- end users do not need to install or manually operate `CLIProxyAPIPlus`
- end users can sign up, connect providers, generate an Aiproxy tenant key, and immediately use a working proxy endpoint
- the power of `CLIProxyAPIPlus` remains intact and becomes easier to consume, package, and monetize

This design deliberately re-centers the project around the original PRD intent. The existing Next.js application remains valuable, but only as the control plane, onboarding surface, analytics surface, and admin/backoffice layer.

---

## 2. Product decisions locked in

The following decisions were explicitly validated:

### 2.1 Core architecture

- `CLIProxyAPIPlus` remains the runtime core
- Aiproxy is the SaaS control plane layered above it
- the web application must not become the primary proxy engine

### 2.2 Runtime model

- runtime model: **hybrid pooled runtime**
- infrastructure model: **shared nodes, but one container/runtime per workspace**
- goal: preserve tenant isolation while keeping MVP infrastructure cost realistic

### 2.3 Provider scope

- MVP should expose **all providers already supported by `CLIProxyAPIPlus`**
- Aiproxy must inherit the breadth of the core rather than narrowing the product to a small subset of providers

### 2.4 Monetization model

- monetization model: **fixed subscription tiers**
- billing model for MVP: **entitlement-first**, not full live self-serve billing on day one
- paid activation can be manual or semi-manual through internal admin workflows at first

### 2.5 Admin and operations

- MVP includes **full internal admin/backoffice**, not just minimal support tooling
- backoffice is considered part of the business engine, not a later enhancement

### 2.6 Onboarding model

- first successful call requires **real provider connection first**
- no fake/demo success path should replace the real core product experience

### 2.7 Workspace/provider model

- workspaces can connect **multiple providers according to tier entitlement**
- the product should emphasize multi-provider capability because that is part of the core value proposition

---

## 3. Product shape

The intended product shape is:

> A user-facing SaaS control plane that provisions and manages isolated `CLIProxyAPIPlus` runtimes for customer workspaces, enforces product entitlements, and exposes a clean onboarding and operations experience.

The intended customer journey is:

1. user lands on Aiproxy
2. user signs up or logs in
3. user creates a workspace
4. workspace receives a plan/tier entitlement
5. Aiproxy provisions a workspace runtime based on `CLIProxyAPIPlus`
6. user connects one or more providers supported by the core
7. user generates an Aiproxy tenant API key
8. user copies endpoint + key
9. user performs first successful call
10. usage, health, and entitlement state become visible in the dashboard

This user journey is the activation funnel. If the implementation deviates from this sequence, it is drifting from the core product design.

---

## 4. Recommended system components

The MVP should be designed as a single product with multiple logical boundaries.

### 4.1 Web frontend

Responsibilities:

- landing page
- pricing page
- signup/login/session UX
- workspace onboarding
- provider connection UI
- API key UI
- analytics UI
- admin/backoffice UI

### 4.2 Control-plane API

Responsibilities:

- workspace lifecycle
- entitlement evaluation
- API key metadata and issuance orchestration
- analytics read models
- admin actions
- support workflows

### 4.3 Runtime provisioner / orchestrator

Responsibilities:

- create runtime/container per workspace
- suspend/resume/deprovision runtime
- update runtime config
- track runtime status and health

### 4.4 Provider connection orchestrator

Responsibilities:

- initiate provider connection flow
- coordinate provider auth material with runtime
- handle reconnect/disconnect
- expose actionable connection state to users and admins

### 4.5 Usage ingestor / sync layer

Responsibilities:

- collect usage and health information from runtime
- persist analytics data for dashboard and admin tooling
- support quota, rate limit, and plan observability

### 4.6 Internal backoffice

Responsibilities:

- search workspaces
- inspect tenant state
- modify entitlement manually
- suspend / unsuspend workspaces
- inspect provider/runtime state
- troubleshoot onboarding and support incidents

These boundaries may live in one repository initially, but the code must respect them architecturally.

---

## 5. Runtime model

The chosen runtime strategy is:

### Shared nodes + runtime/container per workspace

This means:

- customer workspaces do not share the same runtime process identity
- each workspace gets its own runtime/container boundary
- multiple runtimes can live on the same host/node pool
- infrastructure is pooled, but runtime isolation is preserved at the workspace level

### Why this is the correct compromise

- stronger tenant isolation than a single shared runtime cluster
- better alignment with provider auth separation and support workflows
- more faithful to the PRD than logical-only isolation
- still cheaper and faster to launch than dedicated infrastructure per tenant

### Operational implication

The control plane must be able to:

- map workspace -> runtime
- provision idempotently
- rehydrate and resume suspended runtimes
- expose runtime health to admin tooling
- differentiate user-visible product state from raw runtime state

---

## 6. Entitlement-first monetization design

The MVP monetization path should not block on full billing provider integration.

Instead, the product should introduce **real product entitlements first**:

- plan tier per workspace
- provider slot limits
- API key limits
- rate limit / quota rules
- retention and observability differences
- premium feature gates

### Practical MVP rule

- Free / Starter / Pro are real product states
- workspace behavior changes immediately according to entitlement
- admin can assign or change entitlement state manually during MVP
- later billing integration simply becomes the system that updates entitlement automatically

### Why this matters

This allows the team to validate:

- whether customers understand the packaging
- whether the value proposition is strong enough to pay for
- whether operators can run the business manually at low scale

without first building a full payment platform.

---

## 7. Full admin/backoffice scope

Backoffice is required in MVP, not optional.

The recommended admin scope is:

- workspace search and detail view
- plan / entitlement management
- runtime status and health visibility
- provider connection visibility
- suspend / unsuspend actions
- usage summary and quota view
- troubleshooting metadata for onboarding and support

This is necessary because entitlement-first monetization requires operators to handle real business state before billing automation exists.

---

## 8. MVP feature boundaries

### Must be in MVP

- landing page and pricing page
- auth and session management
- workspace creation
- plan assignment and entitlement enforcement
- runtime provisioning per workspace
- provider connection management using `CLIProxyAPIPlus` as core
- tenant API key management
- first successful call through Aiproxy endpoint backed by workspace runtime
- usage dashboard basics
- full internal admin/backoffice

### Can remain deferred after MVP

- live self-serve billing integration
- invoice history automation
- enterprise SSO/SCIM
- advanced permission matrix
- finance-heavy subscription lifecycle automation

The product should not ship a fake MVP where the dashboard exists but real provider-backed proxy onboarding is still absent.

---

## 9. Data model guidance

The design requires separating **business/control-plane entities** from **runtime-operational entities**.

### 9.1 Business/control-plane entities

- `users`
- `workspaces`
- `memberships`
- `plans`
- `workspace_entitlements`
- `tenant_api_keys`
- `workspace_billing_state` or later `subscriptions`
- `usage_events`
- `audit_logs`

### 9.2 Runtime-operational entities

- `proxy_runtimes`
- `provider_connections`
- `runtime_health_checks`
- `provisioning_jobs`
- `entitlement_change_events`

### Key rule

Even if live billing is deferred, **plans and entitlements must still be first-class now**. They must not remain implicit in hardcoded UI or simple enum checks.

---

## 10. Current repo drift to correct

The current repository contains useful control-plane work, but its active execution path has drifted.

### Drift pattern

- the active proxy flow currently behaves like a direct provider proxy inside the web app
- the runtime integration layer exists, but is still largely placeholder/mock oriented
- the app risks becoming a new proxy implementation rather than a commercial wrapper around `CLIProxyAPIPlus`

### What should be preserved

- auth/session and workspace scaffolding
- dashboard and admin surface work
- analytics and audit concepts
- deployment, health, and operational hardening

### What should be re-centered

- make runtime adapter the real production path
- demote direct provider calls from primary architecture to temporary fallback/dev-only behavior if kept at all
- wire onboarding, provider connection, key issuance, validation, and usage around workspace runtime lifecycle

---

## 11. Realignment strategy for this repository

Do **not** rewrite from scratch.

Instead, realign in this order:

### Phase A — Freeze product direction

- treat this design as the source of truth
- stop expanding direct-provider web-app proxy behavior as the main product path

### Phase B — Make `CLIProxyAPIPlus` integration real

- implement a real adapter for runtime provisioning and runtime operations
- route the primary product path through runtime integration instead of direct provider calls

### Phase C — Move behavior to entitlement-centric design

- plan state controls provider slots, API key count, quota, retention, and feature gates
- admin workflows can change entitlement manually

### Phase D — Complete the control plane around the core

- provider onboarding UI
- runtime health visibility
- full backoffice
- first-successful-call flow aligned to the real runtime path

This sequence minimizes waste and preserves the useful work already present in the repository.

---

## 12. Success criteria for realignment

The repository is considered aligned only when the following statements are true:

- the primary proxy path uses `CLIProxyAPIPlus` as the true runtime core
- a workspace runtime is provisioned and tracked by the control plane
- users connect providers through the SaaS onboarding flow rather than bypassing the core model
- tenant API keys represent access into workspace runtime, not just direct provider passthrough
- plan entitlement visibly changes product capability
- admin can operate the business manually through backoffice
- first successful call demonstrates the real product, not a shortcut path

---

## 13. Recommended next step

The next step after this design is **not implementation yet**.

The next step is to create a **repo realignment implementation plan** that:

- maps current files to target architecture
- identifies what to keep, replace, or demote
- sequences work into batches
- avoids rewriting already useful control-plane pieces

That implementation plan should be derived directly from this design and the original PRD.
