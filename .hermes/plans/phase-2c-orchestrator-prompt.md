# Phase 2C — Hermes orchestrator dispatch prompt

**Profile:** `aegis-orchestrator`  
**Board:** `aegis-hackathon`  
**Workspace:** `dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc`  
**UI reference:** `../frontend/sentinel-preflight/`  
**Model:** `cursor-composer-2` @ `http://127.0.0.1:8787/v1`

## Waves (Phase 2C)

| Wave | Focus | Status |
|------|-------|--------|
| E | Commit Phase 2B baseline | done in Cursor |
| F | Sentinel UI parity (landing, dashboard, policies, adapters, tokens) | done |
| G | LEAD demo: PolicyModeToggle, WARN override, PreSigningAssist | done |
| H | Backend alignment: ai-analyze shape, Chainlink feed, README | done |
| I | forge test + curl-demo; deploy gated | done |

## Demo gate

```bash
npm run build --prefix apps/web
npm run start -- --port 3020
AEGIS_BASE_URL=http://127.0.0.1:3020 ./tests/curl-demo.sh
cd contracts && forge test
```

- `/demo/agent` — LEAD with policy mode toggle
- `/demo/wallet` — approval BLOCK
- `/dashboard` — selectable timeline + AI memo
- Deploy (D3) — **blocked until human approves keys**

## Hermes prompt (maintenance / stretch)

```
/plan aegis-orchestrator: monitor Phase 2C demo gate. Do NOT implement unless gap found.
Workspace: dir:/home/asyam/dev/Project/aegis-hackathon-kit/aegis-rpc
Verify curl-demo on :3020, /demo/agent 5 scenarios, onChainPolicyHash in preflight.
Stretch: Supabase audit log, real Base Sepolia deploy (human approval), Vercel (human approval).
hermes kanban dispatch --max 2
```
