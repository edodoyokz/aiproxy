# Aiproxy Runtime Boundaries

## Purpose

This document defines the architectural boundaries for the Aiproxy MVP after re-centering the product on `CLIProxyAPIPlus` as the runtime core.

## Boundary 1: Web frontend

Responsibilities:

- landing and pricing pages
- signup/login/session UX
- workspace onboarding
- provider connection UI
- API key UI
- analytics UI
- admin/backoffice UI

Non-responsibilities:

- it is not the primary proxy engine
- it must not become the direct provider runtime path by default

## Boundary 2: Control-plane API

Responsibilities:

- workspace lifecycle
- entitlement evaluation
- tenant API key metadata and orchestration
- analytics read models
- admin workflows
- support workflows

## Boundary 3: Runtime provisioner and runtime integration

Responsibilities:

- provision one runtime/container per workspace on shared nodes
- map workspace to runtime
- connect and manage provider state through `CLIProxyAPIPlus`
- issue and revoke runtime-backed tenant keys
- expose runtime health and lifecycle state

## Boundary 4: Usage and observability layer

Responsibilities:

- ingest usage events from runtime paths
- expose quota, usage, and provider/runtime health state to dashboard and admin surfaces
- support entitlement and support operations with structured data

## Boundary 5: Admin/backoffice

Responsibilities:

- search workspaces
- inspect runtime, provider, and entitlement state
- change entitlement manually
- suspend or resume workspaces
- support onboarding and first-successful-call troubleshooting

## Primary product identity

Aiproxy is the SaaS control plane.

`CLIProxyAPIPlus` is the runtime core.

If a code path, document, or screen makes the web app appear to be the standalone proxy engine, that is architecture drift and should be corrected.
