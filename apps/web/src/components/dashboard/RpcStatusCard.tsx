"use client";

import type { ReactNode } from "react";
import { BASESCAN_SEPOLIA, contractAddresses } from "@/lib/chain/addresses";
import { getAegisRpcUrl } from "@/lib/client/aegisRpc";
import { useRpcProbe } from "@/hooks/useRpcProbe";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/utils/format";

export function RpcStatusCard({ className }: { className?: string }) {
  const { data } = useRpcProbe();
  const ok = data?.ok ?? true;
  const latencyMs = data?.latencyMs;
  const block = data?.blockNumber ?? "—";

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
              : "bg-block/10 text-block ring-block/30",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              ok ? "bg-safe shadow-[0_0_8px_2px_var(--safe)]" : "bg-block",
            )}
          />
          {ok ? "online" : "degraded"}
        </span>
      </div>
      <dl className="mt-3 grid gap-1.5 text-xs">
        <Row k="Gateway" v={getAegisRpcUrl()} mono />
        <Row k="Chain" v="Base Sepolia (84532)" />
        <Row k="p50 latency" v={latencyMs != null ? `${latencyMs} ms` : "—"} />
        <Row k="Last block" v={block} mono />
        <Row
          k="Registry"
          v={
            <a
              href={`${BASESCAN_SEPOLIA}/${contractAddresses.AegisPolicyRegistry}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortAddress(contractAddresses.AegisPolicyRegistry)}
            </a>
          }
        />
        <Row
          k="Demo token"
          v={
            <a
              href={`${BASESCAN_SEPOLIA}/${contractAddresses.DemoERC20}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortAddress(contractAddresses.DemoERC20)}
            </a>
          }
        />
      </dl>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className={cn("text-foreground/90", mono && "font-mono")}>{v}</dd>
    </div>
  );
}
