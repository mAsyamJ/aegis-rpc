#!/usr/bin/env bash
# Backend verification: contracts + web build + unit tests
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== forge test ==="
(cd "$ROOT/contracts" && forge build -q && forge test -vv)

echo "=== sync abi-index (forge + Blockscout strict) ==="
node "$ROOT/scripts/sync-abi-index.mjs"

echo "=== npm install (apps/web) ==="
(cd "$ROOT/apps/web" && npm install)

echo "=== npm run build ==="
(cd "$ROOT/apps/web" && npm run build)

echo "=== vitest ==="
(cd "$ROOT/apps/web" && npm run test)

echo "OK: verify-backend finished"
echo "Optional: AEGIS_BASE_URL=http://127.0.0.1:3020 $ROOT/tests/curl-demo.sh (dev server required)"
echo "Optional: AEGIS_BASE_URL=http://127.0.0.1:3020 $ROOT/tests/curl-live-three-tx.sh (SAFE/WARN/BLOCK on DemoERC20 + DeFi app)"
echo "Optional: AEGIS_PROD_URL=https://<vercel-app> $ROOT/tests/curl-production-smoke.sh (after Vercel deploy)"
echo "Optional: AEGIS_BASE_URL=http://127.0.0.1:3020 $ROOT/tests/curl-innovation.sh"
echo "Optional: AEGIS_BASE_URL=http://127.0.0.1:3020 $ROOT/tests/curl-abi-index.sh"
echo "Supabase: run $ROOT/supabase/migrations/001_aegis_events.sql then $ROOT/scripts/check-supabase-ready.sh"
