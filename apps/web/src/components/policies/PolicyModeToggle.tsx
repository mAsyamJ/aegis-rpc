"use client";

import { useState } from "react";
import type { PolicyMode } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";
import { setPolicyMode as setPolicyModeApi } from "@/lib/client/aegisApi";
import { useAppStatus } from "@/components/layout/AppStatusProvider";

const MODES: PolicyMode[] = ["enforce", "warn", "observe"];

export function PolicyModeToggle({
  policyId,
  mode,
  onChange,
  className,
}: {
  policyId: string;
  mode: PolicyMode;
  onChange?: (mode: PolicyMode) => void;
  className?: string;
}) {
  const { setPolicyMode: setGlobalMode, setActivePolicyId } = useAppStatus();
  const [busy, setBusy] = useState(false);

  async function pick(next: PolicyMode) {
    if (next === mode || busy) return;
    setBusy(true);
    try {
      await setPolicyModeApi(policyId, next);
      setGlobalMode(next);
      setActivePolicyId(policyId);
      onChange?.(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("rounded-xl border border-border bg-surface p-3", className)}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Policy mode
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            disabled={busy}
            onClick={() => pick(m)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              mode === m
                ? "border-aegis/50 bg-aegis/15 text-aegis"
                : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        enforce = block; warn = review + override; observe = log only
      </p>
    </div>
  );
}
