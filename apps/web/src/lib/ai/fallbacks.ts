import type { AiAnalysisResult } from "./types";

export const FALLBACK_MEMOS: Record<string, Omit<AiAnalysisResult, "source">> = {
  HIGH_ALLOWANCE: {
    summary:
      "Approve amount exceeds the high-allowance threshold but is not unlimited. Policy returned WARN — review spender and amount before signing.",
    risks: [
      "Large finite allowance can still enable significant token movement",
      "Spender is not on the policy allowlist",
    ],
    suggestion: "Approve only the exact amount needed for the next transaction.",
    confidence: 0.88,
    model: "aegis-template",
    role: "WarnContextSynthesizer",
  },
  UNLIMITED_APPROVAL_UNKNOWN_SPENDER: {
    summary:
      "Aegis blocked an unlimited ERC20 approval to a spender not on the policy allowlist — a common wallet-drainer pattern.",
    risks: [
      "Unlimited ERC-20 allowance to unverified spender",
      "Spender can drain full token balance",
    ],
    suggestion: "Approve only the exact amount needed for one transaction.",
    confidence: 0.99,
    model: "aegis-template",
    role: "MemoGenerator",
  },
  AGENT_TX_CAP_EXCEEDED: {
    summary:
      "The agent attempted a transfer exceeding the configured per-transaction USD cap. Policy blocked before broadcast.",
    risks: ["USD value exceeds per-tx cap", "Potential prompt-induced over-spend"],
    suggestion: "Split into smaller transfers or escalate to a human approver.",
    confidence: 0.99,
    model: "aegis-template",
    role: "MemoGenerator",
  },
  SELECTOR_NOT_ALLOWLISTED: {
    summary:
      "The called function selector is not registered in this agent's allowlist. Review calldata before override.",
    risks: [
      "Unverified contract semantics",
      "Selector has no registered human-readable signature",
    ],
    suggestion: "Verify contract source and add selector to allowlist.",
    confidence: 0.78,
    model: "aegis-template",
    role: "UnknownSelectorAnalyzer",
  },
  ORACLE_STALE: {
    summary:
      "Required Chainlink price feed is older than maxAge. Deterministic policy blocked the transaction.",
    risks: ["Stale oracle could permit MEV-friendly pricing"],
    suggestion: "Wait for fresh oracle update or use a different price source.",
    confidence: 0.94,
    model: "aegis-template",
    role: "WarnContextSynthesizer",
  },
  CHAINLINK_STALE_FEED: {
    summary: "Chainlink ETH/USD feed is stale relative to policy maxAge.",
    risks: ["Price data may not reflect current market"],
    suggestion: "Retry when feed updates.",
    confidence: 0.9,
    model: "aegis-template",
    role: "WarnContextSynthesizer",
  },
  UNKNOWN_FUNCTION_SELECTOR: {
    summary: "Calldata uses an unrecognized function selector. Policy returned WARN pending review.",
    risks: ["Cannot statically infer calldata semantics"],
    suggestion: "Decode calldata on a block explorer before signing.",
    confidence: 0.75,
    model: "aegis-template",
    role: "UnknownSelectorAnalyzer",
  },
  ALL_CHECKS_PASSED: {
    summary: "All deterministic policy and adapter checks passed.",
    risks: [],
    suggestion: "Safe to broadcast.",
    confidence: 0.96,
    model: "aegis-template",
    role: "MemoGenerator",
  },
  WARNING_SIGNAL: {
    summary: "One or more adapter signals returned WARN. Review before broadcast.",
    risks: ["Adapter warning present"],
    suggestion: "Inspect adapter signals on the dashboard.",
    confidence: 0.8,
    model: "aegis-template",
    role: "WarnContextSynthesizer",
  },
  ADAPTER_BLOCK: {
    summary: "An adapter returned BLOCK under enforce mode.",
    risks: ["Deterministic block signal fired"],
    suggestion: "Do not broadcast without policy change.",
    confidence: 0.99,
    model: "aegis-template",
    role: "MemoGenerator",
  },
};

export function templateAnalysis(
  reasonCode: string,
  verdict: string
): AiAnalysisResult {
  const base = FALLBACK_MEMOS[reasonCode] ?? {
    summary: `Aegis ${verdict}: ${reasonCode}. Deterministic policy decided; AI memo unavailable.`,
    risks: [],
    model: "aegis-template",
    role: "MemoGenerator" as const,
  };
  return { ...base, source: "template" };
}

export function preSigningFallback(verdict: string, reasonCode: string) {
  if (verdict === "BLOCK") {
    return {
      headline: "Do not sign — policy BLOCK",
      bullets: [
        `Reason: ${reasonCode}`,
        "Broadcast is disabled until policy or calldata changes.",
      ],
    };
  }
  if (verdict === "WARN") {
    return {
      headline: "Review before signing",
      bullets: [
        `Reason: ${reasonCode}`,
        "Override only after verifying contract and calldata.",
      ],
    };
  }
  return {
    headline: "Checks passed",
    bullets: ["Deterministic policy returned SAFE.", "You may proceed to broadcast."],
  };
}
