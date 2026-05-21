# Judge narrative — plan.md §2 mapped to demo

Use with kit `docs/15-demo-script.md` (10s / 30s / live beats). Spoken lines stay honest: Aegis reduces pre-broadcast risk; it does not guarantee zero exploits.

## Weights (SEABW)

| Criterion | Weight | One line for judges | Point to in demo |
|-----------|--------|---------------------|------------------|
| Originality | 30% | RPC is the seam: programmable screening before broadcast, not a wallet-only plugin and not post-tx monitoring. | `/api/rpc` passthrough then `/api/preflight` intercept story |
| Problem-Solving | 30% | Blocks dangerous patterns (e.g. unlimited ERC20 approve to unknown spender) before broadcast; agents and backends get the same gate. | `/demo/wallet` or curl-demo approve path |
| Completeness | 20% | Working app: gateway, preflight, policy, adapter signal, audit trail, dashboard. | `curl-demo.sh`, `/dashboard`, `/demo/agent` |
| Scalability | 20% | Roadmap: Security RPC / preflight API → OpsRisk Cloud → managed gateway → adapter marketplace; on-chain policy hash as trust anchor where deployed. | README roadmap + registry link when set |

## Thirty seconds

Normal RPC forwards execution requests blindly. Aegis sits in front of your provider, decodes intent, runs deterministic policy, merges adapter signals (Chainlink is one), and returns SAFE, WARN, or BLOCK before broadcast. AI may explain context after the verdict is fixed—it does not override policy.

## Two minutes (order)

1. RPC passthrough — trust the middleware shape.  
2. Preflight + BLOCK — drainer-class approve.  
3. Adapter — price/freshness as input to policy, not the product story.  
4. Dashboard — auditability / OpsRisk surface.  
5. One sentence roadmap.

## If they push on Chainlink

Chainlink proves a real external signal in the adapter slot. The product is the gateway and policy system; adapters are pluggable.

## If they push on AI

AI is assistive narrative and WARN-era UX; enforcement is deterministic with audit events.
