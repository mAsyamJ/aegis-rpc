# Orchestrate all agents from `plan.md` — Kanban tasks, per-agent `/plan`, PABTI handoff

**Saved:** 2026-05-21 (plan skill — planning only; no code, no Kanban mutations in this turn)  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon`  
**Authoritative spec:** kit-root `../plan.md` (v4 masterplan TOC §1–26; execution loads **chunks**, not the full file in one prompt)

---

## Goal

1. **Orchestrator** breaks kit **`plan.md`** into **Kanban-ready work** (one epic parent + children), scoped by **`HACKATHON.md`**, **`ORCHESTRATOR.md`**, **`DECISIONS.md`**, **`../docs/04-api-spec.md`–`15-demo-script.md`**, and **`.hermes/plans/plan-chunks/`** (§7–15, 20–21 as already split in-repo).
2. **Every swarm agent** from `aegis-rpc/AGENTS.md` gets **at least one** `ready` task with a **stable first-line plan pointer** and **`plan.md` section refs**.
3. Each worker runs an **internal `/plan`** (writes **their own** timestamped `.hermes/plans/YYYY-MM-DD_HHMMSS-<agent>-<slug>.md`), **submits that path to the orchestrator**, then runs **Plan → Analyze → Build → Debug → Test → Integrate** (PABTI “I” = integrate + close), and **returns** a standard report before **`kanban_complete`** / **`kanban_block`**.
4. **Orchestrator** merges sequencing, resolves cross-agent conflicts, and gates **demo / security / deploy** milestones.

---

## Current context / assumptions

- **Hivemind (Deeplake):** shared org memory across Cursor, Hermes, Codex; Kiro via Hivemind MCP — use for “did we already decide X?” not for secrets.
- **Inference:** workers may use Cursor bridge at `http://127.0.0.1:8787/v1` with `CURSOR_BRIDGE_MODE=agent` when implementation is expected; orchestration status can stay script-only (`aegis-pm-tick-10m.sh`) per existing kit docs.
- **Board state may already be mostly `done`** with **D3 deploy gated** — this plan still defines the **canonical matrix** for **new** waves or **re-opened** gaps after scope changes.
- **Non-negotiables** (from `AGENTS.md` + `plan.md` §4): deterministic policy → `SAFE` / `WARN` / `BLOCK`; AI explains only; every decision → audit event; every `BLOCK` → `reasonCode`; Chainlink = **one** adapter story; lead demo path **`/demo/agent`**.
- **No** wallet passwords, private keys, API keys, or forge keystores in Kanban bodies, comments, Telegram, or plan text — deploy remains **human-approved** per `DECISIONS.md`.

---

## Proposed approach

| Layer | Responsibility |
|--------|----------------|
| **Spec** | `../plan.md` + kit `docs/04`–`15` + `plan-chunks/` + MVP cuts in `HACKATHON.md` / `ORCHESTRATOR.md` |
| **Stable worker brief** | Existing batch: `.hermes/plans/2026-05-20_174800-agent-<slug>.md` (12 files) — **do not fork**; extend with **new timestamped** child plans only when scope drifts |
| **Per-run worker plan** | Each assignment: worker writes **new** `2026-__-___*-<role>-<task>.md` under `.hermes/plans/` before coding |
| **Kanban** | One Phase parent; children = one row per agent-slice; `hermes kanban dispatch --max 2` until `ready` empty |
| **Closeout** | Worker ends only with **`hermes kanban complete`** or **`hermes kanban block`** + reason — no silent exit |

---

## `plan.md` § → agent matrix (every role gets a home)

Use this when **creating** or **auditing** Kanban titles. Map **primary** owner; orchestrator files **dependencies** in the child body (e.g. policy before AI memo).

