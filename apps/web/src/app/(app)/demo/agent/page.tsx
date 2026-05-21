"use client";

import { Suspense } from "react";

import { GuidedAgentDemo } from "@/components/demo/GuidedAgentDemo";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgentDemoPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AdminPageHeader
        section="Demo · agent (LEAD)"
        title="Agent execution preflight"
        description="Four-step judge walkthrough: BLOCK → WARN policy → AI assist → safe-send override."
      />
      <Suspense
        fallback={<Skeleton className="h-64 w-full rounded-xl" />}
      >
        <GuidedAgentDemo />
      </Suspense>
    </div>
  );
}
