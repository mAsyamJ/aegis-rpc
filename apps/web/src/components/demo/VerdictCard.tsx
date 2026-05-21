import type { MemoStatus, PreflightResponse } from "@/lib/types/aegis";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ShieldX, ShieldAlert, RotateCcw } from "lucide-react";
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
  memoStatus,
  onSafeSend,
  onWarnOverride,
  onReset,
  className,
}: {
  response?: PreflightResponse;
  loading?: boolean;
  memoStatus?: MemoStatus;
  onSafeSend?: () => void;
  onWarnOverride?: () => void;
  onReset?: () => void;
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

  const failedChecks =
    response?.checks.filter((c) => c.status === "BLOCK" || c.status === "WARN") ?? [];

  return (
    <Card className={cn(tone, className)}>
      <CardContent className="pt-6">
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

      {failedChecks.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {failedChecks.map((c) => (
            <li
              key={c.id}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-[11px]",
                c.status === "BLOCK"
                  ? "border-block/30 bg-block/10 text-foreground"
                  : "border-warn/30 bg-warn/10 text-foreground",
              )}
            >
              <span className="font-medium">{c.name}</span>
              {c.detail ? (
                <span className="text-muted-foreground"> — {c.detail}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {memoStatus === "generating" && response && (
        <p className="mt-2 animate-pulse text-xs text-muted-foreground">
          AI memo generating…
        </p>
      )}

      {response?.ai?.summary && memoStatus === "ready" && (
        <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
          {response.ai.summary}
        </p>
      )}

      {response && (
        <div className="mt-3 grid gap-2 text-xs">
          <KV k="reasonCode" v={response.reasonCode} mono />
          <KV k="requestId" v={response.requestId} mono />
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
            <Button
              size="sm"
              variant="outline"
              onClick={onWarnOverride}
              className="border-warn/40 text-warn hover:bg-warn/10"
            >
              Override with reason
            </Button>
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
          {onReset ? (
            <Button size="sm" variant="ghost" onClick={onReset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          ) : null}
        </div>
      )}

      <p className="mt-3 text-[10px] text-muted-foreground">
        AI assists only — deterministic policy decides the verdict.
      </p>
      </CardContent>
    </Card>
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