| Agent (Kanban assignee profile) | Primary `plan.md` sections | Kit docs / chunks | Stable brief file |
|---------------------------------|---------------------------|-------------------|---------------------|
| **aegis-orchestrator** | §18–19, §25–26 + sequencing | `ORCHESTRATOR.md`, `DECISIONS.md`, `phase-2-repeat-orchestrator-prompt.md` | `2026-05-20_174800-agent-aegis-orchestrator.md` |
| **backend-rpc** | §8, §5 (gateway), §4 modules | `../docs/04-api-spec.md`, `../docs/05-*` as listed in orchestrator | `2026-05-20_174800-agent-backend-rpc.md` |
| **tx-decoder** | §9 | plan-chunks `09-*`, decoder APIs in `04` | `2026-05-20_174800-agent-tx-decoder.md` |
| **policy-engine** | §10 | policy shapes in `04` / `10` kit docs | `2026-05-20_174800-agent-policy-engine.md` |
| **adapter** | §11 (Chainlink + other adapters as MVP allows) | adapter contracts + freshness story | `2026-05-20_174800-agent-adapter.md` |
| **database** | §13 | audit schema, events | `2026-05-20_174800-agent-database.md` |
| **ai-memo** | §14 | AI **after** policy; four-role v4 design | `2026-05-20_174800-agent-ai-memo.md` |
| **frontend** | §7, §21 (demo UX) | `../docs/15-demo-script.md`, deep UI plan below | `2026-05-20_174800-agent-frontend.md` + **Detail:** `2026-05-20_202600-frontend-landing-reown-dashboard.md` |
| **smart-contract** | §15, §17 (on-chain) | Foundry layout in `aegis-rpc/contracts` | `2026-05-20_174800-agent-smart-contract.md` |
| **qa** | §20, §21 | `tests/curl-demo.sh`, `forge test`, `npm run build` | `2026-05-20_174800-agent-qa.md` |
| **pitch** | §2, §24, judge path | README, demo narrative | `2026-05-20_174800-agent-pitch.md` |
| **security** (review gate, not default implementer) | Cross-cutting §10–12, §14–15 | threat model, adapter freshness, AI ordering | `2026-05-20_174800-agent-security-review.md` |

**Optional ops profile** (e.g. `aegis-devops`): only **D3**-class tasks — Base Sepolia **deploy / verify** after explicit human approval; never holds product code ownership for policy/RPC core.

---

## Kanban child template (orchestrator copies into each task body)

**Line 1 (required):**

```text
Plan: .hermes/plans/2026-05-20_174800-agent-<slug>.md | plan.md: §<n>[,§n…] | Parent: <epic_id>
```

**Line 2 (frontend only):**

```text
Detail: .hermes/plans/2026-05-20_202600-frontend-landing-reown-dashboard.md
```

**Then bullets:**

- **Scope / allowed paths:** (glob list — prevents agents editing unrelated packages)
- **Acceptance:** exact commands (`forge test`, `npm run build --prefix apps/web`, `AEGIS_BASE_URL=… ./tests/curl-demo.sh`, scenario IDs from `../docs/15-demo-script.md`)
- **OpenSrc gate:** one line from `../docs/research/agent-research-assignments.md` for that vertical
- **Dependencies:** upstream task IDs or “blocked until orchestrator approves merge order”
- **Out of scope:** Vercel prod, mainnet, autonomous `git push` — unless `DECISIONS.md` records an allowlist **and** human says go

---

## Handoff loop (each agent cycle)

1. **Orchestrator** moves task to `ready` (or creates child), correct assignee, correct parent.
2. **Dispatch:** `hermes kanban --board aegis-hackathon dispatch --max 2` (repeat while `ready > 0` and bridge healthy).
3. **Worker — Plan (sub-`/plan`):** write `aegis-rpc/.hermes/plans/<timestamp>-<role>-<short-slug>.md` containing: goal, files to touch, tests, risks, **≤10 line** summary for orchestrator.
4. **Worker — post to orchestrator channel:** first line = path to **timestamped** plan; second line = “ready to execute” or “blocked on dependency X”.
5. **Orchestrator gate:** ACK or reorder; resolve file conflicts between agents (single writer per package if needed).
6. **Worker — Analyze → Build → Debug → Test → Integrate:** implement, run tests locally, update `docs/AI_COLLABORATION_LOG.md` when the repo requires it for AI-assisted commits.
7. **Worker — Return package to orchestrator:**

   - Files changed (paths)
   - Commands + key output (pass/fail)
   - Commit SHA (if committed)
   - Demo impact (which `/demo/agent` step improved)
   - Follow-ups / debt

