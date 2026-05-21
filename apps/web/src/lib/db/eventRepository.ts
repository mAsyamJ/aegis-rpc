import type { AuditEvent } from "@/lib/types";
import { getSupabaseAdmin } from "./supabaseClient";
import * as memory from "./eventStore";
import * as supabase from "./supabaseEvents";

export type EventPatch = Partial<
  Pick<
    AuditEvent,
    | "aiMemo"
    | "memoStatus"
    | "aiAnalysis"
    | "broadcasted"
    | "txHash"
    | "unknownSelectorGuess"
    | "riskSummary"
    | "primaryConcern"
    | "aiGeneratedAt"
    | "aiConfidence"
  >
>;

function useSupabase(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

let supabaseReadyCache: boolean | null = null;

/** True when env is set and `aegis_events` table exists (matches /api/health supabaseReady). */
export async function isSupabaseReady(): Promise<boolean> {
  if (!useSupabase()) return false;
  if (supabaseReadyCache !== null) return supabaseReadyCache;
  const db = getSupabaseAdmin();
  if (!db) {
    supabaseReadyCache = false;
    return false;
  }
  const { error } = await db.from("aegis_events").select("id").limit(1);
  supabaseReadyCache = !error;
  return supabaseReadyCache;
}

export function resetSupabaseReadyCacheForTests(): void {
  supabaseReadyCache = null;
}

export async function appendEvent(event: AuditEvent): Promise<AuditEvent> {
  if (await isSupabaseReady()) {
    return supabase.appendEvent(event);
  }
  return memory.appendEvent(event);
}

export async function listEvents(limit = 50): Promise<AuditEvent[]> {
  if (await isSupabaseReady()) {
    return supabase.listEvents(limit);
  }
  return memory.listEvents(limit);
}

export async function getEventByRequestId(
  requestId: string
): Promise<AuditEvent | undefined> {
  if (await isSupabaseReady()) {
    return supabase.getEventByRequestId(requestId);
  }
  return memory.getEventByRequestId(requestId);
}

export async function updateEvent(
  requestId: string,
  patch: EventPatch
): Promise<AuditEvent | undefined> {
  if (await isSupabaseReady()) {
    return supabase.updateEvent(requestId, patch);
  }
  return memory.updateEvent(requestId, patch);
}
