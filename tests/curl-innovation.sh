#!/usr/bin/env bash
# OpenSrc innovation smoke: batch RPC, cache header, UserOp intercept, aegis_preflightUserOp
set -euo pipefail

BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3020}"
RPC="$BASE/api/rpc"
HEALTH="$BASE/api/health"

echo "=== health (metrics + flags) ==="
curl -sf "$HEALTH" | head -c 500
echo ""

echo "=== batch JSON-RPC ==="
curl -sf -X POST "$RPC" -H 'Content-Type: application/json' -d '[
  {"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]},
  {"jsonrpc":"2.0","id":2,"method":"eth_sendRawTransaction","params":["0x02"]}
]' | head -c 800
echo ""

echo "=== eth_sendUserOperation intercept (-32090) ==="
curl -sf -X POST "$RPC" -H 'Content-Type: application/json' -d '{
  "jsonrpc":"2.0","id":3,
  "method":"eth_sendUserOperation",
  "params":[{"sender":"0x1234567890123456789012345678901234567890","nonce":"0x0","callData":"0x","callGasLimit":"0x1","verificationGasLimit":"0x1","preVerificationGas":"0x1","maxFeePerGas":"0x1","maxPriorityFeePerGas":"0x1"},"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"]
}' | grep -q REQUIRES_PREFLIGHT && echo "OK: UserOp gated"

echo "=== aegis_preflightUserOp (schema) ==="
curl -sf -X POST "$RPC" -H 'Content-Type: application/json' -d '{
  "jsonrpc":"2.0","id":4,
  "method":"aegis_preflightUserOp",
  "params":[{"chainId":84532,"userOperation":{"sender":"0x1234567890123456789012345678901234567890","nonce":"0x0","callData":"0x","callGasLimit":"0x5208","verificationGasLimit":"0x5208","preVerificationGas":"0x5208","maxFeePerGas":"0x1","maxPriorityFeePerGas":"0x1"}}]
}' | head -c 400
echo ""

if [[ -n "${AEGIS_RPC_CACHE_TTL_MS:-}" ]]; then
  echo "=== RPC cache header (optional AEGIS_RPC_CACHE_TTL_MS) ==="
  curl -sD - -o /dev/null -X POST "$RPC" -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","id":5,"method":"eth_chainId","params":[]}' | grep -i x-aegis-cache || true
fi

echo "OK: curl-innovation finished"
