#!/usr/bin/env bash
# Wave 2 smoke: multicall-wrapped approve BLOCK, treasury policy id
set -euo pipefail

BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3020}"
PF="$BASE/api/preflight"

# Unlimited approve calldata (matches curl-demo.sh)
APPROVE_DATA="0x095ea7b3000000000000000000000000deadbee5deadbeefdeadbeefdeadbeefdeadbeefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

echo "=== direct unlimited approve → BLOCK ==="
RESP=$(curl -sf -X POST "$PF" -H 'Content-Type: application/json' -d "{
  \"chainId\": 84532,
  \"from\": \"0x1234567890abcdef1234567890abcdef12345678\",
  \"to\": \"0x036cbd53842c5426634e7929541ec2318f3dcf7e\",
  \"data\": \"$APPROVE_DATA\",
  \"policyId\": \"default-wallet-policy\"
}")
echo "$RESP" | head -c 400
echo "$RESP" | grep -q '"verdict":"BLOCK"' || { echo "FAIL: expected BLOCK"; exit 1; }
echo "$RESP" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || { echo "FAIL: expected reason code"; exit 1; }
echo "OK: approve blocked"

echo "=== treasury policy preflight (schema) ==="
TREASURY=$(curl -sf -X POST "$PF" -H 'Content-Type: application/json' -d '{
  "chainId": 84532,
  "from": "0x1111111111111111111111111111111111111111",
  "to": "0x3333333333333333333333333333333333333333",
  "data": "0x",
  "policyId": "default-treasury-policy"
}')
echo "$TREASURY" | head -c 200
echo "$TREASURY" | grep -q '"verdict"' || { echo "FAIL: treasury preflight missing verdict"; exit 1; }
echo "OK: treasury policy preflight"

echo "=== defender webhook (optional secret) ==="
curl -sf -X POST "$BASE/api/webhooks/defender" -H 'Content-Type: application/json' -d '{
  "eventName": "SuspiciousApproval",
  "severity": "HIGH",
  "description": "wave2 smoke"
}' | grep -q '"verdict":"WARN"' && echo "OK: defender WARN audit"

echo "OK: curl-wave2 finished"
