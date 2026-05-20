import type {
  AegisEvent,
  DemoScenario,
  PreflightRequest,
  PreflightResponse,
} from "@/lib/types/aegis";
import { demoScenarios, getScenario } from "@/lib/fixtures/demoScenarios";
import {
  buildPreflightResponse,
  intentFromScenario,
  pollAiAnalysis,
} from "./mapPreflightResponse";
import { mapPolicyToUi } from "./mapPolicies";

const USING_FIXTURES =
  process.env.NEXT_PUBLIC_AEGIS_FIXTURES === "true";

const SCENARIO_POLICY: Record<string, string> = {
  "agent-safe-low-value": "default-agent-policy",
  "agent-over-cap": "default-agent-policy",
  "agent-unknown-selector": "default-agent-policy-warn",
  "agent-stale-feed": "default-agent-policy",
  "wallet-unlimited-approval": "default-wallet-policy",
};

async function fixturePreflight(req: PreflightRequest): Promise<PreflightResponse> {
  const scenario = req.scenarioId
    ? getScenario(req.scenarioId)
    : demoScenarios[0];
  if (!scenario) throw new Error("unknown scenario");
  await new Promise((r) => setTimeout(r, 120));
  return {
    requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
    verdict: scenario.expectedVerdict,
    reasonCode: scenario.expectedReasonCode,
    reason: scenario.summary,
    intent: scenario.intent,
    checks: scenario.checks,
    adapters: scenario.adapters,
    ai: scenario.ai,
    policyHash: scenario.policyHash,
    policyMode: scenario.policyMode,
    latencyMs: scenario.latencyMs,
    broadcasted: false,
    createdAt: new Date().toISOString(),
  };
}

export async function preflight(req: PreflightRequest): Promise<PreflightResponse> {
  const scenarioId = req.scenarioId ?? "agent-safe-low-value";
  const scenario = getScenario(scenarioId);
  if (!scenario) throw new Error("unknown scenario");

  if (USING_FIXTURES || scenarioId === "agent-stale-feed") {
    return fixturePreflight(req);
  }

  const policyId = SCENARIO_POLICY[scenarioId] ?? "default-wallet-policy";
  const body = {
    ...intentFromScenario(scenario.intent),
    policyId,
  };

  const r = await fetch("/api/preflight", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("preflight failed");
  const api = await r.json();
  const ai = await pollAiAnalysis(api.requestId);
  return buildPreflightResponse(api, scenario.intent, ai);
}

export async function safeSend(requestId: string): Promise<{ txHash: string }> {
  const r = await fetch("/api/safe-send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ requestId, overrideWarn: true }),
  });
  if (!r.ok) {
    const err = (await r.json()) as { error?: string };
    throw new Error(err.error ?? "safe-send failed");
  }
  return r.json();
}

export async function getEvents(): Promise<AegisEvent[]> {
  const r = await fetch("/api/events?limit=25");
  if (!r.ok) throw new Error("events failed");
  const json = (await r.json()) as { events: unknown[] };
  const { mapAuditEventToUi } = await import("./mapPreflightResponse");
  return json.events.map((e) =>
    mapAuditEventToUi(e as Parameters<typeof mapAuditEventToUi>[0])
  ) as AegisEvent[];
}

export function listScenarios(): DemoScenario[] {
  return demoScenarios;
}

export async function getAdaptersChainlink() {
  const r = await fetch("/api/adapters/chainlink");
  if (!r.ok) throw new Error("chainlink health failed");
  const json = await r.json();
  return {
    adapter: "ChainlinkPriceAdapter",
    status: json.ok ? "OK" : "WARN",
    label: json.ok ? "ETH/USD live" : "Feed unavailable",
    detail: json.staleSeconds
      ? `Age ${json.staleSeconds}s`
      : (json.error ?? "checking"),
    source: json.feedAddress,
    latencyMs: 0,
    data: { price: json.priceUsd ?? 0 },
  };
}

export async function getPolicies() {
  if (USING_FIXTURES) {
    const { demoScenarios } = await import("@/lib/fixtures/demoScenarios");
    return demoScenarios.slice(0, 2).map((s, i) => ({
      id: i === 0 ? "default-agent-policy" : "default-wallet-policy",
      name: i === 0 ? "Default Agent Policy" : "Default Wallet Policy",
      audience: i === 0 ? ("agent" as const) : ("wallet" as const),
      mode: "enforce" as const,
      description: s.summary,
      limits: [{ name: "Per-tx cap", value: "$500" }],
      allowlists: [{ name: "Selectors", entries: ["transfer", "approve"] }],
      rules: [{ id: "r1", description: "Deterministic checks", severity: "BLOCK" as const }],
      policyHash: s.policyHash,
      updatedAt: new Date().toISOString(),
    }));
  }
  const r = await fetch("/api/policies");
  if (!r.ok) throw new Error("policies failed");
  const json = (await r.json()) as { policies: Parameters<typeof mapPolicyToUi>[0][] };
  return json.policies.map(mapPolicyToUi);
}

export async function setPolicyMode(policyId: string, mode: "observe" | "warn" | "enforce") {
  const r = await fetch("/api/policies", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: policyId, name: policyId, mode, template: "agent", chainId: 84532 }),
  });
  if (!r.ok) throw new Error("policy update failed");
  return r.json();
}
