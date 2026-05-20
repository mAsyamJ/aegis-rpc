import type { AuditEvent, VerdictResult } from "@/lib/types";
import { preSigningFallback, templateAnalysis } from "./fallbacks";
import {
  memoPrompt,
  preSigningAssistPrompt,
  unknownSelectorPrompt,
  warnContextPrompt,
} from "./prompts";
import type { AiRole, MemoServiceResult } from "./types";

async function callAi(prompt: string): Promise<string | undefined> {
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
        max_tokens: 280,
      }),
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content?.trim();
  } catch {
    return undefined;
  }
}

function pickRole(event: AuditEvent, verdictResult: VerdictResult) {
  if (event.isUnknownSelector) return "UnknownSelectorAnalyzer";
  if (verdictResult.verdict === "WARN") return "WarnContextSynthesizer";
  if (verdictResult.verdict !== "SAFE") return "MemoGenerator";
  return "MemoGenerator";
}

export async function runMemoService(
  event: AuditEvent,
  verdictResult: VerdictResult
): Promise<MemoServiceResult> {
  const role = pickRole(event, verdictResult);
  const signalSummary = event.signals
    .map((s) => `${s.adapter}:${s.status}`)
    .join(", ");

  let prompt: string;
  if (role === "UnknownSelectorAnalyzer") {
    prompt = unknownSelectorPrompt(event.selector ?? "0x", event.toAddress);
  } else if (role === "WarnContextSynthesizer") {
    prompt = warnContextPrompt(event.verdict, event.reasonCode, signalSummary);
  } else {
    prompt = memoPrompt(event.verdict, event.reasonCode, event.decodedFunction);
  }

  const aiText = await callAi(prompt);
  const base: MemoServiceResult = aiText
    ? {
        summary: aiText,
        risks: [],
        model: "aegis-explain-v1",
        role: role as AiRole,
        source: "ai",
      }
    : templateAnalysis(event.reasonCode, event.verdict);

  const assistPrompt = preSigningAssistPrompt(event.verdict, event.reasonCode);
  const assistRaw = await callAi(assistPrompt);
  let preSigningAssist = preSigningFallback(event.verdict, event.reasonCode);
  if (assistRaw) {
    try {
      const parsed = JSON.parse(assistRaw) as {
        headline?: string;
        bullets?: string[];
      };
      if (parsed.headline && parsed.bullets) {
        preSigningAssist = {
          headline: parsed.headline,
          bullets: parsed.bullets,
        };
      }
    } catch {
      preSigningAssist = {
        headline: "AI assist",
        bullets: [assistRaw.slice(0, 200)],
      };
    }
  }

  return { ...base, preSigningAssist };
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
      preSigningAssist: preSigningFallback(event.verdict, event.reasonCode),
    };
  }
  if (event.memoStatus === "generating") return undefined;
  return templateAnalysis(event.reasonCode, event.verdict);
}
