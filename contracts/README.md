# Aegis contracts (Base Sepolia)

## Build & test

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit 2>/dev/null || true
forge build
forge test -vv
```

## Contracts

| Contract | Purpose |
|----------|---------|
| `AegisPolicyRegistry.sol` | On-chain policy hash store |
| `ChainlinkFeedConsumer.sol` | AggregatorV3Interface reader |
| `DemoERC20.sol` | Approval demo token |
| `DemoSpender.sol` | Unknown spender for BLOCK demo |

Deploy addresses: see `deployments/base-sepolia.json` (populate after broadcast with approval).
