import {
  buildInterceptScreeningError,
  isAegisRpcMethod,
  isInterceptedSendMethod,
  isInterceptedUserOpMethod,
} from "@/lib/rpc/client";
import type { RpcMiddleware } from "@/lib/rpc/middleware/types";
import { jsonRpcError, methodNotFound } from "@/lib/rpc/middleware/errorShape";

export const interceptSendMiddleware: RpcMiddleware = async (ctx) => {
  const { method } = ctx.request;

  if (
    isInterceptedSendMethod(method) ||
    isInterceptedUserOpMethod(method)
  ) {
    return jsonRpcError(ctx.id, buildInterceptScreeningError(method));
  }

  if (isAegisRpcMethod(method)) {
    return methodNotFound(ctx.id);
  }

  return null;
};
