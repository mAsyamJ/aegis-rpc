import { Sparkles } from "lucide-react";
import type { AiAnalysis } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";

export function PreSigningAssistPanel({
  ai,
  className,
}: {
  ai?: AiAnalysis;
  className?: string;
}) {
  const assist = ai?.preSigningAssist;

  return (
    <div
      className={cn(
        "rounded-xl border border-warn/30 bg-warn/5 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-warn" />
        <div className="text-sm font-semibold text-warn">
          Pre-signing assist
        </div>
        <span className="ml-auto rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border">
          AI assists only · policy already decided
        </span>
      </div>
      {assist ? (
        <>
          <p className="mt-3 text-sm font-medium text-foreground">{assist.headline}</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {assist.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-warn">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </>
      ) : ai ? (
        <>
          <p className="mt-3 text-xs leading-relaxed text-foreground/90">
            {ai.summary}
          </p>
          {ai.suggestion && (
            <div className="mt-3 rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                suggestion
              </span>
              <div className="mt-0.5 text-foreground">{ai.suggestion}</div>
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Generating assist…</p>
      )}
    </div>
  );
}
