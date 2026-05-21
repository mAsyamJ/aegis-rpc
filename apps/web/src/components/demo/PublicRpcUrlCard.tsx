"use client";

import { useState } from "react";
import { Activity, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/chain/addresses";
import { getAegisRpcUrl } from "@/lib/client/aegisRpc";
import { cn } from "@/lib/utils";

export function PublicRpcUrlCard({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const rpcUrl = getAegisRpcUrl();

  async function copyRpcUrl() {
    try {
      await navigator.clipboard.writeText(rpcUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-aegis/30 bg-aegis/5 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-aegis/15 text-aegis">
          <Activity className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">Public Aegis RPC</div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Base Sepolia (chainId {BASE_SEPOLIA_CHAIN_ID}). Add as custom network RPC in MetaMask
            or point your backend here. Screening:{" "}
            <span className="font-mono text-foreground/80">POST /api/preflight</span> or JSON-RPC{" "}
            <span className="font-mono text-foreground/80">aegis_preflight</span>.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[10px]">
              {rpcUrl}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={() => void copyRpcUrl()}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy RPC URL"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
