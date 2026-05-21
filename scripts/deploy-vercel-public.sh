#!/usr/bin/env bash
# Deploy public Aegis RPC to Vercel (apps/web). Requires: vercel CLI logged in, env vars in dashboard.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"

echo "=== Preflight: build + test ==="
(cd "$WEB" && npm run test && npm run build)

echo ""
echo "=== Vercel link (once) ==="
(cd "$WEB" && vercel link --yes 2>/dev/null || vercel link)

echo ""
echo "=== Required Vercel Production env (set in dashboard if missing) ==="
echo "  BASE_SEPOLIA_RPC_URL"
echo "  NEXT_PUBLIC_CHAIN_ID=84532"
echo "  NEXT_PUBLIC_REOWN_PROJECT_ID"
echo "  SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY"
echo "  NEXT_PUBLIC_AEGIS_RPC_URL=https://<your-domain>/api/rpc"
echo ""
echo "Supabase: run $ROOT/supabase/migrations/001_aegis_events.sql in SQL editor first."
echo ""

echo "=== Deploy production ==="
(cd "$WEB" && vercel --prod --yes)

echo ""
echo "After deploy, set NEXT_PUBLIC_AEGIS_RPC_URL to your production /api/rpc URL and redeploy if needed."
echo "Smoke: AEGIS_PROD_URL=https://<your-domain> $ROOT/tests/curl-production-smoke.sh"
