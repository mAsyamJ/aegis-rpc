"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Play, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { PublicRpcUrlCard } from "@/components/demo/PublicRpcUrlCard";
import { DemoWorkbench } from "@/components/layout/DemoWorkbench";
import { TransactionRiskPanel } from "@/components/demo/TransactionRiskPanel";
import { VerdictCard } from "@/components/demo/VerdictCard";
import { DemoResultsPanel } from "@/components/demo/DemoResultsPanel";
import { PreSigningAssistPanel } from "@/components/demo/PreSigningAssistPanel";
import { SignInButton } from "@/components/web3/SignInButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { safeSend } from "@/lib/client/aegisApi";
import { liveTxScenarios, type LiveTxScenario } from "@/lib/fixtures/liveTxScenarios";
import { useLivePreflight } from "@/hooks/useLivePreflight";

const USING_FIXTURES =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_AEGIS_FIXTURES === "true";

const laneIcon = {
  SAFE: ShieldCheck,
  WARN: ShieldAlert,
  BLOCK: ShieldX,
} as const;

function LiveLaneCard({
  scenario,
  active,
  onSelect,
}: {
  scenario: LiveTxScenario;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = laneIcon[scenario.expectedVerdict];
  const tone =
    scenario.expectedVerdict === "SAFE"
      ? "border-safe/40"
      : scenario.expectedVerdict === "WARN"
        ? "border-warn/40"
        : "border-block/40";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border bg-surface p-4 text-left transition-colors",
        tone,
        active && "ring-2 ring-aegis/50",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
            scenario.expectedVerdict === "SAFE" && "bg-safe/15 text-safe",
            scenario.expectedVerdict === "WARN" && "bg-warn/15 text-warn",
            scenario.expectedVerdict === "BLOCK" && "bg-block/15 text-block",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{scenario.title}</div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {scenario.summary}
          </p>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            expect {scenario.expectedVerdict} · {scenario.expectedReasonCode}
          </p>
        </div>
      </div>
    </button>
  );
}

export function LiveUseCasesDemo() {
  const [activeId, setActiveId] = useState<LiveTxScenario["id"]>("live-safe-defi");
  const scenario =
    liveTxScenarios.find((s) => s.id === activeId) ?? liveTxScenarios[0];

  const { address } = useAccount();
  const from = address ?? undefined;
  const { response, running, memoStatus, aiSource, run, reset, updateResponse } =
    useLivePreflight(scenario, from);

  const handleSafeSend = useCallback(async () => {
    if (!response?.requestId) return;
    try {
      const { txHash } = await safeSend(response.requestId);
      updateResponse({ ...response, broadcasted: true });
      toast.success(`Safe-send queued: ${txHash.slice(0, 10)}…`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "safe-send failed");
    }
  }, [response, updateResponse]);

  const handleWarnOverride = useCallback(async () => {
    if (!response?.requestId) return;
    try {
      const { txHash } = await safeSend(response.requestId);
      updateResponse({ ...response, broadcasted: true });
      toast.success(`Override broadcast: ${txHash.slice(0, 10)}…`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "override failed");
    }
  }, [response, updateResponse]);

  const intentPreview = response?.intent ?? {
    from: from ?? "0x1234567890123456789012345678901234567890",
    to: scenario.buildPreflightBody(from).to,
    value: "0",
    data: scenario.buildPreflightBody(from).data,
    selector: scenario.buildPreflightBody(from).data.slice(0, 10),
    chainId: 84532,
  };

  return (
    <div className="flex flex-col gap-4">
      <PublicRpcUrlCard />
      {USING_FIXTURES ? (
        <Alert variant="destructive">
          <AlertTitle>Fixtures mode enabled</AlertTitle>
          <AlertDescription>
            Unset <span className="font-mono">NEXT_PUBLIC_AEGIS_FIXTURES</span> and restart
            the dev server for live screening.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Live Base Sepolia — 3 real preflights</AlertTitle>
          <AlertDescription>
            Each lane calls <span className="font-mono">POST /api/preflight</span> with
            deployed contract calldata and loads AI memos from{" "}
            <span className="font-mono">/api/ai-analyze</span> (template when no LLM keys).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {liveTxScenarios.map((s) => (
          <LiveLaneCard
            key={s.id}
            scenario={s}
            active={s.id === activeId}
            onSelect={() => {
              setActiveId(s.id);
              reset();
            }}
          />
        ))}
      </div>

      <DemoWorkbench
        controls={
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{scenario.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-aegis text-aegis-foreground hover:bg-aegis/90"
                onClick={() => void run()}
                disabled={running || USING_FIXTURES}
              >
                <Play className="mr-1.5 h-4 w-4" />
                {running ? "Running preflight…" : "Run live preflight"}
              </Button>
              {scenario.expectedVerdict === "BLOCK" ? (
                <p className="text-xs text-muted-foreground">
                  Malicious pattern: gateway blocks before broadcast. No sign CTA.
                </p>
              ) : null}
              {scenario.expectedVerdict === "SAFE" ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Optional: connect wallet for your address in preflight.
                  </p>
                  <SignInButton size="sm" />
                </div>
              ) : null}
              <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
                Reset lane
              </Button>
            </CardContent>
          </Card>
        }
        primary={
          <div className="space-y-4">
            <TransactionRiskPanel
              intent={intentPreview}
              response={response}
              useCase="wallet"
            />
            {response?.ai?.preSigningAssist ? (
              <PreSigningAssistPanel ai={response.ai} />
            ) : null}
          </div>
        }
        secondary={
          <div className="space-y-3">
            <VerdictCard
              response={response}
              loading={running}
              memoStatus={memoStatus}
              onSafeSend={
                response?.verdict === "SAFE" ? () => void handleSafeSend() : undefined
              }
              onWarnOverride={
                response?.verdict === "WARN" ? () => void handleWarnOverride() : undefined
              }
              onReset={reset}
            />
            {aiSource ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                AI memo:{" "}
                {aiSource === "aegis-template"
                  ? "deterministic template"
                  : aiSource}
              </Badge>
            ) : null}
          </div>
        }
        footer={response ? <DemoResultsPanel response={response} /> : null}
      />

      <p className="text-center text-xs text-muted-foreground">
        Events appear on the{" "}
        <Link href="/dashboard" className="text-aegis hover:underline">
          OpsRisk dashboard
        </Link>{" "}
        after each run.
      </p>
    </div>
  );
}
