import type { TxIntent } from "@/lib/types";
import {
  MULTICALL_SELECTOR,
  decodeInnerCallSummary,
  pickWorstInnerCall,
  unwrapMulticallInnerCalls,
} from "./decodeCallData";

export function enrichIntentWithMulticall(intent: TxIntent): TxIntent {
  if (intent.selector?.toLowerCase() !== MULTICALL_SELECTOR) {
    return intent;
  }
  const innerCalls = unwrapMulticallInnerCalls(intent.data);
  if (innerCalls.length === 0) {
    return intent;
  }
  const worst = pickWorstInnerCall(innerCalls);
  const hasMulticallInnerRisk = innerCalls.some((c) => c.isUnlimitedApproval === true);
  return {
    ...intent,
    innerCalls,
    hasMulticallInnerRisk,
    ...(worst?.isUnlimitedApproval
      ? {
          isUnlimitedApproval: true,
          decodedFunction: worst.decodedFunction ?? intent.decodedFunction,
        }
      : {}),
  };
}

export { decodeInnerCallSummary, unwrapMulticallInnerCalls };
