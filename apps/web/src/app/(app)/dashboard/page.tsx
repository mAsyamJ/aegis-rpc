"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Play } from "lucide-react";

import { OpsRiskMetricCards } from "@/components/dashboard/OpsRiskMetricCards";
import { EventTimeline } from "@/components/dashboard/EventTimeline";
import { AdapterSignalCard } from "@/components/dashboard/AdapterSignalCard";
import { AiMemoPanel } from "@/components/dashboard/AiMemoPanel";
import { RiskChecksTable } from "@/components/dashboard/RiskChecksTable";
import { IndexerStatusCard } from "@/components/dashboard/IndexerStatusCard";
import { RpcStatusCard } from "@/components/dashboard/RpcStatusCard";
import { TransactionRiskPanel } from "@/components/demo/TransactionRiskPanel";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { GettingStartedBanner } from "@/components/shared/GettingStartedBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { ContractAddressCard } from "@/components/shared/ContractAddressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuditEvents } from "@/hooks/useAuditEvents";
import { basescanUrl } from "@/lib/client/mapPolicies";
import type { AegisEvent } from "@/lib/types/aegis";
import { formatMs, relativeTime } from "@/lib/utils/format";

export default function DashboardPage() {
  const { data: events = [], isLoading } = useAuditEvents();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const activeId = selectedId ?? events[0]?.id;
  const selected = events.find((e) => e.id === activeId);
  const counts = {
    total: events.length,
    safe: events.filter((e) => e.verdict === "SAFE").length,
    warn: events.filter((e) => e.verdict === "WARN").length,
    block: events.filter((e) => e.verdict === "BLOCK").length,
    avgLatency:
      events.length === 0
        ? 0
        : Math.round(events.reduce((a, b) => a + b.latencyMs, 0) / events.length),
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AdminPageHeader
        section="Operations"
        title="OpsRisk dashboard"
        description="Live audit timeline — deterministic verdicts, adapter signals, AI memos."
      />

      <OpsRiskMetricCards counts={counts} isLoading={isLoading} />

      {events.length === 0 && !isLoading ? (
        <div className="space-y-4">
          <GettingStartedBanner />
          <EmptyState
            icon={LayoutDashboard}
            title="No screenings yet"
            description="Run the live 3-tx demo to populate the audit log with real SAFE, WARN, and BLOCK screenings."
            primaryHref="/demo/live"
            primaryLabel="Run live 3-tx demo"
            secondaryHref="/demo/agent"
            secondaryLabel="Agent judge walkthrough"
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Event timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-0">
              {isLoading ? (
                <Skeleton className="mx-4 mb-4 h-64 rounded-md" />
              ) : (
                <ScrollArea className="h-[min(28rem,60vh)]">
                  <EventTimeline
                    embedded
                    events={events}
                    selectedId={activeId}
                    onSelect={setSelectedId}
                  />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          <RpcStatusCard />
          <IndexerStatusCard />
        </div>

        <div className="lg:col-span-8">
          {selected ? (
            <EventDetail event={selected} />
          ) : isLoading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full rounded-md" />
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Play}
              title="Select an event"
              description="Choose a row in the timeline or run a demo to create audit events."
              primaryHref="/demo/agent"
              primaryLabel="Run agent demo"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EventDetail({ event }: { event: AegisEvent }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Event · {relativeTime(event.createdAt)}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <VerdictBadge verdict={event.verdict} size="md" />
            <span className="text-base font-semibold">{event.scenario}</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {event.reasonCode} · {event.requestId}
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <div>latency · {formatMs(event.latencyMs)}</div>
          <Link href="/demo/agent" className="text-aegis hover:underline">
            Replay in demo
          </Link>
        </div>
      </CardHeader>

      <CardContent className="border-b p-4">
        <TransactionRiskPanel
          intent={event.intent}
          useCase="audit"
          response={{
            requestId: event.requestId,
            verdict: event.verdict,
            reasonCode: event.reasonCode,
            reason: event.reasonCode,
            intent: event.intent,
            checks: event.checks,
            adapters: event.adapters,
            policyHash: event.policyHash,
            policyMode: "enforce",
            latencyMs: event.latencyMs,
            broadcasted: event.broadcasted,
            createdAt: event.createdAt,
          }}
        />
      </CardContent>

      <Tabs defaultValue="summary" className="p-4">
        <TabsList className="bg-background/60">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="adapters">Adapters</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="ai">AI memo</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {event.adapters.slice(0, 4).map((a) => (
              <AdapterSignalCard key={a.adapter} signal={a} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="adapters" className="mt-4 grid gap-2 md:grid-cols-2">
          {event.adapters.map((a) => (
            <AdapterSignalCard key={a.adapter} signal={a} />
          ))}
        </TabsContent>
        <TabsContent value="policy" className="mt-4">
          <RiskChecksTable checks={event.checks} />
        </TabsContent>
        <TabsContent value="ai" className="mt-4">
          <AiMemoPanel ai={event.ai} />
        </TabsContent>
      </Tabs>

      {event.txHash ? (
        <div className="border-t p-4">
          <ContractAddressCard label="Tx hash" address={event.txHash} full />
        </div>
      ) : null}
      {event.policyHash && event.policyHash !== "0x0" ? (
        <div className="border-t p-4">
          <a
            href={basescanUrl(event.policyHash)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-aegis hover:underline"
          >
            View policy on BaseScan · {event.policyHash.slice(0, 14)}…
          </a>
        </div>
      ) : null}
    </Card>
  );
}
