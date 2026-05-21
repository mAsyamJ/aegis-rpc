# Headless 24/7 PM — orchestrate @agent (PABTI) + GitHub until green + 10m Telegram return

**Role:** Product manager / orchestrator (`aegis-orchestrator`) — cadence, truth on the board, gates, and **approval policy** for remote git and chain.  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon`  
**Scope anchor:** kit-root `../plan.md` + `../docs/04-api-spec.md` … `../docs/15-demo-script.md` + `.hermes/plans/plan-chunks/` + per-agent `2026-05-20_174800-agent-*.md`

**Prior art (read in order; do not fork competing runbooks):**

1. `.hermes/plans/2026-05-20_190500-headless-pm-10m-orchestrate-agent-push-github.md` — operator checklist + two-lane architecture  
2. `.hermes/plans/2026-05-20_180500-orchestrate-headless-pm-agent-github-10m.md` — GitHub allowlist / phases in depth  
3. `.hermes/plans/2026-05-20_141254-headless-pm-orchestrator-10m.md` — earliest 10m PM framing  
4. `.hermes/plans/2026-05-20_183045-plan-md-fullscope-blocked-kanban.md` — blocked-task hygiene vs `plan.md`

---

## Goal

1. **Orchestrate** Kanban so work is **bounded**, **attributed**, and **closed cleanly** (`kanban_complete` / `kanban_block` with reason; reclaim dead `running`).
2. **@agent execution** — Cursor bridge `http://127.0.0.1:8787/v1` with **`CURSOR_BRIDGE_MODE=agent`** for implementers: **Plan → Analyze → Build → Test → Integrate** per card (see matrix below).
3. **GitHub until it works** — branch → commit → (human-approved) push → PR → `gh pr checks` → fix loop until green. No force-push to `main`/`master`.
4. **Return output every 10 minutes** — Hermes cron posts **script-only** status to Telegram **`origin`** (deterministic; not an LLM tick on the gateway).

---

## PABTI loop (one Kanban worker cycle)

Map each **`running`** task to this sequence before **`kanban_complete`** or **`kanban_block`**:

| Phase | Owner | Output / artifact |
|-------|--------|-------------------|
| **P** Plan | Worker (@agent) | Restates acceptance from card body + linked `.hermes/plans/…md`; lists files to touch. |
| **A** Analyze | Worker | Grep/read tests and API shapes; notes risks; no scope creep vs `plan.md` + MVP cuts. |
| **B** Build | Worker | Minimal diff; matches repo conventions. |
| **T** Test | Worker | `forge test`, `npm run build` (paths per `AGENTS.md` / card), `./tests/curl-demo.sh` when API needs a server. |
| **I** Integrate | Worker | One commit per work package where applicable; `docs/AI_COLLABORATION_LOG.md` row; handoff note on card. |

**Close:** Hermes protocol — **`kanban_complete`** (done) or **`kanban_block`** (blocked + human-readable reason, e.g. D3 deploy gate, missing approval for push).

---

## Two lanes (what runs 24/7 vs what is on-demand)

```text
Lane A — every 10m (Hermes cron, --no-agent)
  Kit: scripts/install-aegis-pm-cron-10m.sh
  Script: ~/.hermes/scripts/aegis-pm-tick-10m.sh (copy from kit)
  → stdout → Telegram origin

Lane B — orchestration + implementation (on-demand or timer-assisted)
  Optional: aegis-kanban-dispatch.timer (kit) — dispatch only when bridge healthy + ready > 0
  Workers: Hermes Kanban session OR Cursor Agent on same repo — must end with complete/block
  GitHub: local work → approval gate → push/PR → checks green
```

**Important:** The **10-minute message is Lane A only** (status snapshot). It does **not** replace PABTI work; it **surfaces** board/bridge/repo state so you can steer in Telegram.

---

## What you receive every ~10 minutes (Telegram)

Content is defined by **`~/dev/Project/aegis-hackathon-kit/scripts/aegis-pm-tick-10m.sh`** (synced by install script). Expect roughly:

