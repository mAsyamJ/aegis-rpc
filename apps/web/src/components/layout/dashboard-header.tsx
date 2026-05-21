"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Copy } from "lucide-react";

import { ChainStatusBadge } from "@/components/status/ChainStatusBadge";
import { PolicyModeBadge } from "@/components/status/PolicyModeBadge";
import { WalletAccountChip } from "@/components/web3/WalletAccountChip";
import { useAppStatus } from "@/components/layout/AppStatusProvider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRpcProbe } from "@/hooks/useRpcProbe";
import { BASESCAN_SEPOLIA } from "@/lib/chain/addresses";
import { cn } from "@/lib/utils";
import { copyToClipboard, shortAddress } from "@/lib/utils/format";

const ROUTE_CRUMBS: Record<string, { section: string; page: string }> = {
  "/dashboard": { section: "Operations", page: "OpsRisk dashboard" },
  "/demo/live": { section: "Demo", page: "Live 3-tx" },
  "/demo/agent": { section: "Demo", page: "Agent preflight" },
  "/demo/wallet": { section: "Demo", page: "Wallet firewall" },
  "/policies": { section: "Configuration", page: "Policy console" },
  "/adapters": { section: "Configuration", page: "Adapter health" },
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const match = ROUTE_CRUMBS[pathname];
  if (match) return match;
  return { section: "Aegis", page: "App" };
}

export function DashboardHeader() {
  const { data } = useRpcProbe();
  const { policyMode, registryAddress } = useAppStatus();
  const crumbs = useBreadcrumbs();
  const ok = data?.ok ?? true;
  const latency = data?.latencyMs;

  return (
    <header className="flex h-(--dashboard-header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">{crumbs.section}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{crumbs.page}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <ChainStatusBadge
            chain={data?.chainLabel ?? "Base Sepolia"}
            online={ok}
            className="hidden sm:inline-flex"
          />
          <span className="hidden items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs sm:inline-flex">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ok ? "bg-safe" : "bg-block",
              )}
            />
            {ok
              ? latency != null
                ? `${latency} ms`
                : "healthy"
              : "degraded"}
          </span>
          <PolicyModeBadge mode={policyMode} className="hidden md:inline-flex" />
          <a
            href={`${BASESCAN_SEPOLIA}/${registryAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              void copyToClipboard(registryAddress);
            }}
            className="group hidden items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground lg:inline-flex"
            title="Copy AegisPolicyRegistry address"
          >
            {shortAddress(registryAddress)}
            <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </a>
          <WalletAccountChip size="sm" connectLabel="Connect" />
        </div>
      </div>
    </header>
  );
}
