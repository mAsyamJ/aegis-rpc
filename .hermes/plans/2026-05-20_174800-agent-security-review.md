# Plan — Agent: security (review / gate; optional board profile)

**Profile:** `aegis-security` or `security` (if on Kanban)  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Mode:** Read-heavy review; code changes only for **test gaps** or **severity-1** issues.

## Goal

Independently verify **policy** + **adapter** + **decoder** align with Web3 safety baselines: infinite approval risk, feed freshness, JSON-RPC error safety, no AI-before-policy, no secret leakage.

## Read order

- `AGENTS.md`, `DECISIONS.md`
- `.hermes/plans/plan-chunks/10-10-policy-engine-design.md`, `11-11-adapter-layer-design.md`
- Implemented PRs or SHAs provided by orchestrator

## OpenSrc gate

Run **pitch / security** security bullets in `../docs/research/agent-research-assignments.md` (Chainlink stale fields, OZ MaxUint256 / approve patterns).

## Checklist (deliver as markdown comment to orchestrator)

- Every **BLOCK** has **`reasonCode`** and user-visible explanation path
- Chainlink adapter: `updatedAt` / heartbeat handling matches documented intent
- **AI memo** cannot change verdict; grep for accidental reorder
- Logs: no private keys, seeds, or full PII bodies
- `curl-demo.sh` + `/demo/agent` paths cannot return fake **`onChainPolicyHash`**

## Output

- `SECURITY_REVIEW.md` or Kanban comment: findings **P0/P1/P2**, owners (which agent profile), retest notes

## Definition of done

- P0 empty before Phase 2B “done” call, or explicit waiver with human sign-off

## Risks

- Blocking on theoretical issues — prioritize demo integrity and honest claims per `AGENTS.md`
