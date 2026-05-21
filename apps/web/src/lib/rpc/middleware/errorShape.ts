import type { JsonRpcId, JsonRpcResponse } from "@/lib/rpc/middleware/types";
import type { JsonRpcErrorShape } from "@/lib/rpc/client";

export function jsonRpcOk(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

export function jsonRpcError(
  id: JsonRpcId,
  error: JsonRpcErrorShape
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error };
}

export function parseError(id: JsonRpcId): JsonRpcResponse {
  return jsonRpcError(id, { code: -32700, message: "Parse error" });
}

export function invalidRequest(id: JsonRpcId): JsonRpcResponse {
  return jsonRpcError(id, { code: -32600, message: "Invalid Request" });
}

export function methodNotFound(id: JsonRpcId): JsonRpcResponse {
  return jsonRpcError(id, { code: -32601, message: "Method not supported" });
}

export function invalidParams(id: JsonRpcId, message: string): JsonRpcResponse {
  return jsonRpcError(id, { code: -32602, message });
}
