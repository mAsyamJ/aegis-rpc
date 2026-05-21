import {
  runScreening,
  toJsonRpcScreeningResult,
} from "@/lib/engine/screeningPipeline";
import {
  toPreflightRequest,
  type PreflightWireBody,
} from "@/lib/engine/preflightService";
import { parseAegisPreflightParams } from "@/lib/rpc/aegisPreflightParams";
import type { RpcMiddleware } from "@/lib/rpc/middleware/types";
import { invalidParams, jsonRpcOk } from "@/lib/rpc/middleware/errorShape";

export const aegisPreflightMiddleware: RpcMiddleware = async (ctx) => {
  if (ctx.request.method !== "aegis_preflight") return null;

  try {
    const wire = parseAegisPreflightParams(ctx.params);
    if (ctx.policyIdFromQuery && !wire.policyId) {
      wire.policyId = ctx.policyIdFromQuery;
    }
    let normalized;
    try {
      normalized = toPreflightRequest(wire as PreflightWireBody);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid transaction payload";
      return invalidParams(ctx.id, message);
    }
    const result = await runScreening(normalized);
    return jsonRpcOk(ctx.id, toJsonRpcScreeningResult(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid params";
    return invalidParams(ctx.id, message);
  }
};
