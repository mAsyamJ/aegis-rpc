# Phase 2B — Hermes orchestrator dispatch prompt

**Profile:** `aegis-orchestrator`  
**Board:** `aegis-hackathon`  
**Parent:** `t_1249ee6d` (Phase 2B: plan.md full spec via Cursor)  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Model backend:** `cursor-composer-2` at `http://127.0.0.1:8787/v1` (headless Cursor Agent when `CURSOR_BRIDGE_MODE=agent`)  
**Mode:** Orchestrate only — do NOT implement code yourself. Kanban workers use the same bridge for implementation.

---

## Mission

Close the gap between thin MVP (`8a2a48d`) and plan.md v4 + kit `docs/` via Wave A–D Kanban children.

## Read order (NO @file:plan.md — use chunks)

1. `AGENTS.md`, `ORCHESTRATOR.md`, `DECISIONS.md`, `HACKATHON.md`
2. Kit docs: `../docs/04-api-spec.md` … `../docs/15-demo-script.md`
3. Plan chunks: `.hermes/plans/plan-chunks/` (sections 7–15, 20–21)
4. This file

## Wave tasks (Phase 2B)

| Wave | Task IDs | Assignee |
|------|----------|----------|
| A | A1–A5 `t_847a1d9f` … `t_6bec0d44` | backend-rpc, tx-decoder, policy-engine, adapter |
| B | B1–B2 `t_1eb39523`, `t_c62c7efb` | ai-memo |
| C | C1–C3 `t_3d40341e` … `t_921f1e76` | frontend |
| D | D1–D4 `t_842636d0` … `t_f0788160` | smart-contract, qa (D3 deploy gated) |

## Pre-flight

```bash
curl -sf http://127.0.0.1:8787/health
scripts/aegis-model.sh status  # expect cursor-composer-2
cd aegis-rpc && ./scripts/smoke-scaffold.sh
npm run build --prefix apps/web && cd contracts && forge test
hermes kanban reclaim <stale-id>  # if any running tasks stuck
```

## Dispatch

```bash
hermes kanban dispatch --max 2
hermes kanban list
```

## Demo gate (Phase 2B done)

- `/demo/agent` — 5-scenario LEAD path (live API + stale-feed fixture fallback)
- `npm run build --prefix apps/web` green
- `forge test` green
- `AEGIS_BASE_URL=http://127.0.0.1:3020 ./tests/curl-demo.sh` green
- `onChainPolicyHash` on preflight response OR deploy task D3 blocked with reason

## Non-negotiables

- Deterministic policy → SAFE/WARN/BLOCK; AI explains only
- One commit per work package; update `docs/AI_COLLABORATION_LOG.md`
- No push, deploy, or private keys without human approval

---

## Copy-paste Hermes prompt

```
/plan You are the Aegis Orchestrator (profile: aegis-orchestrator). Do NOT implement code. Decompose, Kanban-dispatch, and report. Workers implement via Cursor (bridge cursor-composer-2 at http://127.0.0.1:8787/v1).

Mission — Phase 2B: implement plan.md v4 spec via docs/
Workspace: dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc
Board: aegis-hackathon
Parent: t_1249ee6d
Baseline: thin MVP extended by Cursor session — verify before re-implementing

Read: AGENTS.md, ORCHESTRATOR.md, ../docs/04-15, .hermes/plans/plan-chunks/, this prompt file.

Step 1: Gap audit — smoke + curl-demo on port 3020
Step 2: Dispatch hermes kanban dispatch --max 2 for Wave A→D
Step 3: Report SHAs, test output, demo impact per wave

Demo gate: /demo/agent, forge test, npm run build, curl-demo.sh, onChainPolicyHash visible.
Do not deploy without human approval.
```
