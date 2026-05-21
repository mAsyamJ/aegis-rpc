# Full `plan.md` (v4) scope + blocked Kanban reconciliation

**Saved:** 2026-05-20 (plan skill — this file is the only deliverable for the `/plan` turn; implementation runs in a separate Agent session without plan-only constraints.)  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Authoritative product spec (kit root):** `../plan.md` (v4 masterplan; use chunks + `aegis-rpc/.hermes/plans/plan-chunks/` §7–15, 20–21 — do not load entire file in one prompt.)  
**Kit API / demo authority:** `../docs/04-api-spec.md` … `../docs/15-demo-script.md`  
**Orchestrator prompt:** `.hermes/plans/phase-2-repeat-orchestrator-prompt.md`  
**Per-agent execution plans:** `.hermes/plans/2026-05-20_174800-agent-*.md`  
**Frontend deep-dive plan:** `.hermes/plans/2026-05-20_202600-frontend-landing-reown-dashboard.md`

---

## Goal

1. **Ship everything in `plan.md` v4 that remains a product gap** in `aegis-rpc` (deterministic policy, adapters, AI memo after policy, audit trail, dashboard, contracts, tests, demo script parity).  
2. **Resolve Kanban attention debt:** twelve **`blocked`** tasks on board **`aegis-hackathon`** — either complete real remaining work, **`kanban_complete`** with evidence, or **`kanban_block`** with a crisp reason (never leave workers in protocol-violation limbo).  
3. **Keep non-negotiables:** no secrets in Kanban/plans/chat; **D3 deploy** only after explicit human approval; no fake `onChainPolicyHash`.

---

## Current context (2026-05-20 snapshot)

### Board vs code

From `hermes kanban --board aegis-hackathon list`:

- **Phase 2B wave tasks (A1–D4)** are predominantly **`done`** (A1–A5, B1–B2, C1–C3, D1, D2, D4, security gate, orchestrator follow-ups).  
- **Twelve tasks remain `blocked`** — see table below. Many are **legacy “Module 1–9”** titles that **overlap** completed Wave A–C / D1–D2 / QA work; treat as **board hygiene + verification**, not automatic re-implementation.  
- **`t_481e57d1` (D3: Deploy gated)** should stay **blocked** until a human explicitly approves testnet deploy + verify; card body should document **approval owner** and **zero secrets**.

### `plan.md` is larger than the MVP cut

`../plan.md` includes §16 Docker, §17 broad deployment, §22–26 business/competitive/README — **not all belong in the 24H MVP**. Align execution with:

- `aegis-rpc/HACKATHON.md`, `ORCHESTRATOR.md`, `DECISIONS.md`  
- Kit **`06-hackathon-scope-control`** mindset: demo-first, cut stretch before new platform features.

---

## Blocked tasks — needs attention matrix

| Task ID | Assignee | Title (summary) | Likely reality | Recommended next action |
|--------|----------|-----------------|----------------|-------------------------|
| `t_e9e04a4b` | aegis-backend-rpc | Module 1: `/api/rpc` | Wave **A1** done (`t_847a1d9f`) | Verify `POST /api/rpc` + audit + kit doc shape → **`kanban_complete`** as duplicate-of-wave with comment link to A1, or narrow gap if any curl fails |
| `t_ee91d134` | aegis-backend-rpc | Module 2: `/api/preflight` | Wave **A2**/pipeline done | Same: curl-demo + `docs/04-api-spec` → complete or file **one** concrete gap as new `ready` child |
| `t_829ec7ea` | aegis-tx-decoder | Module 3: Tx decoder | **A3** done | Verify decoder tests / preflight intents → complete duplicate or fix gap |
| `t_31d7ffa8` | aegis-policy-engine | Module 4: Policy engine | **A4** done | Verify BLOCK `reasonCode`, templates → complete or fix |
| `t_4b3bfb35` | aegis-adapter | Module 5: Adapter layer | **A5** partial in title | Verify all adapters + signals in dashboard → complete or fix |
| `t_5f7ff103` | aegis-adapter | Module 6: Chainlink adapter | Covered in A5 / adapter work | Verify stale-feed demo path per `docs/15-demo-script.md` → complete or fix |
| `t_60c1615a` | aegis-frontend | Module 7: RiskOps dashboard | **C1–C3** done | Run **frontend deep plan** (`2026-05-20_202600-…`) for polish; then complete Module 7 or spawn **C4** if scope explodes |
| `t_ebdb6701` | aegis-ai-memo | Module 8: AI memo | **B1–B2** done | Verify memo only post-policy, fallback templates → complete |
| `t_d1a55f7c` | aegis-smart-contract | Module 9: Base Sepolia proof | **D1** done | Verify `forge test`, registry/consumer wired, explorer links in README/pitch → complete |
| `t_b6b59592` | aegis-security | Module 4 review: policy FP | Security gate `t_059d4e99` **done** | Either **`kanban_complete`** “superseded by Phase 2B gate” or short delta review → `kanban_complete` / `kanban_block` with finding |
| `t_20e4aa1c` | aegis-qa | Module 1 QA: rpc curl | **D4**/curl-demo path | Run `tests/curl-demo.sh` on CI port; document command in card → complete |
| `t_481e57d1` | aegis-devops | **D3: Deploy gated** | Intentional | **`kanban_block`** until human approval; never put keys/passwords in card; after approval: Foundry script + Base Sepolia verify only |

---

## Proposed approach

