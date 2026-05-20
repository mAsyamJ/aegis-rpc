import type { AegisEvent } from "@/lib/types/aegis";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { cn } from "@/lib/utils";
import { relativeTime, shortAddress } from "@/lib/utils/format";

export function EventTimeline({
  events,
  selectedId,
  onSelect,
  className,
}: {
  events: AegisEvent[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Audit timeline
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            live · polling every 3s
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aegis" />
          live
        </div>
      </div>
      <div className="max-h-[600px] divide-y divide-border overflow-y-auto">
        {events.map((e) => {
          const active = e.id === selectedId;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              className={cn(
                "block w-full px-4 py-3 text-left transition-colors hover:bg-accent/40",
                active && "bg-aegis/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <VerdictBadge verdict={e.verdict} />
                <span className="text-[10px] text-muted-foreground">
                  {relativeTime(e.createdAt)}
                </span>
              </div>
              <div className="mt-1.5 text-xs font-medium text-foreground">
                {e.scenario}
              </div>
              <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                {e.reasonCode} · {shortAddress(e.intent.from)} →{" "}
                {shortAddress(e.intent.to)}
              </div>
            </button>
          );
        })}
        {events.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No events yet. Run a demo to populate.
          </div>
        )}
      </div>
    </div>
  );
}
