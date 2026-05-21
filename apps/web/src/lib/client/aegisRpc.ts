/** Public Aegis JSON-RPC gateway URL (wallets + wagmi). */
export function getAegisRpcUrl(): string {
  const env = process.env.NEXT_PUBLIC_AEGIS_RPC_URL?.trim();
  if (env) return env;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/rpc`;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return `${host.replace(/\/$/, "")}/api/rpc`;
  }
  return "http://127.0.0.1:3020/api/rpc";
}

export async function aegisRpcCall(
  method: string,
  params: unknown[] = [],
  id: number | string = 1
): Promise<{ ok: true; json: unknown } | { ok: false; error: string; json?: unknown }> {
  try {
    const url = getAegisRpcUrl();
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    });
    const json = (await r.json()) as {
      result?: unknown;
      error?: { code?: number; message?: string; data?: unknown };
    };
    if (json.error) {
      return {
        ok: false,
        error: json.error.message ?? `RPC error ${json.error.code ?? ""}`,
        json,
      };
    }
    return { ok: true, json };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "request failed",
    };
  }
}
