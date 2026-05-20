"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RpcStatusCard({ className }: { className?: string }) {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [block, setBlock] = useState<string>("—");
  const [ok, setOk] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function probe() {
      const started = Date.now();
      try {
        const res = await fetch("/api/rpc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_blockNumber",
            params: [],
          }),
        });
        const json = (await res.json()) as { result?: string };
        if (!cancelled) {
          setLatencyMs(Date.now() - started);
          setOk(Boolean(json.result));
          if (json.result) {
            setBlock(parseInt(json.result, 16).toLocaleString());
          }
        }
      } catch {
        if (!cancelled) {
          setOk(false);
          setLatencyMs(null);
        }
      }
    }
    probe();
    const t = setInterval(probe, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className={cn("rounded-xl border border-border bg-surface p-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">RPC gateway</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            base-sepolia · /api/rpc
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs ring-1",
            ok
              ? "bg-safe/10 text-safe ring-safe/30"
              : "bg-block/10 text-block ring-block/30"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              ok ? "bg-safe shadow-[0_0_8px_2px_var(--safe)]" : "bg-block"
            )}
          />
          {ok ? "online" : "degraded"}
        </span>
      </div>
      <dl className="mt-3 grid gap-1.5 text-xs">
        <Row k="Endpoint" v="/api/rpc" mono />
        <Row k="p50 latency" v={latencyMs != null ? `${latencyMs} ms` : "—"} />
        <Row k="Last block" v={block} mono />
      </dl>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className={cn("text-foreground/90", mono && "font-mono")}>{v}</dd>
    </div>
  );
}
