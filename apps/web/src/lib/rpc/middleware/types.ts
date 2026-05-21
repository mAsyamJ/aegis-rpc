import type { JsonRpcErrorShape } from "@/lib/rpc/client";

export type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: JsonRpcErrorShape;
};

export type RpcContext = {
  request: JsonRpcRequest;
  /** Resolved JSON-RPC id (null if omitted). */
  id: JsonRpcId;
  params: unknown[];
  /** Optional org policy from `POST /api/rpc?policyId=` (metadata only). */
  policyIdFromQuery?: string;
};

export type RpcMiddleware = (
  ctx: RpcContext
) => Promise<JsonRpcResponse | null>;
