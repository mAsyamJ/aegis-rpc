## 10. Policy Engine Design

### AegisPolicy Schema

```typescript
export type AegisPolicy = {
  id: string;
  name: string;
  mode: "observe" | "warn" | "enforce";
  template: "wallet" | "agent" | "defi" | "rwa" | "treasury" | "backend";
  chainId: number;
  onChainPolicyId?: `0x${string}`;    // bytes32 id in AegisPolicyRegistry
  onChainPolicyHash?: `0x${string}`;  // keccak256(JSON.stringify(policy config))

  limits: {
    maxNativeTransferUsd?: number;
    maxSingleAgentActionUsd?: number;
    maxDailyAgentSpendUsd?: number;
    maxSwapDeviationBps?: number;
    maxApprovalUsd?: number;
  };
  rules: {
    blockUnlimitedApproval: boolean;
    requireSpenderAllowlist: boolean;
    blockUnknownContracts: boolean;
    requireFreshPrice: boolean;
    blockSimulationRevert: boolean;
    flagUnknownSelectors: boolean;    // NEW: routes to AI UnknownSelectorAnalyzer
  };
  allowlists: {
    agents: `0x${string}`[];
    recipients: `0x${string}`[];
    spenders: `0x${string}`[];
    contracts: `0x${string}`[];
    selectors: string[];
  };
  denylists: {
    addresses: `0x${string}`[];
    selectors: string[];
  };
};
```

### Verdict Engine

```typescript
export type Verdict = "SAFE" | "WARN" | "BLOCK";

export function finalizeVerdict(
  signals: AdapterSignal[],
  intent: TxIntent,
  policy: AegisPolicy
): { verdict: Verdict; reasonCode: string; needsAiAnalysis: boolean } {

  const block = signals.find(s => s.status === "BLOCK");
  if (block) {
    return {
      verdict: policy.mode === "enforce" ? "BLOCK" : "WARN",
      reasonCode: block.reasonCode ?? "ADAPTER_BLOCK",
      needsAiAnalysis: false,
    };
  }

  const warn = signals.find(s => s.status === "WARN" || s.status === "ERROR");
  if (warn) {
    return {
      verdict: "WARN",
      reasonCode: warn.reasonCode ?? "WARNING_SIGNAL",
      needsAiAnalysis: intent.isUnknownSelector || signals.length > 2,
    };
  }

  // Unknown selector in flag mode → WARN + AI
  if (intent.isUnknownSelector && policy.rules.flagUnknownSelectors) {
    return {
      verdict: "WARN",
      reasonCode: "UNKNOWN_FUNCTION_SELECTOR",
      needsAiAnalysis: true,
    };
  }

  return {
    verdict: "SAFE",
    reasonCode: "ALL_CHECKS_PASSED",
    needsAiAnalysis: false,
  };
}
```

---
