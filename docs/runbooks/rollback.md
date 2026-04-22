# Rollback Runbook

1. Stop routing new traffic to the current release.
2. Restore the previous application artifact or image tag.
3. If the release included a bad migration, restore the latest verified backup before re-enabling traffic.
4. Re-run `/api/health` and `/api/ready` checks.
5. Execute the smoke test flow before declaring rollback complete.
