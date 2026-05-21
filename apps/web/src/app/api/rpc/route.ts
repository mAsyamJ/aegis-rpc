import { NextResponse } from "next/server";
import {
  corsPreflightResponse,
  corsHeaders,
  withCors,
} from "@/lib/http/cors";
import {
  isPublicApiEnabled,
  publicApiDisabledResponse,
} from "@/lib/http/publicApiGuard";
import {
  handleJsonRpcBody,
  isBatchRequest,
} from "@/lib/rpc/engine";
import { parseError } from "@/lib/rpc/middleware/errorShape";
import type { JsonRpcResponse } from "@/lib/rpc/middleware/types";

export async function OPTIONS() {
  return corsPreflightResponse();
}

function cacheHeaderFromResponse(res: JsonRpcResponse): string | undefined {
  const hit = (res as { _aegisCacheHit?: boolean })._aegisCacheHit;
  if (hit === undefined) return undefined;
  return hit ? "HIT" : "MISS";
}

function toNextResponse(
  body: JsonRpcResponse | JsonRpcResponse[],
  status = 200
): NextResponse {
  const base = corsHeaders();
  if (Array.isArray(body)) {
    return NextResponse.json(body, { status, headers: base });
  }
  const cache = cacheHeaderFromResponse(body);
  const headers = cache
    ? { ...base, "X-Aegis-Cache": cache }
    : base;
  const { _aegisCacheHit: _, ...json } = body as JsonRpcResponse & {
    _aegisCacheHit?: boolean;
  };
  return NextResponse.json(json, { status, headers });
}

export async function POST(req: Request) {
  if (!isPublicApiEnabled()) {
    return publicApiDisabledResponse();
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return withCors(toNextResponse(parseError(null), 400));
  }

  const url = new URL(req.url);
  const policyId = url.searchParams.get("policyId") ?? undefined;

  const result = await handleJsonRpcBody(raw, policyId ?? undefined);
  return withCors(toNextResponse(result));
}

export { isBatchRequest };
