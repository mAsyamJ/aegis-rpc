#!/usr/bin/env bash
# Demo curl scenarios — requires dev server: cd apps/web && npm run dev
set -euo pipefail

BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3000}"

echo "=== 1. RPC passthrough eth_blockNumber ==="
curl -sf -X POST "$BASE/api/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' | head -c 200
echo ""

echo "=== 2. RPC passthrough eth_chainId ==="
curl -sf -X POST "$BASE/api/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' | head -c 200
echo ""

echo "=== 3. Preflight BLOCK unlimited approve unknown spender ==="
# approve(spender=0x03..., MaxUint256)
curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": 84532,
    "from": "0x0000000000000000000000000000000000000001",
    "to": "0x0000000000000000000000000000000000000002",
    "valueWei": "0",
    "data": "0x095ea7b30000000000000000000000000000000000000000000000000000000000000003ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "policyId": "default-wallet-policy"
  }' | head -c 400
echo ""

echo "=== 4. Preflight SAFE small native transfer ==="
curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": 84532,
    "from": "0x0000000000000000000000000000000000000001",
    "to": "0x0000000000000000000000000000000000000003",
    "valueWei": "1000000000000000",
    "data": "0x",
    "policyId": "default-wallet-policy"
  }' | head -c 400
echo ""

echo "=== 5. Events timeline ==="
curl -sf "$BASE/api/events?limit=5" | head -c 300
echo ""

echo "=== 6. Chainlink adapter health ==="
curl -sf "$BASE/api/adapters/chainlink" | head -c 200
echo ""

echo "OK: demo curl script finished"
