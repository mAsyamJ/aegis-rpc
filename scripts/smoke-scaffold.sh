#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB="$ROOT/apps/web"

echo "=== Aegis RPC scaffold smoke ==="
test -f "$ROOT/HACKATHON.md"
test -f "$ROOT/AGENTS.md"
test -f "$WEB/package.json"

cd "$WEB"
npm run build
echo "OK: scaffold build passed"
