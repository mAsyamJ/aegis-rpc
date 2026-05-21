#!/usr/bin/env bash
# Sync apps/web/.env.local keys to Vercel production. Never prints secret values.
set -euo pipefail

WEB_DIR="$(cd "$(dirname "$0")/../apps/web" && pwd)"
ENV_FILE="${WEB_DIR}/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: missing $ENV_FILE" >&2
  exit 1
fi

cd "$WEB_DIR"
SYNCED=()
FAILED=()

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line#"${line%%[![:space:]]*}"}}"
  line="${line%"${line##*[![:space:]]}"}}"
  [[ -z "$line" ]] && continue
  [[ "$line" =~ ^# ]] && continue
  [[ "$line" != *"="* ]] && continue

  key="${line%%=*}"
  key="${key#"${key%%[![:space:]]*}"}}"
  key="${key%"${key##*[![:space:]]}"}}"
  value="${line#*=}"
  value="${value#"${value%%[![:space:]]*}"}}"

  [[ -z "$key" || -z "$value" ]] && continue
  [[ ! "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] && continue

  if printf '%s' "$value" | vercel env add "$key" production --yes --force >/dev/null 2>&1 \
    || printf '%s' "$value" | vercel env add "$key" production --yes >/dev/null 2>&1; then
    SYNCED+=("$key")
  else
    FAILED+=("$key")
  fi
done < "$ENV_FILE"

echo "Synced ${#SYNCED[@]} keys to Vercel production:"
printf '  - %s\n' "${SYNCED[@]}"
if ((${#FAILED[@]} > 0)); then
  echo "Failed (${#FAILED[@]}):"
  printf '  - %s\n' "${FAILED[@]}"
fi
