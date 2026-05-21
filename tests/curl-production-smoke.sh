#!/usr/bin/env bash
# Production smoke — health + live 3-tx on deployed Vercel URL.
# Usage: AEGIS_PROD_URL=https://your-app.vercel.app ./tests/curl-production-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROD="${AEGIS_PROD_URL:-${AEGIS_BASE_URL:-}}"

if [ -z "$PROD" ]; then
  echo "FAIL: set AEGIS_PROD_URL or AEGIS_BASE_URL to your production origin (no trailing slash)"
  exit 1
fi

PROD="${PROD%/}"
export AEGIS_BASE_URL="$PROD"

echo "=== Production health: $PROD ==="
HEALTH=$(curl -sf "$PROD/api/health")
echo "$HEALTH" | head -c 400
echo ""
echo "$HEALTH" | grep -q '"ok":true' || { echo "FAIL: health ok"; exit 1; }
echo "$HEALTH" | grep -q '"rpcEnvSet":true' || { echo "FAIL: BASE_SEPOLIA_RPC_URL not set on Vercel"; exit 1; }

echo ""
echo "=== CORS preflight on /api/rpc ==="
CORS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$PROD/api/rpc" \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST")
echo "OPTIONS status: $CORS"
[ "$CORS" = "204" ] || [ "$CORS" = "200" ] || { echo "FAIL: expected OPTIONS 204/200"; exit 1; }

echo ""
bash "$ROOT/tests/curl-live-three-tx.sh"

echo ""
echo "OK: curl-production-smoke finished for $PROD"
