#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"

backup_dir="${BACKUP_DIR:-./backups}"
mkdir -p "$backup_dir"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output_file="$backup_dir/aiproxy-$timestamp.sql.gz"

pg_dump "$DATABASE_URL" | gzip > "$output_file"

printf 'Backup created: %s\n' "$output_file"
