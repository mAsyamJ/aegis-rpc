"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EventTimeline } from "@/components/dashboard/EventTimeline";
import { AdapterSignalCard } from "@/components/dashboard/AdapterSignalCard";
import { AiMemoPanel } from "@/components/dashboard/AiMemoPanel";
import { RiskChecksTable } from "@/components/dashboard/RiskChecksTable";
import { RpcStatusCard } from "@/components/dashboard/RpcStatusCard";
import { TxIntentPreview } from "@/components/demo/TxIntentPreview";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { ContractAddressCard } from "@/components/shared/ContractAddressCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvents } from "@/lib/client/aegisApi";
import { basescanUrl } from "@/lib/client/mapPolicies";
import type { AegisEvent } from "@/lib/types/aegis";
import { formatMs, relativeTime } from "@/lib/utils/format";

export default function DashboardPage() {
  const [events, setEvents] = useState<AegisEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;
    async function load() {
      const list = await getEvents();
      if (!mounted) return;
      setEvents(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    }
    load();
    const t = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [selectedId]);

  const selected = events.find((e) => e.id === selectedId);
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
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Operations
          </div>
          <h1 className="mt-1 text-2xl font-semibold">OpsRisk dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live audit timeline — deterministic verdicts, adapter signals, AI memos.
          </p>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi label="Total" value={counts.total} />
          <Kpi label="SAFE" value={counts.safe} tone="safe" />
          <Kpi label="WARN" value={counts.warn} tone="warn" />
          <Kpi label="BLOCK" value={counts.block} tone="block" />
          <Kpi label="Avg latency" value={formatMs(counts.avgLatency)} />
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <EventTimeline
              events={events}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <RpcStatusCard />
          </div>
          <div className="lg:col-span-8">
            {selected ? (
              <EventDetail event={selected} />
            ) : (
              <div className="grid h-64 place-items-center rounded-xl border border-dashed border-border bg-surface text-sm text-muted-foreground">
                Run a demo preflight to populate the timeline.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function EventDetail({ event }: { event: AegisEvent }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
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
          <a
            href={basescanUrl(event.policyHash)}
            className="font-mono text-aegis hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            policy {event.policyHash.slice(0, 10)}…
          </a>
        </div>
      </div>

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

      {event.txHash && (
        <div className="border-t border-border p-4">
          <ContractAddressCard label="Tx hash" address={event.txHash} full />
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "safe" | "warn" | "block";
}) {
  const toneCls =
    tone === "safe"
      ? "text-safe"
      : tone === "warn"
        ? "text-warn"
        : tone === "block"
          ? "text-block"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}
