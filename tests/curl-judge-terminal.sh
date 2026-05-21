#!/usr/bin/env bash
# Judge terminal tour — full Aegis API smoke (production-safe; no ai-analyze poll).
# Usage: AEGIS_BASE_URL=https://web-gamma-bay-96.vercel.app ./tests/curl-judge-terminal.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${AEGIS_BASE_URL:-https://web-gamma-bay-96.vercel.app}"
BASE="${BASE%/}"
RPC="$BASE/api/rpc"
PF="$BASE/api/preflight"

echo "=== 1. Health ==="
HEALTH=$(curl -sf "$BASE/api/health")
echo "$HEALTH" | head -c 400
echo ""
echo "$HEALTH" | grep -q '"ok":true' || { echo "FAIL: health ok"; exit 1; }
echo "$HEALTH" | grep -q '"rpcEnvSet":true' || { echo "FAIL: rpcEnvSet"; exit 1; }

echo ""
echo "=== 2. CORS OPTIONS /api/rpc ==="
CORS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$RPC" \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST")
echo "OPTIONS status: $CORS"
[ "$CORS" = "204" ] || [ "$CORS" = "200" ] || { echo "FAIL: expected OPTIONS 204/200"; exit 1; }

echo ""
echo "=== 3. RPC passthrough (read) ==="
curl -sf -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' | head -c 120
echo ""
curl -sf -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"eth_chainId","params":[]}' | head -c 120
echo ""
curl -sf -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"eth_getBalance","params":["0x1234567890123456789012345678901234567890","latest"]}' | head -c 120
echo ""

echo "=== 4. RPC intercept (-32090 REQUIRES_PREFLIGHT) ==="
INTERCEPT_RAW=$(curl -s -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"eth_sendRawTransaction","params":["0x00"]}')
echo "$INTERCEPT_RAW" | head -c 280
echo ""
echo "$INTERCEPT_RAW" | grep -q '"code":-32090' || { echo "FAIL: eth_sendRawTransaction -32090"; exit 1; }
echo "$INTERCEPT_RAW" | grep -q 'REQUIRES_PREFLIGHT' || { echo "FAIL: REQUIRES_PREFLIGHT"; exit 1; }

