import { getSupabaseAdmin } from "./supabaseClient";
import type { AuditEvent } from "@/lib/types";
import type { EventPatch } from "./eventRepository";

type EventRow = {
  id: string;
  request_id: string;
  created_at: string;
  chain_id: number;
  method: string;
  from_address: string | null;
  to_address: string | null;
  value_wei: string;
  selector: string | null;
  decoded_function: string | null;
  decoded_args: Record<string, unknown> | null;
  calldata_preview: string | null;
  use_case: string | null;
  is_unknown_selector: boolean;
  policy_id: string | null;
  verdict: string;
  reason_code: string;
  signals: AuditEvent["signals"];
  needs_ai_analysis: boolean;
  broadcasted: boolean;
  tx_hash: string | null;
  serialized_transaction: string | null;
  ai_memo: string | null;
  ai_analysis: AuditEvent["aiAnalysis"] | null;
  memo_status: string;
  on_chain_policy_hash: string | null;
  unknown_selector_guess: string | null;
  risk_summary: string | null;
  primary_concern: string | null;
  ai_generated_at: string | null;
  ai_confidence: string | null;
  latency_ms: number | null;
};

function rowToEvent(row: EventRow): AuditEvent {
  return {
    id: row.id,
    requestId: row.request_id,
    createdAt: row.created_at,
    chainId: row.chain_id,
    method: row.method,
    fromAddress: row.from_address ?? undefined,
    toAddress: row.to_address ?? undefined,
    valueWei: row.value_wei,
    selector: row.selector ?? undefined,
    decodedFunction: row.decoded_function ?? undefined,
    decodedArgs: row.decoded_args ?? undefined,
    calldataPreview: row.calldata_preview ?? undefined,
    useCase: row.use_case ?? undefined,
    isUnknownSelector: row.is_unknown_selector,
    policyId: row.policy_id ?? undefined,
    verdict: row.verdict as AuditEvent["verdict"],
    reasonCode: row.reason_code,
    signals: row.signals ?? [],
    needsAiAnalysis: row.needs_ai_analysis,
    broadcasted: row.broadcasted,
    txHash: row.tx_hash ?? undefined,
    serializedTransaction: row.serialized_transaction ?? undefined,
    aiMemo: row.ai_memo ?? undefined,
    aiAnalysis: row.ai_analysis ?? undefined,
    memoStatus: row.memo_status as AuditEvent["memoStatus"],
    onChainPolicyHash: row.on_chain_policy_hash ?? undefined,
    unknownSelectorGuess: row.unknown_selector_guess ?? undefined,
    riskSummary: row.risk_summary ?? undefined,
    primaryConcern: row.primary_concern ?? undefined,
    aiGeneratedAt: row.ai_generated_at ?? undefined,
    aiConfidence: row.ai_confidence ?? undefined,
    latencyMs: row.latency_ms ?? undefined,
  };
}

function eventToRow(event: AuditEvent): EventRow {
  return {
    id: event.id,
    request_id: event.requestId,
    created_at: event.createdAt,
    chain_id: event.chainId,
    method: event.method,
    from_address: event.fromAddress ?? null,
    to_address: event.toAddress ?? null,
    value_wei: event.valueWei,
    selector: event.selector ?? null,
    decoded_function: event.decodedFunction ?? null,
    decoded_args: event.decodedArgs ?? null,
    calldata_preview: event.calldataPreview ?? null,
    use_case: event.useCase ?? null,
    is_unknown_selector: event.isUnknownSelector,
    policy_id: event.policyId ?? null,
    verdict: event.verdict,
    reason_code: event.reasonCode,
    signals: event.signals,
    needs_ai_analysis: event.needsAiAnalysis,
    broadcasted: event.broadcasted,
    tx_hash: event.txHash ?? null,
    serialized_transaction: event.serializedTransaction ?? null,
    ai_memo: event.aiMemo ?? null,
    ai_analysis: event.aiAnalysis ?? null,
    memo_status: event.memoStatus,
    on_chain_policy_hash: event.onChainPolicyHash ?? null,
    unknown_selector_guess: event.unknownSelectorGuess ?? null,
    risk_summary: event.riskSummary ?? null,
    primary_concern: event.primaryConcern ?? null,
    ai_generated_at: event.aiGeneratedAt ?? null,
    ai_confidence: event.aiConfidence ?? null,
    latency_ms: event.latencyMs ?? null,
  };
}

export async function appendEvent(event: AuditEvent): Promise<AuditEvent> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase not configured");

  const { error } = await db.from("aegis_events").insert(eventToRow(event));
  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  return event;
}

export async function listEvents(limit = 50): Promise<AuditEvent[]> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase not configured");

  const { data, error } = await db
    .from("aegis_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Supabase list failed: ${error.message}`);
  return (data as EventRow[]).map(rowToEvent);
}

export async function getEventByRequestId(
  requestId: string
): Promise<AuditEvent | undefined> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase not configured");

  const { data, error } = await db
    .from("aegis_events")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) throw new Error(`Supabase get failed: ${error.message}`);
  if (!data) return undefined;
  return rowToEvent(data as EventRow);
}

export async function updateEvent(
  requestId: string,
  patch: EventPatch
): Promise<AuditEvent | undefined> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase not configured");

  const rowPatch: Record<string, unknown> = {};
  if (patch.aiMemo !== undefined) rowPatch.ai_memo = patch.aiMemo;
  if (patch.memoStatus !== undefined) rowPatch.memo_status = patch.memoStatus;
  if (patch.aiAnalysis !== undefined) rowPatch.ai_analysis = patch.aiAnalysis;
  if (patch.broadcasted !== undefined) rowPatch.broadcasted = patch.broadcasted;
  if (patch.txHash !== undefined) rowPatch.tx_hash = patch.txHash;
  if (patch.unknownSelectorGuess !== undefined) {
    rowPatch.unknown_selector_guess = patch.unknownSelectorGuess;
  }
  if (patch.riskSummary !== undefined) rowPatch.risk_summary = patch.riskSummary;
  if (patch.primaryConcern !== undefined) {
    rowPatch.primary_concern = patch.primaryConcern;
  }
  if (patch.aiGeneratedAt !== undefined) {
    rowPatch.ai_generated_at = patch.aiGeneratedAt;
  }
  if (patch.aiConfidence !== undefined) {
    rowPatch.ai_confidence = patch.aiConfidence;
  }

  const { data, error } = await db
    .from("aegis_events")
    .update(rowPatch)
    .eq("request_id", requestId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(`Supabase update failed: ${error.message}`);
  if (!data) return undefined;
  return rowToEvent(data as EventRow);
}
