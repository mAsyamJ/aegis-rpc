# Headless 24/7 PM — orchestrate @agent (plan→integrate) + GitHub until green + 10m Telegram output

**Profile:** `aegis-orchestrator` (PM: cadence, Kanban hygiene, status, push/PR gates; specialists implement)  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon`  
**Authoritative scope:** kit-root `../plan.md` + `../docs/04-api-spec.md` … `../docs/15-demo-script.md` + `.hermes/plans/plan-chunks/` + `2026-05-20_174800-agent-*.md` + `2026-05-20_183045-plan-md-fullscope-blocked-kanban.md`  
**Prior detailed architecture:** `.hermes/plans/2026-05-20_180500-orchestrate-headless-pm-agent-github-10m.md` (read first — this file is the **operator checklist** and **non-negotiables** in one place)

## Goal

1. **Product-manager orchestration** — Keep Kanban **truthful** (`ready` / `running` / `blocked` / `done`), dispatch bounded concurrency, and ensure every worker run ends with **`kanban_complete`** or **`kanban_block`** (reason). Reclaim zombies after confirmed death.
2. **@agent execution** — Workers use **Cursor bridge** `http://127.0.0.1:8787/v1` with **`CURSOR_BRIDGE_MODE=agent`** (headless agent: plan → analyze → build → test → integrate per card).
3. **GitHub until it works** — Branch → PR → `gh pr checks` → fix loop until green, **without** force-push to `main`/`master`, **without** secrets in status, **without** autonomous chain deploy (D3).
4. **Return output every 10 minutes** — Hermes cron **`--no-agent`** + **`--script aegis-pm-tick-10m.sh`** posts **deterministic** status to Telegram **`origin`** (board stats, running/ready, blocked count, bridge/systemd, next actions). This is **not** a long LLM tick on the gateway.

## Current context / assumptions

- **10m output = script stdout**, implemented in the kit: `scripts/aegis-pm-tick-10m.sh` (copied to `~/.hermes/scripts/` by `scripts/install-aegis-pm-cron-10m.sh`). Cron: `hermes cron create 'every 10m' --name aegis-pm-tick-10m --deliver origin --script aegis-pm-tick-10m.sh --no-agent --workdir <aegis-rpc>`.
- **Heavy reasoning** stays on **Kanban workers** or **Cursor Agent sessions**, not inside the 10m cron (avoids gateway stalls and 502s).
- **`hermes kanban` CLI order:** `hermes kanban --board aegis-hackathon <subcommand>` (e.g. `list`, `stats`, `dispatch`).

## Non-negotiables

| Rule | Why |
|------|-----|
| No **force-push** to `main` / `master` | Irreversible; matches kit + user git safety. |
| **Default:** no `git push` / `gh pr create` until **explicit human approval** per wave | “Push until it works” means **iterate until checks pass**, not silent remote mutation. Optional **standing allowlist** only if recorded in **`aegis-rpc/DECISIONS.md`** (branch + time window + forbidden ops) — see `2026-05-20_180500-…` Phase 3. |
| No **secrets** in Kanban, cron text, Telegram, or pasted `gh` logs | Keys in env / OS store only. |
| No **on-chain deploy / D3** without separate approval | Same as Phase 2B. |
| Every decision → audit event; every `BLOCK` → `reasonCode`; AI explains only | Product swarm contract. |

## Proposed architecture (two lanes)

```text
Lane A — every 10m (Hermes cron, --no-agent)
  ~/.hermes/scripts/aegis-pm-tick-10m.sh
  → stdout → Telegram origin
     (UTC, board stats, running/ready lines, blocked count, bridge health, systemd, next actions)

Lane B — continuous / on-demand (orchestrator + workers)
  preflight bridge → dispatch --max 2 → @agent implements → gates → kanban_complete | kanban_block
  GitHub: local commits → (approval) → push → PR → gh pr checks → fix until green
```

## Step-by-step — what you run (operator)

### 0. One-time preconditions

1. User systemd: **`hermes-gateway`**, **`kiro-openai-bridge`** active; **`loginctl enable-linger`** where needed (WSL 24/7 caveats per kit docs).
2. `curl -sf http://127.0.0.1:8787/health` — `provider`, `bridgeMode: agent`, Cursor configured.
3. Telegram **`/set-home`** so **`--deliver origin`** reaches the right DM.
4. Install 10m PM tick:

   ```bash
   /home/asyam/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh
   ```

