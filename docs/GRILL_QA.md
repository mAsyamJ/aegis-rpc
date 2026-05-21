# Grill me — judge Q&A (honest limits)

Companion: spoken beats and weights in `docs/JUDGE_NARRATIVE.md`. Live demo order: hackathon kit `docs/15-demo-script.md` (sibling directory to `aegis-rpc/`).

All security posture claims align with `AGENTS.md` non-negotiables (deterministic policy, AI assist-only, no “stops all hacks”).

---

## Demo script vs UI (verify LEAD path)

| Kit demo step | Where to show | UI / copy anchor |
|---------------|-----------------|------------------|
| 1. RPC passthrough (`eth_blockNumber`) | `/demo/agent` | `RpcPassthroughPanel`: “Demo 1 · RPC passthrough”, “Test RPC passthrough”, `eth_blockNumber` + `eth_getBalance` via `POST /api/rpc` — `apps/web/src/components/demo/RpcPassthroughPanel.tsx` |
| 2. Agent policy cap (high value → BLOCK) | `/demo/agent` | Scenario **Agent exceeds USD policy cap** (`agent-over-cap`) — `apps/web/src/lib/fixtures/demoScenarios.ts` |
| 3. Unlimited approval | `/demo/live` or `/demo/wallet` | Live: `live-block-unlimited-approve` → `DemoERC20` + `WALLET_UNLIMITED_APPROVE_DATA` — `apps/web/src/lib/fixtures/liveTxScenarios.ts` |
| 3b. SAFE + WARN (real API) | `/demo/live` | DeFi `checkSwapDeviation` (SAFE) + high allowance approve (WARN) — same file + `tests/curl-live-three-tx.sh` |
| 4. Chainlink context | `/demo/agent` | Adapter cards after preflight; stale scenario `agent-stale-feed` — fixtures + `AdapterSignalCard` |
| 5. Dashboard + AI memo | `/dashboard` + preflight bottom panels | `AiMemoPanel`, audit poll — `apps/web/src/app/(app)/dashboard/` routes |
| 6. Business one-liner | spoken | `README.md` roadmap row + `docs/JUDGE_NARRATIVE.md` |

Preflight composer narrates `/api/preflight` before broadcast: `apps/web/src/components/demo/PreflightComposer.tsx`.

### Public production RPC (Vercel)

| Item | Evidence |
|------|----------|
| Hosted gateway | `POST https://<vercel-app>/api/rpc` — `apps/web/src/app/api/rpc/route.ts` |
| Shared audit | Supabase `aegis_events` when env set — `supabase/migrations/001_aegis_events.sql`, `lib/db/eventRepository.ts` |
| Browser wallets | CORS `OPTIONS` + `Access-Control-Allow-Origin` — `lib/http/cors.ts` |
| Production smoke | `tests/curl-production-smoke.sh` with `AEGIS_PROD_URL` |
| MetaMask setup | `docs/LOCAL_DEV.md` § Vercel — RPC URL + chainId 84532 |

---

## Top 20 judge questions (with evidence)

Each answer stays within shipped behavior or explicit MVP limits. Evidence paths are from **aegis-rpc** repo root unless noted.

### 1. How is this different from wallet security tools?

Wallet tools sit at signing UX. Aegis is an RPC-shaped gateway + preflight API so wallets, agents, keepers, and backends share one policy seam before broadcast. Evidence: `README.md` intro, `AGENTS.md` mission, `../docs/04-api-spec.md` (`POST /api/rpc`, `POST /api/preflight`).

### 2. What happens if your policy engine is wrong?

False positives block legitimate traffic until policy is tuned; false negatives miss threats outside rules. Mitigations: `reasonCode`, policy modes, audit log, adapters — not completeness against all calldata or social engineering. Evidence: `AGENTS.md` coding rules (every `BLOCK` has `reasonCode`), `README.md` security disclaimer.

### 3. Can this scale to production RPC traffic?

MVP: single chain, bounded routes. Scaling story: passthrough to upstream, stateless preflight workers, horizontal gateways — same as hosted RPC middleware. Evidence: `docs/JUDGE_NARRATIVE.md` (Scalability row), this doc §2 answer.

### 4. Why does this need Chainlink specifically?

It does not. Chainlink `AggregatorV3Interface` is the first real external adapter signal (price + freshness). Other feeds can implement the same adapter contract. Evidence: `AGENTS.md` item 2, `README.md` demo thesis item 4, `../docs/15-demo-script.md` §4.

### 5. What is the business model?

Security RPC + preflight API → OpsRisk Cloud → managed gateway → adapter marketplace. Evidence: `README.md` judging alignment / roadmap, `docs/JUDGE_NARRATIVE.md`, kit `../docs/15-demo-script.md` §6.

### 6. Is this just Blowfish / Rabby / wallet simulators?

Those excel at human-readable tx previews in the wallet. Aegis targets automated signers and shared infra policy at the RPC layer. Evidence: Q1 above, `README.md` first paragraph.

### 7. Does AI replace auditors or policy owners?

No. AI explains after deterministic context exists; it does not change `SAFE`/`WARN`/`BLOCK`. Evidence: `AGENTS.md` items 3–4, `README.md` “AI explains. Policy decides.”

### 8. Is this Flashbots / private mempool / MEV protection?

No. Flashbots-style stacks address routing and MEV. Aegis gates whether to broadcast under org policy. Evidence: original GRILL comparison (conceptual), product seam in `README.md`.

### 9. Tenderly (or similar) already simulates — why Aegis?

Simulators debug execution. Aegis merges decode + adapters + policy + audit events for enforce/warn/observe modes at a gateway integration point. Evidence: `AGENTS.md` architecture roles, `HACKATHON.md` module list if present.

