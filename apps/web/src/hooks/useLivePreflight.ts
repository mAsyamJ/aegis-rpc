"use client";

import { useCallback, useState } from "react";
import { postPreflightLive } from "@/lib/client/aegisApi";
import { pollAiAnalysis } from "@/lib/client/mapPreflightResponse";
import type { LiveTxScenario } from "@/lib/fixtures/liveTxScenarios";
import type { MemoStatus, PreflightResponse } from "@/lib/types/aegis";

export function useLivePreflight(scenario: LiveTxScenario, from?: string) {
  const [response, setResponse] = useState<PreflightResponse | undefined>();
  const [running, setRunning] = useState(false);
  const [memoStatus, setMemoStatus] = useState<MemoStatus>("idle");
  const [aiSource, setAiSource] = useState<string | undefined>();

  const run = useCallback(async () => {
    setRunning(true);
    setResponse(undefined);
    setMemoStatus("generating");
    setAiSource(undefined);

    try {
      const body = scenario.buildPreflightBody(from);
      let result = await postPreflightLive(body);

      if (result.memoStatus === "generating" || !result.ai) {
        const ai = await pollAiAnalysis(result.requestId);
        if (ai) {
          result = { ...result, ai, memoStatus: "ready" };
          setAiSource(ai.model);
        } else {
          setMemoStatus("failed");
        }
      } else {
        setAiSource(result.ai?.model);
      }

      setResponse(result);
      setMemoStatus(result.memoStatus ?? (result.ai ? "ready" : "failed"));
    } catch {
      setMemoStatus("failed");
    } finally {
      setRunning(false);
    }
  }, [scenario, from]);

  const reset = useCallback(() => {
    setResponse(undefined);
    setMemoStatus("idle");
    setAiSource(undefined);
  }, []);

  const updateResponse = useCallback((next: PreflightResponse) => {
    setResponse(next);
    setAiSource(next.ai?.model);
  }, []);

  return {
    response,
    running,
    memoStatus,
    aiSource,
    run,
    reset,
    updateResponse,
  };
}
