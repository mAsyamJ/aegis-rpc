import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/shared/SurfaceCard";

export function GettingStartedBanner({
  step,
  total = 4,
  compact,
}: {
  step?: number;
  total?: number;
  compact?: boolean;
}) {
  return (
    <SurfaceCard
      className={
        compact
          ? "border-aegis/25 bg-aegis/5 p-3"
          : "border-aegis/30 bg-aegis/5 p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-aegis/15 text-aegis ring-1 ring-aegis/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {step != null ? `Judge demo · step ${step} of ${total}` : "New here?"}
            </div>
            <p
              className={
                compact
                  ? "mt-0.5 text-sm text-foreground"
                  : "mt-1 max-w-xl text-sm text-foreground"
              }
            >
              Follow the guided agent preflight: BLOCK → policy WARN → AI assist →
              safe-send. Takes about 60 seconds.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="bg-aegis text-aegis-foreground hover:bg-aegis/90">
          <Link href={step != null ? `/demo/agent?step=${step}` : "/demo/agent"}>
            {step != null ? "Continue demo" : "Start agent demo"}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </SurfaceCard>
  );
}
