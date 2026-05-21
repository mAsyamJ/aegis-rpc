import type { AuditEvent, VerdictResult } from "@/lib/types";
import { updateEvent } from "@/lib/db/eventRepository";
import {
  preSigningFallback,
  templateAnalysis,
} from "./fallbacks";
import {
  memoPrompt,
  preSigningAssistPrompt,
  previewEnrichedUnknownPrompt,
  unknownSelectorPrompt,
  warnContextPrompt,
} from "./prompts";
import type { MemoServiceResult } from "./types";

export async function callClaudeJson(
  prompt: string
): Promise<Record<string, unknown> | undefined> {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return undefined;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-haiku",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      }),
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return undefined;
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function nonOkSignals(event: AuditEvent) {
  return event.signals.filter((s) => s.status !== "OK");
}

function previewContextFromSignals(event: AuditEvent): string | undefined {
  const preview = event.signals.find(
    (s) => s.adapter === "PreviewEnrichmentAdapter"
  );
  if (!preview?.data) return undefined;
  const label = preview.data.decodedLabel as string | undefined;
  const contract = preview.data.contractName as string | undefined;
  const hint = preview.data.useCaseHint as string | undefined;
  const parts = [label, contract ? `target:${contract}` : undefined, hint ? `useCase:${hint}` : undefined].filter(Boolean);
  return parts.length ? parts.join("; ") : preview.message;
}

export async function runAiAnalysis(
  event: AuditEvent,
  verdictResult: VerdictResult
): Promise<MemoServiceResult> {
  const signalSummary = event.signals
    .map((s) => `${s.adapter}:${s.status}`)
    .join(", ");
  let usedFallback = false;
  const generatedAt = new Date().toISOString();

  let unknownSelectorGuess: string | undefined;
  let unknownSelectorConfidence: string | undefined;

  const previewCtx = previewContextFromSignals(event);

  if (event.isUnknownSelector) {
    const r = await callClaudeJson(
      previewCtx
        ? previewEnrichedUnknownPrompt(
            event.selector ?? "0x",
            event.toAddress,
            previewCtx
          )
        : unknownSelectorPrompt(event.selector ?? "0x", event.toAddress)
    );
    if (r && typeof r.guess === "string") {
      unknownSelectorGuess = r.guess;
      unknownSelectorConfidence =
        typeof r.confidence === "string" ? r.confidence : "medium";
    } else {
      const fb = templateAnalysis(
        event.reasonCode,
        event.verdict
      );
      unknownSelectorGuess = fb.summary;
      usedFallback = true;
    }
  }

  let riskSummary: string | undefined;
  let primaryConcern: string | undefined;

  const warnSignals = nonOkSignals(event);
  if (
    verdictResult.verdict === "WARN" &&
    warnSignals.length > 1
  ) {
    const r = await callClaudeJson(
      warnContextPrompt(event.verdict, event.reasonCode, signalSummary)
    );
    if (r && typeof r.riskSummary === "string") {
      riskSummary = r.riskSummary;
      primaryConcern =
        typeof r.primaryConcern === "string"
          ? r.primaryConcern
          : undefined;
    } else {
      const fb = templateAnalysis(event.reasonCode, event.verdict);
      riskSummary = fb.summary;
      usedFallback = true;
    }
  }

  const memoResult = await callClaudeJson(
    memoPrompt(
      event.verdict,
      event.reasonCode,
      event.decodedFunction,
      previewCtx
    )
  );
  const memoBase = memoResult && typeof memoResult.memo === "string"
    ? {
        summary: memoResult.memo,
        risks: [] as string[],
        model: "aegis-explain-v1",
        role: "MemoGenerator" as const,
        source: "ai" as const,
        confidence: 0.85,
      }
    : templateAnalysis(event.reasonCode, event.verdict);

  if (memoBase.source === "template") usedFallback = true;

  let preSigningAssist = preSigningFallback(event.verdict, event.reasonCode);
  if (verdictResult.verdict === "WARN") {
    const assistRaw = await callClaudeJson(
      preSigningAssistPrompt(event.verdict, event.reasonCode)
    );
    if (assistRaw) {
      if (
        typeof assistRaw.preSigningAssist === "string"
      ) {
        preSigningAssist = {
          headline: "Review before signing",
          bullets: [assistRaw.preSigningAssist.slice(0, 400)],
        };
      } else if (
        typeof assistRaw.headline === "string" &&
        Array.isArray(assistRaw.bullets)
      ) {
        preSigningAssist = {
          headline: assistRaw.headline,
          bullets: assistRaw.bullets.map(String).slice(0, 5),
        };
      }
    }
  }

  return {
    ...memoBase,
    unknownSelectorGuess,
    unknownSelectorConfidence,
    riskSummary,
    primaryConcern,
    preSigningAssist,
    source: usedFallback && memoBase.source === "ai" ? "template" : memoBase.source,
    confidence: usedFallback ? 0.75 : (memoBase.confidence ?? 0.85),
    generatedAt,
  };
}

export function scheduleAiAnalysis(
  event: AuditEvent,
  verdictResult: VerdictResult
): void {
  void runAiAnalysis(event, verdictResult).then(async (memo) => {
    await updateEvent(event.requestId, {
      aiMemo: memo.summary,
      aiAnalysis: memo,
      memoStatus: memo.source === "template" ? "fallback" : "ready",
      unknownSelectorGuess: memo.unknownSelectorGuess,
      riskSummary: memo.riskSummary,
      primaryConcern: memo.primaryConcern,
      aiGeneratedAt: memo.generatedAt ?? new Date().toISOString(),
      aiConfidence: String(memo.confidence ?? 0.85),
    });
  });
}
