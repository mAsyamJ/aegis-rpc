import { NextResponse } from "next/server";

const ALLOWED_METHODS = "POST, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

/** Public demo default; override with AEGIS_CORS_ORIGIN (comma-separated or single). */
export function corsAllowOrigin(): string {
  const raw = process.env.AEGIS_CORS_ORIGIN?.trim();
  return raw && raw.length > 0 ? raw : "*";
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": corsAllowOrigin(),
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Max-Age": "86400",
  };
}

export function corsPreflightResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export function withCors<T extends NextResponse>(response: T): T {
  const headers = corsHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function jsonWithCors(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> }
): NextResponse {
  const merged = { ...corsHeaders(), ...init?.headers };
  return NextResponse.json(body, { status: init?.status ?? 200, headers: merged });
}
