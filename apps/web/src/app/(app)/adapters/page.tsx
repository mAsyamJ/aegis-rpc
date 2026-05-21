"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import { AdapterSignalCard } from "@/components/dashboard/AdapterSignalCard";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { ContractAddressCard } from "@/components/shared/ContractAddressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdaptersChainlink } from "@/lib/client/aegisApi";
import { BASESCAN_SEPOLIA } from "@/lib/chain/addresses";
import type { AdapterSignal } from "@/lib/types/aegis";

const STATIC_ADAPTERS: AdapterSignal[] = [
  {
    adapter: "ApprovalRiskAdapter",
    status: "OK",
    label: "Detects unlimited approvals",
    detail: "MaxUint256 pattern",
    latencyMs: 4,
  },
  {
    adapter: "AgentPolicyAdapter",
    status: "OK",
    label: "Agent caps + selector allowlist",
    detail: "default-agent-policy",
    latencyMs: 2,
  },
  {
    adapter: "ContractCodeAdapter",
    status: "OK",
    label: "eth_getCode verification",
    detail: "Base Sepolia RPC",
    latencyMs: 38,
  },
  {
    adapter: "SimulationAdapter",
    status: "OK",
    label: "eth_call preflight simulation",
    detail: "skips ERC20 transfer intents",
    latencyMs: 120,
  },
  {
    adapter: "AllowlistAdapter",
    status: "OK",
    label: "Denylist + allowlist checks",
    latencyMs: 6,
  },
];

export default function AdaptersPage() {
  const [chainlink, setChainlink] = useState<AdapterSignal | null>(null);

  useEffect(() => {
    getAdaptersChainlink()
      .then((s) => setChainlink(s as AdapterSignal))
      .catch(() => setChainlink(null));
  }, []);

  const adapters = chainlink ? [chainlink, ...STATIC_ADAPTERS] : STATIC_ADAPTERS;
  const warnCount = adapters.filter(
    (a) => a.status === "WARN" || a.status === "BLOCK",
  ).length;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AdminPageHeader
        section="Operations"
        title="Adapter health"
        description="Chainlink is one adapter, not the product. Signals compose into one verdict."
        actions={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-aegis" />
            <span className="font-mono">
              {adapters.length} adapters · {warnCount} warn
            </span>
          </span>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {adapters.map((a) => (
          <AdapterSignalCard key={a.adapter} signal={a} className="h-full" />
        ))}
      </div>

      {chainlink ? (
        <Card>
          <CardHeader>
            <CardTitle>Chainlink ETH/USD feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Stat k="price" v={`$${Number(chainlink.data?.price ?? 0).toFixed(2)}`} />
              <Stat k="status" v={chainlink.status} />
              <Stat k="detail" v={chainlink.detail ?? "—"} />
              <Stat k="latency" v={`${chainlink.latencyMs ?? 0} ms`} />
            </div>
            {chainlink.source ? (
              <div className="mt-4">
                <ContractAddressCard
                  label="Feed address"
                  address={chainlink.source}
                  full
                  href={`${BASESCAN_SEPOLIA}/${chainlink.source}`}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {k}
      </div>
      <div className="mt-0.5 font-mono text-sm">{v}</div>
    </div>
  );
}
