# ORCHESTRATOR.md — Senior Engineering Plan

## Objective

Coordinate AI coding agents to build Aegis RPC MVP within 24 hours, while keeping architecture extensible for post-hackathon development.

## Execution strategy

Build in vertical slices, not horizontal perfection.

### Slice 1 — RPC passthrough
Goal: prove Aegis behaves like a real RPC gateway.

Output:
- `POST /api/rpc`
- passthrough for `eth_chainId`, `eth_blockNumber`, `eth_getBalance`, `eth_call`
- curl tests

### Slice 2 — Preflight pipeline
Goal: reliable demo path without depending on full raw signed tx parsing.

Output:
- `POST /api/preflight`
- `TxIntent` normalization
- `SAFE/WARN/BLOCK` response shape
- audit event creation

### Slice 3 — Approval blocker
Goal: prove real problem-solving with wallet-drainer pattern.

Output:
- ERC20 `approve(address,uint256)` decoder
- `MaxUint256` detection
- unknown spender policy
- BLOCK verdict

### Slice 4 — Chainlink adapter
Goal: prove live-data adapter layer.

Output:
- `ChainlinkPriceAdapter`
- `latestRoundData()`
- `decimals()`
- freshness check
- USD value calculation signal

### Slice 5 — OpsRisk dashboard
Goal: prove completeness and business surface.

Output:
- dashboard timeline
- verdict badges
- adapter signals table
- AI memo panel

### Slice 6 — Smart contracts
Goal: add Web3-native proof without making contracts the core engine.

Output:
- `AegisPolicyRegistry.sol`
- `ChainlinkFeedConsumer.sol`
- `DemoERC20.sol`
- `DemoSpender.sol`
- Foundry tests if time permits

## Dependency graph

```mermaid
flowchart TD
    A[Repo setup] --> B[/api/rpc passthrough]
    A --> C[Shared types]
    C --> D[TxIntent + decoder]
    D --> E[Policy engine]
    E --> F[Approval blocker]
    E --> G[Adapter layer]
    G --> H[ChainlinkPriceAdapter]
    E --> I[Audit log]
    I --> J[Dashboard]
    F --> J
    H --> J
    E --> K[AI memo]
    A --> L[Contracts]
    L --> M[Registry deploy]
```

## Plan.md and Kanban wave sequencing

Authoritative long-form narrative lives in the kit repo `../plan.md` (sections 18–19: 24-hour build schedule and agent-swarm operating model; sections 25–26: final cut list and judge-facing demo recommendation). This file stays the **in-repo execution spine**: vertical slices above, dependency graph, and checkpoints map 1:1 to those sections without duplicating the full masterplan.

### Phase 3 checkpoint (2026-05-21) — scope freeze

Aligned with kit `plan.md` **§25 Final Cut List** (cuts: raw send parser depth, universal DeFi router, RWA settlement, private relay, multi-chain, exploit-AI overclaim) and **§26 Final Recommendation** (must-not-cut: verdicts, approval blocker, Chainlink adapter signal, dashboard log, deterministic-policy disclaimer). Matches **Hard scope limits** in this file.

**Open gaps (post-freeze, not MVP re-scope):** **Phase 4** grill — **done** (`docs/GRILL_QA.md`, Kanban **t_a6c35888** + security child **t_f85e6781**). **Phase 4 continuity (2026-05-21):** orchestrator re-verified GRILL_QA vs kit `docs/15-demo-script.md` mapping; `hermes kanban` **ready/running** **0**; **dispatch** spawned **0**; audit **comment** on **t_a6c35888**. **Regression** — **done** (**t_3fbe7d2a**: forge 5/5, `apps/web` build, `curl-demo.sh` @ local :3000). **Phase 5** Vercel — **blocked** (**t_f488017b**) until operator links project, sets env, deploys, pastes production URL in `HACKATHON.md`. **Phase 6** — **blocked** (**t_40bcee10**) until **`gh`** is installed/authenticated where workers run + PR checks + allowlisted push/merge per `DECISIONS.md` (or operator waiver). **Last orchestration pulse (automated gate):** `hermes kanban` **ready/running** both **0**; **`hermes kanban dispatch --max 2`** → spawned **0**; **forge test** **5/5**; **`npm run build`** (`apps/web`) **green**; **`./tests/curl-demo.sh`** with **`AEGIS_BASE_URL=http://127.0.0.1:3000`** **OK**. **Module 9** row still `deploy pending approval` until D3 verify on Base Sepolia per `DECISIONS.md`. Kanban handoff matrix: `.hermes/plans/2026-05-21_001200-orchestrate-plan-md-all-agents-handoff-pabti.md`.

**Kanban parents (do not confuse):**

- **Ship path (HACKATHON Phase 3–6, 2026-05-21):** flat tasks (archived mis-blocked epic **t_79e30cc9** — do not resurrect): **t_3f230e76** (Phase 3 technical plan / scope freeze, `aegis-orchestrator`), **t_a6c35888** (Phase 4 grill + judge Q&A, `aegis-pitch`), **t_f488017b** (Phase 5 Vercel, `aegis-devops`), **t_40bcee10** (Phase 6 PR green + submit, `aegis-qa`), **t_3fbe7d2a** (Regression smoke, `aegis-qa`). Workspace `dir:.../aegis-rpc`. Headless: kit `scripts/install-aegis-pm-cron-10m.sh` + optional `scripts/install-aegis-kanban-dispatch-timer.sh`.
- **Completed PABTI / plan.md handoff wave (2026-05):** epic **t_e69aadd4** and its children — **done**; use for history only.
- **Historical Phase 2B Cursor wave:** parent **t_1249ee6d** and wave task IDs **t_847a1d9f** … **t_f0788160** — complete; bodies may still cite `t_1249ee6d`. Workers follow card scope and file paths, not stale parent prose.

**Dispatch cadence:** `hermes kanban dispatch --max 2` (per kit headless runbook). Prefer foundation lanes (RPC + decoder + policy) before adapter/database, then AI memo, frontend, contracts/QA — parallelize only where `DECISIONS.md` and card dependencies allow.

## Work allocation for agent swarm

| Agent | First task | Hard acceptance |
|---|---|---|
| Backend RPC | `/api/rpc` | `eth_blockNumber` passes through |
| Decoder | `TxIntent` + approve decode | `approve(MaxUint256)` decoded |
| Policy | `evaluateTransaction()` | BLOCK for unlimited approval |
| Adapter | Chainlink adapter | returns `OK/WARN/BLOCK` signal |
| Dashboard | event timeline | visible SAFE/WARN/BLOCK |
| Contracts | registry + demo ERC20 | compiles |
| QA | curl scripts | one-command demo checklist |
| Pitch | README/demo | 2-minute demo script |

## Hard scope limits

Must not build in MVP:
- Full own RPC node
- Full mempool/private relay
- Universal DeFi router decoder
- Full bytecode decompiler
- Full zero-day AI exploit detector
- Full RWA settlement or NAV oracle
- Multichain support beyond Base Sepolia

## Go / no-go checkpoints

### Hour 4
If `/api/rpc` passthrough is not working, pause all other backend work.

### Hour 8
If preflight cannot parse approve tx, switch to controlled unsigned intent payload for demo.

### Hour 12
If Chainlink feed address causes issues, keep adapter interface and configure fallback signal. Do not make Chainlink the demo blocker.

### Hour 18
If dashboard is not ready, use JSON event log page.

### Hour 22
Freeze code. Record demo video. No new features.
