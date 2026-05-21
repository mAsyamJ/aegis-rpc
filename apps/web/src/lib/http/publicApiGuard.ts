import { jsonWithCors } from "./cors";

/** Kill switch for public RPC/preflight when AEGIS_PUBLIC_RPC_ENABLED=false. */
export function isPublicApiEnabled(): boolean {
  const flag = process.env.AEGIS_PUBLIC_RPC_ENABLED?.trim().toLowerCase();
  return flag !== "false";
}

export function publicApiDisabledResponse() {
  return jsonWithCors(
    { error: "Aegis public API is temporarily disabled" },
    { status: 503 }
  );
}
