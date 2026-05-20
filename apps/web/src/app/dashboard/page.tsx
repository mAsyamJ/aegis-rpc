"use client";

import { useEffect, useState } from "react";
import type { AuditEvent } from "@/lib/types";

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, string> = {
    SAFE: "bg-emerald-100 text-emerald-800 border-emerald-300",
    WARN: "bg-amber-100 text-amber-900 border-amber-300",
    BLOCK: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold uppercase ${colors[verdict] ?? "bg-gray-100"}`}
    >
      {verdict}
    </span>
  );
}

export default function DashboardPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/events?limit=25");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { events: AuditEvent[] };
        if (!cancelled) setEvents(data.events);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 border-b border-zinc-800 pb-6">
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            OpsRisk
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Aegis RPC Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Deterministic screening timeline — AI memos explain, policy decides.
          </p>
        </header>

        {loading && <p className="text-zinc-500">Loading events…</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && events.length === 0 && (
          <p className="rounded border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
            No audit events yet. Run{" "}
            <code className="text-zinc-200">POST /api/preflight</code> or the
            curl demo script.
          </p>
        )}

        <ul className="space-y-4">
          {events.map((evt) => (
            <li
              key={evt.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <VerdictBadge verdict={evt.verdict} />
                <code className="text-xs text-zinc-500">{evt.requestId}</code>
                <span className="text-xs text-zinc-600">{evt.createdAt}</span>
              </div>
              <p className="mt-2 font-mono text-sm text-zinc-300">
                {evt.decodedFunction ?? evt.method}{" "}
                <span className="text-zinc-500">· {evt.reasonCode}</span>
              </p>
              {evt.signals.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs uppercase text-zinc-500">Signals</p>
                  <ul className="mt-1 space-y-1">
                    {evt.signals.map((s, i) => (
                      <li key={i} className="text-sm text-zinc-400">
                        {s.adapter}: {s.status} — {s.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(evt.aiMemo || evt.memoStatus !== "pending") && (
                <div className="mt-3 rounded border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-xs uppercase text-zinc-500">
                    AI memo ({evt.memoStatus})
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    {evt.aiMemo ?? "Generating…"}
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-zinc-600">
                broadcasted: {String(evt.broadcasted)} · latency:{" "}
                {evt.latencyMs ?? "—"}ms
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
