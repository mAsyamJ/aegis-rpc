import type { JsonRpcErrorShape } from "@/lib/rpc/client";
import type { Verdict } from "@/lib/types";

export function buildPolicyBlockError(
  verdict: Verdict,
  reasonCode: string,
  requestId: string,
  message?: string
): JsonRpcErrorShape {
  return {
    code: -32090,
    message: message ?? `Aegis ${verdict}: ${reasonCode}`,
    data: {
      verdict,
      reasonCode,
      broadcasted: false,
      requestId,
    },
  };
}

export function buildSafeSendBlockError(
  verdict: Verdict,
  reasonCode: string,
  requestId?: string
): JsonRpcErrorShape {
  return {
    code: -32090,
    message:
      verdict === "BLOCK"
        ? "BLOCK verdict cannot be overridden in enforce mode"
        : "Broadcast blocked",
    data: {
      verdict,
      reasonCode,
      broadcasted: false,
      ...(requestId ? { requestId } : {}),
    },
  };
}
