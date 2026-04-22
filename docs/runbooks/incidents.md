# Incident Runbook

## Triage

1. Check `/api/health` for process availability.
2. Check `/api/ready` for database, session secret, runtime integration, and workspace runtime readiness.
3. Review structured logs for `requestId`, route, result class, workspaceId, runtimeId, provider context, and runtime operations.

## Common failure domains

- Database unreachable
- Runtime provisioning failures or runtime integration misconfiguration
- Provider onboarding failures between the control plane and workspace runtime
- Workspace runtime suspend or resume failures
- Missing session or runtime integration secrets after deploy
- Upstream provider rate limiting or auth failures after the request reaches the runtime
- Proxy latency spikes

## Escalation

- Capture request IDs from affected responses.
- Capture workspace IDs, runtime IDs, and the last known runtime suspend/resume operation.
- Preserve recent deploy metadata and backup references.
- If needed, follow `rollback.md`.
