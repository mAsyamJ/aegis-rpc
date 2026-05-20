import { Sparkles } from "lucide-react";
import type { AiAnalysis } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";

export function AiMemoPanel({
  ai,
  className,
}: {
  ai?: AiAnalysis;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-unknown/30 bg-unknown/5 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-unknown/15 text-unknown">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            AI memo
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            explains the verdict · does not decide
          </div>
        </div>
        {ai?.model && (
          <span className="ml-auto rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border">
            {ai.model}
          </span>
        )}
      </div>
      {ai ? (
        <>
          <p className="mt-3 text-xs leading-relaxed text-foreground/90">
            {ai.summary}
          </p>
          {ai.risks.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {ai.risks.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-border/60 bg-background/40 px-2 py-1.5 text-[11.5px] text-foreground/85"
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-unknown" />
                  {r}
                </li>
              ))}
            </ul>
          )}
          {ai.suggestion && (
            <div className="mt-3 rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                AI suggestion
              </span>
              <div className="mt-0.5 text-foreground">{ai.suggestion}</div>
            </div>
          )}
          <div className="mt-3 text-[10px] text-muted-foreground">
            AI explains the verdict. The deterministic policy engine already decided.
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          No AI memo for this event.
        </p>
      )}
    </div>
  );
}
