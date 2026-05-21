#!/usr/bin/env bash
# Demo curl scenarios — requires dev server: cd apps/web && npm run dev
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
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
echo "$INTERCEPT" | grep -q 'REQUIRES_PREFLIGHT' || { echo "FAIL: expected REQUIRES_PREFLIGHT in intercept data"; exit 1; }
echo ""

echo "=== 2a. RPC intercept eth_sendTransaction (-32090) ==="
INTERCEPT_TX=$(curl -s -X POST "$BASE/api/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"eth_sendTransaction","params":[{"from":"0x0000000000000000000000000000000000000001","to":"0x0000000000000000000000000000000000000002","value":"0x0"}]}')
echo "$INTERCEPT_TX" | head -c 300
echo "$INTERCEPT_TX" | grep -q '"code":-32090' || { echo "FAIL: eth_sendTransaction expected -32090"; exit 1; }
echo "$INTERCEPT_TX" | grep -q 'REQUIRES_PREFLIGHT' || { echo "FAIL: eth_sendTransaction expected REQUIRES_PREFLIGHT"; exit 1; }
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

echo "=== 4. Wallet preflight BLOCK unlimited approve (DemoERC20) ==="
LIVE_PAYLOAD=$(node "$ROOT/scripts/print-live-calldata.mjs")
WALLET_BLOCK=$(node -e "
const base = process.argv[1];
const p = JSON.parse(process.argv[2]);
const body = {
  chainId: p.chainId,
  from: p.from,
  to: p.block.to,
  valueWei: '0',
  data: p.block.data,
  policyId: p.block.policyId,
};
const r = await fetch(base + '/api/preflight', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
if (!r.ok) process.exit(1);
process.stdout.write(await r.text());
" "$BASE" "$LIVE_PAYLOAD")
echo "$WALLET_BLOCK" | head -c 400
echo "$WALLET_BLOCK" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || { echo "FAIL: expected BLOCK approve"; exit 1; }
echo ""

echo "=== 4b. Preflight via viem parseTransaction (serialized unsigned EIP-1559) ==="
SERIAL_BLOCK=$(curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d '{
    "serializedTransaction": "0x02f87083014a3480843b9aca00843b9aca00830186a094036cbd53842c5426634e7929541ec2318f3dcf7e80b844095ea7b3000000000000000000000000deadbee5deadbeefdeadbeefdeadbeefdeadbeefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0",
    "from": "0x1234567890aBCdef1234567890abcDEf12345678",
    "policyId": "default-wallet-policy"
  }')
echo "$SERIAL_BLOCK" | head -c 400
echo "$SERIAL_BLOCK" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || { echo "FAIL: serialized tx expected same BLOCK as explicit calldata"; exit 1; }
echo ""

echo "=== 4c. aegis_preflight via JSON-RPC /api/rpc (DemoERC20) ==="
RPC_PREFLIGHT=$(node -e "
const base = process.argv[1];
const p = JSON.parse(process.argv[2]);
const r = await fetch(base + '/api/rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 99,
    method: 'aegis_preflight',
    params: [{
      chainId: p.chainId,
      from: p.from,
      to: p.block.to,
      valueWei: '0',
      data: p.block.data,
      policyId: p.block.policyId,
    }],
  }),
});
if (!r.ok) process.exit(1);
process.stdout.write(await r.text());
" "$BASE" "$LIVE_PAYLOAD")
echo "$RPC_PREFLIGHT" | head -c 400
echo "$RPC_PREFLIGHT" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || { echo "FAIL: aegis_preflight RPC expected BLOCK reason"; exit 1; }
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

echo "=== 6b. aegis_sendTransaction blocked for BLOCK verdict ==="
RPC_SEND_BLOCK=$(curl -s -X POST "$BASE/api/rpc" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":100,\"method\":\"aegis_sendTransaction\",\"params\":[{\"requestId\":\"$REQ_ID\"}]}")
echo "$RPC_SEND_BLOCK" | head -c 300
if [ -n "$REQ_ID" ]; then
  echo "$RPC_SEND_BLOCK" | grep -q '"code":-32090' || { echo "FAIL: aegis_sendTransaction expected -32090 for BLOCK"; exit 1; }
fi
echo ""

echo "=== 7. Chainlink adapter health ==="
curl -sf "$BASE/api/adapters/chainlink" | head -c 200
echo ""

echo "OK: curl demo finished"
