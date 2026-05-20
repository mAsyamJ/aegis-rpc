import type { AegisEvent } from "@/lib/types/aegis";
import { demoScenarios } from "./demoScenarios";

function rid() {
  return "req_" + Math.random().toString(36).slice(2, 10);
}

function ago(min: number) {
  return new Date(Date.now() - min * 60_000).toISOString();
}

export const seedEvents: AegisEvent[] = [
  scenarioToEvent("agent-safe-low-value", ago(1), false),
  scenarioToEvent("agent-over-cap", ago(3), false),
  scenarioToEvent("agent-unknown-selector", ago(7), false),
  scenarioToEvent("wallet-unlimited-approval", ago(11), false),
  scenarioToEvent("agent-stale-feed", ago(18), false),
  scenarioToEvent("agent-safe-low-value", ago(24), true),
  scenarioToEvent("agent-safe-low-value", ago(31), true),
];

function scenarioToEvent(scenarioId: string, createdAt: string, broadcasted: boolean): AegisEvent {
  const s = demoScenarios.find((x) => x.id === scenarioId)!;
  return {
    id: rid(),
    requestId: rid(),
    verdict: s.expectedVerdict,
    reasonCode: s.expectedReasonCode,
    scenario: s.title,
    policyHash: s.policyHash,
    intent: s.intent,
    adapters: s.adapters,
    checks: s.checks,
    ai: s.ai,
    latencyMs: s.latencyMs,
    broadcasted: broadcasted && s.expectedVerdict === "SAFE",
    txHash:
      broadcasted && s.expectedVerdict === "SAFE"
        ? "0x" + Math.random().toString(16).slice(2).padEnd(64, "0").slice(0, 64)
        : undefined,
    createdAt,
  };
}
