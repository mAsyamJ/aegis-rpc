import type {
  AdapterSignal,
  AegisPolicy,
  TxIntent,
  VerdictResult,
} from "@/lib/types";

export function finalizeVerdict(
  signals: AdapterSignal[],
  intent: TxIntent,
  policy: AegisPolicy
): VerdictResult {
  const block = signals.find((s) => s.status === "BLOCK");
  if (block) {
    return {
      verdict: policy.mode === "enforce" ? "BLOCK" : "WARN",
      reasonCode: block.reasonCode ?? "ADAPTER_BLOCK",
      needsAiAnalysis: false,
    };
  }

  const warn = signals.find((s) => s.status === "WARN" || s.status === "ERROR");
  if (warn) {
    return {
      verdict: "WARN",
      reasonCode: warn.reasonCode ?? "WARNING_SIGNAL",
      needsAiAnalysis: intent.isUnknownSelector || signals.length > 2,
    };
  }

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

export function evaluateTransaction(
  intent: TxIntent,
  signals: AdapterSignal[],
  policy: AegisPolicy
): VerdictResult {
  return finalizeVerdict(signals, intent, policy);
}
