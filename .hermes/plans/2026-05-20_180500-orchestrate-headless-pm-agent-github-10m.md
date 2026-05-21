# Orchestrate headless 24/7 PM → @agent loop + GitHub “until green” + 10m Telegram output

**Profile:** `aegis-orchestrator` (PM owns cadence, sequencing, and status; specialist profiles own vertical implementation)  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon` (infra-only items on `aegis-kit` if needed)  
**Authoritative product scope:** kit-root `../plan.md` + `../docs/04-api-spec.md` … `../docs/15-demo-script.md` + `.hermes/plans/plan-chunks/` (§7–15, 20–21) + `2026-05-20_174800-agent-*.md` + `2026-05-20_183045-plan-md-fullscope-blocked-kanban.md`  
**Prior headless PM doc:** `.hermes/plans/2026-05-20_141254-headless-pm-orchestrator-10m.md` (architecture + non-negotiables — this file **extends** it for GitHub iteration and explicit @agent orchestration)

## Goal

Run a **durable** product-manager loop that:

1. **Orchestrates @agent work** (Hermes Kanban workers + Cursor bridge **`CURSOR_BRIDGE_MODE=agent`**) through **plan → analyze → build → test → integrate** per task.
2. **Iterates on GitHub** (branch, PR, checks, fix commits) until **local gates + PR checks** are green — without bypassing **secrets**, **main protection**, or **deploy/chain** approval bars.
3. **Returns output to you every 10 minutes** via Telegram **`origin`** while the program is active — implemented as the **script-only** cron path already in the kit (`aegis-pm-tick-10m.sh` + `install-aegis-pm-cron-10m.sh`) for reliable cadence.

**Interpretation of “@agent”:** Kanban-assigned worker runs (e.g. `aegis-backend-rpc`, `frontend`, `qa`) whose execution agent is **headless Cursor** behind `http://127.0.0.1:8787/v1`, **not** “you manually typing in the IDE” unless you choose that fallback.

## Current context / assumptions

- **Bridge health** and **`bridgeMode: agent`** are required before `dispatch` spawns coding workers; on **502 / model errors**, PM status reports **stop + no dispatch** (do not hammer the gateway).
- **Kanban protocol:** every worker run must end with **`kanban_complete`** or **`kanban_block`** (reason). Anything else causes **protocol violation** and poisons the queue — PM loop must **reclaim** zombies after confirmed death.
- **10m output:** the installed job is **`--no-agent`** + **`--script aegis-pm-tick-10m.sh`** — it posts **deterministic** board/stack/gate hints, not full LLM prose. Add a **separate** weekly or on-demand LLM digest if you need narrative summaries (keeps Telegram from stalling on long completions).

## Non-negotiables (even with “push until it works”)

| Rule | Rationale |
|------|-----------|
| **No force-push to `main` / `master`** | Irreversible; kit + user git safety. |
| **No autonomous `git push` to any remote until a written allow gate is true** | Default: each push wave needs **explicit human approval** in-session or a **time-boxed** `DECISIONS.md` entry naming **branch + window** (see Phase 3). |
| **No secrets** in Kanban bodies, cron text, Telegram, or `gh` logs pasted back | API keys, `CURSOR_API_KEY`, wallet passwords, forge keystores stay in **env / OS secret store** only. |
| **No chain deploy / D3** without separate human approval | Same bar as Phase 2B D3. |

## Proposed architecture (layers)

```text
every 10m (Hermes cron, --no-agent)
  → ~/.hermes/scripts/aegis-pm-tick-10m.sh
  → stdout delivered to Telegram origin
       (board stats, running/ready lines, bridge health, next actions)

parallel / on-demand (human or thicker Hermes tick)
  → hermes kanban dispatch --max 2
  → workers (@agent profiles) via Cursor agent
  → commits locally; integrate; push/PR only inside Phase 3 allow gate
```

## Step-by-step — PM loop (what runs continuously)

### A. Preconditions (one-time)

1. **`loginctl enable-linger`** where applicable; user systemd **hermes-gateway** + **kiro-openai-bridge** active.
2. `curl -sf http://127.0.0.1:8787/health` → expected **`provider`**, **`bridgeMode`**, **`configured`**.
3. Telegram **`/set-home`** so **`--deliver origin`** reaches you.
4. Install **10m status** cron from kit:

   ```bash
   ~/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh
   ```

5. Verify: `hermes cron list` contains **`aegis-pm-tick-10m`**, then wait ≤10m or run `~/.hermes/scripts/aegis-pm-tick-10m.sh` manually to preview the next Telegram body.

### B. Every 10 minutes (automatic — your “return output”)

The script posts a fixed template (see `scripts/aegis-pm-tick-10m.sh`):

- UTC timestamp  
- Board **`stats`** for `aegis-hackathon`  
- **Running** / **ready** lines (grep-filtered list)  
- **Blocked** count  
- Bridge + **`hermes-gateway`** + **`kiro-openai-bridge`** systemd hints  
- **Next actions** (dispatch if `ready`, else unblock/complete guidance)

