import type { Verdict } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldAlert, ShieldX, Loader2 } from "lucide-react";

const map = {
  SAFE: {
    label: "SAFE",
    cls: "bg-safe/12 text-safe ring-safe/30",
    Icon: CheckCircle2,
  },
  WARN: {
    label: "WARN",
    cls: "bg-warn/12 text-warn ring-warn/30",
    Icon: ShieldAlert,
  },
  BLOCK: {
    label: "BLOCK",
    cls: "bg-block/12 text-block ring-block/40",
    Icon: ShieldX,
  },
} as const;

export function VerdictBadge({
  verdict,
  loading,
  size = "sm",
  className,
}: {
  verdict?: Verdict;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (loading || !verdict) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-unknown/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-unknown ring-1 ring-unknown/30",
          size === "md" && "px-3 py-1 text-sm",
          size === "lg" && "px-4 py-1.5 text-base",
          className,
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        analyzing
      </span>
    );
  }
  const { label, cls, Icon } = map[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1",
        cls,
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          size === "md" && "h-4 w-4",
          size === "lg" && "h-5 w-5",
        )}
      />
      {label}
    </span>
  );
}
