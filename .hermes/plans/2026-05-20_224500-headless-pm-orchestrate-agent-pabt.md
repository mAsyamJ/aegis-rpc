# Headless 24/7 PM — orchestrate @agent with Plan → Analyze → Build → Test

**Role:** Product manager / orchestrator (`aegis-orchestrator`): cadence, board truth, gates, approval policy for git and chain.  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon`  
**Inference for implementers:** Cursor bridge `http://127.0.0.1:8787/v1` with **`CURSOR_BRIDGE_MODE=agent`**.

**Canonical long-form (do not duplicate architecture elsewhere):**

- `.hermes/plans/2026-05-20_201500-headless-pm-pabti-orchestrate-agent-github-10m.md` — PABTI matrix, two lanes, GitHub loop, risks  
- `.hermes/plans/2026-05-20_213000-pm-orchestrate-agent-github-until-green-10m-operator.md` — one-page operator supplement + copy-paste prompt

This file is the **PABT-shaped summary** (your wording). **Hermes protocol still requires a clean close** after Test: see **§Close** below.

---

## Goal

1. **Headless PM (24/7 reporting)** — Every ~10 minutes, **script-only** status to Telegram `origin` (not an LLM tick on the gateway): board stats, bridge health, next actions.  
2. **Orchestrate @agent** — Kanban `dispatch` (manual or optional `aegis-kanban-dispatch.timer`) claims `ready` work; **Cursor Agent** (bridge **agent** mode) executes each card with **Plan → Analyze → Build → Test**.  
3. **Product truth** — Work stays aligned with kit-root `../plan.md`, `../docs/04-api-spec.md` … `../docs/15-demo-script.md`, `AGENTS.md`, and per-agent `2026-05-20_174800-agent-*.md` where linked from cards.

---

## Who does what (three layers)

| Layer | Runs | Responsibility |
|-------|------|----------------|
| **PM (headless)** | Hermes cron + `~/.hermes/scripts/aegis-pm-tick-10m.sh` (from `scripts/install-aegis-pm-cron-10m.sh`) | **Return output** to you; surface `running` / `ready` / blocked counts; bridge + systemd snapshot. |
| **Orchestrator** | You + `aegis-orchestrator` + optional dispatch timer | Parent epics, card bodies with `Plan: …`, **`hermes kanban dispatch --max N`**, reclaim stale `running`. |
| **@agent (implement)** | Cursor Agent via bridge **agent** mode | **Plan → Analyze → Build → Test** on the active card; then handoff / integrate per **§Close**. |

---

## Plan → Analyze → Build → Test (one task cycle)

| Phase | Output |
|-------|--------|
| **Plan** | Restate acceptance from Kanban body + linked `.hermes/plans/*.md`; list files and risks; no scope creep vs `../plan.md` + MVP cuts (`HACKATHON.md`, `ORCHESTRATOR.md`). |
| **Analyze** | Read existing tests and API shapes; confirm deterministic policy / audit / `reasonCode` on `BLOCK` per `AGENTS.md`. |
| **Build** | Minimal diff; match repo TypeScript / Next / Foundry conventions. |
| **Test** | `forge test` (contracts), `npm run build` (`apps/web`), `./tests/curl-demo.sh` with correct `AEGIS_BASE_URL` when a dev server is required. |

### Close (still mandatory — maps to “Integrate” in PABTI)

After **Test** passes (or you hit an approval wall):

- **Integrate** — Focused commit(s); row in `docs/AI_COLLABORATION_LOG.md` when the repo requires it; short comment on the card with commands + result summary.  
- **Hermes Kanban** — End the worker with **`kanban_complete`** or **`kanban_block`** + human-readable reason (e.g. deploy not approved, push not approved). **Do not** exit a worker session without one of these — avoids protocol violations.

For the full **P → A → B → T → I** table and GitHub PR/check loop, use the **`201500`** doc above.

---

## Two lanes (24/7 vs on-demand)

```text
Lane A — every ~10m (Hermes cron, --no-agent)
  scripts/install-aegis-pm-cron-10m.sh
  → ~/.hermes/scripts/aegis-pm-tick-10m.sh → stdout → Telegram origin

Lane B — @agent + tests + optional dispatch timer
  CURSOR_BRIDGE_MODE=agent + Hermes Kanban running/ready lifecycle
  Optional: scripts/install-aegis-kanban-dispatch-timer.sh (dispatch when ready > 0 and bridge healthy)
```

---

## One-time operator checklist

1. Telegram **`/set-home`** for `origin` delivery.  
2. `curl -sf http://127.0.0.1:8787/health` — expect **`bridgeMode`: `agent`**, Cursor configured.  
3. `~/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh` — refresh cron + script copy.  
4. Optional: `scripts/install-aegis-kanban-dispatch-timer.sh` — 15m dispatch when `ready > 0`.  
5. `loginctl enable-linger` if you need user systemd after logout — see `docs/kit/02-hermes-24-7.md`.

---

## Copy-paste — Cursor Agent (Lane B, PABT + close)

Use in **Agent** mode on the `aegis-rpc` workspace:

> You are the **implementer** for board **aegis-hackathon**. For each **`running`** task: **Plan → Analyze → Build → Test** using the card’s first-line plan path (`Plan: .hermes/plans/…`). After tests: integrate (commit + log row if required), then **`hermes kanban complete`** or **`hermes kanban block "<reason>"`**. Do **not** push, merge, or on-chain deploy without **explicit human approval**. No secrets in Kanban, commits, or chat.

---

## Validation

| Signal | Check |
|--------|--------|
| 10m Telegram | Message ~every 10m with board + bridge lines |
| Board | `hermes kanban --board aegis-hackathon stats` |
| Product gate | `forge test`, `npm run build`, `curl-demo.sh` as in **`201500`** |

---

## Risks

- **10m PM is not coding** — it only reports; **Plan/Analyze/Build/Test** happen in **@agent** / Hermes worker sessions.  
- **Host sleep / WSL** — “24/7” requires the VM/session actually running.  
- **Bridge 502 / model errors** — keep long runs off the Telegram LLM path; use bridge **agent** for implementation.

---

## Non-negotiables

- No API keys, wallet passwords, forge keystores, or seed phrases in Kanban, cron output, plans, or Telegram.  
- No chain deploy without separate human approval (same bar as D3 deploy-gate pattern).  
- Deterministic policy owns verdicts; AI explain-only; audit events + `reasonCode` on `BLOCK` — `AGENTS.md`.
