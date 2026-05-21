import {
  runScreening,
  toJsonRpcScreeningResult,
} from "@/lib/engine/screeningPipeline";
import {
  decodeUserOpSummary,
  parseUserOpPreflightParams,
  userOpToPreflightRequest,
} from "@/lib/engine/userOperationDecoder";
import type { RpcMiddleware } from "@/lib/rpc/middleware/types";
import { invalidParams, jsonRpcOk } from "@/lib/rpc/middleware/errorShape";

export const aegisPreflightUserOpMiddleware: RpcMiddleware = async (ctx) => {
  if (ctx.request.method !== "aegis_preflightUserOp") return null;

  try {
    const input = parseUserOpPreflightParams(ctx.params);
    if (ctx.policyIdFromQuery && !input.policyId) {
      input.policyId = ctx.policyIdFromQuery;
    }
    const normalized = userOpToPreflightRequest(input);
    const result = await runScreening(normalized);
    const summary = decodeUserOpSummary(input.userOperation);
    return jsonRpcOk(ctx.id, {
      ...toJsonRpcScreeningResult(result),
      userOp: summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid params";
    return invalidParams(ctx.id, message);
  }
};
