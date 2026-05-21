import { NextResponse } from "next/server";
import { loadAnalysisByRequestId } from "@/lib/ai/memoService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("requestId");
  if (!requestId) {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
  }

  const loaded = await loadAnalysisByRequestId(requestId);
  if (!loaded) {
    return NextResponse.json({ error: "Unknown requestId" }, { status: 404 });
  }

  const { event, analysis } = loaded;
  if (!analysis) {
    return NextResponse.json({
      requestId,
      memoStatus: event.memoStatus,
      pending: true,
    });
  }

  const preSigningText = analysis.preSigningAssist
    ? `${analysis.preSigningAssist.headline} ${analysis.preSigningAssist.bullets.join(" ")}`
    : null;

  return NextResponse.json({
    requestId,
    memoStatus: event.memoStatus,
    memo: analysis.summary,
    unknownSelectorGuess: analysis.unknownSelectorGuess ?? null,
    riskSummary: analysis.riskSummary ?? null,
    primaryConcern: analysis.primaryConcern ?? null,
    preSigningAssist: preSigningText,
    confidence: analysis.confidence ?? 0.85,
    generatedAt: analysis.generatedAt ?? event.aiGeneratedAt ?? event.createdAt,
    analysis,
    onChainPolicyHash: event.onChainPolicyHash,
  });
}
