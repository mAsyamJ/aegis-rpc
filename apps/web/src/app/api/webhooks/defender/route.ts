import { NextResponse } from "next/server";
import { z } from "zod";
import { appendEvent } from "@/lib/db/eventRepository";
import type { AuditEvent } from "@/lib/types";

const defenderEventSchema = z.object({
  eventName: z.string().optional(),
  transactionHash: z.string().optional(),
  contractAddress: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  description: z.string().optional(),
});

/**
 * Optional post-broadcast intel from OZ Defender monitors (WARN-only; does not override preflight).
 */
export async function POST(request: Request) {
  const secret = process.env.AEGIS_DEFENDER_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-aegis-defender-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = defenderEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const requestId = `def_${Date.now().toString(36)}`;
  const event: AuditEvent = {
    id: `evt_${requestId}`,
    requestId,
    createdAt: new Date().toISOString(),
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532),
    method: "defender_webhook",
    valueWei: "0",
    isUnknownSelector: false,
    policyId: "defender-monitor",
    verdict: "WARN",
    reasonCode: "DEFENDER_MONITOR_INTEL",
    signals: [
      {
        adapter: "DefenderWebhook",
        status: "WARN",
        reasonCode: "DEFENDER_MONITOR_INTEL",
        message: data.description ?? data.eventName ?? "Defender monitor event",
        data: {
          eventName: data.eventName,
          transactionHash: data.transactionHash,
          contractAddress: data.contractAddress,
          severity: data.severity,
        },
      },
    ],
    needsAiAnalysis: false,
    broadcasted: true,
    memoStatus: "pending",
    latencyMs: 0,
  };

  await appendEvent(event);

  return NextResponse.json({ ok: true, requestId, verdict: "WARN" });
}
