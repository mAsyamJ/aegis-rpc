# AI Collaboration Log

Judges use this to verify AI tool usage alongside git `Co-authored-by` trailers.

| Date | Module / phase | Commit (SHA) | AI tools used | Human role |
|------|----------------|--------------|---------------|------------|
| 2026-05-21 | Phase 5 production deploy — Vercel types fix (`policy-types.ts`), judge README/HACKATHON URLs, `curl-judge-preflight-only.sh` | `26b468f` | Hermes, Kiro, Cursor | deploy, review, approval |
| 2026-05-21 | Phase 4 orchestration continuity — board shows **t_a6c35888** + **t_f85e6781** **done**; `docs/GRILL_QA.md` + demo-script anchors OK; `hermes kanban dispatch` spawned **0**; orchestrator **comment** on **t_a6c35888**; ORCHESTRATOR pulse line | (no code commit unless committed separately) | Cursor Agent (`cursor-composer-2` bridge), `hermes kanban` | orchestration |
| 2026-05-20 | Ship-path orchestration pulse — Kanban dispatch no-op (`ready`=0); forge 5/5, Next build OK, curl-demo OK @ `:3000`; orchestrator comments on **t_f488017b** (Phase 5) + **t_40bcee10** (Phase 6: `gh` missing); ORCHESTRATOR.md pulse paragraph | (no code commit unless committed separately) | Cursor Agent, `hermes kanban` | orchestration |
| 2026-05-21 | Phase 4 + regression — `hermes kanban complete` t_a6c35888 (GRILL_QA + security comment), t_3fbe7d2a (forge 5/5, Next build, curl-demo @ :3000); HACKATHON Phase 4 ticked | (docs only unless committed) | Cursor Agent, `hermes kanban` | orchestration |
| 2026-05-21 | Phase 3–6 ship path — new Kanban tasks (t_3f230e76 … t_3fbe7d2a), archived epic t_79e30cc9, dispatch spawned Phase 3+4 workers; ORCHESTRATOR + plan doc | (no code commit) | Cursor Agent, `hermes kanban` | orchestration |
| 2026-05-21 | Kanban hygiene — 11 PABTI blocked rows closed as duplicate-of-done (evidence: forge 5/5, `npm run build` apps/web, `curl-demo.sh` @ :3000) | (no code commit) | Cursor Agent, `hermes kanban complete` | orchestration |
| 2026-05-20 | QA baseline PABTI (forge, build, curl-demo) | `e4098ec` (checkout had local edits; build/smoke used working tree) | Hermes Kanban worker, Cursor | verification |
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