**Optional enhancement (not required for MVP):** extend the script to append **last local `git` short SHA** for `AEGIS_RPC_ROOT` and **`gh pr checks`** one-liner for a pinned PR — keep runtime **<15s** so cron stays reliable.

### C. Work loop inside each @agent / worker (plan → … → integrate)

For each claimed task:

1. **Plan** — Open `Plan: .hermes/plans/2026-05-20_174800-agent-<slug>.md` (and `Detail:` lines for frontend). Map slice to **`../plan.md`** + kit `docs/` + `plan-chunks/`.
2. **Analyze** — Read-only discovery limited to paths in the plan; note acceptance curls from `tests/curl-demo.sh` + `docs/15-demo-script.md`.
3. **Build** — Minimal diff; **one commit per work package** where team rules apply; `docs/AI_COLLABORATION_LOG.md` row when required.
4. **Test** — `forge test`; `npm run build --prefix apps/web`; `./tests/curl-demo.sh` with **`AEGIS_BASE_URL`** matching **real dev port** (3000 vs 3020 — align before declaring green).
5. **Integrate** — Rebase/merge feature branch locally; resolve conflicts; run gates again.
6. **Close** — **`kanban_complete`** (files, commands, SHAs) or **`kanban_block`** (approval / external dep / spec ambiguity).

### D. Dispatch until `ready` is drained (manager mind, bounded concurrency)

```bash
hermes kanban --board aegis-hackathon stats
# while ready > 0 and bridge OK:
hermes kanban --board aegis-hackathon dispatch --max 2
```

**Stuck `RUNNING`:** confirm process dead → `hermes kanban reclaim <id>` → re-queue or block with reason.

## Phase 3 — GitHub “until it works” (push / PR / CI loop)

**Default (safest):** workers **commit locally**; **10m status** includes “**READY_TO_PUSH**” with branch name + summary; **you** reply in Telegram / Cursor with **one-line approval**, then a worker or you runs `git push -u origin <branch>` and `gh pr create` / `gh pr checks`.

**Standing approval (only if you explicitly record it):** append to **`aegis-rpc/DECISIONS.md`** (human-authored) a dated stanza:

- **Branch allowlist** (e.g. `feature/aegis-phase2b-automation`)  
- **Time window** or **milestone** (“until PR #N merged” / “until 2026-05-22”)  
- **Forbidden operations** (no `--force`, no `main` direct push)

Then the orchestrator **may** `git push` / update PR **only** inside that envelope. Revoke by editing `DECISIONS.md`.

**Until green loop (after push exists):**

1. `gh pr checks <PR>` — on failure, spawn **`qa`** task with log excerpt (no secrets).  
2. Fix → commit → push (still within allowlist branch).  
3. Repeat until green **or** `kanban_block` with external blocker (billing, org policy).

## Definition of done (aligned with `plan.md` + MVP cut)

- **`/demo/agent`** path per `docs/15-demo-script.md`  
- **`forge test`**, **`npm run build`**, **`curl-demo.sh`** green at pinned base URL  
- Policy: deterministic **`SAFE|WARN|BLOCK`**, **`reasonCode`** on **`BLOCK`**, audit event per decision  
- **`onChainPolicyHash`** visible **or** D3 remains **blocked** with documented reason  

## Files / systems touched

| Area | Path / command |
|------|----------------|
| 10m install | `~/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh` |
| 10m script | `~/.hermes/scripts/aegis-pm-tick-10m.sh` (copied from `scripts/aegis-pm-tick-10m.sh`) |
| Push policy record | `aegis-rpc/DECISIONS.md` (optional allow gate) |
| Worker plans | `aegis-rpc/.hermes/plans/2026-05-20_174800-agent-*.md` |
| Blocked reconciliation | `aegis-rpc/.hermes/plans/2026-05-20_183045-plan-md-fullscope-blocked-kanban.md` |

## Risks / tradeoffs

| Risk | Mitigation |
|------|------------|
| LLM in cron stalls gateway | Use **`--no-agent`** script cron for 10m; keep LLM work on Kanban workers. |
| “Push until works” vs safety | **Branch allowlist + DECISIONS.md time box**; never auto-merge `main` without human. |
| `rg` missing on PATH for script | Install **ripgrep** or patch script to `grep` fallback on your host. |
| Model 502 | Status reports error; **no dispatch** until health recovers. |

## Open questions (resolve once)

1. **Canonical dev port** for `AEGIS_BASE_URL` (document in `HACKATHON.md` / worker plans).  
2. **Single PR** vs **one PR per wave** (smaller reviews vs fewer clicks).  
3. Whether to add **`gh pr checks`** to the 10m script (slightly slower but higher signal).

## After this plan (execution)

1. Run **`scripts/install-aegis-pm-cron-10m.sh`** once — you get **Telegram every 10 minutes** with board + stack status.  
2. Keep **`hermes kanban dispatch --max 2`** in a **Cursor Agent** or **Hermes tool** session when `ready > 0`.  
3. Record **push approval** in **`DECISIONS.md`** if you want automation beyond “human types push OK each time”.

---

**Saved path:** `aegis-rpc/.hermes/plans/2026-05-20_180500-orchestrate-headless-pm-agent-github-10m.md`
