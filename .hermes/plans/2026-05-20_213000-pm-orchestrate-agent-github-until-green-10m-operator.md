# Product manager (headless) — orchestrate @agent, PABTI, GitHub until green, 10m Telegram return

**Canonical detail:** `.hermes/plans/2026-05-20_201500-headless-pm-pabti-orchestrate-agent-github-10m.md` — read that first; this file is the **one-page operator supplement** (no competing architecture).

**Identity (runtime):** Hermes Agent runtime using a **local Cursor bridge** provider. **Hivemind:** yes — org memory shared across Cursor, Hermes, and Codex; Kiro uses Hivemind via MCP.

---

## Goal (what “24/7 PM” means)

| Layer | What runs | Purpose |
|-------|-------------|---------|
| **PM (headless)** | Hermes cron every **10m**, `--no-agent`, `~/.hermes/scripts/aegis-pm-tick-10m.sh` | **Return output to you** on Telegram `origin`: board stats, running/ready/blocked, bridge health, systemd, short `aegis-rpc` SHA, next actions. **Not** an LLM on the gateway. |
| **Orchestrator** | Human + `aegis-orchestrator` + board hygiene | One parent epic, `kanban_complete` / `kanban_block` with reason, reclaim dead `running`, optional `aegis-kanban-dispatch.timer` when `ready > 0`. |
| **@agent (implement)** | Cursor bridge `CURSOR_BRIDGE_MODE=agent` → `http://127.0.0.1:8787/v1` | **Plan → Analyze → Build → Test → Integrate** per Kanban card (PABTI matrix in `201500` doc). |
| **GitHub until it works** | Cursor Agent or local shell with `gh` | Branch → commits → **human-approved** push → PR → **`gh pr checks`** → fix loop until green. **No** force-push to `main`/`master`. |

---

## PABTI (one worker cycle — reminder)

1. **Plan** — Card body + linked `.hermes/plans/2026-05-20_174800-agent-*.md` + acceptance from kit `docs/`.
2. **Analyze** — Read tests/API shapes; no scope creep vs kit-root `../plan.md` + MVP cuts in `HACKATHON.md` / `ORCHESTRATOR.md`.
3. **Build** — Minimal diff, repo conventions.
4. **Test** — `forge test` (contracts), `npm run build` (web), `./tests/curl-demo.sh` with correct `AEGIS_BASE_URL` when server required.
5. **Integrate** — One commit per work package where applicable; `docs/AI_COLLABORATION_LOG.md` row.

**Close:** `kanban_complete` or `kanban_block` (+ reason). Never exit worker without one of these.

---

## GitHub “until it works” loop (explicit)

Default: **fix until checks pass on the PR branch**; treat **`git push`** to remote and **merge to default branch** as **explicit human approval** unless you have a **time-boxed allowlist** recorded in `DECISIONS.md` (see `2026-05-20_180500-orchestrate-headless-pm-agent-github-10m.md`).

1. `git checkout -b feat/<task-or-card-id>-<short-slug>`
2. Implement + test locally (PABTI **T**).
3. `git add` / `git commit` (focused message; hooks on).
4. **Approval gate:** human says “push this branch” (or allowlist satisfied).
5. `git push -u origin HEAD` → `gh pr create` (or update existing PR).
6. `gh pr checks` (or GitHub UI) → on failure: fix, commit, push → repeat **6** until green.

**Blocked without approval:** stop at **4**; note on card `kanban_block` reason “push not approved” or leave in draft with comment — do not bypass.

---

## Every 10 minutes — what you should see

- Install / refresh: `~/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh`
- Requires Telegram **`/set-home`** for `--deliver origin`.
- Template lives in kit: `scripts/aegis-pm-tick-10m.sh` (synced to `~/.hermes/scripts/` by install).

To add fields to the status post (e.g. last PR check summary), extend the **kit** script and reinstall cron — keep script **fast** (avoid blocking `gh` calls unless you accept delayed delivery).

---

## One-time operator checklist

1. `loginctl enable-linger $USER` (if you want user services after logout) — see `docs/kit/02-hermes-24-7.md`.
2. `systemctl --user` — `hermes-gateway`, `kiro-openai-bridge` **active**; `curl -sf http://127.0.0.1:8787/health` shows **`bridgeMode: agent`** and Cursor configured.
3. `scripts/install-aegis-pm-cron-10m.sh` — verify `hermes cron list`, manual `~/.hermes/scripts/aegis-pm-tick-10m.sh` preview.
4. Optional: `scripts/install-aegis-kanban-dispatch-timer.sh` — dispatch when `ready > 0` + bridge healthy.

---

## Copy-paste — Cursor Agent session (Lane B)

Use in **Agent** mode on `aegis-rpc` workspace:

> You are **aegis-orchestrator** implementing Lane B. Board **aegis-hackathon**. For each `running` task: run **PABTI** (plan/analyze/build/test/integrate) using the card’s `Plan: .hermes/plans/2026-05-20_174800-agent-*.md`. End with **`kanban_complete`** or **`kanban_block`** + reason. GitHub: work on a feature branch; **do not push or merge without explicit human approval**; if approved, open/update PR and loop **`gh pr checks`** until green. Do not put secrets in commits, Kanban, or Telegram.

---

## Non-negotiables

- No API keys, wallet passwords, forge keystores, or seed phrases in Kanban, cron output, plans, or chat.
- No on-chain deploy without separate human approval (D3 pattern).
- Product: deterministic policy; AI explain-only; audit + `reasonCode` on `BLOCK` — `AGENTS.md`.

---

## Validation

| Signal | How |
|--------|-----|
| 10m Telegram | Message every ~10m with board + bridge + stack lines |
| Bridge | `curl -sf http://127.0.0.1:8787/health` |
| Board | `hermes kanban --board aegis-hackathon stats` |
| Dispatch timer | `journalctl --user -u aegis-kanban-dispatch.service -n 30` when `ready > 0` |
| Product | `forge test`, `npm run build`, `./tests/curl-demo.sh` per `201500` |

---

## Risks

- **10m cron ≠ coding agent** — it only reports; implementation is **@agent** / Hermes workers.
- **Host sleep / WSL** — 24/7 needs VM up and realistic expectations when Windows sleeps.
- **Model/bridge 502** — keep long jobs off the Telegram LLM path; use bridge **agent** mode for coding, not Telegram for heavy runs.
