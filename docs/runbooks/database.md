# Database Runbook

## Production migration flow

1. Ensure `DATABASE_URL` points at the production PostgreSQL instance.
2. Run `npm run db:migrate:deploy` from the release artifact.
3. Confirm the application passes its `/api/ready` checks after deploy.

## Demo seed flow

- Demo/sample data is **opt-in only**.
- To seed a non-production environment, run `DEMO_SEED_ENABLED=true npm run db:seed`.
- Never run the demo seed against production.

## Backups

- Set `DATABASE_URL` and optionally `BACKUP_DIR`.
- Run `./scripts/db-backup.sh`.
- Store the resulting `.sql.gz` artifact in an encrypted backup destination.

## Restore procedure

1. Create or choose the target PostgreSQL database.
2. Set `DATABASE_URL` to the restore target.
3. Run `./scripts/db-restore.sh <backup-file.sql.gz>`.
4. Run `npm run db:migrate:deploy` to ensure the restored database is current.
5. Smoke-test the app before reopening traffic.

## Retention notes

- `UsageEvent(workspaceId, timestamp)` and `Request(workspaceId, createdAt)` are indexed for high-volume reads.
- Review retention/archival policy before large-scale production traffic; these tables will grow quickly.
