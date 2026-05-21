import { NextResponse } from "next/server";
import { z } from "zod";
import { runSafeSend } from "@/lib/engine/safeSendService";

const bodySchema = z.object({
  requestId: z.string().min(1),
  override: z.boolean().optional(),
  overrideWarn: z.boolean().optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const outcome = await runSafeSend({
    requestId: body.requestId,
    override: body.override,
    overrideWarn: body.overrideWarn,
  });

  if (!outcome.ok) {
    return NextResponse.json(
      {
        error: outcome.error,
        verdict: outcome.verdict,
        reasonCode: outcome.reasonCode,
        broadcasted: false,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    requestId: outcome.requestId,
    txHash: outcome.txHash,
    broadcasted: outcome.broadcasted,
    verdict: outcome.verdict,
    overridden: outcome.overridden,
    note: outcome.note,
  });
}
