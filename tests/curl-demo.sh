#!/usr/bin/env bash
# Demo curl scenarios — requires dev server: cd apps/web && npm run dev
set -euo pipefail

BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3000}"

echo "=== 1. RPC passthrough eth_blockNumber ==="
curl -sf -X POST "$BASE/api/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' | head -c 200
echo ""

echo "=== 2. RPC intercept eth_sendRawTransaction (-32090) ==="
INTERCEPT=$(curl -s -X POST "$BASE/api/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_sendRawTransaction","params":["0x00"]}')
echo "$INTERCEPT" | head -c 300
echo "$INTERCEPT" | grep -q '"code":-32090' || { echo "FAIL: expected -32090"; exit 1; }
echo ""

echo "=== 3. Agent preflight BLOCK over cap ==="
AGENT_BLOCK=$(curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": 84532,
    "from": "0xA9e15A7d2c0B7F0EaF94c2De27B5C7e1aaF50001",
    "to": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "valueWei": "0",
    "data": "0xa9059cbb000000000000000000000000ae61b5c3b6e9210aa12345678aef0c11b0a0ab00000000000000000000000000000000000000000000000000000000011e1a3000",
    "policyId": "default-agent-policy"
  }')
echo "$AGENT_BLOCK" | head -c 400
echo "$AGENT_BLOCK" | grep -q 'AGENT_TX_CAP_EXCEEDED' || { echo "FAIL: expected AGENT_TX_CAP_EXCEEDED"; exit 1; }
echo ""

echo "=== 4. Wallet preflight BLOCK unlimited approve ==="
WALLET_BLOCK=$(curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": 84532,
    "from": "0x1234567890aBCdef1234567890abcDEf12345678",
    "to": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "valueWei": "0",
    "data": "0x095ea7b3000000000000000000000000deadbee5deadbeefdeadbeefdeadbeefdeadbeefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "policyId": "default-wallet-policy"
  }')
echo "$WALLET_BLOCK" | head -c 400
echo "$WALLET_BLOCK" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || { echo "FAIL: expected BLOCK approve"; exit 1; }
echo ""

echo "=== 5. GET policies + onChainPolicyHash on preflight ==="
curl -sf "$BASE/api/policies" | head -c 200
echo ""
REQ_ID=$(echo "$WALLET_BLOCK" | grep -o '"requestId":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$REQ_ID" ]; then
  curl -sf "$BASE/api/ai-analyze?requestId=$REQ_ID" | head -c 300
  echo ""
fi

echo "=== 6. Events timeline ==="
curl -sf "$BASE/api/events?limit=5" | head -c 300
echo ""

echo "=== 7. Chainlink adapter health ==="
curl -sf "$BASE/api/adapters/chainlink" | head -c 200
echo ""

echo "OK: 5-scenario curl demo finished"
