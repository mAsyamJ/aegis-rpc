import { isPassthroughMethod } from "@/lib/rpc/client";
import { forwardWithCache, isCacheableMethod } from "@/lib/rpc/rpcCache";
import type { RpcMiddleware } from "@/lib/rpc/middleware/types";
import { jsonRpcError, jsonRpcOk, methodNotFound } from "@/lib/rpc/middleware/errorShape";

export const passthroughMiddleware: RpcMiddleware = async (ctx) => {
  const { method } = ctx.request;

  if (!isPassthroughMethod(method)) {
    return methodNotFound(ctx.id);
  }

  const upstream = await forwardWithCache(ctx.id, method, ctx.params);
  if ("error" in upstream) {
    return jsonRpcError(ctx.id, upstream.error);
  }

  const response = jsonRpcOk(ctx.id, upstream.result);
  if (isCacheableMethod(method) && upstream.cacheHit !== undefined) {
    (response as { _aegisCacheHit?: boolean })._aegisCacheHit = upstream.cacheHit;
  }
  return response;
};
