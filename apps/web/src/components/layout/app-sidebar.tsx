"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { aegisSidebarItems } from "@/navigation/aegis-sidebar-items";
import { useRpcProbe } from "@/hooks/useRpcProbe";
import { cn } from "@/lib/utils";

import { NavMain } from "./nav-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useRpcProbe();
  const ok = data?.ok ?? true;

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Aegis RPC">
              <Link prefetch={false} href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Aegis RPC</span>
                  <span className="truncate text-xs text-muted-foreground">
                    OpsRisk · Base Sepolia
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={aegisSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ok ? "bg-safe" : "bg-block",
              )}
            />
            <span className="font-medium text-sidebar-foreground">
              {ok ? "RPC healthy" : "RPC degraded"}
            </span>
          </div>
          {data?.latencyMs != null ? (
            <p className="mt-1 font-mono text-[10px]">{data.latencyMs} ms probe</p>
          ) : null}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
