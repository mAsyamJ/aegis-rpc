import type { PreflightResponse } from "@/lib/types/aegis";
import { AdapterSignalCard } from "@/components/dashboard/AdapterSignalCard";
import { AiMemoPanel } from "@/components/dashboard/AiMemoPanel";
import { RiskChecksTable } from "@/components/dashboard/RiskChecksTable";
import { cn } from "@/lib/utils";

export function DemoResultsPanel({
  response,
  className,
}: {
  response: PreflightResponse;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-12", className)}>
      <div className="space-y-4 lg:col-span-7">
        <div className="grid gap-2 sm:grid-cols-2">
          {response.adapters.map((a) => (
            <AdapterSignalCard key={a.adapter} signal={a} />
          ))}
        </div>
        <RiskChecksTable checks={response.checks} />
      </div>
      <div className="lg:col-span-5">
        <AiMemoPanel ai={response.ai} />
      </div>
    </div>
  );
}
