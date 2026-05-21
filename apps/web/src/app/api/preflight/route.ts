import { NextResponse } from "next/server";
import { corsPreflightResponse, jsonWithCors } from "@/lib/http/cors";
import {
  isPublicApiEnabled,
  publicApiDisabledResponse,
} from "@/lib/http/publicApiGuard";
import {
  preflightSchema,
  runPreflight,
  toPreflightRequest,
} from "@/lib/engine/preflightService";

export async function OPTIONS() {
  return corsPreflightResponse();
}

export async function POST(req: Request) {
  if (!isPublicApiEnabled()) {
    return publicApiDisabledResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWithCors({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = preflightSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let normalized;
  try {
    normalized = toPreflightRequest(parsed.data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid transaction payload";
    return jsonWithCors({ error: message }, { status: 400 });
  }

  try {
    const result = await runPreflight(normalized);
    return jsonWithCors(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Preflight failed";
    return jsonWithCors({ error: message }, { status: 500 });
  }
}
