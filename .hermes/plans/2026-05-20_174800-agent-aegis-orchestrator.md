# Plan — Agent: aegis-orchestrator (Phase 2B)

**Saved:** 2026-05-20  
**Profile:** `aegis-orchestrator`  
**Mode:** Orchestrate only — no direct product implementation unless unblocking.  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon`  
**Baseline:** extend thin MVP; do not rewrite from scratch.

## Goal

Run gap audit → Kanban children → dispatch → wave reports → demo gate until Phase 2B is done per kit docs and plan chunks.

## Read order

1. `AGENTS.md`, `ORCHESTRATOR.md`, `DECISIONS.md`, `HACKATHON.md`
2. Kit: `../docs/04-api-spec.md` … `../docs/15-demo-script.md`
3. `.hermes/plans/plan-chunks/` (07–15, 20–21)
4. `.hermes/plans/phase-2-repeat-orchestrator-prompt.md`
5. `../docs/research/agent-research-assignments.md` (orchestrator + index)

## OpenSrc gate

Before closing any wave, confirm assignee ran their section’s `rg` / key-file reads from `../docs/research/agent-research-assignments.md` (or documented equivalent if paths missing).

## Parent / task IDs

- Reconcile **one** Phase 2B parent: `t_1249ee6d` (prompt) vs any other parent (e.g. `t_faaff575`) so children are not split.
- Wave map: A `t_847a1d9f`…`t_6bec0d44`, B `t_1eb39523`, `t_c62c7efb`, C `t_3d40341e`…`t_921f1e76`, D `t_842636d0`…`t_f0788160` — verify live IDs with `hermes kanban list`.

## Step-by-step

1. **Pre-flight:** bridge health, `scripts/aegis-model.sh status`, `smoke-scaffold.sh`, `npm run build --prefix apps/web`, `forge test`, reclaim stale RUNNING.
2. **Gap audit:** run `AEGIS_BASE_URL=... ./tests/curl-demo.sh`; note failures vs `../docs/04-api-spec.md`.
3. **Kanban:** ensure each A–D child has assignee, workspace, body (allowed paths, doc § refs, acceptance curl, OpenSrc line, fallback).
4. **Dispatch:** `hermes kanban dispatch --max 2`; poll list + `http://127.0.0.1:9119`.
5. **Per wave:** collect files changed, commands, test output, **commit SHA**; update `docs/AI_COLLABORATION_LOG.md` requirement satisfied by workers.
6. **Demo gate:** `/demo/agent` (5 scenarios, `docs/15-demo-script.md`), `forge test`, `npm run build`, `curl-demo.sh`; **`onChainPolicyHash`** or **documented D3 blocker** (no fake hash).
7. **No** git push, Vercel, or chain deploy without explicit human approval. **Never** put keys/passwords in cards or plans.

## Risks

- Parent ID drift; stale workers; bridge 502 — unblock before dispatch.

## Validation

Orchestrator success = demo gate green or explicit blocked reason with owner and next action.
