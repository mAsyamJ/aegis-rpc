# Orchestration plan — `plan.md` v4 → every agent task, `/plan` handoff, execute loop

**Saved:** plan skill (planning only; no code or Kanban mutations in this turn)  
**Profile:** `aegis-orchestrator`  
**Authoritative spec:** `/home/asyam/dev/Project/aegis-hackathon-kit/plan.md` (v4 masterplan; full doc is large — use **MVP cuts** via `aegis-rpc/HACKATHON.md`, `ORCHESTRATOR.md`, `DECISIONS.md`, and **plan-chunks** §7–15, 20–21)  
**Workspace (Kanban):** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon`  
**Existing per-agent execution plans:** `.hermes/plans/2026-05-20_174800-agent-*.md` (12 files)  
**Kit API / demo authority:** `../docs/04-api-spec.md` … `../docs/15-demo-script.md`  
**OpenSrc / research gate (task bodies):** `../docs/research/agent-research-assignments.md`

---

## Goal

1. **Orchestrate** implementation of **`plan.md` v4** in `aegis-rpc` without treating the entire 26-section document as one undifferentiated backlog.  
2. **Create one Kanban child per agent vertical** (below), each tied to the correct **`plan.md` TOC sections** and kit docs.  
3. Enforce the **handoff protocol**: each worker **writes its own `/plan`** (worker-local markdown under `.hermes/plans/` or comment attachment) → **submits summary + path to orchestrator** → orchestrator **gates scope** → worker **executes** (analyze → plan → build → debug → test) → **returns** with files, commands, test output, commit SHA, and **`hermes kanban complete`** or **`hermes kanban block`** with reason.  
4. Close the **demo gate** aligned with `plan.md` §21 and `docs/15-demo-script.md` (five scenarios, `/demo/agent` lead path).

---

## Current context / assumptions

- **Non-negotiables** (from `aegis-rpc/AGENTS.md` + `plan.md` §Core Rule): deterministic policy → `SAFE` / `WARN` / `BLOCK`; AI explains only; every decision → audit event; every `BLOCK` → `reasonCode`; Chainlink = **one** adapter story among many.  
- **Orchestrator does not implement product code** in the same breath as sequencing; coding belongs to **profile workers** (Cursor bridge `agent` or Hermes workers).  
- **Deploy / push / secrets:** no on-chain deploy, no `git push`, no keys or wallet passwords in Kanban bodies, Telegram, or plans — per `DECISIONS.md` and kit rules. **D3-style** tasks stay **blocked** or **`kanban_block`** until explicit human approval and local-only credentials.  
- **Hivemind:** org memory is shared across Cursor, Hermes, Codex; Kiro uses Hivemind via MCP (runtime truth for stakeholders).

---

## `plan.md` section → agent ownership matrix

Use this when writing **Kanban titles** and **first line of body** (`Plan: …`).

| Agent profile (Hermes assignee) | Primary `plan.md` § | Secondary § | Notes |
|----------------------------------|---------------------|---------------|--------|
| **aegis-orchestrator** | §18–19, §25 | §1–6 (scope) | Sequencing, cuts, Kanban hygiene, wave reports; no solo coding. |
| **backend-rpc** | §8 | §5–6, §12 (routing) | `/api/rpc`, `/api/preflight`, passthrough vs intercept. |
| **tx-decoder** | §9 | §8 | Intents, selectors, ERC20 paths, `isUnknownSelector`. |
| **policy-engine** | §10 | §9, §11 | JSON policies, templates, verdict engine. |
| **adapter** | §11 | §10, §12 | `AdapterSignal`, Chainlink + other adapters; **one** Chainlink narrative. |
| **database** | §13 | §8, §10 | Audit schema, events, persistence of decisions + AI memo refs. |
| **ai-memo** | §14 | §10 | Four-role pipeline; **after** policy; fallbacks; no verdict override. |
| **frontend** | §7 | §21 | OpsRisk UI, `/demo/agent`, landing vs dashboard (see `2026-05-20_202600-frontend-landing-reown-dashboard.md`). |
| **smart-contract** | §15 | §20 | Foundry contracts, registry, feeds; deploy **approval-gated**. |
| **qa** | §20 | §21 | `forge test`, `npm run build`, `tests/curl-demo.sh`, scenario checklist. |
| **pitch** | §24, §22–23 (cuts) | §21 | README, judge path, demo script alignment. |
| **security** (review gate) | §10–11, §14–15 | — | Review after vertical slices; no duplicate implementation ownership. |

**MVP filter:** For anything beyond 24H scope, default to **`HACKATHON.md`** + **`ORCHESTRATOR.md`** + **`plan.md` §25 Final Cut List** — orchestrator records **explicit cut** in wave report rather than spawning endless children.

---

## Proposed approach

### Phase 0 — Orchestrator baseline (read-only + one parent epic)

1. Read `aegis-rpc/ORCHESTRATOR.md`, `DECISIONS.md`, `HACKATHON.md`.  
2. Ensure **one open parent** epic for “`plan.md` v4 closure” (reuse existing Phase 2B parent if still the canonical epic; avoid duplicate open parents).  
3. Snapshot board: `hermes kanban --board aegis-hackathon stats`.

### Phase 1 — Create / refresh Kanban children (one per agent row above)

For **each** agent profile, ensure a **`ready`** task exists (create if missing) with body structured as:

```text
Plan: .hermes/plans/2026-05-20_174800-agent-<slug>.md
plan.md: §<list>
Kit docs: ../docs/0X-....md (list)
OpenSrc: <one line from agent-research-assignments.md for this vertical>
Workspace: dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc
Acceptance: <curl / forge / build lines from qa plan + HACKATHON>
Parent: <epic-id>
```

**Slug map:** `aegis-orchestrator`, `backend-rpc`, `tx-decoder`, `policy-engine`, `adapter`, `database`, `ai-memo`, `frontend`, `smart-contract`, `qa`, `pitch`, `security-review` (security review as **gate** task after others complete or per-wave).

**Frontend depth:** add second line `Detail: .hermes/plans/2026-05-20_202600-frontend-landing-reown-dashboard.md` on the **frontend** card only.

### Phase 2 — Handoff loop (each agent cycle)

For each dispatched worker:

1. **Worker `/plan`:** Worker writes `aegis-rpc/.hermes/plans/YYYY-MM-DD_HHMMSS-<agent>-<short-slug>.md` (concrete steps, files, tests) — *this is the agent’s plan artifact*, distinct from the static `174800` template.  
2. **Submit to orchestrator:** Message or Kanban comment: path to plan + estimated scope + risks.  
3. **Orchestrator gate:** Conflicts, duplicate files, or cuts vs `plan.md` §25 — reply approve / narrow / defer.  
4. **Execute:** Analyze → build → debug → test (agent mode; bridge `CURSOR_BRIDGE_MODE=agent` if using Cursor).  
5. **Return package:**  
   - Files changed (paths)  
   - Commands + exit codes  
   - Test output summary  
   - Commit SHA (if committed)  
   - `docs/AI_COLLABORATION_LOG.md` row if policy requires per commit  
6. **Close protocol:** `hermes kanban complete <id>` or `hermes kanban block <id> --reason "…"` — **never** exit worker without one of these.

### Phase 3 — Dispatch cadence

- `hermes kanban --board aegis-hackathon dispatch --max 2`  
- Reclaim stale `RUNNING` if workers died without complete/block.  
- Optional: user systemd `aegis-kanban-dispatch.timer` only when you want **automated** dispatch when `ready > 0` and bridge healthy.

### Phase 4 — Demo gate (orchestrator-owned checklist)

- `npm run build` in `apps/web`  
- `forge test` in `contracts`  
- `AEGIS_BASE_URL=http://127.0.0.1:<port> ./tests/curl-demo.sh`  
- Manual or scripted: **`/demo/agent`** five scenarios per `docs/15-demo-script.md`  
- **`onChainPolicyHash`** visible **or** deploy task **`kanban_block`** with documented approval/credential blocker (no fake hash).

