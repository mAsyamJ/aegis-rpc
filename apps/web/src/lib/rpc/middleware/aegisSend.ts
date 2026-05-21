import { runSafeSend } from "@/lib/engine/safeSendService";
import { parseAegisSendParams } from "@/lib/rpc/aegisPreflightParams";
import { buildSafeSendBlockError } from "@/lib/rpc/jsonRpcErrors";
import type { RpcMiddleware } from "@/lib/rpc/middleware/types";
import { invalidParams, jsonRpcError, jsonRpcOk } from "@/lib/rpc/middleware/errorShape";

export const aegisSendMiddleware: RpcMiddleware = async (ctx) => {
  if (ctx.request.method !== "aegis_sendTransaction") return null;

  try {
    const sendParams = parseAegisSendParams(ctx.params);
    const outcome = await runSafeSend({
      requestId: sendParams.requestId,
      override: sendParams.override,
      overrideWarn: sendParams.overrideWarn,
    });
    if (!outcome.ok) {
      return jsonRpcError(
        ctx.id,
        buildSafeSendBlockError(
          outcome.verdict,
          outcome.reasonCode,
          sendParams.requestId
        )
      );
    }
    return jsonRpcOk(ctx.id, {
      requestId: outcome.requestId,
      txHash: outcome.txHash,
      broadcasted: outcome.broadcasted,
      verdict: outcome.verdict,
      overridden: outcome.overridden ?? false,
      note: outcome.note,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid params";
    return invalidParams(ctx.id, message);
  }
};
