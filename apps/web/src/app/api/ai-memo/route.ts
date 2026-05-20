import { NextResponse } from "next/server";
import { getEventByRequestId } from "@/lib/db/eventStore";
import { getMemoForRequest, templateMemo } from "@/lib/ai/memoGenerator";

export async function POST(req: Request) {
  let body: { requestId?: string };
  try {
    body = (await req.json()) as { requestId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.requestId) {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
  }

  const event = getEventByRequestId(body.requestId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const memo = getMemoForRequest(
    event.reasonCode,
    event.verdict,
    event.aiMemo
  );

  return NextResponse.json({
    requestId: event.requestId,
    verdict: event.verdict,
    memo,
    memoStatus: event.memoStatus,
    note: "Memo explains verdict only; does not modify policy outcome.",
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reasonCode = searchParams.get("reasonCode") ?? "ALL_CHECKS_PASSED";
  const verdict = searchParams.get("verdict") ?? "SAFE";
  return NextResponse.json({
    memo: templateMemo(reasonCode, verdict),
    source: "template",
  });
}
