# OpenSrc integrations map

Post-MVP backend innovations inspired by [`research/opensrc-paths/`](../../research/opensrc-paths/) and [`docs/research/agent-research-assignments.md`](../../docs/research/agent-research-assignments.md). Aegis remains **deterministic policy first**; AI explains only.

## Reference → code paths

| OpenSrc reference | Pattern borrowed | Aegis implementation |
|-------------------|------------------|------------------------|
| [flashbots/rpc-endpoint](research/opensrc-paths/github__flashbots__rpc-endpoint.path) | Method router, read RPC cache, batch JSON-RPC | `lib/rpc/engine.ts`, `lib/rpc/middleware/registry.ts`, `rpcCache.ts`, `tests/curl-innovation.sh` |
| [MetaMask/json-rpc-engine](research/opensrc-paths/json-rpc-engine.path) | Composable middleware chain | `lib/rpc/middleware/*.ts` → `getMiddlewareHandlers()` |
| [ethereum/execution-apis](research/opensrc-paths/github__ethereum__execution-apis.path) | Passthrough `eth_*` surface | `lib/rpc/client.ts` `PASSTHROUGH_METHODS` |
| [viem](research/opensrc-paths/viem.path) | `parseTransaction`, `eth_call` + `stateOverride` | `simulationEngine.ts`, `preflightService.ts`, `lib/chain/simulation.ts` |
| [Tenderly/tenderly-rabby-transaction-preview](research/opensrc-paths/github__Tenderly__tenderly-rabby-transaction-preview.path) | Human-readable decode labels | `knownSelectors.ts`, `previewEnrichmentAdapter.ts` |
| Blockscout `getabi` + Foundry artifacts | Verified ABI index (strict dual-source) | `scripts/sync-abi-index.mjs`, `data/abi-index.json`, `lib/indexer/*`, `GET /api/indexer` |
| [RabbyHub/Rabby](research/opensrc-paths/github__RabbyHub__Rabby.path) | Selector registry, multicall unwrap | `knownSelectors.ts`, `multicallDecoder.ts`, `decodeCallData.ts` |
| [wallet-guard](research/opensrc-paths/github__wallet-guard__wallet-guard-extension.path) | Spender risk, high allowance, sim hints | `spenderReputationAdapter.ts`, `simulationEngine.ts` |
| [safe-global/safe-core-sdk](research/opensrc-paths/github__safe-global__safe-core-sdk.path) | `execTransaction` inner call | `safeExecDecoder.ts`, `safeTreasuryAdapter.ts`, `default-treasury-policy` |
| [eth-infinitism/bundler-spec](research/opensrc-paths/github__eth-infinitism__bundler-spec.path) | UserOperation shape | `userOperationDecoder.ts`, `aegis_preflightUserOp` |
| [permissionless.js](research/opensrc-paths/github__pimlicolabs__permissionless.js.path) | ERC-4337 RPC method names | `eth_sendUserOperation` intercept |
| [OpenZeppelin/defender-sdk](research/opensrc-paths/github__OpenZeppelin__defender-sdk.path) | Monitor webhooks (post-tx) | `app/api/webhooks/defender/route.ts` (WARN-only) |
| Chainlink EVM | Price adapter (MVP) | `chainlinkPriceAdapter.ts` |
| Supabase-js | Audit persistence | `eventRepository.ts` |

## Wave 2 engines

| Module | Role |
|--------|------|
| `lib/engine/simulationEngine.ts` | Shared `eth_call` simulation |
| `lib/engine/verdictEngine.ts` | Merge `AdapterSignal[]` → verdict + precedence |
| `lib/engine/decodeCallData.ts` | Inner call / multicall / Safe / approve helpers |
| `lib/indexer/abiIndex.ts` | Address → ABI + selector registry (committed JSON) |
| `lib/indexer/decodeWithIndexer.ts` | viem `decodeFunctionData` for indexed contracts |

## JSON-RPC extensions

| Method | Purpose |
|--------|---------|
| `aegis_preflight` | Screen unsigned tx intent |
| `aegis_preflightUserOp` | Screen ERC-4337 UserOperation |
| `aegis_sendTransaction` | Safe-send after preflight |

Intercepted until preflight: `eth_sendRawTransaction`, `eth_sendTransaction`, `eth_sendUserOperation`, `eth_estimateUserOperationGas`.

## Operator flags

| Env | Effect |
|-----|--------|
| `AEGIS_RPC_CACHE_TTL_MS` | TTL cache for `eth_chainId` / `eth_blockNumber` |
| `AEGIS_INLINE_RAW_SCREENING=true` | Inline `eth_sendRawTransaction` screening |
| `AEGIS_DEFENDER_WEBHOOK_SECRET` | Optional auth for Defender webhook |

## Verification

```bash
cd aegis-rpc/apps/web && npm run test
AEGIS_BASE_URL=http://127.0.0.1:3020 ./tests/curl-innovation.sh
AEGIS_BASE_URL=http://127.0.0.1:3020 ./tests/curl-wave2.sh
AEGIS_BASE_URL=http://127.0.0.1:3020 ./tests/curl-abi-index.sh
npm run sync:abi-index
./scripts/verify-backend.sh
```

## Not integrated (scope guard)

Flashbots bundles/relays, full Rabby router ABI, OpenZeppelin Relayer runtime, mandatory Tenderly cloud simulation, mainnet multi-chain.
