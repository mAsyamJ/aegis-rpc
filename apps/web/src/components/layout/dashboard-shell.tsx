"use client";

import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";

export function DashboardShell({
  children,
  defaultOpen = true,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 68)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset
          className={cn(
            "peer-data-[variant=inset]:border",
            "[--dashboard-header-height:--spacing(12)]",
          )}
        >
          <DashboardHeader />
          <div className="@container/main flex h-full flex-col gap-4 p-4 md:gap-6 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
