#!/usr/bin/env bash
set -euo pipefail

npm ci
npx prisma generate
npm run lint
npm run typecheck
npm test
npm run build
docker compose -f docker-compose.prod.yml up -d --build
