# HACKATHON — Aegis Protocol (SEABW)

> Copy this file to your **hackathon app repo root** when official build starts.
> Source: `aegis-hackathon-kit/docs/kit/templates/HACKATHON.md`

## Team & links

| Field | Value |
|-------|--------|
| Project | Aegis RPC / Aegis Protocol |
| Team | |
| Track | SEABW |
| Repo | aegis-rpc/ |
| Demo URL | **Production:** [https://web-gamma-bay-96.vercel.app](https://web-gamma-bay-96.vercel.app) · `/demo/live` · RPC `…/api/rpc` (84532). **Judge terminal:** `AEGIS_BASE_URL=https://web-gamma-bay-96.vercel.app ./tests/curl-judge-terminal.sh` (full tour) or `./tests/curl-judge-preflight-only.sh` (3 verdicts). Curls: [README.md](README.md#judge-terminal-test-guide). Local: `npm run start -- --port 3020`. Deploy: `docs/LOCAL_DEV.md`, `./scripts/deploy-vercel-public.sh`. |
| Video | |

## Lifecycle checklist

- [x] **Phase 0** — Pre-build (kit only; no product code in kit repo)
- [x] **Phase 1** — Scaffold Next.js app, copy `.kiro`, `AGENTS.md`, this file, `docs/AI_COLLABORATION_LOG.md`
- [x] **Phase 2** — MVP modules 1–9 (one commit each; see below)
- [x] **Phase 3** — Technical plan (`/plan` or Kiro orchestrator)
- [x] **Phase 4** — Grill me (judge Q&A; `docs/GRILL_QA.md`)
- [x] **Phase 5** — Production deploy (Vercel 2026-05-21 — `web-gamma-bay-96.vercel.app`; Supabase optional follow-up: `001_aegis_events.sql` + env sync)
- [ ] **Phase 6** — Push / submit (approval required)

## MVP modules (one commit per row)

| # | Module | Commit prefix | Done | Agent |
|---|--------|---------------|------|-------|
| 1 | JSON-RPC passthrough | `chore: rpc passthrough` | [x] | backend-rpc |
| 2 | POST /api/preflight | `feat: preflight endpoint` | [x] | backend-rpc |
| 3 | Tx decoder | `feat: tx decoder` | [x] | tx-decoder |
| 4 | Policy engine | `feat: policy engine` | [x] | policy-engine + security |
| 5 | Adapter layer | `feat: adapter layer` | [x] | adapter |
| 6 | Chainlink/mock adapter | `feat: chainlink adapter` | [x] | adapter |
| 7 | RiskOps dashboard | `feat: riskops dashboard` | [x] | frontend |
| 8 | AI memo panel | `feat: ai memo panel` | [x] | ai-memo |
| 9 | Base Sepolia proof | `chore: base sepolia demo` | [x] deployed 2026-05-21 — registry `0xdd59…5011` (see `contracts/deployments/base-sepolia.json`) | smart-contract + qa |

## AI collaboration proof

- Log: [docs/AI_COLLABORATION_LOG.md](docs/AI_COLLABORATION_LOG.md)
- Guide: kit parent `docs/kit/05-ai-collaboration.md`

## Do not overclaim

- Aegis does not prevent all hacks or detect all zero-days.
- Aegis does not replace Chainlink or RPC providers.
- AI explains deterministic verdicts; policy engine decides SAFE/WARN/BLOCK.

## Say instead

- Aegis wraps existing RPC providers.
- Aegis intercepts high-risk transactions before broadcast.
- Chainlink is the first real-data adapter in the demo.
