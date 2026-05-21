# Aegis web UI design system

## Layout

- **Studio Admin shell (app routes):** `DashboardShell` — `SidebarProvider` + inset `AppSidebar` (`variant="inset"`, `collapsible="icon"`) + `SidebarInset` + `DashboardHeader`
- **Content rhythm:** `@container/main flex flex-col gap-4 md:gap-6` with shell padding `p-4 md:p-6` (no `PageContainer` on app pages)
- **Marketing landing (`/`):** focused 5-beat funnel + `frontend/landing-p` visual shell — hero (metallic/gradient headline, 3D mockup) → spotlight step cards → 3 proof spotlight cards → demo glass panel → final CTA; `ParticleCanvas` + floating `LandingNav` + conic CTA; anchors `#product`, `#demo`
- **Landing effects:** `.spotlight-card`, `.text-metallic`, `.shine-button`, `.landing-enter`, `prefers-reduced-motion` disables canvas, tilt, shimmer, stagger
- **Header height:** `--dashboard-header-height` (3rem / `--spacing(12)` in shell)

## Typography

- **Section / breadcrumb:** `AdminPageHeader` or header `Breadcrumb` row
- **Page title:** `text-2xl font-semibold tracking-tight`
- **Mono data:** `font-mono text-xs` for addresses, hashes, selectors

## Surfaces

- **Default panel:** shadcn `Card` + `CardHeader` / `CardContent` (aligned with Studio Admin)
- **Legacy:** `SurfaceCard` still used in a few marketing strips
- **Verdict tones:** CSS vars `--safe`, `--warn`, `--block` from `globals.css`
- **Sidebar tokens:** `--sidebar-primary` maps to `--aegis`

## Components (prefer these)

| Primitive | Use |
|-----------|-----|
| `Card` | Dashboard metrics, timeline shell, demo panels |
| `OpsRiskMetricCards` | OpsRisk KPI strip on `/dashboard` |
| `AdminPageHeader` | App page title + breadcrumb |
| `EmptyState` | Zero-data with CTA |
| `DemoStepper` | Guided demos |
| `VerdictBadge` | SAFE / WARN / BLOCK |
| shadcn `Sidebar`, `ScrollArea`, `Breadcrumb` | Admin chrome |

## New-user flow

1. Landing `/` → **Run agent demo**
2. `/demo/agent` → 4-step judge script
3. `/dashboard` → audit timeline (empty state links back to demo)
