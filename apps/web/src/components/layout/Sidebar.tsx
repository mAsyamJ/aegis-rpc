"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Boxes,
  Bot,
  Cpu,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: ShieldCheck },
  { group: "Demos" },
  { href: "/demo/agent", label: "Agent preflight", icon: Bot },
  { href: "/demo/wallet", label: "Wallet firewall", icon: Wallet },
  { group: "Operations" },
  { href: "/dashboard", label: "OpsRisk dashboard", icon: LayoutDashboard },
  { href: "/policies", label: "Policy console", icon: Boxes },
  { href: "/adapters", label: "Adapter health", icon: Activity },
] as const;

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-aegis/15 ring-1 ring-aegis/40">
          <Cpu className="h-4 w-4 text-aegis" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Aegis RPC</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Pre-broadcast gateway
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
        {nav.map((item, i) => {
          if ("group" in item) {
            return (
              <div
                key={i}
                className="px-3 pb-1 pt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70"
              >
                {item.group}
              </div>
            );
          }
          const active =
            item.href === "/"
              ? path === "/"
              : path === item.href || path.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-aegis")} />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-aegis shadow-[0_0_10px_2px_var(--aegis-glow)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
        <div className="flex justify-between">
          <span>Build</span>
          <span className="font-mono">v0.1.0</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Network</span>
          <span className="font-mono">base-sepolia</span>
        </div>
      </div>
    </aside>
  );
}
