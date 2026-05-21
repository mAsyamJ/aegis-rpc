#!/usr/bin/env bash
# ABI indexer curl smokes — requires dev server on AEGIS_BASE_URL (default 3020)
set -euo pipefail

BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3020}"
DEMO_ERC20="${DEMO_ERC20:-0xba0e8e5cbdd3dc2d3787776298fa524313bab52e}"
DEFI_APP="${DEFI_POLICY_APP:-0x320b965a9b79229703548e51c5bcae9c5769406c}"

echo "=== 1. GET /api/indexer ==="
INDEXER=$(curl -sf "$BASE/api/indexer")
echo "$INDEXER" | head -c 400
echo ""
echo "$INDEXER" | grep -q '"contractCount":' || { echo "FAIL: missing contractCount"; exit 1; }
COUNT=$(echo "$INDEXER" | sed -n 's/.*"contractCount":\([0-9]*\).*/\1/p' | head -1)
if [ -z "$COUNT" ] || [ "$COUNT" -lt 6 ]; then
  echo "FAIL: expected contractCount >= 6, got $COUNT"
  exit 1
fi
echo ""

echo "=== 2. Preflight DemoERC20.mint (indexed decode) ==="
# mint(address,uint256) selector 0x40c10f19
MINT_TO="0x1234567890123456789012345678901234567890"
MINT_AMOUNT_HEX=$(printf '%064x' 1000000)
MINT_DATA="0x40c10f19${MINT_TO:2}${MINT_AMOUNT_HEX}"
MINT_RESP=$(curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d "{
    \"chainId\": 84532,
    \"from\": \"0x1234567890123456789012345678901234567890\",
    \"to\": \"$DEMO_ERC20\",
    \"valueWei\": \"0\",
    \"data\": \"$MINT_DATA\",
    \"policyId\": \"default-wallet-policy\"
  }")
echo "$MINT_RESP" | head -c 500
echo ""
echo "$MINT_RESP" | grep -qi 'mint' || { echo "FAIL: expected mint in preflight response"; exit 1; }
echo ""

echo "=== 3. Preflight DeFi checkSwapDeviation (indexed decode) ==="
# checkSwapDeviation(address,address,uint256,uint256,uint256,uint256) 0x02d23590
DEFI_DATA="0x02d235900000000000000000000011111111111111111111111111111111111111111000000000000000000000022222222222222222222222222222222222222220000000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000032"
DEFI_RESP=$(curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d "{
    \"chainId\": 84532,
    \"from\": \"0x1234567890123456789012345678901234567890\",
    \"to\": \"$DEFI_APP\",
    \"valueWei\": \"0\",
    \"data\": \"$DEFI_DATA\",
    \"policyId\": \"default-wallet-policy\"
  }")
echo "$DEFI_RESP" | head -c 500
echo ""
echo "$DEFI_RESP" | grep -qi 'checkSwapDeviation' || {
  echo "FAIL: expected checkSwapDeviation in preflight response"
  exit 1
}
echo ""

echo "=== 4. Wallet unlimited approve still BLOCK ==="
WALLET_BLOCK=$(curl -sf -X POST "$BASE/api/preflight" \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": 84532,
    "from": "0x1234567890123456789012345678901234567890",
    "to": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "valueWei": "0",
    "data": "0x095ea7b3000000000000000000000000deadbee5deadbeefdeadbeefdeadbeefdeadbeefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "policyId": "default-wallet-policy"
  }')
echo "$WALLET_BLOCK" | head -c 400
echo "$WALLET_BLOCK" | grep -q 'UNLIMITED_APPROVAL_UNKNOWN_SPENDER' || {
  echo "FAIL: expected UNLIMITED_APPROVAL_UNKNOWN_SPENDER"
  exit 1
}
echo ""

echo "OK: curl-abi-index finished"
