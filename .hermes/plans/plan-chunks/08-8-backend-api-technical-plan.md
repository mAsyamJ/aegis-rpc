## 8. Backend API Technical Plan

### POST /api/rpc — JSON-RPC Gateway

**Passthrough:** `eth_chainId`, `eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_getTransactionCount`, `eth_estimateGas`, `eth_gasPrice`, `eth_maxPriorityFeePerGas`, `eth_getCode`, `eth_getTransactionByHash`, `eth_getTransactionReceipt`

**Intercepted:** `eth_sendRawTransaction`, `aegis_preflight`, `aegis_sendTransaction`

```json
// Passthrough request + response
{ "jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": [] }
{ "jsonrpc": "2.0", "id": 1, "result": "0x1a2b3c" }

// BLOCK error response
{
  "jsonrpc": "2.0", "id": 1,
  "error": {
    "code": -32090,
    "message": "Aegis BLOCK: unlimited approval to unknown spender",
    "data": { "verdict": "BLOCK", "reasonCode": "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
               "broadcasted": false, "requestId": "req_abc123" }
  }
}
```

### POST /api/preflight — Primary Screening Interface

```json
// Request
{
  "chainId": 84532, "from": "0xAgent",
  "to": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "valueWei": "0",
  "data": "0x095ea7b3000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "policyId": "default-wallet-policy"
}

// Response — returned fast, AI memo arrives async
{
  "requestId": "req_abc123",
  "verdict": "BLOCK",
  "reasonCode": "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
  "broadcasted": false,
  "intent": {
    "selector": "0x095ea7b3",
    "decodedFunction": "approve(address,uint256)",
    "decodedArgs": { "spender": "0xDemoSpender", "amount": "115792...MAX" },
    "isUnknownSelector": false,
    "useCase": "wallet"
  },
  "signals": [
    { "adapter": "approval-risk", "status": "BLOCK",
      "reasonCode": "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
      "message": "MaxUint256 approval to non-allowlisted spender." }
  ],
  "memo": null,
  "memoStatus": "generating",
  "onChainPolicyHash": "0xabc123...",
  "latencyMs": 312
}
```

### GET /api/ai-analyze?requestId= — Async AI Retrieval

```json
// Available ~1-3s after preflight returns
{
  "requestId": "req_abc123",
  "memo": "Aegis blocked this transaction because it requests unlimited ERC20 approval to an address not on your policy allowlist. Unlimited approvals give permanent token access to the spender. Verify the spender address before proceeding.",
  "unknownSelectorGuess": null,
  "riskSummary": null,
  "preSigningAssist": null,
  "confidence": "high",
  "generatedAt": "2026-05-20T14:30:03Z"
}

// WARN case — preSigningAssist populated
{
  "requestId": "req_def456",
  "memo": "Aegis flagged this ETH transfer because the value ($4,850 at current ETH/USD price) exceeds your agent policy cap of $500 per action. The Chainlink ETH/USD feed is fresh (23s old).",
  "riskSummary": "High relative risk: agent action exceeds per-action USD limit by 9.7x.",
  "preSigningAssist": "Before overriding: this swap exceeds your agent's $500/action policy cap by 9.7x. The Chainlink feed is fresh (23s), so the USD calculation is accurate. Override only if this is an intentional manual exception — consider updating your policy limit if this amount recurs.",
  "confidence": "high",
  "generatedAt": "2026-05-20T14:30:04Z"
}
```

### POST /api/safe-send

```json
// Request
{ "requestId": "req_abc123", "override": false }

// Response — SAFE forwarded
{ "txHash": "0xabc...", "broadcasted": true, "verdict": "SAFE" }

// Response — WARN overridden
{ "txHash": "0xdef...", "broadcasted": true, "verdict": "WARN", "overridden": true }

// Response — BLOCK cannot override in enforce mode
{ "broadcasted": false, "verdict": "BLOCK",
  "error": "BLOCK verdict cannot be overridden in enforce mode" }
```

### GET /api/events

```json
{
  "events": [{
    "id": "uuid", "requestId": "req_abc123",
    "createdAt": "2026-05-20T14:30:00Z",
    "chainId": 84532, "method": "aegis_preflight",
    "fromAddress": "0xAgent", "toAddress": "0x036C...",
    "valueWei": "0", "valueUsd": null,
    "selector": "0x095ea7b3", "decodedFunction": "approve(address,uint256)",
    "isUnknownSelector": false, "useCase": "wallet",
    "policyId": "default-wallet-policy",
    "verdict": "BLOCK", "reasonCode": "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
    "signals": [...],
    "broadcasted": false, "txHash": null,
    "aiMemo": "Aegis blocked this transaction because...",
    "aiAnalysis": { "riskSummary": null, "preSigningAssist": null, "confidence": "high" },
    "onChainPolicyHash": "0xabc123...",
    "latencyMs": 312
  }]
}
```

---
