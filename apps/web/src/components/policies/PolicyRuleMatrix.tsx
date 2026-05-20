import type { AegisPolicy } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";
import { VerdictBadge } from "@/components/status/VerdictBadge";

export function PolicyRuleMatrix({
  policy,
  className,
}: {
  policy: AegisPolicy;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>
      <div className="border-b border-border px-4 py-2.5 text-sm font-semibold">
        Rules — {policy.name}
      </div>
      <div className="divide-y divide-border">
        {policy.rules.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
          >
            <div className="min-w-0">
              <div className="truncate text-foreground">{r.description}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {r.id}
              </div>
            </div>
            <VerdictBadge verdict={r.severity} />
          </div>
        ))}
      </div>
    </div>
  );
}
