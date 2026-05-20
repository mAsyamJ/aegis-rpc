import type { AdapterSignal } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";
import { formatMs } from "@/lib/utils/format";

const tone = {
  OK: "border-safe/30 bg-safe/5 text-safe",
  WARN: "border-warn/30 bg-warn/5 text-warn",
  BLOCK: "border-block/40 bg-block/5 text-block",
  ERROR: "border-block/40 bg-block/5 text-block",
} as const;

export function AdapterSignalCard({
  signal,
  className,
}: {
  signal: AdapterSignal;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-3",
        tone[signal.status].split(" ").slice(0, 2).join(" "),
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-foreground">
            {signal.adapter}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            {signal.label}
          </div>
        </div>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[10px] ring-1",
            tone[signal.status],
          )}
        >
          {signal.status}
        </span>
      </div>
      {signal.detail && (
        <div className="mt-2 rounded-md border border-border/50 bg-background/40 px-2 py-1.5 font-mono text-[11px] text-foreground/80">
          {signal.detail}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-mono">
          {signal.source ? `${signal.source.slice(0, 10)}…` : "—"}
        </span>
        <span>{formatMs(signal.latencyMs)}</span>
      </div>
    </div>
  );
}
