# Aegis RPC

Programmable pre-broadcast transaction screening gateway for Base Sepolia.

Aegis wraps an underlying RPC provider, passes through read-only JSON-RPC calls, decodes transaction intent, evaluates deterministic policy, collects adapter signals, and returns `SAFE`, `WARN`, or `BLOCK` before broadcast.

## Demo thesis

1. RPC passthrough (`eth_blockNumber`, `eth_getBalance`)
2. Preflight API with decoded intent
3. Block unlimited ERC20 approvals to unknown spenders
4. Chainlink price/freshness adapter signal
5. OpsRisk dashboard + AI memo (explanation only)

See [HACKATHON.md](HACKATHON.md) for module build order (one commit per module).

## Stack

- Next.js App Router (`apps/web`)
- TypeScript strict, Tailwind, viem, zod
- Target chain: Base Sepolia (84532)

## Quick start

```bash
cp .env.example .env.local   # set BASE_SEPOLIA_RPC_URL locally — never commit secrets
cd apps/web && npm install && npm run build
./scripts/smoke-scaffold.sh
```

## OpenSrc research

Before implementing modules, agents must read source via OpenSrc:

```bash
opensrc path viem
opensrc path zod
```

Assignments: kit parent `docs/research/agent-research-assignments.md`.

## Orchestration

- Hermes Kanban board: `aegis-hackathon`
- Workspace: `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`
- Dashboard: `hermes dashboard` → http://127.0.0.1:9119
