#!/usr/bin/env bash
set -euo pipefail

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Waiting for app to start..."
sleep 10

echo "==> Verifying health..."
curl -sf http://localhost:3000/api/health && echo " ✓ Health OK" || echo " ✗ Health check failed"

echo "==> Deployment complete."
echo "    View logs: docker compose -f docker-compose.prod.yml logs -f"
