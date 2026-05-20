import { cn } from "@/lib/utils";

export function ChainStatusBadge({
  chain,
  online,
  className,
}: {
  chain: string;
  online?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 text-xs",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          online
            ? "bg-aegis shadow-[0_0_8px_2px_var(--aegis-glow)]"
            : "bg-muted-foreground",
        )}
      />
      <span className="font-mono">{chain}</span>
    </span>
  );
}
