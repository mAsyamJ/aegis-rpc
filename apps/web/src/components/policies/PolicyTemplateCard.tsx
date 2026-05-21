import type { AegisPolicy } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";
import { PolicyModeBadge } from "@/components/status/PolicyModeBadge";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Bot, Wallet, Boxes, Building2, Cpu } from "lucide-react";
import { relativeTime } from "@/lib/utils/format";

const audienceMap = {
  wallet: { Icon: Wallet, label: "Wallet" },
  agent: { Icon: Bot, label: "Agent" },
  defi: { Icon: Boxes, label: "DeFi" },
  rwa: { Icon: Building2, label: "RWA" },
  backend: { Icon: Cpu, label: "Backend" },
} as const;

export function PolicyTemplateCard({
  policy,
  className,
}: {
  policy: AegisPolicy;
  className?: string;
}) {
  const { Icon, label } = audienceMap[policy.audience];
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-aegis/10 text-aegis ring-1 ring-aegis/30">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {label} policy
            </div>
            <div className="text-sm font-semibold text-foreground">
              {policy.name}
            </div>
          </div>
        </div>
        <PolicyModeBadge mode={policy.mode} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {policy.description}
      </p>

      <div className="mt-3 grid gap-1.5 text-[11px]">
        {policy.limits.map((l) => (
          <div
            key={l.name}
            className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-2 py-1"
          >
            <span className="text-muted-foreground">{l.name}</span>
            <span className="font-mono text-foreground/90">{l.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-2.5 text-[10px]">
        {policy.onChainVerified === true ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-safe/10 px-1.5 py-0.5 text-safe ring-1 ring-safe/30">
            <CheckCircle2 className="h-3 w-3" />
            On-chain verified
          </span>
        ) : policy.onChainHash ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-warn/10 px-1.5 py-0.5 text-warn ring-1 ring-warn/30">
            <AlertTriangle className="h-3 w-3" />
            Registry drift
          </span>
        ) : (
          <span className="text-muted-foreground">Registry: not read</span>
        )}
        <span className="font-mono text-muted-foreground">{policy.policyHash}</span>
        <span className="ml-auto text-muted-foreground">
          updated {relativeTime(policy.updatedAt)}
        </span>
      </div>
    </div>
  );
}
