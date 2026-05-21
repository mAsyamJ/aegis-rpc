# Security Review — Phase 2B (2026-05-20)

**Reviewer:** Cursor orchestrator (Hermes `aegis-security` worker `t_059d4e99` crashed 2×; review completed in-repo per `.hermes/plans/2026-05-20_174800-agent-security-review.md`)  
**Scope:** `aegis-rpc` at `41a156f` … `e4098ec`  
**Board:** `aegis-hackathon` parent `t_1249ee6d`

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| P0 | 0 | — |
| P1 | 2 | Documented; acceptable for demo with D3 deploy gate |
| P2 | 2 | Track post-hackathon |

**Phase 2B security gate:** **PASS** (no open P0; on-chain registry deferred via blocked `t_481e57d1`).

---

## Checklist

### BLOCK + reasonCode

- **PASS.** `finalizeVerdict` maps adapter `BLOCK` → `reasonCode` from signal (`policyEngine.ts`). `approvalRiskAdapter` emits `UNLIMITED_APPROVAL_UNKNOWN_SPENDER`. `curl-demo` returns `AGENT_TX_CAP_EXCEEDED` and `UNLIMITED_APPROVAL_UNKNOWN_SPENDER` with matching `verdict: "BLOCK"`.

### Chainlink freshness

- **PASS (with P1 note).** `chainlinkPriceAdapter.ts` uses `updatedAt` from `latestRoundData`, `MAX_STALE_SECONDS = 7200`, `ORACLE_STALE` when exceeded; invalid answer → `CHAINLINK_INVALID_ANSWER`. Health endpoint exposes `staleSeconds` (curl-demo §7 OK).

### AI cannot change verdict

- **PASS.** `preflightService.ts`: `evaluateTransaction` → verdict **before** `appendEvent`; `runMemoService` is fire-and-forget `void` on existing event. `safe-send` reads stored `event.verdict` only; no AI path in route handlers. Grep: no assignment to `verdict` in `lib/ai/`.

### No secret leakage in code paths reviewed

- **PASS.** API keys read from `process.env` only (`memoService.ts`, `chainlinkPriceAdapter.ts`). No `console.log` in `app/api/*`. Kanban/plans contain no credentials.

### onChainPolicyHash honesty

- **PASS with documented limitation (P1).** `getPolicyHash()` in `lib/policies/index.ts` is a **deterministic off-chain digest** of policy JSON, not `AegisPolicyRegistry` on-chain hash. Field is present for API/demo shape; **D3 deploy** (`t_481e57d1`) remains **blocked** until human approval — satisfies demo gate “hash or documented blocker,” not a fabricated chain read.

---

## Findings

### P1 — `onChainPolicyHash` naming vs implementation

- **Owner:** `aegis-backend-rpc` / `aegis-smart-contract`
- **Detail:** Response field implies on-chain registry proof; implementation is local policy canonicalization until deploy.
- **Mitigation:** UI copy / README should say “policy digest (off-chain)” until D3; wire registry hash after approved deploy.
- **Retest:** After deploy, assert hash matches `AegisPolicyRegistry.verifyHash` on fork.

### P1 — WARN override via `POST /api/safe-send`

- **Owner:** `aegis-policy-engine`
- **Detail:** `overrideWarn: true` allows broadcast after WARN (LEAD demo path). Intentional for agent workflow; enforce mode still BLOCKs.
- **Mitigation:** Document in `docs/15-demo-script.md`; ensure wallet template stays `enforce` for drainer demo.

### P2 — In-memory audit store

- **Owner:** `aegis-database`
- **Detail:** Events not durable across restarts (acceptable MVP).
- **Mitigation:** Supabase/SQLite per roadmap.

### P2 — Hermes Kanban worker protocol

- **Owner:** kit ops
- **Detail:** `t_059d4e99` crashed without `kanban_complete` / `kanban_block`.
- **Mitigation:** Orchestrator fallback review (this file).

---

## Verification run (orchestrator)

| Check | Result |
|-------|--------|
| Bridge `:8787/health` | OK (`cursor-composer-2`) |
| `smoke-scaffold.sh` | OK |
| `forge test` | 5/5 PASS |
| `AEGIS_BASE_URL=http://127.0.0.1:3020 ./tests/curl-demo.sh` | OK (7 steps) |
| D3 deploy | **Blocked** `t_481e57d1` — no deploy without approval |

## Wave SHAs (reference)

- Phase 2B engine: `41a156f`, `fbbf2fe`
- Phase 2C UI/demo: `0d2f26e`, `f19f5be`, `e4098ec`

---

## Sign-off

P0 empty. Phase 2B may be called **done** for hackathon demo with **D3 deploy gate** explicit in Kanban and README.
