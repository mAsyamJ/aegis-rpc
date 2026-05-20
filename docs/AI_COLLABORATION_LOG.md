# AI Collaboration Log

Judges use this to verify AI tool usage alongside git `Co-authored-by` trailers.

| Date | Module / phase | Commit (SHA) | AI tools used | Human role |
|------|----------------|--------------|---------------|------------|
| 2026-05-20 | Phase 1 scaffold | `4c4f665` | Cursor, Hermes orchestrator | architecture, review |
| 2026-05-20 | Phase 2 MVP modules 1–9 | `8a2a48d` | Cursor agent | review, approval |
| 2026-05-20 | Phase 2B Waves A–D (full spec) | `41a156f`, `fbbf2fe` | Cursor Composer | orchestration, review |
| 2026-05-20 | Phase 2C sentinel UI + LEAD demo | `0d2f26e`, `f19f5be` | Cursor Composer | UI wiring, calldata fix, review |

## Phase 2C modules landed

- **Wave F:** Sentinel design tokens, shadcn kit, landing, dashboard, policies, adapters pages
- **Wave G:** `/demo/agent` LEAD — `PolicyModeToggle`, WARN override → `safeSend`, `PreSigningAssistPanel`, fixture toggle
- **Wave H:** Chainlink feed alignment, `ai-analyze` response shape, README demo path, `transferFrom` decoder
- **Wave I:** `curl-demo.sh` strict `AGENT_TX_CAP_EXCEEDED` (viem-valid calldata), forge 5/5, deploy gated (D3 blocked)

## Phase 2B modules landed

- **Wave A:** RPC `-32090` intercept, `/api/safe-send`, `/api/policies`, decoder classifier, agent policy + adapters (ContractCode, Simulation, AgentPolicy)
- **Wave B:** Four-role AI (`lib/ai/memoService.ts`), `GET /api/ai-analyze`
- **Wave C:** Sentinel UI wired — `/demo/agent` (LEAD), `/demo/wallet`, enhanced `/dashboard`
- **Wave D:** `DeployBaseSepolia.s.sol`, `ChainlinkFeedConsumer.t.sol`, `onChainPolicyHash`, expanded `curl-demo.sh` (deploy gated)

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
