# Sub-plan — aegis-pitch — PABTI judge narrative (t_de0a2c1b)

**Kanban:** t_de0a2c1b  
**Parent:** t_e69aadd4  
**Refs:** kit `plan.md` §2 Judging Criteria Strategy, §21 Demo Script, §22 Competitive Analysis, §24 README Draft; `.hermes/plans/2026-05-20_174800-agent-pitch.md`

## Plan

Confirm pitch docs exist; tighten README to §24 voice; extend GRILL_QA with §22 objection handlers; point judges to `docs/JUDGE_NARRATIVE.md`.

## Analyze

README already had stack + routes; missing §24 tagline, disclaimer block, and explicit deploy placeholders. GRILL_QA had five core questions; §22 adds Flashbots, Tenderly, Defender, GoPlus, Forta angles.

## Build

Edit `README.md`, `docs/GRILL_QA.md` only.

## Debug / Test

`forge test`; `npm run build --prefix apps/web`; `AEGIS_BASE_URL=... ./tests/curl-demo.sh` when API up (smoke optional if port busy).

## Integrate

Kanban comment to parent: plan path + ready line; complete with metadata.

## Done when

README claims match HACKATHON surfaces; no security snake oil.
