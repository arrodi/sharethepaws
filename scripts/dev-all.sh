#!/usr/bin/env bash
set -euo pipefail

(cd apps/server && npm run start) &
SERVER_PID=$!

sleep 1
(cd apps/mobile && npm run start) &
MOBILE_PID=$!

trap 'kill ${SERVER_PID} ${MOBILE_PID} 2>/dev/null || true' EXIT
wait
