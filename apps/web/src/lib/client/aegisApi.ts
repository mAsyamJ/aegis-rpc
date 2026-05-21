import type {
  AegisEvent,
  DemoScenario,
  PolicyMode,
  PreflightRequest,
  PreflightResponse,
  TxIntent,
  Verdict,
} from "@/lib/types/aegis";
import { demoScenarios, getScenario } from "@/lib/fixtures/demoScenarios";
import {
  buildPreflightResponse,
  intentFromScenario,
  mapIntentFromApi,
  pollAiAnalysis,
} from "./mapPreflightResponse";
import { mapPolicyToUi } from "./mapPolicies";
import { policyIdForScenario } from "./scenarioPolicy";

const USING_FIXTURES =
  process.env.NEXT_PUBLIC_AEGIS_FIXTURES === "true";

function fixtureVerdictForMode(
  scenario: DemoScenario,
  mode: PolicyMode,
): { verdict: Verdict; reasonCode: string } {
  if (
    mode !== "enforce" &&
    scenario.expectedVerdict === "BLOCK" &&
    scenario.id === "agent-over-cap"
  ) {
    return {
      verdict: "WARN",
      reasonCode: scenario.expectedReasonCode,
    };
  }
  return {
    verdict: scenario.expectedVerdict,
    reasonCode: scenario.expectedReasonCode,
  };
}

function fixtureAiForWarn(scenario: DemoScenario): DemoScenario["ai"] {
  if (scenario.id !== "agent-over-cap") return scenario.ai;
  return {
    ...scenario.ai,
    preSigningAssist: {
      headline:
        "Before overriding: this transfer exceeds your agent's $500/action policy cap by 9.6×.",
      bullets: [
        "Chainlink ETH/USD feed is fresh — USD notional is reliable.",
        "Override only for an intentional manual exception.",
        "Consider raising the per-tx cap if this amount recurs.",
      ],
    },
  };
}

async function fixturePreflight(
  req: PreflightRequest,
  mode: PolicyMode,
): Promise<PreflightResponse> {
  const scenario = req.scenarioId
    ? getScenario(req.scenarioId)
    : demoScenarios[0];
  if (!scenario) throw new Error("unknown scenario");
  await new Promise((r) => setTimeout(r, 120));
  const { verdict, reasonCode } = fixtureVerdictForMode(scenario, mode);
  const ai =
    verdict === "WARN" && scenario.id === "agent-over-cap"
      ? fixtureAiForWarn(scenario)
      : scenario.ai;
  return {
    requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
    verdict,
    reasonCode,
    reason: scenario.summary,
    intent: scenario.intent,
    checks: scenario.checks,
    adapters: scenario.adapters,
    ai,
    memoStatus: "ready",
    policyHash: scenario.policyHash,
    policyMode: mode,
    latencyMs: scenario.latencyMs,
    broadcasted: false,
    createdAt: new Date().toISOString(),
  };
}

/** POST preflight only — AI memo polling is owned by usePreflight / VerdictCard. */
export async function postPreflight(
  req: PreflightRequest & { policyMode?: PolicyMode },
): Promise<PreflightResponse> {
  const scenarioId = req.scenarioId ?? "agent-safe-low-value";
  const scenario = getScenario(scenarioId);
  if (!scenario) throw new Error("unknown scenario");

  const mode = req.policyMode ?? scenario.policyMode;

  if (USING_FIXTURES || scenarioId === "agent-stale-feed") {
    return fixturePreflight(req, mode);
  }

  const policyId = policyIdForScenario(scenarioId);
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
  const mapped = buildPreflightResponse(api, scenario.intent);
  const memoStatus =
    api.memoStatus === "generating" || !mapped.ai
      ? ("generating" as const)
      : ("ready" as const);
  return { ...mapped, memoStatus, policyMode: (api.policyMode as PolicyMode) ?? mode };
}

/** Live preflight with explicit calldata (wallet / contract demos). */
export async function postPreflightLive(body: {
  chainId: number;
  from?: string;
  to?: string;
  data?: string;
  valueWei?: string;
  policyId?: string;
  serializedTransaction?: string;
}): Promise<PreflightResponse> {
  const r = await fetch("/api/preflight", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("preflight failed");
  const api = await r.json();
  const baseIntent: TxIntent = {
    from: body.from ?? "",
    to: body.to ?? "",
    value: body.valueWei ?? "0",
    data: body.data ?? "0x",
    selector: body.data && body.data.length >= 10 ? body.data.slice(0, 10) : "0x",
    chainId: body.chainId,
  };
  const intent = mapIntentFromApi(baseIntent, api.intent);
  const mapped = buildPreflightResponse(api, intent);
  const memoStatus =
    api.memoStatus === "generating" || !mapped.ai
      ? ("generating" as const)
      : ("ready" as const);
  let result = { ...mapped, memoStatus, policyMode: (api.policyMode as PolicyMode) ?? "enforce" };
  if (memoStatus === "generating") {
    const ai = await pollAiAnalysis(result.requestId);
    if (ai) result = { ...result, ai, memoStatus: "ready" };
  }
  return result;
}

/** @deprecated Prefer postPreflight + usePreflight hook */
export async function preflight(req: PreflightRequest): Promise<PreflightResponse> {
  const result = await postPreflight(req);
  if (result.memoStatus === "generating") {
    const { pollAiAnalysis } = await import("./mapPreflightResponse");
    const ai = await pollAiAnalysis(result.requestId);
    if (ai) return { ...result, ai, memoStatus: "ready" };
  }
  return result;
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
    mapAuditEventToUi(e as Parameters<typeof mapAuditEventToUi>[0]),
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

export async function setPolicyMode(policyId: string, mode: PolicyMode) {
  const r = await fetch("/api/policies", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: policyId,
      name: policyId,
      mode,
      template: "agent",
      chainId: 84532,
    }),
  });
  if (!r.ok) throw new Error("policy update failed");
  return r.json();
}
