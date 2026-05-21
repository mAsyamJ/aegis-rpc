import type { TxIntent } from "@/lib/types";
import {
  SAFE_EXEC_SELECTOR,
  decodeInnerCallSummary,
  tryDecodeSafeInner,
} from "./decodeCallData";
import { enrichIntentWithMulticall } from "./multicallDecoder";

export function enrichIntentWithSafeExec(intent: TxIntent): TxIntent {
  if (intent.selector?.toLowerCase() !== SAFE_EXEC_SELECTOR) {
    return intent;
  }
  const safeInner = tryDecodeSafeInner(intent.data);
  if (!safeInner) {
    return intent;
  }

  let enriched: TxIntent = {
    ...intent,
    safeInner,
    useCase: intent.useCase === "wallet" ? "treasury" : intent.useCase,
  };

  if (safeInner.data.length >= 10) {
    const innerSummary = decodeInnerCallSummary(
      safeInner.data,
      safeInner.to ?? intent.to
    );
    const innerIntent: TxIntent = {
      ...intent,
      selector: innerSummary.selector,
      data: safeInner.data,
      to: safeInner.to ?? intent.to,
      valueWei: safeInner.valueWei,
      decodedFunction: innerSummary.decodedFunction,
      isUnknownSelector: innerSummary.isUnknownSelector,
      isUnlimitedApproval: innerSummary.isUnlimitedApproval,
      calldataLength: (safeInner.data.length - 2) / 2,
    };
    enriched = enrichIntentWithMulticall(innerIntent);
    enriched = {
      ...enriched,
      safeInner,
      isUnlimitedApproval:
        enriched.isUnlimitedApproval ?? innerSummary.isUnlimitedApproval,
      hasMulticallInnerRisk: enriched.hasMulticallInnerRisk,
    };
  }

  return enriched;
}
