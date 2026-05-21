# Phase 3–6 ship path — Kanban + headless (2026-05-21)

## Goal

Drive **HACKATHON.md** Phases **3–6** (technical plan → grill → Vercel → submit) after MVP modules, with **Hermes Kanban** + **headless** status/dispatch already installed in the kit.

## Kanban (board `aegis-hackathon`)

| ID | Assignee | Title |
|----|----------|--------|
| **t_3f230e76** | `aegis-orchestrator` | Phase 3: Technical plan + scope freeze |
| **t_a6c35888** | `aegis-pitch` | Phase 4: Grill me + judge Q&A pack |
| **t_f488017b** | `aegis-devops` | Phase 5: Production deploy (Vercel) |
| **t_40bcee10** | `aegis-qa` | Phase 6: PR green + submit |
| **t_3fbe7d2a** | `aegis-qa` | Regression: weekly smoke (forge + build + curl-demo) |

Epic **t_79e30cc9** was **archived** after a mistaken **blocked**-container pattern prevented `todo → ready` promotion; children were **unlinked** so dispatch works.

## Headless 24/7 (operator)

- **10m Telegram PM (script-only):** `~/dev/Project/aegis-hackathon-kit/scripts/install-aegis-pm-cron-10m.sh` → Hermes cron `aegis-pm-tick-10m`, `--no-agent`, `--deliver origin`. Requires Telegram **`/set-home`**.
- **15m Kanban dispatch (optional):** `scripts/install-aegis-kanban-dispatch-timer.sh` → user systemd `aegis-kanban-dispatch.timer`; runs `hermes kanban dispatch --max 2` only when **bridge health OK** and **`ready > 0`**.
- **Bridge:** `http://127.0.0.1:8787/health`; workers need **`CURSOR_BRIDGE_MODE=agent`** (or Kiro) per kit docs.

## Worker protocol

Every run ends with **`hermes kanban complete`** or **`hermes kanban block`** (reason); silent exit → protocol violation.

## Security

No API keys, Vercel tokens, wallet material, or forge secrets in Kanban bodies, plans, or Telegram. Use **`~/.hermes/.env`** / CI secrets only. Push/deploy per **`DECISIONS.md`**.

## Verification (per card)

See each task body: **forge test**, **`npm run build --prefix apps/web`**, **`./tests/curl-demo.sh`** with **`AEGIS_BASE_URL`** where applicable; Phase 6 adds **`gh pr checks`**.
