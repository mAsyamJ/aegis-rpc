# AI Collaboration Log

Judges use this to verify AI tool usage alongside git `Co-authored-by` trailers.

| Date | Module / phase | Commit (SHA) | AI tools used | Human role |
|------|----------------|--------------|---------------|------------|
| 2026-05-20 | Phase 1 scaffold | `4c4f665` | Cursor, Hermes orchestrator | architecture, review |
| 2026-05-20 | Phase 2 MVP modules 1–9 | (see git log) | Cursor agent | review, approval |

## Phase 2 modules landed

1. JSON-RPC passthrough — `/api/rpc`
2. Preflight + events — `/api/preflight`, `/api/events`
3. Tx decoder — `lib/engine/transactionDecoder.ts`
4. Policy engine — BLOCK unlimited approve unknown spender
5. Adapter layer — ApprovalRisk, Allowlist
6. Chainlink adapter — health endpoint + skip fallback
7. RiskOps dashboard — `/dashboard`
8. AI memo — template fallback, async optional
9. Contracts — Foundry registry + demo token/spender + curl demo

## Rules

- Every AI-assisted commit must include at least one `Co-authored-by:` line in the commit body.
- Update this table when you land a module or complete a lifecycle phase.
- See kit parent `docs/kit/05-ai-collaboration.md` for commit message examples.
