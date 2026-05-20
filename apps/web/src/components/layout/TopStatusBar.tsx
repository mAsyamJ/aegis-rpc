import { Copy } from "lucide-react";
import { ChainStatusBadge } from "@/components/status/ChainStatusBadge";
import { PolicyModeBadge } from "@/components/status/PolicyModeBadge";
import { copyToClipboard, shortAddress } from "@/lib/utils/format";

const REGISTRY_ADDR = "0xA1Eg15Re91577Yc0Ntrac7Aa0E1A1A1A1A1A1A1A";

export function TopStatusBar() {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ChainStatusBadge chain="Base Sepolia" online />
      <Separator />
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">RPC</span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-safe shadow-[0_0_8px_2px_var(--safe)]" />
          healthy · 84 ms
        </span>
      </div>
      <Separator />
      <PolicyModeBadge mode="enforce" />
      <Separator />
      <button
        onClick={() => copyToClipboard(REGISTRY_ADDR)}
        className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-mono text-muted-foreground hover:text-foreground"
        title="Copy AegisPolicyRegistry"
      >
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
          registry
        </span>
        <span>{shortAddress(REGISTRY_ADDR)}</span>
        <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
      </button>

      <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="hidden sm:inline">Operator</span>
        <span className="font-mono">ops@aegis.dev</span>
      </div>
    </header>
  );
}

function Separator() {
  return <span className="h-4 w-px bg-border" />;
}
