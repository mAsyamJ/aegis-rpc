import { incrementRpcRequest } from "@/lib/metrics/counters";
import type { JsonRpcResponse, RpcContext, RpcMiddleware } from "./types";

/** Tap: count RPC requests, then continue chain. */
export const metricsMiddleware: RpcMiddleware = async (
  ctx: RpcContext
): Promise<JsonRpcResponse | null> => {
  incrementRpcRequest();
  return null;
};
