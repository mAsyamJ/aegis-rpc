import { NextResponse } from "next/server";
import { z } from "zod";
import { getEventByRequestId, updateEvent } from "@/lib/db/eventStore";
import { getPolicy } from "@/lib/policies";

const bodySchema = z.object({
  requestId: z.string().min(1),
  overrideWarn: z.boolean().optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const event = getEventByRequestId(body.requestId);
  if (!event) {
    return NextResponse.json({ error: "Unknown requestId" }, { status: 404 });
  }

  const policy = getPolicy(event.policyId);
  const canOverride =
    event.verdict === "WARN" &&
    (policy.mode === "warn" || body.overrideWarn === true);
  const canSend = event.verdict === "SAFE" || canOverride;

  if (!canSend) {
    return NextResponse.json(
      {
        error: "Broadcast blocked",
        verdict: event.verdict,
        reasonCode: event.reasonCode,
        broadcasted: false,
      },
      { status: 403 }
    );
  }

  const txHash =
    `0x${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}` as `0x${string}`;

  updateEvent(body.requestId, { broadcasted: true, txHash });

  return NextResponse.json({
    requestId: body.requestId,
    txHash,
    broadcasted: true,
    note: "Demo mode — tx not sent to chain without configured signer",
  });
}