- UTC timestamp and **scope line** (`plan.md` + orchestration plan ref)
- **`hermes kanban --board aegis-hackathon stats`**
- Lines for **running** and **ready** tasks (if any)
- **Blocked** count
- **Bridge** health (`KIRO_BRIDGE_URL`/health), **cursor `bridgeMode`**, **configured**
- **`hermes-gateway`** / **`kiro-openai-bridge`** user systemd state
- **Short git SHA** for `aegis-rpc` (if `.git` present)
- **Gate reminders** (dev server + `curl-demo.sh` hints)
- **Next actions** (e.g. dispatch if `ready` > 0)

To change the template: edit the kit script, re-run **`scripts/install-aegis-pm-cron-10m.sh`** (idempotent job replace), or edit `~/.hermes/scripts/aegis-pm-tick-10m.sh` and keep kit in sync manually.

---

## One-time setup (operator)

1. **`loginctl enable-linger`** (if you want user timers/cron without interactive login) — see `docs/kit/02-hermes-24-7.md`.
2. **`hermes-gateway`** + **`kiro-openai-bridge`** user units active; **`curl -sf http://127.0.0.1:8787/health`** OK with **`bridgeMode: agent`**.
3. Telegram **`/set-home`** for **`--deliver origin`**.
4. Install PM cron:  
   `~/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh`
5. Verify: **`hermes cron list`**, manual **`~/.hermes/scripts/aegis-pm-tick-10m.sh`** preview.
6. Optional dispatch cadence: **`scripts/install-aegis-kanban-dispatch-timer.sh`** (only dispatches when `ready > 0` and bridge up).

---

## Non-negotiables

| Rule | Rationale |
|------|-----------|
| No secrets in Telegram, cron text, Kanban, or plans | Keys/passwords in env only. |
| Default: **no `git push` / merge to default branch** without explicit human approval | “Until it works” = fix until checks pass **locally or on PR branch**; remote is gated. |
| Optional standing allowlist | Document in **`aegis-rpc/DECISIONS.md`** (branch + window + forbidden ops) per `2026-05-20_180500-…`. |
| No on-chain deploy without separate approval | D3 / `t_481e57d1` pattern. |
| Product swarm: deterministic policy; AI explain-only; audit + `reasonCode` on BLOCK | `aegis-rpc/AGENTS.md`. |

---

## Validation

| Check | Command / signal |
|--------|-------------------|
| 10m post arrives | Telegram DM within ~10m of cron enable; body matches script sections above |
| Bridge | `curl -sf http://127.0.0.1:8787/health` |
| Board | `hermes kanban --board aegis-hackathon stats` |
| Dispatch (optional) | `journalctl --user -u aegis-kanban-dispatch.service -n 30` after `ready > 0` |
| Product gate | `forge test`, `npm run build` under `aegis-rpc`, `./tests/curl-demo.sh` with correct `AEGIS_BASE_URL` |

---

## Risks / limits

- **Cron is not an LLM** — it cannot “think”; it only reports. Implementation stays on **workers** / **Cursor Agent**.
- **Gateway 502 / model errors** — long jobs belong off the Telegram LLM path; keep **Lane A** script-only.
- **WSL / Windows sleep** — 24/7 requires VM up + linger + realistic expectations when host sleeps.

---

## After this plan

- If anything in **Lane A** output is missing (e.g. PR URL, last `gh pr checks` summary), extend **`aegis-pm-tick-10m.sh`** in the **kit** and reinstall cron — keep additions **fast** (no `gh` network calls that hang Telegram delivery unless you accept latency).
- Drive **Lane B** from Cursor Agent or Hermes worker sessions with tools; use **`hermes kanban --board aegis-hackathon dispatch --max 2`** when `ready > 0`.

---

**Identity (runtime copy):** Hermes Agent runtime using a **local Cursor bridge** provider. **Hivemind:** yes — shared org memory across Cursor, Hermes, and Codex; Kiro uses Hivemind via MCP.