### Phase A — Truth baseline (same day, QA-owned)

1. `curl -sf http://127.0.0.1:8787/health` (bridge + `bridgeMode` as needed).  
2. `cd aegis-rpc/contracts && forge test`  
3. `npm run build --prefix apps/web`  
4. `npm run dev` in `apps/web` (note port: **3000** vs **3020** — align `AEGIS_BASE_URL` with actual `next dev` / `npm run start`).  
5. `AEGIS_BASE_URL=http://127.0.0.1:<port> ./tests/curl-demo.sh`  
6. Manual: `/demo/agent` five scenarios per `../docs/15-demo-script.md`.

Log outputs in **`docs/AI_COLLABORATION_LOG.md`** (one row per work package if code changes).

### Phase B — Kanban hygiene (orchestrator-owned)

For each **Module 1–9** blocked row:

1. If behavior exists and tests pass → comment “**Superseded by** `t_<wave-task>`”, **`kanban_complete`**.  
2. If a real delta exists → **`kanban_block`** with reason + spawn **one** new `ready` child with acceptance curl (do not split into 9 parallel rewrites).

Keep **single narrative** on parent **`t_1249ee6d`** (Phase 2B epic already **done**): add a **final reconciliation comment** listing which legacy module IDs were closed vs which opened follow-ups.

### Phase C — `plan.md` v4 “full” product gaps (builder + frontend + contracts + pitch)

Map remaining **judge-visible** gaps from `../plan.md` sections:

| `plan.md` region | Primary owner | Notes |
|------------------|---------------|--------|
| §7 Frontend | `frontend` | Landing vs `(app)` shell, TanStack Query, Reown AppKit + wagmi per `2026-05-20_202600-…`; OpenSrc: `../docs/research/agent-research-assignments.md` §frontend |
| §8 API | `backend-rpc` | JSON-RPC + preflight shapes vs `../docs/04-api-spec.md` |
| §9 Decoder | `tx-decoder` | Unknown selector path → AI **after** policy |
| §10 Policy | `policy-engine` | `reasonCode` on every BLOCK |
| §11–12 Adapters + simulation | `adapter` | `forwardRpcCall(id, method, params)` signature correctness; simulation vs `eth_call` errors |
| §13 DB | `database` | Audit schema + retention for demo |
| §14 AI | `ai-memo` | Four-role pipeline, template fallback, never overrides verdict |
| §15 Contracts | `smart-contract` | Registry + feeds; tests |
| §20–21 Testing + demo | `qa` + `pitch` | `curl-demo`, README judge path |

Cut explicitly: full Docker production (§16), multi-cloud §17, long business treatise — replace with **README “stretch”** bullets if needed.

### Phase D — D3 deploy (only after approval)

1. Human signs off in writing (Telegram/repo issue).  
2. Use **local env / CI secrets** — never paste wallet password or private key into Kanban, plans, or Telegram.  
3. `forge script` + Base Sepolia verify; capture **tx hash** + **verified contract** links in pitch/README.  
4. Then **`kanban_complete`** `t_481e57d1` with links; confirm `onChainPolicyHash` appears in preflight per demo gate.

---

## Step-by-step (execution order for next Agent / workers)

1. Run **Phase A** checks; save failing logs to a single QA note if red.  
2. For each row in **Blocked tasks matrix**: verify → complete duplicate **or** open one scoped child.  
3. Run **Phase C** in vertical slices (one commit per package per repo convention).  
4. Re-run demo gate; fix until green.  
5. **`security`** profile: quick pass on policy/adapter changes (use `2026-05-20_174800-agent-security-review.md`).  
6. **D3**: only Phase D after approval.

---

## Files likely to change (indicative)

- `apps/web/**` — routes, layouts, Reown, dashboard, `/demo/agent`  
- `apps/web/src/lib/**` — adapters, policy, RPC forward helpers  
- `contracts/**`, `foundry.toml`  
- `tests/curl-demo.sh`, `tests/**`  
- `docs/AI_COLLABORATION_LOG.md`, `README.md`, `HACKATHON.md`

---

## Tests / validation

- `forge test`  
- `npm run build --prefix apps/web`  
- `./tests/curl-demo.sh` with correct `AEGIS_BASE_URL`  
- Manual `/demo/agent` per `../docs/15-demo-script.md`  
- Optional: `hermes kanban --board aegis-hackathon stats` → `blocked: 0` except transient, or **`blocked: 1`** only if D3 still legitimately gated with documented reason

---

## Risks, tradeoffs, open questions

- **Duplicate board rows** confuse workers; closing Module 1–9 after verification is faster than re-implementing.  
- **Port mismatch** (3000 vs 3020) causes false-negative curl-demo.  
- **Composer / bridge 502** — if model unavailable, workers must **`kanban_block`** with “infra” reason, not silent exit (avoids protocol violation).  
- **Scope creep:** “implement all of `plan.md`” ≠ implement every stretch contract; use **Final Cut List** in `plan.md` §25 with orchestrator sign-off.

---

## Security

- **Never** store wallet passwords, seed phrases, API keys, or forge keystores in Kanban bodies, `.hermes/plans/`, or chat.  
- Bridge stays **`127.0.0.1`** for `8787` in production-style setups.

---

## After this plan (explicit handoff)

To **implement**: open a **Cursor Agent** (or Hermes worker) session **without** plan-only mode and execute Phases A→D. This file is the roadmap; use `2026-05-20_174800-agent-<role>.md` for role-specific steps.
