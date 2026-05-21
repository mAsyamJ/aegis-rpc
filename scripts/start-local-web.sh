#!/usr/bin/env bash
# Start Aegis web on :3020 (WSL + Windows localhost). Run from repo root or scripts/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KIT_SCRIPTS="$(cd "$ROOT/../scripts" && pwd)"
WEB="$ROOT/apps/web"
PORT=3020

cd "$WEB"
if [[ ! -f .next/BUILD_ID ]]; then
  echo "Building apps/web (first run)…"
  npm run build
fi

fuser -k "${PORT}/tcp" 2>/dev/null || true
sleep 1
nohup npm run start -- --port "$PORT" -H 0.0.0.0 >"$ROOT/.local-web.log" 2>&1 &
for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null || {
  echo "Server did not become healthy; see $ROOT/.local-web.log"
  exit 1
}

if [[ -x "$KIT_SCRIPTS/update-wsl-portproxy.sh" ]] && [[ -f /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe ]]; then
  "$KIT_SCRIPTS/update-wsl-portproxy.sh" || echo "Note: portproxy may need an elevated PowerShell approve (UAC)."
fi

WSL_IP="$(ip -4 addr show eth0 2>/dev/null | awk '/inet /{print $2}' | cut -d/ -f1 || true)"
echo ""
echo "Aegis web is up:"
echo "  http://127.0.0.1:${PORT}/demo/live"
echo "  http://127.0.0.1:${PORT}/dashboard"
[[ -n "$WSL_IP" ]] && echo "  http://${WSL_IP}:${PORT}/demo/live  (direct WSL IP from Windows)"
if command -v cmd.exe >/dev/null 2>&1; then
  /mnt/c/Windows/System32/cmd.exe /c "start http://127.0.0.1:${PORT}/demo/live" 2>/dev/null || true
fi
