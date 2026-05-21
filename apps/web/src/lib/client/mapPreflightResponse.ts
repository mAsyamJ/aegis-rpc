import type {
  AdapterSignal as BackendSignal,
  AuditEvent,
} from "@/lib/types";
import type {
  AdapterSignal,
  AiAnalysis,
  PreflightResponse,
  RiskCheck,
  TxIntent,
  Verdict,
} from "@/lib/types/aegis";

const REASON_LABELS: Record<string, string> = {
  POLICY_OK: "Policy checks passed. Transaction is eligible for broadcast.",
  AGENT_TX_CAP_EXCEEDED: "Transaction USD value exceeds agent per-tx cap.",
  SELECTOR_NOT_ALLOWLISTED: "Function selector is not in this signer's allowlist.",
  ORACLE_STALE: "Required Chainlink feed is older than the configured maxAge.",
  UNLIMITED_APPROVAL_UNKNOWN_SPENDER:
    "Unlimited ERC-20 approval to a spender that is not allowlisted.",
  ALL_CHECKS_PASSED: "All deterministic checks passed.",
};

export type ApiIntentSlice = {
  decodedFunction?: string;
  decodedArgs?: Record<string, unknown>;
  selector?: string;
  useCase?: string;
  isUnknownSelector?: boolean;
};

function verdictToCheckStatus(verdict: Verdict): AdapterSignal["status"] {
  if (verdict === "SAFE") return "OK";
  return verdict;
}

export function reasonFor(code: string): string {
  return REASON_LABELS[code] ?? "Policy decision recorded.";
}

export function mapAdapterSignal(s: BackendSignal): AdapterSignal {
  return {
    adapter: s.adapter,
    status: s.status,
    label: s.message,
    detail: s.reasonCode,
    latencyMs: s.latencyMs,
    source: (s.data?.feedAddress as string | undefined) ?? undefined,
    data: s.data as Record<string, string | number | boolean> | undefined,
  };
}

export function signalsToChecks(
  signals: BackendSignal[],
  verdict: Verdict,
  reasonCode: string
): RiskCheck[] {
  const checks: RiskCheck[] = signals.map((s, i) => ({
    id: `sig-${i}`,
    name: s.adapter,
    status: s.status,
    reasonCode: s.reasonCode,
    detail: s.message,
  }));
  if (checks.length === 0) {
    checks.push({
      id: "verdict",
      name: "Policy engine",
      status: verdictToCheckStatus(verdict),
      reasonCode,
      detail: reasonFor(reasonCode),
    });
  }
  return checks;
}

export function intentFromScenario(intent: TxIntent) {
  return {
    chainId: intent.chainId,
    from: intent.from,
    to: intent.to,
    valueWei: intent.value === "0" ? "0" : intent.value,
    data: intent.data,
  };
}

function formatArgValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Merge live API decode (ABI indexer) into fixture-shaped UI intent. */
export function mapIntentFromApi(
  scenarioIntent: TxIntent,
  apiIntent?: ApiIntentSlice
): TxIntent {
  if (!apiIntent?.decodedFunction) return scenarioIntent;

  const decodedArgs = apiIntent.decodedArgs
    ? Object.entries(apiIntent.decodedArgs).map(([name, value]) => ({
        name,
        type: "unknown",
        value: formatArgValue(value),
        highlight:
          name === "spender" &&
          apiIntent.decodedFunction?.includes("approve") &&
          value ===
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      }))
    : scenarioIntent.decodedArgs;

  return {
    ...scenarioIntent,
    functionSignature: apiIntent.decodedFunction,
    selector: apiIntent.selector ?? scenarioIntent.selector,
    decodedArgs: decodedArgs?.length ? decodedArgs : scenarioIntent.decodedArgs,
  };
}

