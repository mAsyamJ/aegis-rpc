## 21. Demo Script

### Opening, 15 seconds

"Every Web3 transaction passes through RPC, but normal RPC forwards blindly. Aegis turns that path into a programmable checkpoint. It screens high-risk actions before broadcast and returns SAFE, WARN, or BLOCK."

### Demo 1, RPC passthrough

Click: `/demo/agent` then `Test RPC passthrough`.

Say: "Read-only calls stay fast. Aegis is real middleware, not just a dashboard."

Expected: `eth_blockNumber` and `eth_getBalance` return Base Sepolia data.

Judge takeaway: completeness and infrastructure fit.

### Demo 2, agent policy BLOCK

Click: `$5,000 Agent Swap` with policy cap `$500`.

Say: "This is the agentic economy problem. An agent wants to move value outside its budget. Aegis reads live ETH/USD through Chainlink, computes USD notional, and blocks before broadcast."

Expected: BLOCK, reason `EXCEEDS_USD_LIMIT`, Chainlink signal shows price, age, valueUsd.

Judge takeaway: problem-solving with live external data.

### Demo 3, mode switch WARN

Click: policy mode `warn`, rerun same action.

Say: "Operators can tune posture without redeploying. Same engine, same policy, different mode. Now this is a WARN with an override path."

Expected: WARN, PreSigningAssist explains what to consider.

Judge takeaway: platform behavior, not one-off rule.

### Demo 4, wallet drainer approval

Click: `Unlimited approval` scenario.

Say: "This is the most relatable risk. Aegis decodes ERC20 approve and blocks MaxUint256 approval to an unknown spender."

Expected: BLOCK, decoded function `approve(address,uint256)`, approval-risk signal.

Judge takeaway: practical, familiar security value.

### Demo 5, dashboard

Open `/dashboard`.

Say: "The OpsRisk dashboard shows every decision, decoded intent, adapter signals, AI memo, broadcast status, and on-chain policy hash. This is the seed of the paid product."

Expected: timeline with all events.

### Closing, 20 seconds

"Existing tools either sit inside a wallet or after the chain executes. Aegis sits between an organization's signer and the chain, the last place automated transactions can be stopped before they cost money. We start as a Security RPC plus preflight API, expand into OpsRisk Cloud, and upsell managed execution infrastructure."

---
