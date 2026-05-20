import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PreflightComposer({
  onRun,
  onReset,
  running,
  activeScenarioTitle,
  className,
}: {
  onRun: () => void;
  onReset: () => void;
  running?: boolean;
  activeScenarioTitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface p-4",
        className,
      )}
    >
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Preflight composer
        </div>
        <div className="mt-1 text-sm text-foreground">
          {activeScenarioTitle ?? "Select a scenario"}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Builds the unsigned transaction, posts it to
          <span className="mx-1 font-mono text-foreground/80">/api/preflight</span>,
          and renders the verdict, adapter signals, and AI memo before any broadcast.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onRun}
          disabled={running}
          className="flex-1 bg-aegis text-aegis-foreground hover:bg-aegis/90"
        >
          <Play className="mr-1.5 h-4 w-4" />
          {running ? "Running preflight…" : "Run preflight"}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={running}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
