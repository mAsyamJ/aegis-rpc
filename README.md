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

## Demo

```bash
cd apps/web && npm install && npm run build && npm run start -- --port 3020
AEGIS_BASE_URL=http://127.0.0.1:3020 ./tests/curl-demo.sh
cd contracts && forge test
```

Open `/demo/agent` (LEAD), `/demo/wallet`, `/dashboard`.

Optional offline UI: `NEXT_PUBLIC_AEGIS_FIXTURES=true npm run dev`

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/rpc` | JSON-RPC passthrough + intercept `-32090` |
| `POST /api/preflight` | Transaction screening |
| `POST /api/safe-send` | Broadcast after SAFE/WARN override |
| `GET/POST/PUT /api/policies` | Policy registry (in-memory MVP) |
| `GET /api/ai-analyze?requestId=` | AI memo + pre-signing assist |
| `GET /api/events` | Audit timeline |
| `GET /api/adapters/chainlink` | Feed health |
| `/demo/agent` | LEAD agent preflight demo |
| `/demo/wallet` | Wallet approval firewall |
| `/dashboard` | OpsRisk UI |


## Orchestration

- Hermes Kanban board: `aegis-hackathon`
- Workspace: `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`
- Dashboard: `hermes dashboard` → http://127.0.0.1:9119
