# Frontend plan — professional dashboard, landing vs app shell, Reown wallet + AA

**Profile:** frontend (Wave C) under Phase 2B  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**Board:** `aegis-hackathon`  
**Saved:** `2026-05-20_202600-frontend-landing-reown-dashboard.md`

## Goal

1. Align UI with **plan chunk §7** (`plan-chunks/07-7-frontend-technical-plan.md`): clear **landing** vs **in-app** surfaces.  
2. Deep consistency: spacing, typography, page headers, cards, empty states — **OpsRisk-grade** dashboard feel (inspired by OpenSrc brief in `docs/research/agent-research-assignments.md` §frontend: shadcn patterns, TanStack Query live refresh, Rabby/Tenderly-style risk presentation).  
3. **Wallet login** using **Reown AppKit** (account abstraction + EOA): interpret “re own” as **Reown** (WalletConnect stack); AppKit supports **Smart Accounts** on supported chains and standard wallet connect for Base Sepolia.

## Current context (codebase)

- **`/`** (`apps/web/src/app/page.tsx`): Marketing-style hero and sections, but wrapped in **`AppShell`** (sidebar + `TopStatusBar`) — same chrome as `/dashboard`. Sidebar labels **`/`** as **“Overview”** (`Sidebar.tsx`), so landing reads as an app tab, not a public landing.
- **In-app pages** (`/dashboard`, `/demo/*`, `/policies`, `/adapters`) correctly use `AppShell`.
- **Stack:** Next 16, React 19, Tailwind 4, shadcn-style `components/ui`, **`viem`** only — **no** `wagmi`, **no** `@tanstack/react-query` yet (research brief recommends Query for polling).
- **`demo/wallet`:** Simulated preflight only; no real signer — good place to wire “Connect wallet” once AppKit exists.

## Assumptions

- **Reown AppKit** + **wagmi** + **viem** is the chosen stack for connect + optional **ERC-4337 smart accounts** where the chain/network supports it; Base Sepolia is supported for connections (verify latest AppKit chain presets).  
- If product prefers **Privy** / **thirdweb** / **Coinbase Embedded** instead, swap §3.2 only — routing and layout split stay the same.  
- **Secrets:** never put wallet passwords, private keys, or project IDs meant to be secret into Kanban bodies, plans, or Telegram. Use `.env.local` + deployment env for `NEXT_PUBLIC_*` Reown Project ID only.

## Proposed approach

### A) Route layout split (landing vs dashboard app)

Use Next.js **route groups** so layouts compose cleanly:

| Surface | Routes | Layout |
|--------|--------|--------|
| **Marketing / landing** | `/` | Minimal: no `Sidebar`; optional slim top bar with logo + “Open app” / “Connect” that links or opens connect |
| **Application** | `/dashboard`, `/demo`, `/policies`, `/adapters`, future `/overview` if needed | `AppShell` (sidebar + status) |

**Concrete steps:**

