import { collectAdapterSignals } from "@/lib/adapters";
import { appendEvent } from "@/lib/db/eventRepository";
import { evaluateTransaction } from "@/lib/engine/policyEngine";
import { decodeTxIntent } from "@/lib/engine/transactionDecoder";
import { getPolicy, getPolicyHash } from "@/lib/policies";
import { scheduleAiAnalysis } from "@/lib/ai/memoService";
import { incrementScreening } from "@/lib/metrics/counters";
import type {
  AdapterSignal,
  AuditEvent,
  PreflightRequest,
  Verdict,
  VerdictResult,
} from "@/lib/types";

export type ScreeningResult = {
  requestId: string;
  verdict: Verdict;
  reasonCode: string;
  signals: AdapterSignal[];
  memoStatus: AuditEvent["memoStatus"];
  broadcasted: false;
  intent: {
    decodedFunction?: string;
    decodedArgs?: Record<string, unknown>;
    isUnknownSelector: boolean;
    isUnlimitedApproval?: boolean;
    selector?: string;
    useCase?: string;
  };
  onChainPolicyHash?: string;
  policyMode: string;
  latencyMs: number;
};

function newRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function buildAuditEvent(
  input: PreflightRequest,
  requestId: string,
  intent: ReturnType<typeof decodeTxIntent>,
  policy: ReturnType<typeof getPolicy>,
  verdictResult: VerdictResult,
  signals: AdapterSignal[],
  latencyMs: number
): AuditEvent {
  const data = input.data ?? "0x";
  return {
    id: `evt_${requestId}`,
    requestId,
    createdAt: new Date().toISOString(),
    chainId: intent.chainId,
    method: intent.method,
    fromAddress: intent.from,
    toAddress: intent.to,
    valueWei: intent.valueWei.toString(),
    selector: intent.selector,
    decodedFunction: intent.decodedFunction,
    decodedArgs: intent.decodedArgs,
    calldataPreview: data.length > 202 ? `${data.slice(0, 202)}…` : data,
    useCase: intent.useCase,
    isUnknownSelector: intent.isUnknownSelector,
    policyId: policy.id,
    verdict: verdictResult.verdict,
    reasonCode: verdictResult.reasonCode,
    signals,
    needsAiAnalysis: verdictResult.needsAiAnalysis,
    broadcasted: false,
    memoStatus: verdictResult.needsAiAnalysis ? "generating" : "pending",
    onChainPolicyHash: getPolicyHash(policy.id),
    serializedTransaction: input.serializedTransaction,
    latencyMs,
  };
}

export async function runScreening(
  input: PreflightRequest
): Promise<ScreeningResult> {
  const started = Date.now();
  const requestId = newRequestId();
  const intent = decodeTxIntent(input, requestId);
  const policy = getPolicy(input.policyId);
  const signals = await collectAdapterSignals(intent, policy);
  let verdictResult = evaluateTransaction(intent, signals, policy);

  if (
    verdictResult.verdict === "SAFE" &&
    process.env.AEGIS_AI_MEMO_ON_SAFE !== "false"
  ) {
    verdictResult = { ...verdictResult, needsAiAnalysis: true };
  }

  const event = buildAuditEvent(
    input,
    requestId,
    intent,
    policy,
    verdictResult,
    signals,
    Date.now() - started
  );

  await appendEvent(event);
  incrementScreening(verdictResult.verdict);

  if (verdictResult.needsAiAnalysis) {
    scheduleAiAnalysis(event, verdictResult);
  }

  return {
    requestId,
    verdict: verdictResult.verdict,
    reasonCode: verdictResult.reasonCode,
    signals,
    memoStatus: event.memoStatus,
    broadcasted: false,
    intent: {
      decodedFunction: intent.decodedFunction,
      decodedArgs: intent.decodedArgs,
      isUnknownSelector: intent.isUnknownSelector,
      isUnlimitedApproval: intent.isUnlimitedApproval,
      selector: intent.selector,
      useCase: intent.useCase,
    },
    onChainPolicyHash: event.onChainPolicyHash,
    policyMode: policy.mode,
    latencyMs: event.latencyMs ?? Date.now() - started,
  };
}

export function toJsonRpcScreeningResult(result: ScreeningResult): Record<string, unknown> {
  return {
    requestId: result.requestId,
    verdict: result.verdict,
    reasonCode: result.reasonCode,
    signals: result.signals,
    memo: null,
    memoStatus: result.memoStatus,
    broadcasted: result.broadcasted,
    intent: result.intent,
    onChainPolicyHash: result.onChainPolicyHash,
    policyMode: result.policyMode,
    latencyMs: result.latencyMs,
  };
}
