import type { PolicyMode } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";

const map: Record<PolicyMode, { label: string; cls: string }> = {
  observe: { label: "observe", cls: "text-muted-foreground ring-border bg-surface" },
  warn: { label: "warn", cls: "text-warn ring-warn/30 bg-warn/10" },
  enforce: { label: "enforce", cls: "text-aegis ring-aegis/30 bg-aegis/10" },
};

export function PolicyModeBadge({
  mode,
  className,
}: {
  mode: PolicyMode;
  className?: string;
}) {
  const { label, cls } = map[mode];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1",
        cls,
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        policy
      </span>
      <span className="font-mono">{label}</span>
    </span>
  );
}
