#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"

if [[ $# -ne 1 ]]; then
  printf 'Usage: %s <backup-file.sql.gz>\n' "$0" >&2
  exit 1
fi

input_file="$1"

if [[ ! -f "$input_file" ]]; then
  printf 'Backup file not found: %s\n' "$input_file" >&2
  exit 1
fi

gunzip -c "$input_file" | psql "$DATABASE_URL"

printf 'Restore completed from %s\n' "$input_file"
