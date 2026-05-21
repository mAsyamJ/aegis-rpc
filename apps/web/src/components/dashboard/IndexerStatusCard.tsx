"use client";

import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";

type IndexerResponse = {
  chainId: number;
  contractCount: number;
  syncedAt: string;
  strictDualSource?: boolean;
};

export function IndexerStatusCard({ className }: { className?: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["indexer-status"],
    queryFn: async () => {
      const r = await fetch("/api/indexer");
      if (!r.ok) throw new Error("indexer status failed");
      return r.json() as Promise<IndexerResponse>;
    },
    staleTime: 60_000,
  });

  return (
    <div className={cn("rounded-xl border border-border bg-surface p-4", className)}>
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-aegis/10 text-aegis ring-1 ring-aegis/30">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">ABI indexer</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            forge + blockscout strict
          </div>
        </div>
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex justify-between rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5">
          <dt className="text-muted-foreground">Contracts</dt>
          <dd className="font-mono">
            {isLoading ? "…" : isError ? "—" : data?.contractCount ?? 0}
          </dd>
        </div>
        <div className="flex justify-between rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5">
          <dt className="text-muted-foreground">Synced</dt>
          <dd className="font-mono text-[10px]">
            {isLoading ? "…" : isError ? "offline" : data?.syncedAt?.slice(0, 19) ?? "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
