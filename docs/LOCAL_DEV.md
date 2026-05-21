# Local development (Aegis RPC web)

## Prereqs

- Node 20+ (match Vercel default)
- npm

## One-time setup

From repo root `aegis-rpc/`:

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local` if you need a non-default Base Sepolia RPC or Chainlink feed address. Never commit `.env.local`.

### Optional Supabase audit persistence

When set, audit events persist across server restarts (otherwise in-memory store):

- `SUPABASE_URL` — project URL from Supabase dashboard
- `SUPABASE_ANON_KEY` — publishable/anon key (works for MVP after migration disables RLS on audit tables)
- `SUPABASE_SERVICE_ROLE_KEY` — optional; preferred for production (never expose to the browser)

**One-time:** In [Supabase SQL Editor](https://supabase.com/dashboard), run the full script in [`supabase/migrations/001_aegis_events.sql`](../supabase/migrations/001_aegis_events.sql).

Restart `npm run dev` after changing `.env.local`.

### Optional broadcast (demo / staging only)

- `AEGIS_ALLOW_BROADCAST=true` — enable real `sendRawTransaction` when `serializedTransaction` is on the audit event
- `DEPLOYER_PRIVATE_KEY` — local/CI only; never commit

## Install and run

```bash
cd apps/web && npm install && npm run dev
```

Or from repo root:

```bash
npm run dev
```

Build check:

```bash
npm run build
```

Smoke scripts (with server running): see `README.md` and `tests/curl-demo.sh` (`AEGIS_BASE_URL`).

## Vercel (Phase 5 — public Base Sepolia RPC)

**Architecture:** Vercel hosts Next.js (`/api/rpc`, `/api/preflight`). Supabase stores `aegis_events` only — not the JSON-RPC layer.

1. Create/link a Vercel project with **Root Directory** `apps/web` (repo root is `aegis-rpc/`).
2. Set **Production** environment variables (never commit values):

| Variable | Required | Notes |
|----------|----------|--------|
| `BASE_SEPOLIA_RPC_URL` | yes | Upstream RPC (Alchemy, Infura, or `https://sepolia.base.org`) |
| `NEXT_PUBLIC_CHAIN_ID` | yes | `84532` |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | yes | Wallet connect on demo pages |
| `SUPABASE_URL` | yes (public demo) | Shared audit log across users |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (public demo) | Server-only; never `NEXT_PUBLIC_*` |
| `NEXT_PUBLIC_AEGIS_RPC_URL` | recommended | `https://<your-domain>/api/rpc` for SSR/wagmi |
| `OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY` | optional | Live LLM memos; else template fallback |

**Do not set on Vercel:** `NEXT_PUBLIC_AEGIS_FIXTURES`, `AEGIS_ALLOW_BROADCAST`, `DEPLOYER_PRIVATE_KEY`.

**Optional:** `AEGIS_CORS_ORIGIN` (default `*`), `AEGIS_PUBLIC_RPC_ENABLED=false` (kill switch).

3. Deploy:

```bash
cd apps/web
vercel link    # once
vercel --prod
```

4. Post-deploy smoke:

```bash
AEGIS_PROD_URL=https://<your-domain> ./tests/curl-production-smoke.sh
```

5. Paste production URL into `HACKATHON.md` and `README.md` (Live app row).

### MetaMask custom network (integrators)

| Field | Value |
|-------|--------|
| Network | Base Sepolia |
| Chain ID | `84532` |
| RPC URL | `https://<your-domain>/api/rpc` |
| Currency | ETH |

Flow: read calls via RPC → `POST /api/preflight` or `aegis_preflight` → `aegis_sendTransaction` with `requestId` (raw `eth_send*` returns `-32090 REQUIRES_PREFLIGHT`).
