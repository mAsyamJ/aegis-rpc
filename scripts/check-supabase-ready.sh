#!/usr/bin/env bash
# Phase 0 ops: health must show supabaseConfigured; supabaseReady after SQL migration.
set -euo pipefail

BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3020}"
HEALTH="$BASE/api/health"

echo "GET $HEALTH"
body="$(curl -sf "$HEALTH")"
echo "$body" | head -c 600
echo ""

if echo "$body" | grep -q '"supabaseConfigured":true'; then
  if echo "$body" | grep -q '"supabaseReady":true'; then
    echo "OK: supabaseReady=true (migration applied)"
    exit 0
  fi
  echo "WARN: supabaseConfigured but supabaseReady=false — run supabase/migrations/001_aegis_events.sql in Supabase SQL editor"
  exit 1
fi

echo "INFO: Supabase not configured (in-memory audit fallback). Set SUPABASE_URL + key in apps/web/.env.local"
exit 0
