"use client";

import {
  Ban,
  CheckCircle2,
  LayoutDashboard,
  Timer,
  TriangleAlert,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatMs } from "@/lib/utils/format";

export function OpsRiskMetricCards({
  counts,
  isLoading,
}: {
  counts: {
    total: number;
    safe: number;
    warn: number;
    block: number;
    avgLatency: number;
  };
  isLoading: boolean;
}) {
  const items: {
    label: string;
    value: string | number;
    icon: typeof LayoutDashboard;
    description: string;
    tone?: string;
  }[] = [
    {
      label: "Total screenings",
      value: counts.total,
      icon: LayoutDashboard,
      description: "Audit log events",
    },
    {
      label: "SAFE",
      value: counts.safe,
      icon: CheckCircle2,
      description: "Policy allowed",
      tone: "text-safe",
    },
    {
      label: "WARN",
      value: counts.warn,
      icon: TriangleAlert,
      description: "Review recommended",
      tone: "text-warn",
    },
    {
      label: "BLOCK",
      value: counts.block,
      icon: Ban,
      description: "Broadcast blocked",
      tone: "text-block",
    },
    {
      label: "Avg latency",
      value: formatMs(counts.avgLatency),
      icon: Timer,
      description: "Preflight round-trip",
      tone: "text-aegis",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 *:data-[slot=card]:shadow-xs">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <item.icon className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>{item.label}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div
                className={cn(
                  "font-medium text-3xl tabular-nums leading-none tracking-tight",
                  item.tone ?? "text-foreground",
                )}
              >
                {item.value}
              </div>
            )}
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
