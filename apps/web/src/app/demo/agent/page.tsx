"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { DemoScenarioSelector } from "@/components/demo/DemoScenarioSelector";
import { PreflightComposer } from "@/components/demo/PreflightComposer";
import { TxIntentPreview } from "@/components/demo/TxIntentPreview";
import { VerdictCard } from "@/components/demo/VerdictCard";
import { PreSigningAssistPanel } from "@/components/demo/PreSigningAssistPanel";
import { PolicyModeToggle } from "@/components/policies/PolicyModeToggle";
import { AdapterSignalCard } from "@/components/dashboard/AdapterSignalCard";
import { AiMemoPanel } from "@/components/dashboard/AiMemoPanel";
import { RiskChecksTable } from "@/components/dashboard/RiskChecksTable";
import { LoadingTrace, type TraceStep } from "@/components/shared/LoadingTrace";
import { scenariosFor, getScenario } from "@/lib/fixtures/demoScenarios";
import { preflight, safeSend } from "@/lib/client/aegisApi";
import type { PolicyMode, PreflightResponse } from "@/lib/types/aegis";

const traceSteps: TraceStep[] = [
  { id: "decode", label: "Decode calldata", detail: "parse selector + args" },
  { id: "adapters", label: "Query adapters", detail: "chainlink · code · allowlist" },
  { id: "policy", label: "Run policy engine", detail: "deterministic checks" },
  { id: "verdict", label: "Finalize verdict", detail: "SAFE / WARN / BLOCK" },
  { id: "ai", label: "Generate AI memo", detail: "explanation only" },
  { id: "audit", label: "Write audit event", detail: "OpsRisk log" },
];

const SCENARIO_POLICY: Record<string, string> = {
  "agent-safe-low-value": "default-agent-policy",
  "agent-over-cap": "default-agent-policy",
  "agent-unknown-selector": "default-agent-policy-warn",
  "agent-stale-feed": "default-agent-policy",
};

export default function AgentDemoPage() {
  const scenarios = useMemo(() => scenariosFor("agent"), []);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [response, setResponse] = useState<PreflightResponse | undefined>();
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [policyMode, setPolicyMode] = useState<PolicyMode>("enforce");

  const scenario = getScenario(scenarioId)!;
  const policyId = SCENARIO_POLICY[scenarioId] ?? "default-agent-policy";

  async function runPreflight() {
    setRunning(true);
    setResponse(undefined);
    setStepIdx(0);
    for (let i = 0; i < traceSteps.length; i++) {
      setStepIdx(i);
      await new Promise((r) => setTimeout(r, 280));
    }
    const r = await preflight({ scenarioId, intent: scenario.intent });
    setResponse(r);
    setPolicyMode(r.policyMode);
    setStepIdx(traceSteps.length);
    setRunning(false);
  }

  function reset() {
    setResponse(undefined);
    setStepIdx(-1);
  }

  async function onSafeSend() {
    if (!response) return;
    try {
      const { txHash } = await safeSend(response.requestId);
      toast.success("Broadcast queued", { description: txHash });
      setResponse({ ...response, broadcasted: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Broadcast failed");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Demo · agent (LEAD)
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Agent execution preflight
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Flip policy mode, run scenarios, review WARN assist, override to safe-send.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-3">
            <PreflightComposer
              onRun={runPreflight}
              onReset={reset}
              running={running}
              activeScenarioTitle={scenario.title}
            />
            <PolicyModeToggle
              policyId={policyId}
              mode={policyMode}
              onChange={(m) => {
                setPolicyMode(m);
                reset();
              }}
            />
            <DemoScenarioSelector
              scenarios={scenarios}
              activeId={scenarioId}
              onSelect={(id) => {
                setScenarioId(id);
                reset();
              }}
            />
          </div>

          <div className="space-y-4 lg:col-span-6">
            <TxIntentPreview intent={scenario.intent} />
            <div className="rounded-xl border border-border bg-surface p-4">
              <LoadingTrace steps={traceSteps} activeIndex={stepIdx} />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <VerdictCard
              response={response}
              loading={running}
              onSafeSend={onSafeSend}
              onWarnOverride={onSafeSend}
            />
            {response?.verdict === "WARN" && (
              <PreSigningAssistPanel ai={response.ai} />
            )}
          </div>
        </div>

        {response && (
          <div className="mt-6 grid gap-5 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="grid gap-2 sm:grid-cols-2">
                {response.adapters.map((a) => (
                  <AdapterSignalCard key={a.adapter} signal={a} />
                ))}
              </div>
              <RiskChecksTable checks={response.checks} />
            </div>
            <div className="lg:col-span-5">
              <AiMemoPanel ai={response.ai} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