5. Verify: `hermes cron list` shows **`aegis-pm-tick-10m`**. Preview next message: `~/.hermes/scripts/aegis-pm-tick-10m.sh`

### 1. Every 10 minutes (automatic)

No action — Hermes fires the script. **You** read Telegram for: `ready` count, `running` lines, bridge OK/FAIL, suggested next command.

**Optional script hardening (future PR):** append short `git -C aegis-rpc rev-parse --short HEAD` and one-line `gh pr checks` for a pinned PR — keep wall clock **under ~15s** per tick.

### 2. Orchestrate @agent (manager loop)

1. `hermes kanban --board aegis-hackathon stats`
2. If bridge unhealthy or model 502 — **do not dispatch**; fix bridge/model first; 10m tick will show FAIL.
3. While **`ready > 0`**: `hermes kanban --board aegis-hackathon dispatch --max 2`
4. For each **`RUNNING`** without progress: confirm dead → `hermes kanban reclaim <id>` → re-dispatch or **`kanban_block`** with reason.
5. Worker protocol: close with **`kanban_complete`** (files, commands, test output, commit SHA) or **`kanban_block`**.

Per-task internal order (worker): **Plan** (card + `2026-05-20_174800-agent-*.md`) → **Analyze** (read-only, paths in plan) → **Build** (minimal diff; one commit per work package + `AI_COLLABORATION_LOG` when required) → **Test** (`forge test`, `npm run build --prefix apps/web`, `./tests/curl-demo.sh` with correct **`AEGIS_BASE_URL`**) → **Integrate** (merge/rebase locally) → **Close**.

### 3. GitHub “until it works”

1. After local gates green: **default** — 10m status can emit **READY_TO_PUSH** + branch name; human sends one-line approval in Telegram/Cursor.
2. Then: `git push -u origin <branch>`, `gh pr create` (if needed), loop **`gh pr checks`** → fix → commit → push (still within any **DECISIONS.md** allowlist if you added one).
3. Never paste tokens; use `gh auth` / env as documented.

### 4. Definition of done (aligned with `plan.md` + MVP)

- `/demo/agent` scenarios per `docs/15-demo-script.md`
- `forge test`, `npm run build` (apps/web), `curl-demo.sh` at pinned base URL
- `onChainPolicyHash` **or** D3 **blocked** with documented approval reason
- Security review pass per `2026-05-20_174800-agent-security-review.md` before calling program “closed”

## Files / scripts (already in repo — no code required this `/plan` turn)

| Artifact | Role |
|----------|------|
| `scripts/install-aegis-pm-cron-10m.sh` | Installs tick script + registers Hermes cron |
| `scripts/aegis-pm-tick-10m.sh` | 10m status body (stdout → Telegram) |
| `.hermes/plans/2026-05-20_180500-orchestrate-headless-pm-agent-github-10m.md` | Full architecture + Phase 3 push allowlist text |
| `.hermes/plans/2026-05-20_174800-agent-*.md` | Per-profile execution plans |

## Tests / validation

- Within **2×10m**: Telegram receives **Aegis PM status** with board + bridge lines.
- `hermes kanban --board aegis-hackathon stats` matches what the tick printed (same snapshot semantics).
- After a dispatch wave: workers end **complete** or **block**, not protocol violation.

## Risks / tradeoffs

- **502 / model unavailable** — dispatch idle; tick still runs and reports FAIL (do not spam completions on gateway).
- **Script vs narrative** — 10m posts are **structured**, not prose PM essays; add a separate weekly LLM digest if you need long narrative.
- **WSL / Windows host** — Telegram delivery still needs gateway up; Windows shutdown stops WSL unless you run a always-on VM.

## Open questions (human)

1. **Standing push allowlist** — Will you record a time-boxed branch allowlist in **`aegis-rpc/DECISIONS.md`**, or approve each push in chat?
2. **PR checks scope** — Which GitHub Actions (if any) are mandatory “green” for your repo?

---

**Saved path:** `aegis-rpc/.hermes/plans/2026-05-20_190500-headless-pm-10m-orchestrate-agent-push-github.md`  
**Runtime identity (Hermes prompt):** Hermes Agent runtime using a **local Cursor bridge** provider. **Hivemind:** yes — shared org memory across Cursor, Hermes, Codex; Kiro via Hivemind MCP.
