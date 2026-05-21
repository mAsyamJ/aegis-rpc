"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Play } from "lucide-react";
import { DemoWorkbench } from "@/components/layout/DemoWorkbench";
import { GettingStartedBanner } from "@/components/shared/GettingStartedBanner";
import { DemoStepper, type DemoStep } from "@/components/shared/DemoStepper";
import { SurfaceCard } from "@/components/shared/SurfaceCard";
import { RpcPassthroughPanel } from "@/components/demo/RpcPassthroughPanel";
import { TransactionRiskPanel } from "@/components/demo/TransactionRiskPanel";
import { VerdictCard } from "@/components/demo/VerdictCard";
import { PreSigningAssistPanel } from "@/components/demo/PreSigningAssistPanel";
import { DemoResultsPanel } from "@/components/demo/DemoResultsPanel";
import { LoadingTrace } from "@/components/shared/LoadingTrace";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePreflight } from "@/hooks/usePreflight";
import { setPolicyMode as setPolicyModeApi, safeSend } from "@/lib/client/aegisApi";
const STEPS: DemoStep[] = [
  {
    id: "block",
    label: "Agent over-cap → BLOCK",
    description: "Enforce mode blocks $4,800 transfer over $500 cap.",
  },
  {
    id: "warn-mode",
    label: "Policy WARN + unknown selector",
    description: "Switch to warn mode and run a non-allowlisted call.",
  },
  {
    id: "assist",
    label: "Review AI pre-signing assist",
    description: "Read the memo — AI explains, policy decides.",
  },
  {
    id: "send",
    label: "Override → safe-send",
    description: "Operator override queues broadcast (demo).",
  },
];

export function GuidedAgentDemo() {
  const searchParams = useSearchParams();
  const initialStep = Math.min(
    3,
    Math.max(0, Number.parseInt(searchParams.get("step") ?? "1", 10) - 1),
  );

  const [guidedStep, setGuidedStep] = useState(initialStep);
  const [scenarioId, setScenarioId] = useState("agent-over-cap");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const {
    scenario,
    policyId,
    policyMode,
    response,
    running,
    stepIdx,
    memoStatus,
    traceSteps,
    run,
    reset,
    updateResponse,
  } = usePreflight(scenarioId);

  useEffect(() => {
    setGuidedStep(initialStep);
  }, [initialStep]);

  const stepComplete = useMemo(() => {
    const c = [false, false, false, false];
    if (response?.verdict === "BLOCK" && scenarioId === "agent-over-cap") c[0] = true;
    if (response?.verdict === "WARN" && scenarioId === "agent-unknown-selector") c[1] = true;
    if (c[1] && response?.ai) c[2] = true;
    if (response?.broadcasted) c[3] = true;
    return c;
  }, [response, scenarioId]);

  const runStep = useCallback(async () => {
    if (guidedStep === 0) {
      setScenarioId("agent-over-cap");
      await run("enforce");
      return;
    }
    if (guidedStep === 1) {
      try {
        await setPolicyModeApi(policyId, "warn");
        setScenarioId("agent-unknown-selector");
        reset();
        await run("warn");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Policy update failed");
      }
      return;
    }
    if (guidedStep === 2) {
      if (response?.verdict === "WARN") {
        setGuidedStep(3);
      } else {
        toast.message("Run step 2 first to get a WARN verdict.");
      }
      return;
    }
    if (guidedStep === 3 && response) {
      try {
        const { txHash } = await safeSend(response.requestId);
        toast.success("Broadcast queued", { description: txHash });
        updateResponse({ ...response, broadcasted: true });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Broadcast failed");
      }
    }
  }, [guidedStep, policyId, run, reset, response, updateResponse]);

  useEffect(() => {
    if (guidedStep === 0 && stepComplete[0] && !running) setGuidedStep(1);
    if (guidedStep === 1 && stepComplete[1] && !running) setGuidedStep(2);
  }, [guidedStep, stepComplete, running]);

  const primaryLabel =
    guidedStep === 0
      ? "Run step 1 — Block over-cap"
      : guidedStep === 1
        ? "Run step 2 — WARN scenario"
        : guidedStep === 2
          ? "Continue to override"
          : "Run step 4 — Safe-send";

  return (
    <div className="space-y-5">
      <GettingStartedBanner step={guidedStep + 1} total={4} compact />
      <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        For real Base Sepolia adapter signals and three contract lanes (SAFE / WARN / BLOCK), use{" "}
        <Link href="/demo/live" className="font-medium text-aegis hover:underline">
          Live use cases
        </Link>
        .
      </p>

      {scenario ? (
        <DemoWorkbench
          controls={
            <SurfaceCard className="space-y-4">
              <DemoStepper
                steps={STEPS}
                activeIndex={guidedStep}
                completedThrough={
                  stepComplete[3]
                    ? 3
                    : stepComplete[2]
                      ? 2
                      : stepComplete[1]
                        ? 1
                        : stepComplete[0]
                          ? 0
                          : -1
                }
              />
              <Button
                onClick={() => void runStep()}
                disabled={running || (guidedStep === 3 && !response)}
                className="w-full bg-aegis text-aegis-foreground hover:bg-aegis/90"
              >
                <Play className="mr-1.5 h-4 w-4" />
                {running ? "Running preflight…" : primaryLabel}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Policy mode: <span className="font-mono capitalize">{policyMode}</span>
                {" · "}
                Scenario: <span className="font-mono">{scenarioId}</span>
              </p>
            </SurfaceCard>
          }
          primary={
            <div className="space-y-4">
              <SurfaceCard>
                <LoadingTrace steps={traceSteps} activeIndex={stepIdx} />
              </SurfaceCard>
              <TransactionRiskPanel
                intent={scenario.intent}
                response={response}
                useCase="agent"
              />
            </div>
          }
          secondary={
            <>
              <VerdictCard
                response={response}
                loading={running}
                memoStatus={memoStatus}
                onSafeSend={() => void runStep()}
                onWarnOverride={() => void runStep()}
                onReset={reset}
              />
              {response?.verdict === "WARN" && guidedStep >= 2 && (
                <PreSigningAssistPanel ai={response.ai} />
              )}
            </>
          }
          footer={
            <>
              {response ? <DemoResultsPanel response={response} /> : null}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground">
                    Advanced — RPC passthrough
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <RpcPassthroughPanel />
                </CollapsibleContent>
              </Collapsible>
            </>
          }
        />
      ) : null}
    </div>
  );
}
