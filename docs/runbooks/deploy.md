# Deploy Runbook

## First deploy

1. Provision Supabase Postgres and copy the pooled PostgreSQL `DATABASE_URL` into `deploy/.env.production` on the VPS.
2. Set `SESSION_SECRET`, `APP_URL`, `RUNTIME_MODE`, `CLIPROXYAPIPLUS_API_URL`, and `CLIPROXYAPIPLUS_API_KEY` in `deploy/.env.production`.
3. Run local verification before deploy: `npm run lint && npm run typecheck && npm test && npm run build`.
4. Apply migrations with `npm run db:migrate:deploy` using the Supabase-backed `DATABASE_URL`.
5. Start the application stack and verify `/api/health` returns `200 OK` with control-plane, database, and runtime integration status.
6. Verify `/api/ready` returns `200 OK` and confirms workspace runtime readiness before opening traffic.
7. Confirm runtime provisioning succeeds for a test workspace and that provider onboarding reaches the runtime layer.

## Post-deploy checks

- Confirm the app responds through the reverse proxy.
- Confirm uptime probing is pointed at `/api/health`.
- Confirm `deploy/.env.production` on the VPS matches the intended Supabase and runtime-backed production config.
- Confirm runtime provisioning and provider onboarding events are visible in structured logs.
- Confirm a workspace runtime can be suspended and resumed through admin controls if needed.
- Run the smoke-test checklist in `docs/runbooks/smoke-test.md`.
