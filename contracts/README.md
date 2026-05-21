# Aegis contracts (Base Sepolia)

## Build & test

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit 2>/dev/null || true
forge build
forge test -vv
```

## Contracts

| Contract | Path | Purpose |
|----------|------|---------|
| `AegisPolicyRegistry` | `src/registry/` | On-chain policy hash store |
| `ChainlinkFeedConsumer` | `src/adapters/` | AggregatorV3 reader (E8 normalization) |
| `DemoERC20` | `src/demo/` | Approval demo token |
| `DemoSpender` | `src/demo/` | Unknown spender for BLOCK demo |
| `AgentUseCasePolicyApp` | `src/usecases/` | Agent USD cap mirror (testnet — open admin) |
| `DeFiUseCasePolicyApp` | `src/usecases/` | Swap deviation guard |
| `RWAUseCasePolicyApp` | `src/usecases/` | NAV mint/redeem limits |

Stretch use-case apps have **no access control** on testnet — anyone can call `setAgentPolicy` / `setRwaPolicy`. Do not use on mainnet without Ownable.

## Deploy (human approval required)

Keystore account `testnet` (Foundry `~/.foundry/keystores/testnet`):

```bash
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
forge script script/DeployBaseSepolia.s.sol:DeployBaseSepolia \
  --rpc-url "$BASE_SEPOLIA_RPC_URL" \
  --account testnet \
  --broadcast \
  -vvv
```

Or `scripts/aegis-d3-deploy-once.sh` with `DEPLOYER_PRIVATE_KEY` in local `.env` only.

Writes `deployments/base-sepolia.json`. Sync addresses to `apps/web` via `src/lib/chain/addresses.ts` or `NEXT_PUBLIC_*` overrides.

After deploy and Blockscout verify, from repo root:

```bash
npm run sync:abi-index
```

Regenerates `apps/web/src/data/abi-index.json` (forge ABI must match Blockscout `getabi`).

### Live Base Sepolia (2026-05-21)

| Contract | Address |
|----------|---------|
| AegisPolicyRegistry | [0xdd59bC2E7Ea61E689d16514428DD618cFB825011](https://sepolia.basescan.org/address/0xdd59bC2E7Ea61E689d16514428DD618cFB825011) |
| DemoERC20 | [0xba0e8E5CBDD3DC2D3787776298fA524313BAB52E](https://sepolia.basescan.org/address/0xba0e8E5CBDD3DC2D3787776298fA524313BAB52E) |
| DemoSpender | [0x29993246fF751a72B43C1B47583822c017691995](https://sepolia.basescan.org/address/0x29993246fF751a72B43C1B47583822c017691995) |
| AgentUseCasePolicyApp | [0x0355bDCAC2A7078E67A223422632C94F1af762A0](https://sepolia.basescan.org/address/0x0355bDCAC2A7078E67A223422632C94F1af762A0) |
| DeFiUseCasePolicyApp | [0x320b965A9b79229703548E51c5BCAE9C5769406C](https://sepolia.basescan.org/address/0x320b965A9b79229703548E51c5BCAE9C5769406C) |
| RWAUseCasePolicyApp | [0x6B41B1d1bFd18be664FC73969B4Dd30323fD025c](https://sepolia.basescan.org/address/0x6B41B1d1bFd18be664FC73969B4Dd30323fD025c) |

## Policy hash alignment

Deploy script registers policies using `keccak256(abi.encodePacked(json))`. Backend uses the same canonical JSON in `apps/web/src/lib/chain/canonicalPolicyJson.ts`.
