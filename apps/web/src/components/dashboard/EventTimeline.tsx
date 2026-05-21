import type { AegisEvent } from "@/lib/types/aegis";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { basescanUrl } from "@/lib/client/mapPolicies";
import { cn } from "@/lib/utils";
import { relativeTime, shortAddress } from "@/lib/utils/format";

function memoSnippet(ai?: AegisEvent["ai"]): string | null {
  if (!ai?.summary) return null;
  const text = ai.summary.trim();
  if (text.length <= 80) return text;
  return `${text.slice(0, 77)}…`;
}

export function EventTimeline({
  events,
  selectedId,
  onSelect,
  className,
  embedded = false,
}: {
  events: AegisEvent[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
  /** When true, omit outer chrome (parent Card provides shell). */
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden",
        !embedded && "rounded-xl border border-border bg-card",
        className,
      )}
    >
      {!embedded ? (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div>
            <div className="text-sm font-semibold text-foreground">Audit timeline</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              live · polling every 3s
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aegis" />
            live
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          "divide-y divide-border",
          embedded ? "" : "max-h-[600px] overflow-y-auto",
        )}
      >
        {events.map((e) => {
          const active = e.id === selectedId;
          const snippet = memoSnippet(e.ai);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect(e.id)}
              className={cn(
                "relative block w-full border-l-2 py-3 pl-4 pr-4 text-left transition-colors hover:bg-accent/40",
                e.verdict === "SAFE" && "border-l-safe",
                e.verdict === "WARN" && "border-l-warn",
                e.verdict === "BLOCK" && "border-l-block",
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
              {snippet ? (
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {snippet}
                </p>
              ) : null}
              {e.policyHash && e.policyHash !== "0x0" ? (
                <a
                  href={basescanUrl(e.policyHash)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(ev) => ev.stopPropagation()}
                  className="mt-1 inline-block font-mono text-[10px] text-aegis hover:underline"
                >
                  policy {e.policyHash.slice(0, 10)}…
                </a>
              ) : null}
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
