import type { PreflightResponse } from "@/lib/types/aegis";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { formatMs } from "@/lib/utils/format";

const copy = {
  SAFE: "Policy checks passed. Transaction is eligible for broadcast.",
  WARN: "Policy raised a warning. Review AI assist and adapter signals before override.",
  BLOCK: "Aegis blocked this transaction before broadcast.",
};

const Icon = { SAFE: ShieldCheck, WARN: ShieldAlert, BLOCK: ShieldX };

export function VerdictCard({
  response,
  loading,
  onSafeSend,
  onWarnOverride,
  className,
}: {
  response?: PreflightResponse;
  loading?: boolean;
  onSafeSend?: () => void;
  onWarnOverride?: () => void;
  className?: string;
}) {
  const verdict = response?.verdict;
  const I = verdict ? Icon[verdict] : ShieldCheck;

  const tone =
    verdict === "SAFE"
      ? "border-safe/30 bg-safe/5"
      : verdict === "WARN"
        ? "border-warn/30 bg-warn/5"
        : verdict === "BLOCK"
          ? "border-block/40 bg-block/5"
          : "border-border bg-surface";

  return (
    <div className={cn("rounded-xl border p-4", tone, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-lg",
              verdict === "SAFE" && "bg-safe/15 text-safe",
              verdict === "WARN" && "bg-warn/15 text-warn",
              verdict === "BLOCK" && "bg-block/15 text-block",
              !verdict && "bg-unknown/15 text-unknown",
            )}
          >
            <I className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Verdict
            </div>
            <VerdictBadge verdict={verdict} loading={loading} size="lg" />
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <div>latency</div>
          <div className="font-mono text-foreground">
            {formatMs(response?.latencyMs)}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground/90">
        {verdict ? copy[verdict] : "Awaiting preflight…"}
      </p>

      {response && (
        <div className="mt-3 grid gap-2 text-xs">
          <KV k="reasonCode" v={response.reasonCode} mono />
          <KV k="policyHash" v={response.policyHash} mono />
          <KV k="requestId" v={response.requestId} mono />
          <KV
            k="broadcasted"
            v={
              <span
                className={cn(
                  "font-mono",
                  response.broadcasted ? "text-safe" : "text-muted-foreground",
                )}
              >
                {String(response.broadcasted)}
              </span>
            }
          />
        </div>
      )}

      {response && (
        <div className="mt-4 flex flex-wrap gap-2">
          {verdict === "SAFE" && (
            <Button
              size="sm"
              onClick={onSafeSend}
              className="bg-safe text-safe-foreground hover:bg-safe/90"
            >
              Safe send
            </Button>
          )}
          {verdict === "WARN" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onWarnOverride}
                className="border-warn/40 text-warn hover:bg-warn/10"
              >
                Override with reason
              </Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </>
          )}
          {verdict === "BLOCK" && (
            <Button
              size="sm"
              disabled
              className="bg-block/20 text-block opacity-90 cursor-not-allowed"
            >
              Broadcast disabled — blocked
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function KV({
  k,
  v,
  mono,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-border/60 bg-background/40 px-2.5 py-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {k}
      </span>
      <span className={cn("truncate text-foreground/90", mono && "font-mono")}>
        {v}
      </span>
    </div>
  );
}
