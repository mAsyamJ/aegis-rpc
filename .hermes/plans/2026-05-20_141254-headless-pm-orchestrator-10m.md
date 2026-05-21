# Headless 24/7 product-manager orchestration (10-minute status)

**Profile:** `aegis-orchestrator` (PM loop owns sequencing; specialist profiles own verticals)  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon` (and `aegis-kit` for infra-only follow-ups)  
**Authoritative scope:** kit-root `plan.md` + `../docs/04-api-spec.md` … `../docs/15-demo-script.md` + `.hermes/plans/plan-chunks/` + `2026-05-20_174800-agent-*.md` + `2026-05-20_183045-plan-md-fullscope-blocked-kanban.md`  
**Model path (headless coding):** `kiro-openai-bridge` at `http://127.0.0.1:8787/v1` with **`CURSOR_BRIDGE_MODE=agent`** (Cursor Agent CLI/SDK); read-only fallback = `ask`.

## Goal

Run a **durable** orchestration loop that: **plan → analyze → build → test → integrate**, with board hygiene and demo gates, until the agreed cut of **`plan.md`** is green—**without** treating Telegram as a long-running shell.

**Human cadence:** a **structured status** to your home channel **every 10 minutes** while work is active (not a promise that *code* completes every 10 minutes).

## Non-negotiables (do not automate away)

- **No `git push`** to GitHub (and no force-push to `main`) **without explicit human approval** in the session or a written “push OK for branch X” instruction. Cron may **summarize** and **request** approval; it must not push autonomously.
- **No chain deploy / wallet secrets** in prompts, Kanban bodies, cron text, or Telegram. D3-style tasks stay **blocked** until approval.
- **Hivemind:** org memory is shared (Cursor, Hermes, Codex; Kiro via MCP). Status posts should stay **non-secret** (counts, SHAs, branch names, failing test names—never `.env` contents).

## Architecture (who does what)

| Layer | Role |
|-------|------|
| **Hermes gateway + cron** | Wakes orchestrator on a schedule; delivers short status to Telegram **`origin`** (requires `/set-home`). |
| **Hermes Kanban** | Durable queue: `ready` → `dispatch` → `running` → **`kanban_complete` / `kanban_block`** (mandatory—avoid protocol violation). |
| **Cursor via bridge (`agent`)** | Headless **implement / test / fix** in repo when a worker run is tied to that backend. |
| **You (human)** | Approve **push**, **deploy**, irreversible infra; resolve **ambiguous product** calls. |

```text
Cron (10m) → Hermes agent tick → list/stats/reclaim/dispatch/comment
                    ↓
            Kanban workers (profiles) → Cursor agent mode (8787) → commits in worktrees/branches
                    ↓
            Status template → Telegram origin
```

## Phase 0 — Preconditions (one-time)

1. **`loginctl enable-linger`** (WSL/user session) so user services survive logout where applicable.
2. **`aegis-dev`** (or `scripts/start-aegis-dev.sh`): gateway + bridge healthy; `curl -sf http://127.0.0.1:8787/health` shows expected **`provider`** and **`bridgeMode`**.
3. Telegram: **`/set-home`** so cron **`--deliver origin`** reaches you.
4. Board: single parent epic for the current phase; each task body or first **comment** line:  
   `Plan: .hermes/plans/2026-05-20_174800-agent-<slug>.md | Wave <A–D> | Parent: <id>`  
   Frontend depth: second line → `Detail: .hermes/plans/2026-05-20_202600-frontend-landing-reown-dashboard.md`

## Phase 1 — 10-minute status loop (Hermes cron)

**Intent:** Hermes posts a **compact** PM digest every **10 minutes** while the program is active—not 30 minutes (kit default `kanban-orchestrator-tick` is 30m; **add** a dedicated job for 10m or replace schedule after confirming Hermes accepts `every 10m` / cron expression).

Example (adapt to your Hermes CLI version; **schedule and prompt before flags** per kit doc):

```bash
hermes cron create 'every 10m' 'You are aegis-orchestrator PM (headless). Read-only unless tools allow: hermes kanban --board aegis-hackathon stats; hermes kanban --board aegis-hackathon list (truncated); reclaim obvious stale RUNNING if safe; dispatch --max 2 ONLY if ready>0 and bridge health OK; post structured STATUS (template below). Do NOT git push. Do NOT paste secrets. If bridge/model errors (502), report and stop dispatch.' \
  --name aegis-pm-tick-10m \
  --skill kanban-orchestrator \
  --deliver origin \
  --workdir /home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc
```

**Status template (every post):**