INTERCEPT_TX=$(curl -s -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":5,"method":"eth_sendTransaction","params":[{"from":"0x0000000000000000000000000000000000000001","to":"0x0000000000000000000000000000000000000002","value":"0x0"}]}')
echo "$INTERCEPT_TX" | head -c 280
echo ""
echo "$INTERCEPT_TX" | grep -q '"code":-32090' || { echo "FAIL: eth_sendTransaction -32090"; exit 1; }

INTERCEPT_UO=$(curl -s -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":6,"method":"eth_sendUserOperation","params":[{"sender":"0x1234567890123456789012345678901234567890","nonce":"0x0","callData":"0x","callGasLimit":"0x1","verificationGasLimit":"0x1","preVerificationGas":"0x1","maxFeePerGas":"0x1","maxPriorityFeePerGas":"0x1"},"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"]}')
echo "$INTERCEPT_UO" | head -c 280
echo ""
echo "$INTERCEPT_UO" | grep -q 'REQUIRES_PREFLIGHT' || { echo "FAIL: eth_sendUserOperation gate"; exit 1; }

echo ""
echo "=== 5. Batch JSON-RPC ==="
curl -sf -X POST "$RPC" -H "Content-Type: application/json" -d '[
  {"jsonrpc":"2.0","id":7,"method":"eth_blockNumber","params":[]},
  {"jsonrpc":"2.0","id":8,"method":"eth_sendRawTransaction","params":["0x02"]}
]' | head -c 500
echo ""

LIVE_PAYLOAD=$(node "$ROOT/scripts/print-live-calldata.mjs")
export BASE LIVE_PAYLOAD

echo ""
echo "=== 6. aegis_preflight via JSON-RPC (BLOCK approve) ==="
RPC_PF=$(node <<'NODE'
const base = process.env.BASE;
const p = JSON.parse(process.env.LIVE_PAYLOAD);
(async () => {
  const r = await fetch(`${base}/api/rpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 9,
      method: "aegis_preflight",
      params: [{
        chainId: p.chainId,
        from: p.from,
        to: p.block.to,
        valueWei: "0",
        data: p.block.data,
        policyId: p.block.policyId,
      }],
    }),
  });
  if (!r.ok) process.exit(1);
  process.stdout.write(await r.text());
})().catch(() => process.exit(1));
NODE
)
echo "$RPC_PF" | head -c 400
echo ""
echo "$RPC_PF" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || { echo "FAIL: aegis_preflight BLOCK"; exit 1; }

echo ""
echo "=== 7. aegis_preflightUserOp (schema) ==="
curl -sf -X POST "$RPC" -H "Content-Type: application/json" -d '{
  "jsonrpc":"2.0","id":10,
  "method":"aegis_preflightUserOp",
  "params":[{"chainId":84532,"userOperation":{"sender":"0x1234567890123456789012345678901234567890","nonce":"0x0","callData":"0x","callGasLimit":"0x5208","verificationGasLimit":"0x5208","preVerificationGas":"0x5208","maxFeePerGas":"0x1","maxPriorityFeePerGas":"0x1"}}]
}' | head -c 400
echo ""

echo ""
echo "=== 8–10. REST preflight SAFE / WARN / BLOCK ==="
export BASE PAYLOAD="$LIVE_PAYLOAD"
node <<'NODE'
const base = process.env.BASE;
const payload = JSON.parse(process.env.PAYLOAD);

async function preflight(label, lane, expectVerdict, expectReason) {
  const body = {
    chainId: payload.chainId,
    from: payload.from,
    to: lane.to,
    valueWei: "0",
    data: lane.data,
    policyId: lane.policyId,
  };
  console.log(`--- ${label} ---`);
  const r = await fetch(`${base}/api/preflight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${label} HTTP ${r.status}`);
  const json = await r.json();
  console.log(JSON.stringify(json).slice(0, 320));
  console.log("");
  if (json.verdict !== expectVerdict) {
    throw new Error(`${label}: expected ${expectVerdict}, got ${json.verdict}`);
  }
  if (!String(json.reasonCode).includes(expectReason)) {
    throw new Error(`${label}: expected ${expectReason}, got ${json.reasonCode}`);
  }
}

(async () => {
  await preflight("SAFE DeFi", payload.safe, "SAFE", "ALL_CHECKS_PASSED");
  await preflight("WARN approve", payload.warn, "WARN", "HIGH_ALLOWANCE");
  await preflight("BLOCK approve", payload.block, "BLOCK", "UNLIMITED_APPROVAL_UNKNOWN_SPENDER");
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
NODE

echo "=== 11. Agent policy BLOCK (cap exceeded) ==="
AGENT_BLOCK=$(curl -sf -X POST "$PF" \
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
echo ""
echo "$AGENT_BLOCK" | grep -q 'AGENT_TX_CAP_EXCEEDED' || { echo "FAIL: agent cap"; exit 1; }

echo ""
echo "=== 12. Serialized unsigned tx preflight (BLOCK) ==="
SERIAL_BLOCK=$(curl -sf -X POST "$PF" \
  -H "Content-Type: application/json" \
  -d '{
    "serializedTransaction": "0x02f87083014a3480843b9aca00843b9aca00830186a094036cbd53842c5426634e7929541ec2318f3dcf7e80b844095ea7b3000000000000000000000000deadbee5deadbeefdeadbeefdeadbeefdeadbeefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0",
    "from": "0x1234567890aBCdef1234567890abcDEf12345678",
    "policyId": "default-wallet-policy"
  }')
echo "$SERIAL_BLOCK" | head -c 400
echo ""
echo "$SERIAL_BLOCK" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || { echo "FAIL: serialized tx BLOCK"; exit 1; }

echo ""
echo "=== 13. GET /api/policies ==="
curl -sf "$BASE/api/policies" | head -c 300
echo ""

echo ""
echo "=== 14. GET /api/adapters/chainlink ==="
curl -sf "$BASE/api/adapters/chainlink" | head -c 300
echo ""

echo ""
echo "=== 15. GET /api/indexer ==="
INDEXER=$(curl -sf "$BASE/api/indexer")
echo "$INDEXER" | head -c 300
echo ""
echo "$INDEXER" | grep -q '"contractCount":' || { echo "FAIL: indexer contractCount"; exit 1; }

echo ""
echo "=== 16. POST /api/webhooks/defender (WARN audit) ==="
DEFENDER=$(curl -sf -X POST "$BASE/api/webhooks/defender" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"SuspiciousApproval","severity":"HIGH","description":"judge terminal smoke"}')
echo "$DEFENDER" | head -c 300
echo ""
echo "$DEFENDER" | grep -q '"verdict":"WARN"' || { echo "FAIL: defender WARN"; exit 1; }

echo ""
echo "=== 17. GET /api/events (non-fatal on Vercel without Supabase) ==="
EVENTS=$(curl -sf "$BASE/api/events?limit=5" || echo '{"events":[],"count":0}')
echo "$EVENTS" | head -c 300
echo ""
if echo "$EVENTS" | grep -q '"count":0'; then
  echo "NOTE: empty events on prod is expected without Supabase; verdicts are in preflight JSON."
fi

echo ""
echo "OK: curl-judge-terminal finished for $BASE"
