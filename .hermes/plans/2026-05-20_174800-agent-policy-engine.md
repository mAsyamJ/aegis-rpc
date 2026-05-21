# Plan — Agent: policy-engine (Wave A)

**Profile:** `policy-engine`  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`

## Goal

Deterministic `evaluateTransaction()` (or equivalent) producing **SAFE / WARN / BLOCK**; **every BLOCK has `reasonCode`**; templates for approval-unknown-spender and related MVP rules.

## Read order

- `.hermes/plans/plan-chunks/10-10-policy-engine-design.md`
- Kit policy / preflight docs in `../docs/`
- `DECISIONS.md` for resolved thresholds

## OpenSrc gate

Run **policy-engine** block in `../docs/research/agent-research-assignments.md` (wallet-guard, Rabby risk, OZ approval patterns).

## Proposed approach

- Pure functions: inputs = `TxIntent` + adapter signals + registry snapshot; output = verdict + reasons
- Ordering: **no AI call** until verdict and audit context are fixed (memo runs after)
- Merge signals from **adapter** and (if present) simulation per chunk 12 — do not skip verdict engine boundary

## Files likely to change

- Policy package / services under `packages/` or `src/`
- Zod schemas for policy config if applicable

## Tests / validation

- Table-driven tests: BLOCK on `approve(MaxUint256)` unknown spender; SAFE happy path; WARN if spec requires
- Every branch emits audit payload shape expected by **database** agent

## Definition of done

- `reasonCode` on all BLOCKs
- Visible in dashboard via audit events (coordination with **frontend** / **database**)

## Security self-check

Cross-check rules vs OZ infinite approval semantics; document any deliberate demo simplification.
