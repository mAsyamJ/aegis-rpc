"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useAuditEvents } from "@/hooks/useAuditEvents";
import { useRpcProbe } from "@/hooks/useRpcProbe";
import { formatMs } from "@/lib/utils/format";

export function OverviewKpis() {
  const { data: events = [], isLoading } = useAuditEvents();
  const { data: rpc } = useRpcProbe();

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
    <section className="border-b border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Overview
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Gateway at a glance
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Live screening stats from the audit log. Policy decides; AI explains.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-aegis hover:underline"
          >
            Full OpsRisk dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Screenings" value={isLoading ? "…" : counts.total} />
          <KpiCard label="SAFE" value={counts.safe} tone="safe" />
          <KpiCard label="WARN" value={counts.warn} tone="warn" />
          <KpiCard label="BLOCK" value={counts.block} tone="block" />
          <KpiCard label="Avg latency" value={formatMs(counts.avgLatency)} />
          <KpiCard
            label="RPC health"
            value={
              rpc?.ok
                ? rpc.latencyMs != null
                  ? `${rpc.latencyMs} ms`
                  : "online"
                : "—"
            }
          />
        </div>
      </div>
    </section>
  );
}
