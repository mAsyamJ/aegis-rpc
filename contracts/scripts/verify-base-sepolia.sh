#!/usr/bin/env bash
# Verify all six Aegis contracts on Base Sepolia (Blockscout + optional Basescan V2).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f "${ROOT}/../.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT}/../.env"
  set +a
fi

export BASE_SEPOLIA_RPC_URL="${BASE_SEPOLIA_RPC_URL:-https://sepolia.base.org}"
TOKEN=0xba0e8E5CBDD3DC2D3787776298fA524313BAB52E
SPENDER_ARGS=$(cast abi-encode "constructor(address)" "$TOKEN")

verify_blockscout() {
  local addr="$1" contract="$2" extra="${3:-}"
  echo "Blockscout: $contract"
  ETHERSCAN_API_KEY=unused BASESCAN_API_KEY=unused \
    forge verify-contract "$addr" "$contract" \
      --chain base-sepolia \
      --verifier blockscout \
      --verifier-url "https://base-sepolia.blockscout.com/api/" \
      --watch \
      $extra
}

verify_basescan() {
  local addr="$1" contract="$2" extra="${3:-}"
  local key="${ETHERSCAN_API_KEY:-${BASESCAN_API_KEY:-}}"
  if [ -z "$key" ] || [ "${#key}" -lt 20 ]; then
    echo "Skip Basescan ($contract): set ETHERSCAN_API_KEY (multichain V2 from etherscan.io/apidashboard)"
    return 0
  fi
  echo "Basescan V2: $contract"
  forge verify-contract "$addr" "$contract" \
    --chain-id 84532 \
    --verifier custom \
    --verifier-api-key "$key" \
    --verifier-url "https://api.etherscan.io/v2/api?chainid=84532" \
    --watch \
    $extra
}

echo "=== Blockscout (no API key required) ==="
verify_blockscout 0xdd59bC2E7Ea61E689d16514428DD618cFB825011 "src/registry/AegisPolicyRegistry.sol:AegisPolicyRegistry"
verify_blockscout 0xba0e8E5CBDD3DC2D3787776298fA524313BAB52E "src/demo/DemoERC20.sol:DemoERC20"
verify_blockscout 0x29993246fF751a72B43C1B47583822c017691995 "src/demo/DemoSpender.sol:DemoSpender" "--constructor-args $SPENDER_ARGS"
verify_blockscout 0x0355bDCAC2A7078E67A223422632C94F1af762A0 "src/usecases/AgentUseCasePolicyApp.sol:AgentUseCasePolicyApp"
verify_blockscout 0x320b965A9b79229703548E51c5BCAE9C5769406C "src/usecases/DeFiUseCasePolicyApp.sol:DeFiUseCasePolicyApp"
verify_blockscout 0x6B41B1d1bFd18be664FC73969B4Dd30323fD025c "src/usecases/RWAUseCasePolicyApp.sol:RWAUseCasePolicyApp"

echo "=== Basescan (optional; needs real ETHERSCAN_API_KEY) ==="
verify_basescan 0xdd59bC2E7Ea61E689d16514428DD618cFB825011 "src/registry/AegisPolicyRegistry.sol:AegisPolicyRegistry"
verify_basescan 0xba0e8E5CBDD3DC2D3787776298fA524313BAB52E "src/demo/DemoERC20.sol:DemoERC20"
verify_basescan 0x29993246fF751a72B43C1B47583822c017691995 "src/demo/DemoSpender.sol:DemoSpender" "--constructor-args $SPENDER_ARGS"
verify_basescan 0x0355bDCAC2A7078E67A223422632C94F1af762A0 "src/usecases/AgentUseCasePolicyApp.sol:AgentUseCasePolicyApp"
verify_basescan 0x320b965A9b79229703548E51c5BCAE9C5769406C "src/usecases/DeFiUseCasePolicyApp.sol:DeFiUseCasePolicyApp"
verify_basescan 0x6B41B1d1bFd18be664FC73969B4Dd30323fD025c "src/usecases/RWAUseCasePolicyApp.sol:RWAUseCasePolicyApp"

echo "Done."
