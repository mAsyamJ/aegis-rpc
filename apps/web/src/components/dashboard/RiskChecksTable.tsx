import type { RiskCheck } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";

const tone = {
  OK: "text-safe",
  WARN: "text-warn",
  BLOCK: "text-block",
  ERROR: "text-block",
} as const;

export function RiskChecksTable({
  checks,
  className,
}: {
  checks: RiskCheck[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <table className="w-full text-xs">
        <thead className="bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Check</th>
            <th className="px-3 py-2 text-left font-medium">Status</th>
            <th className="px-3 py-2 text-left font-medium">Reason</th>
            <th className="px-3 py-2 text-left font-medium">Detail</th>
          </tr>
        </thead>
        <tbody className="bg-surface/40">
          {checks.map((c) => (
            <tr key={c.id} className="border-t border-border/60">
              <td className="px-3 py-2 font-medium text-foreground">{c.name}</td>
              <td className={cn("px-3 py-2 font-mono", tone[c.status])}>
                {c.status}
              </td>
              <td className="px-3 py-2 font-mono text-foreground/80">
                {c.reasonCode ?? "—"}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {c.detail ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