8. **Worker — Hermes close:** `hermes kanban complete <id>` **or** `hermes kanban block <id> --reason "…"` — **mandatory**; silent process exit = protocol violation.

9. **Orchestrator:** update epic comment, run **wave demo gate** when a vertical closes, schedule **security** plan after Wave D–class work or before “phase done”.

---

## Step-by-step (orchestrator runbook — execution outside this file)

1. Read `aegis-rpc/ORCHESTRATOR.md` + `DECISIONS.md` for current phase and **D3** gate wording.
2. Ensure **one** open epic parent for “`plan.md` execution wave N”; reparent stragglers.
3. For **each row** in the matrix above: ensure a Kanban child exists (create if missing) with the **template** filled.
4. Pre-flight: bridge health, `forge test`, `npm run build`, optional `curl-demo` (needs dev server + `AEGIS_BASE_URL`).
5. Dispatch loop until `ready == 0`.
6. **Security review** task: run checklist from `2026-05-20_174800-agent-security-review.md` before declaring phase complete.
7. **D3 / deploy:** only after human approval + local env — orchestrator does **not** put secrets in tickets.

---

## Files likely to change (during execution — not in this plan-only turn)

- `apps/web/**`, `packages/**` or `src/**` (per repo layout), `contracts/**`, `tests/**`, `docs/AI_COLLABORATION_LOG.md`, `README.md`
- New worker plans: `aegis-rpc/.hermes/plans/2026-*-*.md` (many small files — OK)

---

## Tests / validation (demo gate)

- `cd aegis-rpc/contracts && forge test`
- `npm run build --prefix apps/web`
- Dev server + `AEGIS_BASE_URL=http://127.0.0.1:<port> ./tests/curl-demo.sh`
- Manual: `/demo/agent` per `../docs/15-demo-script.md` (5 scenarios)
- **onChainPolicyHash** visible **or** D3 remains **blocked** with documented reason (no fake hash)

---

## Risks, tradeoffs, open questions

- **`plan.md` is larger than 24H MVP** — orchestrator must **cut** using `HACKATHON.md` / §25 Final Cut List; avoid spawning duplicate tasks for already-done modules.
- **Parallel agents** can conflict on shared files — use **allowed paths** per card or serialize conflicting lanes.
- **Hermes CLI** may not support bulk body edits — use **first-line Plan pointer** + **comments** if `body` edits are awkward.
- **502 / model availability** — workers should retry or `block` with reason; dispatch scripts should no-op when bridge is down (existing kit behavior).

---

## After this plan (explicitly *not* part of plan-only mode)

In a session with **mutating** tools: create/reconcile Kanban children from the matrix, run `dispatch`, let workers execute the handoff loop above, then run the demo gate and security review.

---

## Canonical references (no duplication)

- Master: `/home/asyam/dev/Project/aegis-hackathon-kit/plan.md`
- Swarm contract: `aegis-rpc/AGENTS.md`
- Stable per-agent briefs: `aegis-rpc/.hermes/plans/2026-05-20_174800-agent-*.md` (12 files)
- Frontend depth: `aegis-rpc/.hermes/plans/2026-05-20_202600-frontend-landing-reown-dashboard.md`
- Headless PM / PABTI operator docs: `2026-05-20_201500-headless-pm-pabti-orchestrate-agent-github-10m.md`, `2026-05-20_213000-pm-orchestrate-agent-github-until-green-10m-operator.md`
