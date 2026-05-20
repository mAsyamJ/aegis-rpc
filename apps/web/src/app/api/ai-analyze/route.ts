import { NextResponse } from "next/server";
import { getEventByRequestId } from "@/lib/db/eventStore";
import { getAnalysisForRequest } from "@/lib/ai/memoService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("requestId");
  if (!requestId) {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
  }

  const event = getEventByRequestId(requestId);
  if (!event) {
    return NextResponse.json({ error: "Unknown requestId" }, { status: 404 });
  }

  const analysis = await getAnalysisForRequest(event);
  if (!analysis) {
    return NextResponse.json({
      requestId,
      memoStatus: event.memoStatus,
      pending: true,
    });
  }

  return NextResponse.json({
    requestId,
    memoStatus: event.memoStatus,
    memo: analysis.summary,
    confidence: analysis.confidence ?? 0.85,
    generatedAt: event.createdAt,
    analysis,
    onChainPolicyHash: event.onChainPolicyHash,
  });
}
