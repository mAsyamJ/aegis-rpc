# Plan — Agent: backend-rpc (Wave A)

**Profile:** `backend-rpc`  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Related waves:** A1–A5 (with decoder/policy handoffs)

## Goal

`POST /api/rpc` JSON-RPC passthrough for read methods per `../docs/04-api-spec.md`; routing for tx methods toward preflight path without embedding policy in handlers.

## Read order

- Kit `../docs/04-api-spec.md`, `../docs/05-` (as referenced by chunks)
- `.hermes/plans/plan-chunks/08-8-backend-api-technical-plan.md`
- `ORCHESTRATOR.md` Slice 1

## OpenSrc gate

Run **backend-rpc** block in `../docs/research/agent-research-assignments.md` (execution-apis, viem, Next route handlers, rpc-endpoint proxy patterns).

## Proposed approach

- Route handler: validate body with `zod`, forward read calls to underlying RPC (viem/public client).
- Errors: JSON-RPC-shaped errors; never log full bodies or secrets.
- Coordinate with **tx-decoder** / **policy** for `eth_sendRawTransaction` interception semantics per spec.

## Files likely to change

- `apps/web/src/app/api/rpc/**` (or repo’s actual API route path)
- Shared types if JSON-RPC envelope is centralized

## Tests / validation

- Curl or `tests/curl-demo.sh` subset for `eth_chainId`, `eth_blockNumber`, `eth_getBalance`, `eth_call`
- `npm run build --prefix apps/web`

## Definition of done

- Deterministic passthrough tests pass
- No policy logic inside RPC route (boundary: `.cursor/rules/01-architecture-boundaries.mdc`)

## Risks

- Port/base URL mismatch — document `AEGIS_BASE_URL` for QA.
