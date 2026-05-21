# Sub-plan — Frontend PABTI: §7 / §21 agent demo UX

**Task:** t_dae34ef6  
**Role:** aegis-frontend  
**Saved:** 2026-05-20_231500

## Goal

Make `/demo/agent` match plan chunk §7 (LEAD demo surface) and §21 (demo script): Demo 1 RPC passthrough visible on the same page, scenario labels aligned with judge narration, explicit script steps with correct live `reasonCode` values, cross-link to wallet unlimited-approval demo, shared `PageHeader`, AI memo disclaimer wording per dashboard agent rules.

## Changes

- `RpcPassthroughPanel` on agent demo page (top, full width).
- New `DemoAgentScriptGuide` (or inline): numbered steps 1–5, API-accurate codes (`AGENT_TX_CAP_EXCEEDED`, not legacy script alias).
- `RpcPassthroughPanel` primary CTA label: "Test RPC passthrough" (match §21).
- `demoScenarios.ts`: agent cap scenario title/summary tuned for "$5K / $500 cap" narrative.
- `AiMemoPanel`: add one-line "AI explanation — not the enforcement decision."
- `app/(app)/demo/agent/page.tsx`: `PageHeader`, compose new strip + passthrough.

## Verify

`forge test`; `npm run build --prefix apps/web`; `AEGIS_BASE_URL=http://127.0.0.1:3000 ./tests/curl-demo.sh` (server up for curl).
