## 7. Frontend Technical Plan

### Pages

| Page | Purpose | Key Components | Demo Value | Judge Value |
|---|---|---|---|---|
| `/` | Landing | Hero, architecture, demo links, deployed contract links | First impression | Shows full-stack scope |
| `/demo/agent` | **LEAD DEMO** | PreflightForm, VerdictCard, PolicyModeToggle, DemoScenarioSelector, PreSigningAssistPanel | Agent $5K swap BLOCK → mode flip → WARN + AI pre-signing assist → override → tx hash | End-to-end product proof |
| `/demo/wallet` | Wallet demo | PreflightForm, VerdictCard | approve(MaxUint256) BLOCK + AI memo | Relatable hook |
| `/dashboard` | OpsRisk | EventTimeline, VerdictBadge, AdapterSignalCard, AiMemoPanel, RpcStatusCard | All demo decisions + AI memos + on-chain policy links | Completeness + business surface |
| `/demo/defi` | DeFi (stretch) | PreflightForm, VerdictCard | Swap deviation + Chainlink | Multi-vertical |
| `/demo/rwa` | RWA (stretch) | PreflightForm, VerdictCard | Mint value limit | Institutional use case |

### Key Components

| Component | Props | Behavior |
|---|---|---|
| `PreflightForm` | `{ policyId, defaultScenario? }` | Form fields + scenario selector. Shows loading state, then VerdictCard. |
| `VerdictCard` | `{ verdict, reasonCode, signals, memo, memoStatus, requestId, broadcasted }` | Green/amber/red card. Polls `/api/ai-analyze` when `memoStatus === "generating"`. Shows AI memo when ready. |
| `PreSigningAssistPanel` | `{ requestId, onOverride }` | Shown only for WARN verdict. Fetches AI pre-signing explanation. Operator reads before clicking override. |
| `DemoScenarioSelector` | `{ scenarios, onSelect }` | "Safe transfer" / "$5K agent swap" / "Unlimited approval" / "Stale price" |
| `PolicyModeToggle` | `{ policyId, currentMode, onToggle }` | Three-way: enforce / warn / observe. Calls PUT /api/policies/{id} |
| `EventTimeline` | `{ events }` | Scrollable events with badge, decoded function, AI memo snippet, on-chain hash link |
| `AdapterSignalCard` | `{ signal }` | Adapter name, status, reason, data (price, age, USD) |
| `AiMemoPanel` | `{ memo, confidence }` | Explanation text + "AI assists only — policy decides" disclaimer |
| `RpcStatusCard` | `{ chainId, blockNumber, latency, contractsDeployed }` | Gateway health + deployed contract addresses linking to basescan |

---
