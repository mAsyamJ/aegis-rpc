"use client";

import { LiveUseCasesDemo } from "@/components/demo/LiveUseCasesDemo";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";

export default function LiveDemoPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AdminPageHeader
        section="Demo · live"
        title="Live use cases — 3 transactions"
        description="Real preflight against deployed Base Sepolia contracts: SAFE DeFi check, WARN high allowance, BLOCK unlimited approve."
      />
      <LiveUseCasesDemo />
    </div>
  );
}
