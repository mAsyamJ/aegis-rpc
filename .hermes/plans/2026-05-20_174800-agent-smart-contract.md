# Plan — Agent: smart-contract (Wave D)

**Profile:** `smart-contract`  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`

## Goal

Foundry contracts per `ORCHESTRATOR.md` Slice 6: `AegisPolicyRegistry.sol`, feed consumer, `DemoERC20`, `DemoSpender`; tests; optional Base Sepolia deploy **only after explicit human approval** (no keys in Kanban/plans/chat).

## Read order

- `.hermes/plans/plan-chunks/15-15-smart-contract-architecture.md`
- `../docs/` contract addresses / demo script if present

## OpenSrc gate

Run **smart-contract** block in `../docs/research/agent-research-assignments.md` (OZ Ownable/registry, Chainlink consumer, Foundry patterns).

## Proposed approach

- Minimal registry: policy hash or config pointer suitable for **`onChainPolicyHash`** in API response
- Consumer contract reads Chainlink feed (align addresses with **adapter** env)
- Foundry tests: registry ownership, consumer read, demo token flows as applicable

## Files likely to change

- `contracts/src/**`, `contracts/test/**`, `foundry.toml`, deploy script if repo uses `forge script`

## Tests / validation

- `forge test` green locally and in CI if configured
- After **approved** deploy: verify on Base Sepolia explorer (task for **qa** to confirm hash matches API)

## Definition of done

- Contracts compile; tests cover happy path + one failure mode
- Deploy/verify is **explicitly approval-gated**; if blocked, D3 documents reason for orchestrator

## Risks

- Scope creep into “contracts are the product” — keep gateway authoritative per `AGENTS.md`
