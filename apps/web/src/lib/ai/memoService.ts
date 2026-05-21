import type { AuditEvent, VerdictResult } from "@/lib/types";
import { getEventByRequestId } from "@/lib/db/eventRepository";
import { preSigningFallback, templateAnalysis } from "./fallbacks";
import { runAiAnalysis, scheduleAiAnalysis } from "./runAiAnalysis";
import type { MemoServiceResult } from "./types";

export { scheduleAiAnalysis, runAiAnalysis };

export async function runMemoService(
  event: AuditEvent,
  verdictResult: VerdictResult
): Promise<MemoServiceResult> {
  return runAiAnalysis(event, verdictResult);
}

export async function getAnalysisForRequest(
  event: AuditEvent
): Promise<MemoServiceResult | undefined> {
  if (event.aiAnalysis) return event.aiAnalysis as MemoServiceResult;
  if (event.aiMemo) {
    return {
      summary: event.aiMemo,
      risks: [],
      source: event.memoStatus === "fallback" ? "template" : "ai",
      unknownSelectorGuess: event.unknownSelectorGuess,
      riskSummary: event.riskSummary,
      primaryConcern: event.primaryConcern,
      preSigningAssist: preSigningFallback(event.verdict, event.reasonCode),
      confidence: event.aiConfidence
        ? Number.parseFloat(event.aiConfidence)
        : 0.85,
      generatedAt: event.aiGeneratedAt,
    };
  }
  if (event.memoStatus === "generating") return undefined;
  return templateAnalysis(event.reasonCode, event.verdict);
}

export async function loadAnalysisByRequestId(
  requestId: string
): Promise<{ event: AuditEvent; analysis: MemoServiceResult | undefined } | undefined> {
  const event = await getEventByRequestId(requestId);
  if (!event) return undefined;
  const analysis = await getAnalysisForRequest(event);
  return { event, analysis };
}
