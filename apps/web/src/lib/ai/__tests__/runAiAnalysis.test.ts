import { describe, expect, it } from "vitest";
import { runAiAnalysis } from "@/lib/ai/runAiAnalysis";
import type { AuditEvent, VerdictResult } from "@/lib/types";

const event: AuditEvent = {
  id: "evt_1",
  requestId: "req_1",
  createdAt: new Date().toISOString(),
  chainId: 84532,
  method: "aegis_preflight",
  valueWei: "0",
  isUnknownSelector: false,
  verdict: "BLOCK",
  reasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
  signals: [
    {
      adapter: "ApprovalRiskAdapter",
      status: "BLOCK",
      reasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
      message: "blocked",
    },
  ],
  needsAiAnalysis: true,
  broadcasted: false,
  memoStatus: "generating",
};

const verdict: VerdictResult = {
  verdict: "BLOCK",
  reasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
  needsAiAnalysis: true,
};

describe("runAiAnalysis", () => {
  it("returns template memo without API key", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    const prevOr = process.env.OPENROUTER_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    const result = await runAiAnalysis(event, verdict);
    expect(result.summary.length).toBeGreaterThan(10);
    expect(result.source).toBe("template");

    if (prev) process.env.ANTHROPIC_API_KEY = prev;
    if (prevOr) process.env.OPENROUTER_API_KEY = prevOr;
  });
});
