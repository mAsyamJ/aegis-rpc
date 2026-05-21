import { z } from "zod";
import { getMiddlewareHandlers } from "@/lib/rpc/middleware/registry";
import {
  invalidRequest,
  parseError,
} from "@/lib/rpc/middleware/errorShape";
import type {
  JsonRpcRequest,
  JsonRpcResponse,
  RpcContext,
} from "@/lib/rpc/middleware/types";

const jsonRpcRequestSchema = z.object({
  jsonrpc: z.string().optional(),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string().min(1),
  params: z
    .union([z.array(z.unknown()), z.record(z.string(), z.unknown())])
    .optional(),
});

const middlewareChain = getMiddlewareHandlers();

export function normalizeParams(
  params: z.infer<typeof jsonRpcRequestSchema>["params"]
): unknown[] {
  if (params === undefined) return [];
  return Array.isArray(params) ? params : [];
}

export function resolveJsonRpcId(
  raw: unknown,
  bodyId: unknown
): string | number | null {
  if (bodyId !== undefined) {
    return bodyId as string | number | null;
  }
  if (
    raw !== null &&
    typeof raw === "object" &&
    "id" in raw &&
    (typeof (raw as { id: unknown }).id === "string" ||
      typeof (raw as { id: unknown }).id === "number" ||
      (raw as { id: unknown }).id === null)
  ) {
    return (raw as { id: string | number | null }).id ?? null;
  }
  return null;
}

function buildContext(
  parsed: z.infer<typeof jsonRpcRequestSchema>,
  raw: unknown,
  policyIdFromQuery?: string
): RpcContext {
  const id =
    parsed.id === undefined ? resolveJsonRpcId(raw, undefined) : parsed.id;
  return {
    request: {
      jsonrpc: parsed.jsonrpc,
      id,
      method: parsed.method,
      params: parsed.params,
    },
    id: id ?? null,
    params: normalizeParams(parsed.params),
    policyIdFromQuery,
  };
}

export async function runRpcMiddleware(ctx: RpcContext): Promise<JsonRpcResponse> {
  for (const mw of middlewareChain) {
    const res = await mw(ctx);
    if (res) return res;
  }
  return invalidRequest(ctx.id);
}

export async function handleSingleJsonRpc(
  raw: unknown,
  policyIdFromQuery?: string
): Promise<JsonRpcResponse> {
  const parsed = jsonRpcRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidRequest(resolveJsonRpcId(raw, undefined));
  }
  const ctx = buildContext(parsed.data, raw, policyIdFromQuery);
  return runRpcMiddleware(ctx);
}

export async function handleJsonRpcBody(
  raw: unknown,
  policyIdFromQuery?: string
): Promise<JsonRpcResponse | JsonRpcResponse[]> {
  if (Array.isArray(raw)) {
    const batch = await Promise.all(
      raw.map((item) => handleSingleJsonRpc(item, policyIdFromQuery))
    );
    return batch;
  }
  return handleSingleJsonRpc(raw, policyIdFromQuery);
}

export function isBatchRequest(raw: unknown): boolean {
  return Array.isArray(raw);
}
