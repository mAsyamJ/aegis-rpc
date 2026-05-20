import type { DemoScenario, Verdict } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";
import { VerdictBadge } from "@/components/status/VerdictBadge";

export function DemoScenarioSelector({
  scenarios,
  activeId,
  onSelect,
  className,
}: {
  scenarios: DemoScenario[];
  activeId?: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      {scenarios.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              "group flex flex-col gap-1 rounded-lg border border-border bg-surface/60 p-3 text-left transition-all hover:border-aegis/40 hover:bg-surface",
              active && "border-aegis/60 bg-aegis/5 aegis-glow",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {s.title}
              </span>
              <VerdictBadge verdict={s.expectedVerdict as Verdict} />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {s.summary}
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground/80">
              <span>{s.expectedReasonCode}</span>
              <span>{s.policyMode}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
