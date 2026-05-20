"use client";

import { useState } from "react";
import { Play, ShieldX } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TxIntentPreview } from "@/components/demo/TxIntentPreview";
import { VerdictCard } from "@/components/demo/VerdictCard";
import { AdapterSignalCard } from "@/components/dashboard/AdapterSignalCard";
import { AiMemoPanel } from "@/components/dashboard/AiMemoPanel";
import { RiskChecksTable } from "@/components/dashboard/RiskChecksTable";
import { LoadingTrace, type TraceStep } from "@/components/shared/LoadingTrace";
import { Button } from "@/components/ui/button";
import { getScenario } from "@/lib/fixtures/demoScenarios";
import { preflight } from "@/lib/client/aegisApi";
import type { PreflightResponse } from "@/lib/types/aegis";

const traceSteps: TraceStep[] = [
  { id: "decode", label: "Decode approve(address,uint256)" },
  { id: "spender", label: "Check spender allowlist" },
  { id: "amount", label: "Check approval amount policy" },
  { id: "policy", label: "Run deterministic policy" },
  { id: "verdict", label: "Block before sign" },
];

export default function WalletDemoPage() {
  const scenario = getScenario("wallet-unlimited-approval")!;
  const [response, setResponse] = useState<PreflightResponse | undefined>();
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);

  async function run() {
    setRunning(true);
    setResponse(undefined);
    for (let i = 0; i < traceSteps.length; i++) {
      setStepIdx(i);
      await new Promise((r) => setTimeout(r, 260));
    }
    const r = await preflight({
      scenarioId: scenario.id,
      intent: scenario.intent,
    });
    setResponse(r);
    setStepIdx(traceSteps.length);
    setRunning(false);
  }

  return (
    <AppShell>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Demo · wallet
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Wallet approval firewall
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Aegis stops unlimited ERC-20 approval to an unverified spender before
                broadcast.
              </p>
            </div>
            <Button
              onClick={run}
              disabled={running}
              size="lg"
              className="bg-aegis text-aegis-foreground hover:bg-aegis/90"
            >
              <Play className="mr-1.5 h-4 w-4" />
              {running ? "Screening…" : "Simulate wallet approval"}
            </Button>
          </header>

          <div className="grid gap-5 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="overflow-hidden rounded-xl border border-block/30 bg-block/5 p-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-block/15 text-block">
                    <ShieldX className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Drainer pattern</div>
                    <div className="text-[11px] text-muted-foreground">
                      approve(spender, MaxUint256) — spender not allowlisted
                    </div>
                  </div>
                </div>
              </div>
              <TxIntentPreview intent={scenario.intent} />
              <div className="rounded-xl border border-border bg-surface p-4">
                <LoadingTrace steps={traceSteps} activeIndex={stepIdx} />
              </div>
              {response && (
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {response.adapters.map((a) => (
                      <AdapterSignalCard key={a.adapter} signal={a} />
                    ))}
                  </div>
                  <RiskChecksTable checks={response.checks} />
                </>
              )}
            </div>
            <div className="space-y-4 lg:col-span-5">
              <VerdictCard response={response} loading={running} />
              {response && <AiMemoPanel ai={response.ai} />}
            </div>
          </div>
        </div>
      </AppShell>
  );
}
