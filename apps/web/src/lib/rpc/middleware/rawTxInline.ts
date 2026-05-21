import { parseTransaction, type Hex } from "viem";
import {
  runScreening,
  toJsonRpcScreeningResult,
} from "@/lib/engine/screeningPipeline";
import { toPreflightRequest } from "@/lib/engine/preflightService";
import { buildPolicyBlockError } from "@/lib/rpc/jsonRpcErrors";
import type { RpcMiddleware } from "@/lib/rpc/middleware/types";
import { invalidParams, jsonRpcError, jsonRpcOk } from "@/lib/rpc/middleware/errorShape";

export function inlineRawScreeningEnabled(): boolean {
  return process.env.AEGIS_INLINE_RAW_SCREENING === "true";
}

export const rawTxInlineMiddleware: RpcMiddleware = async (ctx) => {
  if (!inlineRawScreeningEnabled()) return null;
  if (ctx.request.method !== "eth_sendRawTransaction") return null;

  const rawHex = ctx.params[0];
  if (typeof rawHex !== "string" || !/^0x[0-9a-fA-F]+$/.test(rawHex)) {
    return invalidParams(ctx.id, "Invalid raw transaction hex");
  }

  try {
    const parsed = parseTransaction(rawHex as Hex);
    if (parsed.chainId === undefined) {
      return invalidParams(
        ctx.id,
        "serializedTransaction must include chainId (EIP-155)"
      );
    }
    const normalized = toPreflightRequest({
      serializedTransaction: rawHex,
      chainId: Number(parsed.chainId),
      policyId: ctx.policyIdFromQuery,
    });
    const result = await runScreening(normalized);

    if (result.verdict === "BLOCK") {
      return jsonRpcError(
        ctx.id,
        buildPolicyBlockError(
          result.verdict,
          result.reasonCode,
          result.requestId,
          `Aegis BLOCK: ${result.reasonCode}`
        )
      );
    }

    if (result.verdict === "WARN") {
      return jsonRpcError(
        ctx.id,
        buildPolicyBlockError(
          result.verdict,
          result.reasonCode,
          result.requestId,
          `Aegis WARN: screening required before broadcast (${result.reasonCode})`
        )
      );
    }

    return jsonRpcOk(ctx.id, {
      screened: true,
      ...toJsonRpcScreeningResult(result),
      note: "Inline screening passed; use aegis_sendTransaction or POST /api/preflight to broadcast",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid raw transaction";
    return invalidParams(ctx.id, message);
  }
};
