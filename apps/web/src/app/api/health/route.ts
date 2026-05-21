import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/supabaseClient";
import { getMetricsSnapshot } from "@/lib/metrics/counters";
import { inlineRawScreeningEnabled } from "@/lib/rpc/middleware/rawTxInline";
import { rpcCacheTtlMs } from "@/lib/rpc/rpcCache";

/**
 * Lightweight production smoke check (Vercel / load balancers).
 * No secrets; does not call upstream RPC.
 */
export async function GET() {
  const hasRpcEnv = Boolean(process.env.BASE_SEPOLIA_RPC_URL?.trim());
  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
  let supabaseReady = false;
  if (supabaseConfigured) {
    const db = getSupabaseAdmin();
    if (db) {
      const { error } = await db.from("aegis_events").select("id").limit(1);
      supabaseReady = !error;
    }
  }

  const metrics = getMetricsSnapshot();

  return NextResponse.json({
    ok: true,
    service: "aegis-rpc-web",
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID ?? "84532",
    rpcEnvSet: hasRpcEnv,
    reownConfigured: Boolean(process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim()),
    supabaseConfigured,
    supabaseReady,
    rpcCacheTtlMs: rpcCacheTtlMs(),
    inlineRawScreening: inlineRawScreeningEnabled(),
    ...metrics,
  });
}
