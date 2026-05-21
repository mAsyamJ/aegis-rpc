import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "safe" | "warn" | "block";
}) {
  const toneCls =
    tone === "safe"
      ? "text-safe"
      : tone === "warn"
        ? "text-warn"
        : tone === "block"
          ? "text-block"
          : "text-foreground";

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("font-mono text-2xl font-semibold tabular-nums", toneCls)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
