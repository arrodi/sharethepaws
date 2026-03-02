#!/usr/bin/env bash
set -euo pipefail

if [ ! -f apps/server/.env ]; then
  cp apps/server/.env.example apps/server/.env
fi
if [ ! -f apps/mobile/.env ]; then
  cp apps/mobile/.env.example apps/mobile/.env
fi

echo "Starting API server..."
(cd apps/server && npm run start) &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT

for _ in {1..20}; do
  if curl -sf http://localhost:4000/health >/dev/null; then
    echo "API is healthy on :4000"
    break
  fi
  sleep 1
done

curl -sf http://localhost:4000/health | cat
echo "\nRun mobile with: cd apps/mobile && npm run start"
wait ${SERVER_PID}
