import { z } from "zod";
import { collectAdapterSignals } from "@/lib/adapters";
import { appendEvent, updateEvent } from "@/lib/db/eventStore";
import { evaluateTransaction } from "@/lib/engine/policyEngine";
import { decodeTxIntent } from "@/lib/engine/transactionDecoder";
import { generateMemoAsync } from "@/lib/ai/memoGenerator";
import { getPolicy } from "@/lib/policies/default-wallet-policy";
import type { AuditEvent, PreflightRequest } from "@/lib/types";

export const preflightSchema = z.object({
  chainId: z.number().int().positive(),
  from: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  valueWei: z.string().optional(),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/).optional(),
  policyId: z.string().optional(),
});

export async function runPreflight(input: PreflightRequest) {
  const started = Date.now();
  const requestId = `req_${Date.now().toString(36)}`;
  const intent = decodeTxIntent(input, requestId);
  const policy = getPolicy(input.policyId);
  const signals = await collectAdapterSignals(intent, policy);
  const verdictResult = evaluateTransaction(intent, signals, policy);

  const event: AuditEvent = {
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
    useCase: intent.useCase,
    isUnknownSelector: intent.isUnknownSelector,
    policyId: policy.id,
    verdict: verdictResult.verdict,
    reasonCode: verdictResult.reasonCode,
    signals,
    needsAiAnalysis: verdictResult.needsAiAnalysis,
    broadcasted: false,
    memoStatus: verdictResult.needsAiAnalysis ? "generating" : "pending",
    latencyMs: Date.now() - started,
  };

  appendEvent(event);

  if (verdictResult.needsAiAnalysis || verdictResult.verdict !== "SAFE") {
    void generateMemoAsync(requestId, event, verdictResult).then((memo) => {
      updateEvent(requestId, {
        aiMemo: memo.text,
        memoStatus: memo.source === "template" ? "fallback" : "ready",
      });
    });
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
    },
    latencyMs: event.latencyMs,
  };
}
