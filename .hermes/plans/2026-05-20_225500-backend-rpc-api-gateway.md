# Sub-plan — backend-rpc API gateway (PABTI)

**Task:** t_197db7b1  
**Time:** 2026-05-20T22:55:00Z  
**Workspace:** dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc

## Plan

1. Align `POST /api/rpc` intercept JSON-RPC `error.data` with kit `docs/04-api-spec.md` (verdict, reasonCode, broadcasted; no policy in route).
2. Sync kit `docs/04-api-spec.md` passthrough/intercept lists with `plan-chunks/08` + current `lib/rpc/client.ts`.
3. Keep policy in `preflightService` / engine only.

## Analyze

- Route already validates with zod, forwards reads via `forwardRpcCall`, blocks tx methods without embedding policy.
- Gap: intercept response used ad-hoc `data`; spec expects BLOCK-shaped envelope.

## Build

- `apps/web/src/lib/rpc/client.ts` — export `buildInterceptScreeningError(method)`.
- `apps/web/src/app/api/rpc/route.ts` — use it.

## Test

- `forge test` (contracts)
- `npm run build --prefix apps/web`
- `tests/curl-demo.sh` with dev server + `AEGIS_BASE_URL`

## Integrate

- Kanban comment on parent t_e69aadd4 with plan path + status.
