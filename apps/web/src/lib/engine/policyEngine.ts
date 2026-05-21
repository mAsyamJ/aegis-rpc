import { mergeVerdict } from "@/lib/engine/verdictEngine";
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
  return mergeVerdict(signals, intent, policy);
}

export function evaluateTransaction(
  intent: TxIntent,
  signals: AdapterSignal[],
  policy: AegisPolicy
): VerdictResult {
  return finalizeVerdict(signals, intent, policy);
}