export function buildPreflightResponse(
  api: {
    requestId: string;
    verdict: Verdict;
    reasonCode: string;
    signals: BackendSignal[];
    memoStatus: string;
    onChainPolicyHash?: string;
    policyMode?: string;
    latencyMs?: number;
    intent?: ApiIntentSlice;
  },
  scenarioIntent: TxIntent,
  ai?: AiAnalysis
): PreflightResponse {
  const intent = mapIntentFromApi(scenarioIntent, api.intent);
  return {
    requestId: api.requestId,
    verdict: api.verdict,
    reasonCode: api.reasonCode,
    reason: reasonFor(api.reasonCode),
    intent,
    checks: signalsToChecks(api.signals, api.verdict, api.reasonCode),
    adapters: api.signals.map(mapAdapterSignal),
    ai,
    policyHash: api.onChainPolicyHash ?? "0x0",
    policyMode: (api.policyMode as PreflightResponse["policyMode"]) ?? "enforce",
    latencyMs: api.latencyMs ?? 0,
    broadcasted: false,
    createdAt: new Date().toISOString(),
  };
}

export async function pollAiAnalysis(
  requestId: string,
  maxAttempts = 12
): Promise<AiAnalysis | undefined> {
  for (let i = 0; i < maxAttempts; i++) {
    const r = await fetch(`/api/ai-analyze?requestId=${encodeURIComponent(requestId)}`);
    if (!r.ok) return undefined;
    const json = (await r.json()) as {
      pending?: boolean;
      analysis?: {
        summary: string;
        risks: string[];
        suggestion?: string;
        confidence?: number;
        model?: string;
        preSigningAssist?: { headline: string; bullets: string[] };
      };
      memo?: string;
      confidence?: number;
      generatedAt?: string;
    };
    if (json.analysis) {
      return {
        summary: json.analysis.summary,
        risks: json.analysis.risks ?? [],
        suggestion: json.analysis.suggestion,
        confidence: json.analysis.confidence ?? json.confidence,
        model: json.analysis.model,
        preSigningAssist: json.analysis.preSigningAssist,
      };
    }
    if (json.pending) await new Promise((res) => setTimeout(res, 400));
  }
  return undefined;
}

function auditDecodedArgs(
  decodedArgs?: Record<string, unknown>
): TxIntent["decodedArgs"] {
  if (!decodedArgs) return undefined;
  return Object.entries(decodedArgs).map(([name, value]) => ({
    name,
    type: "unknown",
    value: formatArgValue(value),
  }));
}

export function mapAuditEventToUi(evt: AuditEvent) {
  const calldata =
    evt.calldataPreview && evt.calldataPreview.startsWith("0x")
      ? evt.calldataPreview.replace(/…$/, "")
      : "0x";

  return {
    id: evt.id,
    requestId: evt.requestId,
    verdict: evt.verdict,
    reasonCode: evt.reasonCode,
    scenario: evt.decodedFunction ?? evt.method,
    policyHash: evt.onChainPolicyHash ?? "0x0",
    intent: {
      from: evt.fromAddress ?? "",
      to: evt.toAddress ?? "",
      value: evt.valueWei,
      data: calldata.length >= 10 ? calldata : "0x",
      selector: evt.selector ?? "0x",
      functionSignature: evt.decodedFunction,
      decodedArgs: auditDecodedArgs(evt.decodedArgs),
      chainId: evt.chainId,
    },
    adapters: evt.signals.map(mapAdapterSignal),
    checks: signalsToChecks(evt.signals, evt.verdict, evt.reasonCode),
    ai: evt.aiAnalysis
      ? {
          summary: evt.aiAnalysis.summary,
          risks: evt.aiAnalysis.risks ?? [],
          suggestion: evt.aiAnalysis.suggestion,
          confidence: evt.aiAnalysis.confidence,
          model: evt.aiAnalysis.model,
        }
      : evt.aiMemo
        ? { summary: evt.aiMemo, risks: [], model: "aegis-explain-v1" }
        : undefined,
    latencyMs: evt.latencyMs ?? 0,
    broadcasted: evt.broadcasted,
    txHash: evt.txHash,
    createdAt: evt.createdAt,
  };
}
