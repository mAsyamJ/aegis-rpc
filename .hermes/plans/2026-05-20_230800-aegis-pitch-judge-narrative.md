# Sub-plan — aegis-pitch — Judge narrative (plan.md §2, §24)

**Kanban:** t_de0a2c1b  
**Parent:** t_e69aadd4  
**Source plans:** `.hermes/plans/2026-05-20_174800-agent-pitch.md`, kit `plan.md` §2 Judging Criteria Strategy, §24 README Draft

## Plan

1. Map §2 weights to one demo beat each (Originality / Problem-Solving / Completeness / Scalability).
2. Align `README.md` with §24 voice: programmable checkpoint, AI explains / policy decides, disclaimer, placeholders for deploy links.
3. Add `docs/GRILL_QA.md` (HACKATHON Phase 4) with honest judge Q&A; no security snake oil.
4. Add `docs/JUDGE_NARRATIVE.md` as spoken 30s / 2m cue sheet tied to `../docs/15-demo-script.md` (kit) without editing outside workspace.

## Analyze

- Product truths: `AGENTS.md` — Aegis RPC = product; Chainlink = one adapter; deterministic verdicts.
- README draft §24 uses pnpm/docker paths not in this repo; keep npm + `apps/web` + `forge` as source of truth.

## Build

- README + new docs only.

## Test

- `forge test` (contracts)
- `npm run build --prefix apps/web`

## Integrate

- `hermes kanban comment` on parent/orchestrator task with plan path + ready/blocked line per card protocol.

## Done when

- Pitch copy matches shipped demo surfaces (README routes match HACKATHON).
