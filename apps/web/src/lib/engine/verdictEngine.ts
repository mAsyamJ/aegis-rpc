import type {
  AdapterSignal,
  AegisPolicy,
  TxIntent,
  VerdictResult,
} from "@/lib/types";

/** Higher index = lower priority when multiple BLOCK reasonCodes appear. */
const REASON_PRECEDENCE: string[] = [
  "ALL_CHECKS_PASSED",
  "WARNING_SIGNAL",
  "UNKNOWN_FUNCTION_SELECTOR",
  "HIGH_ALLOWANCE",
  "UNLIMITED_APPROVAL_KNOWN_SPENDER",
  "SIMULATION_REVERT",
  "TREASURY_TARGET_NOT_ALLOWLISTED",
  "HIGH_RISK_SPENDER",
  "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
  "ADAPTER_BLOCK",
];

function reasonPriority(code: string): number {
  const idx = REASON_PRECEDENCE.indexOf(code);
  return idx === -1 ? REASON_PRECEDENCE.length - 2 : idx;
}

function pickPrimaryBlock(signals: AdapterSignal[]): AdapterSignal | undefined {
  const blocks = signals.filter((s) => s.status === "BLOCK");
  if (blocks.length === 0) return undefined;
  return blocks.reduce((best, cur) => {
    const bestCode = best.reasonCode ?? "ADAPTER_BLOCK";
    const curCode = cur.reasonCode ?? "ADAPTER_BLOCK";
    return reasonPriority(curCode) >= reasonPriority(bestCode) ? cur : best;
  });
}

function pickPrimaryWarn(signals: AdapterSignal[]): AdapterSignal | undefined {
  const warns = signals.filter((s) => s.status === "WARN" || s.status === "ERROR");
  if (warns.length === 0) return undefined;
  return warns[0];
}

export function mergeVerdict(
  signals: AdapterSignal[],
  intent: TxIntent,
  policy: AegisPolicy
): VerdictResult {
  const block = pickPrimaryBlock(signals);
  if (block) {
    const verdict = policy.mode === "enforce" ? "BLOCK" : "WARN";
    return {
      verdict,
      reasonCode: block.reasonCode ?? "ADAPTER_BLOCK",
      needsAiAnalysis: true,
    };
  }

  const warn = pickPrimaryWarn(signals);
  if (warn) {
    return {
      verdict: "WARN",
      reasonCode: warn.reasonCode ?? "WARNING_SIGNAL",
      needsAiAnalysis: true,
    };
  }

  if (intent.isUnknownSelector && policy.rules.flagUnknownSelectors) {
    return {
      verdict: "WARN",
      reasonCode: "UNKNOWN_FUNCTION_SELECTOR",
      needsAiAnalysis: true,
    };
  }

  if (intent.hasMulticallInnerRisk && policy.rules.blockUnlimitedApproval) {
    return {
      verdict: policy.mode === "enforce" ? "BLOCK" : "WARN",
      reasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
      needsAiAnalysis: true,
    };
  }

  return {
    verdict: "SAFE",
    reasonCode: "ALL_CHECKS_PASSED",
    needsAiAnalysis: false,
  };
}
