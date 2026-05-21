# Sub-plan — aegis-orchestrator — plan.md wave sequencing (PABTI)

**Saved:** 2026-05-20T23:05:00 (local)  
**Kanban:** t_88ff90d2  
**Parent epic:** t_e69aadd4 (plan.md Wave — all-agent PABTI handoff)  
**Baseline plans:** `.hermes/plans/2026-05-20_174800-agent-aegis-orchestrator.md`, kit `../plan.md`

## Plan (P)

Align repo orchestration docs with kit `plan.md` §18–19 (24h build + agent swarm) and §25–26 (cut list + final recommendation). No app re-scaffold.

## Analyze (A)

| Source | Finding |
|--------|---------|
| `plan.md` §18 | Hourly solo/team table maps to `ORCHESTRATOR.md` vertical slices + `HACKATHON.md` modules 1–9. |
| `plan.md` §19 | Agent table ↔ `AGENTS.md` roles; task template matches PABTI card bodies (allowed paths, OpenSrc, acceptance). |
| `plan.md` §25–26 | Hard cuts match `ORCHESTRATOR.md` “Hard scope limits”; 8h minimum demo ⊆ current MVP; judge pitch ↔ `ORCHESTRATOR.md` checkpoints. |
| `plan-chunks/` (07–15, 20–21) | Present under `.hermes/plans/plan-chunks/`; no missing files vs orchestrator read order. |
| Kanban live list | **Active PABTI wave:** children of **t_e69aadd4** (e.g. t_197db7b1 backend-rpc, t_4acf3476 tx-decoder, …). **Historical Phase 2B** tasks used parent **t_1249ee6d** (wave A–D IDs t_847a1d9f…t_f0788160); many are `done`. Card bodies may still say `Parent: t_1249ee6d` — treat **workspace + assignee** as truth; epic for new work is **t_e69aadd4** lineage. |
| `docs/research/agent-research-assignments.md` § orchestrator | Read index + assignments + `research/notes/`; no OpenSrc `rg` block for orchestrator (meta-research only). |
| Epic t_e69aadd4 | Row shows `done` while PABTI children still `running` — hygiene: reviewer should keep epic `todo`/`running` until children close, or accept epic as “planning complete” only if-by-definition. |

## Build (B)

- Add “Plan.md and Kanban waves” subsection to `ORCHESTRATOR.md` (single source in repo for wave order + parent ID note).
- This file (sub-plan) for Hermes thread / `kanban_complete` metadata.

## Debug / Test (D / T)

- `forge test` (contracts)  
- `npm run build --prefix apps/web`  
- Dev server + `AEGIS_BASE_URL=http://127.0.0.1:3000 ./tests/curl-demo.sh`

## Integrate (I)

- `hermes kanban comment` on **t_e69aadd4**: plan path + ready/blocked line.  
- `hermes kanban complete` **t_88ff90d2** with summary + metadata (changed files, test counts).

## Wave order (dispatch hint)

1. **Foundation:** backend-rpc + tx-decoder + policy-engine (parallel where independent).  
2. **Adapter** after policy paths stable for signals.  
3. **Database** when audit emit shape settled.  
4. **AI memo** after verdict pipeline frozen.  
5. **Frontend** when API contracts stable.  
6. **Smart contract / QA** last for on-chain hash + curl-demo gate.

**Cadence:** `hermes kanban dispatch --max 2` per headless runbook; heartbeat on long builds.

## Demo impact

Documentation + Kanban clarity only — no API behavior change. Demo path unchanged; acceptance proves no regression.

## Follow-ups

- Optional: bulk-edit historical card bodies `Parent: t_1249ee6d` → note “superseded by t_e69aadd4 wave” (human UI cleanup; not required for code).  
- Re-open or spawn epic follow-up if t_e69aadd4 should track child completion.
