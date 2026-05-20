import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TraceStep {
  id: string;
  label: string;
  detail?: string;
}

export function LoadingTrace({
  steps,
  activeIndex,
  className,
}: {
  steps: TraceStep[];
  activeIndex: number; // -1 = not started, steps.length = done
  className?: string;
}) {
  return (
    <ol className={cn("space-y-2", className)}>
      {steps.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li
            key={s.id}
            className={cn(
              "flex items-start gap-2.5 rounded-md border border-border px-3 py-2 transition-colors",
              done && "bg-safe/5 border-safe/20",
              active && "bg-aegis/5 border-aegis/30",
              !done && !active && "bg-surface/60 opacity-60",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                done && "bg-safe/20 text-safe",
                active && "bg-aegis/20 text-aegis",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? (
                <Check className="h-3 w-3" />
              ) : active ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="text-[9px]">{i + 1}</span>
              )}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground">{s.label}</div>
              {s.detail && (
                <div className="font-mono text-[10.5px] text-muted-foreground">
                  {s.detail}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
