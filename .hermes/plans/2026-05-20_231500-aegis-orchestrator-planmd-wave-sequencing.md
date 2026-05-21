# Sub-plan — aegis-orchestrator — plan.md wave sequencing

**Saved:** 2026-05-20T23:15:00Z (local)  
**Parent Kanban:** t_e69aadd4  
**This wave task:** t_88ff90d2  
**Kit plan.md:** `../plan.md` (repo root) sections **18–19** (24h build + agent swarm), **25–26** (final cut + judge demo)

## Plan → Analyze

**Authoritative spine (in-repo):** `ORCHESTRATOR.md` already maps kit `plan.md` §18–19 and §25–26 into vertical slices, dependency graph, go/no-go hours, Kanban parent clarification (active **t_e69aadd4** vs historical Phase 2B **t_1249ee6d**), and dispatch cadence `hermes kanban dispatch --max 2`.

**Plan-chunks (07–15, 20–21):** Present under `aegis-rpc/.hermes/plans/plan-chunks/` — no rescaffold requested; filenames align with kit masterplan TOC.

**OpenSrc (orchestrator block):** `docs/research/agent-research-assignments.md` §orchestrator — index + assignments + `research/notes/` listing; no per-repo `rg` required before orchestration-only work.

## Build / Test / Integrate (verification this run)

| Check | Result | Notes |
|--------|--------|--------|
| `cd contracts && forge test` | **PASS** | 5 tests (AegisPolicyRegistry + ChainlinkFeedConsumer suites) |
| `forge test` from `aegis-rpc/` root | **FAIL** | Wrong cwd — no `foundry.toml` / lib resolution at repo root |
| `npm run build --prefix apps/web` | **FAIL** | Missing `@tanstack/react-query` (imported in `QueryProviders.tsx`) |
| `AEGIS_BASE_URL=http://127.0.0.1:3000 ./tests/curl-demo.sh` | **Not completed** | No API listening on :3000 this run; script hung until stopped |

**Git HEAD (aegis-rpc):** `e4098ec5b7b88246e3fb1f48714236b1b0f71df4`

## Wave sequencing (execute next)

1. **Unblock web build** — child task to `aegis-builder` (deps only).  
2. **Re-run** `npm run build --prefix apps/web` then optional `curl-demo` with dev server up.  
3. **Document acceptance** for workers: use `cd contracts && forge test` (or add root wrapper script in a later QA task).  
4. **Dispatch:** `hermes kanban dispatch --max 2` after READY cards have bodies + assignees.  
5. **Demo gate** per parent plan: `/demo/agent`, five scenarios, `onChainPolicyHash` or documented D3 blocker.

## Demo impact

Orchestration only: aligns board with `plan.md` cuts (§25 minimum demo, §26 six-step path) and surfaces two concrete blockers (web dep, forge cwd) before green baseline.

## Risks

- Baseline commands in card text say `forge test` without `contracts/` — risks false red in automation.  
- Push/deploy still require human merge + DECISIONS allowlist discipline.

## Follow-ups

- Child Kanban: web dependency fix (see board).  
- Optional: QA card to normalize `forge test` invocation in `tests/` or CI docs.