- **UTC time**
- **Board:** `aegis-hackathon` — `ready` / `running` / `blocked` / `done` counts
- **Running task IDs + assignee profile** (max 2 lines)
- **Last completed task** (id + one-line outcome) if any
- **CI local gate (last 10m):** `forge test` / `npm run build` / `curl-demo` **pass|skip|fail** (only if a worker ran them—otherwise “unchanged”)
- **Blockers:** bridge health, model 502, EADDRINUSE, **needs human: push approve / deploy approve**
- **Next two actions** (concrete)

**Guardrail:** Keep cron prompts **short**; long bridge runs can stall the gateway (see `docs/kit/02-hermes-24-7.md`).

## Phase 2 — Work loop (inside each worker / Agent session)

For each `running` task until `ready` is empty (subject to concurrency `--max 2`):

1. **Plan:** open the task’s `Plan:` path; align with `plan.md` slice and API docs.
2. **Analyze:** grep/read only what the plan lists; note acceptance **curl** from `tests/curl-demo.sh` and `docs/15-demo-script.md`.
3. **Build:** minimal diff; one commit per work package where the team rule applies; row in `docs/AI_COLLABORATION_LOG.md` when applicable.
4. **Test:** `forge test`; `npm run build --prefix apps/web`; `./tests/curl-demo.sh` with correct `AEGIS_BASE_URL` (dev server port must match).
5. **Integrate:** rebase/merge feature branch locally; resolve conflicts; **stop before push** unless human approved.
6. **Close protocol:** `kanban_complete` with summary (files, commands, SHAs) **or** `kanban_block` with **review-required** / **external dependency** / **approval-gated** reason.

## Phase 3 — GitHub until it works (human-gated)

1. Open **draft PR** early (`gh pr create --draft`) only when the human wants visibility—still no merge without review.
2. **`gh pr checks`** / CI: on red, spawn **`qa`** or **`aegis-builder`** task with failing log excerpt (no secrets).
3. **Push:** after explicit “push allowed for branch `feature/…`”, `git push -u origin HEAD` (never `main` force).
4. **Merge:** human or delegated with written rule.

## Phase 4 — Definition of done (per `plan.md` + MVP cut)

- **`/demo/agent`** scenarios per `docs/15-demo-script.md`
- **`forge test`** green; **`npm run build`** green; **`curl-demo.sh`** green at pinned `AEGIS_BASE_URL`
- **Policy:** deterministic `SAFE|WARN|BLOCK`; **`reasonCode`** on `BLOCK`; audit event on every decision
- **D3 / on-chain:** **`onChainPolicyHash`** visible **or** remains **blocked** with documented reason (no fake hash)

## Files and systems likely touched

- **Cron:** `~/.hermes/config.yaml` (if edited manually instead of CLI) — document changes
- **Scripts:** `~/.hermes/scripts/*` if you add a **non-agent** status script (lighter than full LLM tick)
- **Repo:** `aegis-rpc/**` per active Kanban task plans
- **Docs:** `docs/AI_COLLABORATION_LOG.md`, `HACKATHON.md`, `ORCHESTRATOR.md`

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| **Telegram + long agent runs** | Prefer **Kanban workers** + short cron **status-only** ticks. |
| **502 / model unavailable** | Cron reports; **do not dispatch**; optional fallback model in Hermes. |
| **Protocol violation** | Every worker **must** end with **complete** or **block**; reclaim zombies. |
| **Scope explosion** | **`plan.md` §25** / `HACKATHON.md` final cut list; orchestrator **closes duplicate** module tasks. |
| **Autonomous push** | **Forbidden** without approval—cron text must say so explicitly. |

## Open questions (resolve once, then encode in cron prompt)

1. Should **10m** ticks be **LLM-backed** (Hermes agent) or **script-only** (`hermes kanban stats` + curl health) with LLM only on **30m** deep review? (Script-only is more reliable for strict 10m cadence.)
2. Single remote: **origin** URL and default branch name for PR flow.
3. Maximum concurrent **`dispatch`** beyond 2? (Increase only if workers are isolated worktrees.)

## After this plan (execution handoff)

**Installed (kit):** run once on the machine:

```bash
~/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh
```

That copies `aegis-pm-tick-10m.sh` → `~/.hermes/scripts/` and registers **`aegis-pm-tick-10m`** (`every 10m`, `--no-agent`, `--deliver origin`). No `/reset` required.

Then: confirm **`hermes cron list`**, wait ≤10m for Telegram, or run `~/.hermes/scripts/aegis-pm-tick-10m.sh` manually to preview stdout.

---

**Saved path:** `aegis-rpc/.hermes/plans/2026-05-20_141254-headless-pm-orchestrator-10m.md`