1. Add `apps/web/src/app/(marketing)/layout.tsx` — full-width, optional light header/footer; **no** `AppShell`.  
2. Move current `page.tsx` → `apps/web/src/app/(marketing)/page.tsx` (same content or trimmed).  
3. Add `apps/web/src/app/(app)/layout.tsx` that wraps `children` with **`AppShell`**.  
4. Move `dashboard/`, `demo/`, `policies/`, `adapters/` under `app/(app)/...` **without changing URLs** (route groups do not affect path).  
5. Update **`Sidebar`**: replace **“Overview” → `/”** with **“Home”** or **“Marketing”** linking to `/`, and add **“OpsRisk dashboard”** as primary in-app home if you want a dedicated **`/overview`** KPI strip — **recommended:** keep **`/dashboard`** as the main Ops surface per §7; use **`/`** only for landing. Optionally add **`/app`** redirect to `/dashboard` for “Enter app”.

### B) Visual / UX consistency (“professional dashboard”)

1. **Page template:** Shared `PageHeader` component: eyebrow (`text-[10px] uppercase tracking`), `h1`, description — reuse on `dashboard`, `demo/*`, `policies`, `adapters` (wallet demo already partially matches).  
2. **Density:** Align `max-w-*`, `px-6 py-8` grid gutters across app routes.  
3. **Cards:** Standardize on `rounded-xl border border-border bg-surface` + consistent internal padding (`p-4` / `p-5`).  
4. **Empty states:** Dashboard empty panel → same pattern as agent demo loading (icon + line + CTA link to `/demo/agent`).  
5. **Live data:** Introduce **`@tanstack/react-query`** for `getEvents()` (and optionally preflight polling) per research §frontend — replace raw `useEffect` + `setInterval` in `dashboard/page.tsx` with `useQuery({ queryKey: ['events'], queryFn: getEvents, refetchInterval: 3000 })`.  
6. **OpenSrc gate (worker body line):** Run ripgrep passes from `docs/research/agent-research-assignments.md` §frontend on local clones under `~/.opensrc/...` when available; port **patterns** only (not code), especially Rabby risk hierarchy and Tenderly “preview” information density.

### C) Reown (wallet + account abstraction)

1. **Dependencies:** `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi`, `@tanstack/react-query`, `viem` (already present — align versions with AppKit docs).  
2. **Providers:** Client-only `Web3Provider` (or `AppKitProvider`) in `apps/web/src/components/web3/…` — wrap **`(app)` layout** only (or root if landing needs “Connect” in header — prefer **marketing layout** thin header with connect that still uses same provider **tree** from root `layout.tsx` once, to avoid double mount).  
3. **Config:** `createAppKit` with **Base Sepolia**; `projectId` from `NEXT_PUBLIC_REOWN_PROJECT_ID` (or AppKit’s documented env name — match official docs at implementation time).  
4. **UI:** `AppKitButton` / connect control in **`TopStatusBar`** or sidebar footer: show **chain**, **address** (truncated), **disconnect**.  
5. **Smart accounts:** Enable AppKit **smart account** / **ERC-4337** module per Reown docs for Base Sepolia if in scope; otherwise document “EOA + connect only” for MVP and leave AA toggle behind feature flag.  
6. **`demo/wallet`:** After connect, show **connected address** and optional “Sign-less intent” copy; keep **server-side preflight** as source of truth for demo (on-chain signing is out of scope unless product adds broadcast step).

## Files likely to change

- `apps/web/src/app/layout.tsx` — possibly wrap with QueryClientProvider + Web3 provider.  
- New: `apps/web/src/app/(marketing)/layout.tsx`, `(marketing)/page.tsx`.  
- New: `apps/web/src/app/(app)/layout.tsx`.  
- Move: `dashboard/`, `demo/`, `policies/`, `adapters/` → `(app)/...`.  
- `apps/web/src/components/layout/Sidebar.tsx` — nav targets, labels.  
- `apps/web/src/components/layout/TopStatusBar.tsx` — wallet chip / connect.  
- New: `components/web3/*`, `lib/wagmi.ts` or `lib/appkit.ts`.  
- `apps/web/package.json` — new deps.  
- `apps/web/src/app/dashboard/page.tsx` — TanStack Query.  
- `docs/AI_COLLABORATION_LOG.md` — row after implementation commit.

## Tests / validation

- `npm run build --prefix apps/web`  
- Manual: `/` has **no** sidebar; `/dashboard` has sidebar; deep links `/demo/agent` unchanged.  
- Connect wallet on Base Sepolia; disconnect; refresh persistence per wagmi state.  
- `AEGIS_BASE_URL=... ./tests/curl-demo.sh` unchanged green (APIs unaffected).

## Risks / tradeoffs

- **Next.js 16 + App Router + wagmi SSR:** Keep wallet code in **`"use client"`** boundaries; avoid importing wagmi hooks in server components.  
- **Bundle size:** AppKit increases JS — lazy-load connect modal if needed.  
- **“Account abstraction”:** Full AA flows (paymaster, userOp broadcast) are **large scope**; MVP = **connected identity + optional smart account** with preflight still **off-chain** unless contracts/agent path requires otherwise.

## Orchestrator note (outside this file’s implementation)

Full Phase 2B dispatch (`hermes kanban dispatch --max 2`, Wave A–D children, forge/deploy gates) remains **orchestrator-owned**; this file scopes **Wave C frontend** only. **Do not** embed deploy passwords or private keys in any task body.

## Acceptance (frontend worker)

- [ ] `/` marketing layout without `AppShell`; app routes under `(app)` with `AppShell`.  
- [ ] Sidebar nav accurate (no “Overview” masquerading as in-app home unless product wants `/overview`).  
- [ ] Reown connect in app chrome; Base Sepolia default.  
- [ ] TanStack Query for events timeline polling.  
- [ ] Shared `PageHeader` (or equivalent) on major app pages.  
- [ ] Build green; demo script paths still valid for `/demo/agent`.