### 10. Why not OpenZeppelin Defender end-to-end?

Defender is a broad ops suite (relayers, monitors, workflows). Aegis is a narrow preflight + wrapped RPC surface for screen-then-send-or-reject. Evidence: positioning in Q1, `README.md` API table.

### 11. Why not GoPlus / third-party risk scores only?

Risk APIs fit as **adapters**. Aegis owns verdict merge, audit trail, and RPC/preflight contract. Evidence: `AGENTS.md` Adapter Agent role, adapter cards in UI.

### 12. Forta / Hypernative already monitor — aren’t you late?

Many monitors alert post-broadcast or off-path. Default story: **pre-broadcast** gating for signers you control; intel can still feed adapters. Evidence: `docs/JUDGE_NARRATIVE.md` Originality row.

### 13. What on-chain trust anchor do you show?

When deployed: policy registry hash on Base Sepolia (`README.md` “Base Sepolia policy registry” placeholder). Off-chain MVP still logs every decision to audit API. Evidence: `README.md` links table, `AGENTS.md` Smart Contract Agent.

### 14. What if the upstream RPC is down?

Passthrough and preflight depend on upstream for read/simulation paths; product behavior is fail-closed or surface error — tune per deployment (MVP: honest HTTP/RPC errors). Evidence: `../docs/04-api-spec.md` error handling expectation for routes.

### 15. How do you handle multi-chain?

Hackathon MVP targets Base Sepolia (`84532`); the pattern generalizes per chain config and allowlists. Evidence: `README.md` target chain, fixtures `chainId: 84532` in `demoScenarios.ts`.

### 16. Do you store private keys?

No. Gateway screens unsigned intent; signing stays with the wallet/agent. Never log keys or full sensitive bodies per `AGENTS.md` coding rules.

### 17. Can an operator tamper with audit logs?

MVP audit is server-side store with API read; production hardening adds WORM / SIEM export — not claimed as tamper-proof in hackathon scope. Evidence: Database Agent role `AGENTS.md`, `GET /api/events` in `README.md`.

### 18. What about NFTs / ERC-721 / complex DeFi bundles?

MVP focuses on ERC-20 style flows and selector policy in demos; broader decoding is roadmap. Evidence: demo scenarios in `demoScenarios.ts` (transfer, approve, swap-shaped calldata).

### 19. RWA / treasury angle in one sentence?

Treasury bots and agent spenders hit the same JSON-RPC path — cap, allowlist, and oracle freshness apply before broadcast, not only on a human wallet click. Evidence: `AGENTS.md` mission (RWA/treasury), scenario “Safe low-value action”.

### 20. What do you explicitly NOT claim?

Not full-node RPC replacement; not guaranteed hack prevention; not “only Chainlink” or “only AI agents” as the product story. Evidence: `AGENTS.md` items 6–9, `README.md` security disclaimer.

---

## Original short-form grill (kept for rehearsal)

### How is this different from wallet security tools?

Wallet tools warn at signing time inside the wallet UX. Aegis is an RPC-shaped gateway and preflight API: any signer that already uses JSON-RPC (wallets, agents, keepers, backends) can route sends through screening before broadcast. Same policy surface for org-controlled automation, not only human clicks.

### What happens if your policy engine is wrong?

False positives block legitimate traffic until policy is adjusted; false negatives miss threats outside encoded rules. Mitigations: explicit reason codes, policy modes (observe / warn / enforce), audit log for tuning, adapters for extra signals. We do not claim completeness against all calldata or all social engineering.

### Can this scale to production RPC traffic?

MVP proves correctness on a single chain and bounded routes. Production scaling is read passthrough offloaded to the upstream provider, stateless preflight workers, rate limits, and horizontal gateway replicas—same pattern as hosted RPC middleware. On-chain registry and heavy simulation are optional cost knobs per deployment.

### Why does this need Chainlink specifically?

It does not *need* Chainlink for the concept. The hackathon demo uses Chainlink’s AggregatorV3-style feed as the first **real** external adapter signal (price + freshness) so policy is not only bytecode heuristics. Other oracles or internal risk feeds could implement the same adapter interface.

### What is the business model?

Start as developer-facing Security RPC + preflight API on high-value chains. Expand to team OpsRisk dashboards, hosted policy governance, then managed gateway and private deployments for treasuries and agent platforms. Longer term: adapter marketplace and certified policy packs—not a single vertical.

### Bonus: Is this just Blowfish / Rabby?

Those excel at wallet-side transaction clarity. Aegis targets the **RPC / backend** path for automated signers and shared infrastructure policy, with optional on-chain policy anchoring where deployed.

### Bonus: Does AI replace auditors?

No. AI explains and assists UX after deterministic context exists; it must not silently change SAFE/WARN/BLOCK.

### Is this Flashbots?

Flashbots-style systems focus on private routing and MEV protection. Aegis asks whether a transaction should be sent at all under org policy before it reaches broadcast—different seam; they can complement.

### Tenderly already simulates transactions

Tenderly (and similar) excel at simulation and debugging. Aegis turns decoded intent + signals into **policy enforcement** with audit events and a gateway-shaped integration point, not a debugger replacement.

### Why not OpenZeppelin Defender?

Defender is a broader ops stack (relayers, monitors, admin workflows). Aegis is a narrow preflight + wrapped RPC surface for “screen then send or reject” with minimal integration.

### Why not GoPlus or other risk APIs?

External risk feeds fit naturally as **adapters** behind a single policy engine. Aegis owns verdict merge, audit trail, and RPC/preflight contract—not a one-off score API.

### Forta / Hypernative already detect threats

On-chain and mempool monitors are often post-broadcast or alert-oriented. Aegis’s default story is **pre-broadcast** gating for signers you control; threat intel can still feed adapters.
