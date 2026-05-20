import type { DemoScenario } from "@/lib/types/aegis";

const AGENT = "0xA9e15A7d2c0B7F0EaF94c2De27B5C7e1aaF50001";
const SPENDER_BAD = "0xDEadBee5deAdBeEFdEadbeEFDeAdBEefDeAdbeef";
const SPENDER_OK = "0xAE61B5C3b6e9210Aa12345678Aef0c11B0A0Ab00";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
const FEED_ETH_USD = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";

export const demoScenarios: DemoScenario[] = [
  {
    id: "agent-safe-low-value",
    audience: "agent",
    title: "Safe low-value action",
    summary:
      "Agent transfers 25 USDC to an allowlisted treasury operations wallet.",
    expectedVerdict: "SAFE",
    expectedReasonCode: "POLICY_OK",
    policyHash: "0x9c44…a17e",
    policyMode: "enforce",
    latencyMs: 412,
    intent: {
      from: AGENT,
      to: USDC,
      value: "0",
      valueUsd: 25,
      data: "0xa9059cbb000000000000000000000000ae61b5c3b6e9210aa12345678aef0c11b0a0ab0000000000000000000000000000000000000000000000000000000000017d7840",
      selector: "0xa9059cbb",
      functionSignature: "transfer(address,uint256)",
      decodedArgs: [
        { name: "to", type: "address", value: SPENDER_OK },
        { name: "amount", type: "uint256", value: "25.00 USDC" },
      ],
      chainId: 84532,
      nonce: 41,
    },
    adapters: [
      {
        adapter: "ChainlinkPriceAdapter",
        status: "OK",
        label: "ETH/USD price fresh",
        detail: "Age 14s · maxAge 60s",
        source: FEED_ETH_USD,
        latencyMs: 88,
        data: { price: 3412.18, decimals: 8, ageSec: 14 },
      },
      {
        adapter: "AllowlistAdapter",
        status: "OK",
        label: "Recipient on treasury allowlist",
        detail: "Tag: ops-treasury",
        latencyMs: 6,
      },
      {
        adapter: "ContractCodeAdapter",
        status: "OK",
        label: "USDC verified token",
        detail: "Known ERC-20 · Base Sepolia",
        latencyMs: 22,
      },
    ],
    checks: [
      { id: "cap", name: "USD per-tx cap", status: "OK", detail: "$25 of $500" },
      { id: "selector", name: "Selector allowlist", status: "OK", detail: "transfer ✓" },
      { id: "recipient", name: "Recipient allowlist", status: "OK" },
      { id: "freshness", name: "Oracle freshness", status: "OK", detail: "14s" },
    ],
    ai: {
      summary:
        "Routine treasury sweep to a known operations wallet. Amount is well within daily and per-tx caps, ERC-20 contract is verified, and the Chainlink ETH/USD feed is fresh.",
      risks: [],
      suggestion: "Safe to broadcast.",
      confidence: 0.96,
      model: "aegis-explain-v1",
    },
  },
  {
    id: "agent-over-cap",
    audience: "agent",
    title: "Agent exceeds USD policy cap",
    summary:
      "Agent attempts a 4,800 USDC transfer; policy cap per-tx is 500 USDC.",
    expectedVerdict: "BLOCK",
    expectedReasonCode: "AGENT_TX_CAP_EXCEEDED",
    policyHash: "0x9c44…a17e",
    policyMode: "enforce",
    latencyMs: 388,
    intent: {
      from: AGENT,
      to: USDC,
      value: "0",
      valueUsd: 4800,
      data: "0xa9059cbb000000000000000000000000ae61b5c3b6e9210aa12345678aef0c11b0a0ab00000000000000000000000000000000000000000000000000000000011e1a3000",
      selector: "0xa9059cbb",
      functionSignature: "transfer(address,uint256)",
      decodedArgs: [
        { name: "to", type: "address", value: SPENDER_OK },
        { name: "amount", type: "uint256", value: "4,800.00 USDC", highlight: true },
      ],
      chainId: 84532,
      nonce: 42,
    },
    adapters: [
      {
        adapter: "ChainlinkPriceAdapter",
        status: "OK",
        label: "USDC/USD fresh",
        detail: "Age 9s",
        latencyMs: 71,
        source: FEED_ETH_USD,
        data: { price: 1.0001, decimals: 8, ageSec: 9 },
      },
      {
        adapter: "AllowlistAdapter",
        status: "OK",
        label: "Recipient allowlisted",
        latencyMs: 5,
      },
    ],
    checks: [
      {
        id: "cap",
        name: "USD per-tx cap",
        status: "BLOCK",
        reasonCode: "AGENT_TX_CAP_EXCEEDED",
        detail: "$4,800 exceeds $500 per-tx cap",
      },
      { id: "selector", name: "Selector allowlist", status: "OK" },
      { id: "recipient", name: "Recipient allowlist", status: "OK" },
    ],
    ai: {
      summary:
        "The agent attempted a transfer that is 9.6× the configured per-transaction cap. Even though the recipient is allowlisted, the deterministic policy engine rejected this before broadcast.",
      risks: [
        "USD value exceeds per-tx cap by $4,300",
        "Pattern matches potential prompt-induced over-spend",
      ],
      suggestion:
        "Split into smaller transfers under $500 or escalate to a human approver.",
      confidence: 0.99,
      model: "aegis-explain-v1",
    },
  },
  {
    id: "agent-unknown-selector",
    audience: "agent",
    title: "Unknown selector warning",
    summary:
      "Agent calls a contract function not present in its selector allowlist.",
    expectedVerdict: "WARN",
    expectedReasonCode: "SELECTOR_NOT_ALLOWLISTED",
    policyHash: "0x9c44…a17e",
    policyMode: "warn",
    latencyMs: 504,
    intent: {
      from: AGENT,
      to: "0x9c1B2A3F4d5E6C7B8A9D0e1F2A3B4C5D6E7F8a9b",
      value: "0",
      valueUsd: 12,
      data: "0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001",
      selector: "0xdeadbeef",
      functionSignature: "unknown(bytes32)",
      decodedArgs: [
        { name: "selector", type: "bytes4", value: "0xdeadbeef", highlight: true },
        { name: "arg0", type: "bytes32", value: "0x00…01" },
      ],
      chainId: 84532,
      nonce: 43,
    },
    adapters: [
      {
        adapter: "ContractCodeAdapter",
        status: "WARN",
        label: "Unverified contract",
        detail: "No source on BaseScan",
        latencyMs: 38,
      },
      {
        adapter: "AllowlistAdapter",
        status: "WARN",
        label: "Selector not in allowlist",
        detail: "0xdeadbeef · unknown(bytes32)",
        latencyMs: 6,
      },
    ],
    checks: [
      {
        id: "selector",
        name: "Selector allowlist",
        status: "WARN",
        reasonCode: "SELECTOR_NOT_ALLOWLISTED",
        detail: "0xdeadbeef not registered",
      },
      { id: "cap", name: "USD per-tx cap", status: "OK", detail: "$12 of $500" },
    ],
    ai: {
      summary:
        "The destination contract is unverified and the called selector is not in this agent's allowlist. Policy mode is WARN, so the operator can override after review.",
      risks: [
        "Unverified contract — calldata semantics cannot be statically inferred",
        "Selector 0xdeadbeef has no human-readable signature",
      ],
      suggestion:
        "Verify source on BaseScan and add selector to allowlist before re-running.",
      confidence: 0.78,
      model: "aegis-explain-v1",
    },
  },
  {
    id: "agent-stale-feed",
    audience: "agent",
    title: "Stale price feed block",
    summary:
      "Trade requires fresh ETH/USD price; Chainlink feed is older than maxAge.",
    expectedVerdict: "BLOCK",
    expectedReasonCode: "ORACLE_STALE",
    policyHash: "0x9c44…a17e",
    policyMode: "enforce",
    latencyMs: 332,
    intent: {
      from: AGENT,
      to: "0x4200000000000000000000000000000000000006",
      value: "100000000000000000",
      valueUsd: 341,
      data: "0x7ff36ab50000000000000000000000000000000000000000000000000000000000000001",
      selector: "0x7ff36ab5",
      functionSignature: "swapExactETHForTokens(uint256,address[],address,uint256)",
      decodedArgs: [
        { name: "amountIn", type: "uint256", value: "0.1 ETH" },
        { name: "minOut", type: "uint256", value: "1 wei", highlight: true },
      ],
      chainId: 84532,
      nonce: 44,
    },
    adapters: [
      {
        adapter: "ChainlinkPriceAdapter",
        status: "BLOCK",
        label: "Price feed stale",
        detail: "Age 412s · maxAge 60s",
        source: FEED_ETH_USD,
        latencyMs: 92,
        data: { price: 3402.5, decimals: 8, ageSec: 412, maxAgeSec: 60 },
      },
      {
        adapter: "SimulationAdapter",
        status: "WARN",
        label: "minOut suspiciously low",
        detail: "1 wei minOut on 0.1 ETH swap",
        latencyMs: 140,
      },
    ],
    checks: [
      {
        id: "freshness",
        name: "Oracle freshness",
        status: "BLOCK",
        reasonCode: "ORACLE_STALE",
        detail: "412s > 60s",
      },
      {
        id: "slippage",
        name: "Slippage sanity",
        status: "WARN",
        detail: "minOut = 1 wei",
      },
    ],
    ai: {
      summary:
        "Chainlink ETH/USD price is 412 seconds old, exceeding the 60s maxAge required by this policy. The swap also has an unreasonable minOut. Blocked deterministically.",
      risks: [
        "Stale oracle could permit MEV-friendly pricing",
        "1 wei minOut allows near-total slippage",
      ],
      suggestion: "Wait for fresh oracle update or use a different price source.",
      confidence: 0.94,
      model: "aegis-explain-v1",
    },
  },
  {
    id: "wallet-unlimited-approval",
    audience: "wallet",
    title: "Unlimited approval to unknown spender",
    summary:
      "approve(spender, MaxUint256) to an address not on the user's allowlist.",
    expectedVerdict: "BLOCK",
    expectedReasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
    policyHash: "0x71b2…fe04",
    policyMode: "enforce",
    latencyMs: 287,
    intent: {
      from: "0x1234567890aBCdef1234567890abcDEf12345678",
      to: USDC,
      value: "0",
      valueUsd: 0,
      data: "0x095ea7b3000000000000000000000000deadbee5deadbeefdeadbeefdeadbeefdeadbeefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      selector: "0x095ea7b3",
      functionSignature: "approve(address,uint256)",
      decodedArgs: [
        { name: "spender", type: "address", value: SPENDER_BAD, highlight: true },
        { name: "amount", type: "uint256", value: "MaxUint256 (unlimited)", highlight: true },
      ],
      chainId: 84532,
      nonce: 12,
    },
    adapters: [
      {
        adapter: "ApprovalRiskAdapter",
        status: "BLOCK",
        label: "Unlimited approval detected",
        detail: "amount = 2^256-1",
        latencyMs: 4,
      },
      {
        adapter: "AllowlistAdapter",
        status: "BLOCK",
        label: "Spender not allowlisted",
        detail: shorten(SPENDER_BAD),
        latencyMs: 5,
      },
      {
        adapter: "ContractCodeAdapter",
        status: "WARN",
        label: "Spender contract unverified",
        latencyMs: 31,
      },
    ],
    checks: [
      {
        id: "approval-cap",
        name: "Approval amount cap",
        status: "BLOCK",
        reasonCode: "UNLIMITED_APPROVAL",
        detail: "Unlimited approvals forbidden by wallet policy",
      },
      {
        id: "spender",
        name: "Spender allowlist",
        status: "BLOCK",
        reasonCode: "SPENDER_NOT_ALLOWLISTED",
      },
    ],
    ai: {
      summary:
        "This is the classic 'drainer' approval pattern: an unlimited token allowance granted to an unverified, non-allowlisted spender. Aegis blocked it before broadcast.",
      risks: [
        "Unlimited ERC-20 allowance to attacker-controlled spender",
        "Spender contract has no verified source",
      ],
      suggestion:
        "If interaction is genuinely needed, approve only the exact amount required for one transaction.",
      confidence: 0.99,
      model: "aegis-explain-v1",
    },
  },
];

function shorten(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function getScenario(id: string): DemoScenario | undefined {
  return demoScenarios.find((s) => s.id === id);
}

export function scenariosFor(audience: DemoScenario["audience"]): DemoScenario[] {
  return demoScenarios.filter((s) => s.audience === audience);
}
