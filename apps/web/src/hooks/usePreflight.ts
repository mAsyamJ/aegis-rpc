"use client";

import { useCallback, useState } from "react";
import { useAppStatus } from "@/components/layout/AppStatusProvider";
import type { TraceStep } from "@/components/shared/LoadingTrace";
import { getScenario } from "@/lib/fixtures/demoScenarios";
import { postPreflight } from "@/lib/client/aegisApi";
import { policyIdForScenario } from "@/lib/client/scenarioPolicy";
import { pollAiAnalysis } from "@/lib/client/mapPreflightResponse";
import type { MemoStatus, PreflightResponse, PolicyMode } from "@/lib/types/aegis";

export const PREFLIGHT_TRACE_STEPS: TraceStep[] = [
  { id: "decode", label: "Decode calldata", detail: "parse selector + args" },
  { id: "adapters", label: "Query adapters", detail: "chainlink · code · allowlist" },
  { id: "policy", label: "Run policy engine", detail: "deterministic checks" },
  { id: "verdict", label: "Finalize verdict", detail: "SAFE / WARN / BLOCK" },
  { id: "ai", label: "Generate AI memo", detail: "explanation only" },
  { id: "audit", label: "Write audit event", detail: "OpsRisk log" },
];

const STEP_MS = 220;

const WALLET_TRACE: TraceStep[] = [
  { id: "decode", label: "Decode approve(address,uint256)" },
  { id: "spender", label: "Check spender allowlist" },
  { id: "amount", label: "Check approval amount policy" },
  { id: "policy", label: "Run deterministic policy" },
  { id: "verdict", label: "Block before sign" },
];

export function usePreflight(
  scenarioId: string,
  options?: { traceSteps?: TraceStep[] },
) {
  const { policyMode, setPolicyMode, setActivePolicyId } = useAppStatus();
  const [response, setResponse] = useState<PreflightResponse | undefined>();
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [memoStatus, setMemoStatus] = useState<MemoStatus>("idle");

  const scenario = getScenario(scenarioId);
  const policyId = policyIdForScenario(scenarioId);
  const steps = options?.traceSteps ?? PREFLIGHT_TRACE_STEPS;

  const run = useCallback(
    async (modeOverride?: PolicyMode) => {
    if (!scenario) return;
    const mode = modeOverride ?? policyMode;
    setRunning(true);
    setResponse(undefined);
    setMemoStatus("generating");
    setStepIdx(0);
    setActivePolicyId(policyId);
    setPolicyMode(mode);

    const apiPromise = postPreflight({
      scenarioId,
      intent: scenario.intent,
      policyMode: mode,
    });

    for (let i = 0; i < steps.length; i++) {
      setStepIdx(i);
      await new Promise((r) => setTimeout(r, STEP_MS));
    }

    try {
      let result = await apiPromise;
      setStepIdx(steps.length);
      setResponse(result);
      setPolicyMode(result.policyMode);

      if (result.memoStatus === "generating" || !result.ai) {
        const ai = await pollAiAnalysis(result.requestId);
        if (ai) {
          result = { ...result, ai, memoStatus: "ready" };
          setResponse(result);
        }
        setMemoStatus(ai ? "ready" : "failed");
      } else {
        setMemoStatus("ready");
      }
    } catch {
      setMemoStatus("failed");
      setStepIdx(-1);
    } finally {
      setRunning(false);
    }
  },
    [scenario, scenarioId, policyId, policyMode, setPolicyMode, setActivePolicyId, steps],
  );

  const reset = useCallback(() => {
    setResponse(undefined);
    setStepIdx(-1);
    setMemoStatus("idle");
  }, []);

  const updateResponse = useCallback((next: PreflightResponse) => {
    setResponse(next);
  }, []);

  return {
    scenario,
    policyId,
    policyMode,
    response,
    running,
    stepIdx,
    memoStatus,
    traceSteps: steps,
    run,
    reset,
    updateResponse,
  };
}

export { WALLET_TRACE };