---

## Files likely to change (by agent — indicative)

- **backend-rpc / tx-decoder / policy / adapter:** `apps/web/src/app/api/**`, `apps/web/src/lib/**` (routes, engine, adapters).  
- **database:** migrations / Supabase client / audit repositories as present in repo.  
- **ai-memo:** memo prompts, async pipeline, template fallback.  
- **frontend:** `apps/web/src/app/**`, layout groups, dashboard components.  
- **smart-contract:** `contracts/**`, `script/**`, `foundry.toml`.  
- **qa:** `tests/**`, `package.json` scripts.  
- **pitch:** `README.md`, `docs/**` in app repo.  
- **Orchestrator:** Kanban comments only + optional `.hermes/plans/*` status logs (no product code).

---

## Tests / validation

| Layer | Command / check |
|-------|------------------|
| Contracts | `cd contracts && forge test` |
| Web | `npm run build --prefix apps/web` |
| API demo | `AEGIS_BASE_URL=... ./tests/curl-demo.sh` |
| Bridge | `curl -sf http://127.0.0.1:8787/health` |
| Board | `hermes kanban --board aegis-hackathon stats` |

---

## Risks, tradeoffs, open questions

- **`plan.md` size:** Workers must **not** load the whole file into one prompt; use **plan-chunks** + single § anchor per task.  
- **Duplicate Kanban tasks:** If Phase 2B modules already `done`, new children should be **gap / tech-debt / §25 cuts** titles — avoid re-dispatching completed work without a new scope line.  
- **D3 deploy:** Separate **`kanban_block`** reason until human approves; never paste forge password or private key into chat or cards.  
- **502 / model errors:** Workers should **`kanban_block`** with “bridge unavailable” rather than vanish (prevents protocol violations).

---

## After this plan (execution turn — not part of plan skill)

1. Run Hermes `kanban create` / `edit` / `link` as needed to materialize the matrix rows.  
2. `dispatch --max 2` until `ready` is empty or blocked on approval-only items.  
3. Security review task last: `.hermes/plans/2026-05-20_174800-agent-security-review.md`.

---

**Identity (runtime copy):** Hermes Agent runtime using a **local Cursor bridge** provider. **Hivemind:** yes — shared org memory across Cursor, Hermes, and Codex; Kiro uses Hivemind via MCP.
