"use client";

import { forwardRef } from "react";
import { LayoutDashboard, Play, Wallet } from "lucide-react";

import { useAuditEvents } from "@/hooks/useAuditEvents";
import { cn } from "@/lib/utils";

export const HeroDashboardMockup = forwardRef<
  HTMLDivElement,
  { className?: string }
>(function HeroDashboardMockup({ className }, ref) {
  const { data: events = [] } = useAuditEvents();
  const safe = events.filter((e) => e.verdict === "SAFE").length;
  const warn = events.filter((e) => e.verdict === "WARN").length;
  const block = events.filter((e) => e.verdict === "BLOCK").length;
  const total = events.length || 12;

  const bars = [
    { h: "30%", tone: "bg-muted hover:bg-aegis" },
    { h: "45%", tone: "bg-muted hover:bg-aegis" },
    { h: "60%", tone: "bg-block/80 hover:bg-block" },
    { h: "50%", tone: "bg-muted hover:bg-aegis" },
    { h: "75%", tone: "bg-aegis hover:bg-aegis/90", highlight: true, label: `BLOCK ${block || 3}` },
    { h: "65%", tone: "bg-warn/80 hover:bg-warn" },
    { h: "80%", tone: "bg-safe/80 hover:bg-safe" },
    { h: "70%", tone: "bg-muted hover:bg-aegis" },
  ];

  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl transition-transform duration-100 ease-out motion-reduce:transition-none",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="flex h-10 items-center justify-between border-b border-border/80 bg-card px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full border border-border/80 bg-muted" />
          <div className="h-3 w-3 rounded-full border border-border/80 bg-muted" />
          <div className="h-3 w-3 rounded-full border border-border/80 bg-muted" />
        </div>
        <div className="mx-auto hidden h-5 w-64 rounded-md border border-border/80 bg-muted/50 md:block" />
      </div>

      <div className="flex min-h-[240px] flex-1 md:min-h-0">
        <aside className="hidden w-52 flex-col gap-1 border-r border-border/80 bg-surface/80 p-4 md:flex">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-aegis/20 bg-aegis/10 px-3 py-2 text-xs text-aegis">
            <LayoutDashboard className="h-4 w-4" />
            OpsRisk home
          </div>
          <NavItem icon={Play} label="Agent demo" />
          <NavItem icon={Wallet} label="Wallet firewall" />
        </aside>

        <div className="relative flex-1 bg-background p-6 md:p-8">
          <div className="landing-grid-bg absolute inset-0 opacity-30" />
          <div className="relative z-10">
            <div className="pop-out mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="mb-1 text-xs font-medium text-muted-foreground">
                  Screenings · live audit
                </h2>
                <div className="flex items-center gap-2 text-3xl font-semibold tracking-tight tabular-nums">
                  {total}
                  <span className="rounded-full border border-aegis/30 bg-aegis/10 px-2 py-0.5 text-xs font-normal text-aegis">
                    OpsRisk
                  </span>
                </div>
              </div>
              <div className="flex gap-2 text-[10px] font-mono uppercase tracking-wider">
                <span className="text-safe">SAFE {safe}</span>
                <span className="text-warn">WARN {warn}</span>
                <span className="text-block">BLOCK {block}</span>
              </div>
            </div>

            <div className="pop-out relative mb-6 flex h-48 items-end justify-between gap-1 overflow-hidden rounded-xl border border-border/80 bg-gradient-to-b from-card/50 to-transparent px-4 pt-8">
              <div className="pointer-events-none absolute inset-0 border-t border-border/40 top-1/4" />
              <div className="pointer-events-none absolute inset-0 border-t border-border/40 top-2/4" />
              <div className="pointer-events-none absolute inset-0 border-t border-border/40 top-3/4" />
              {bars.map((b, i) => (
                <div
                  key={i}
                  className={cn(
                    "group/bar relative w-full origin-bottom rounded-t-sm transition-all duration-300 hover:scale-y-105 motion-reduce:transform-none",
                    b.tone,
                  )}
                  style={{ height: b.h }}
                >
                  {b.highlight ? (
                    <>
                      <div className="absolute inset-0 rounded-t-sm bg-aegis/30 opacity-30 blur-lg" />
                      <div className="absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-border/80 bg-card px-2 py-0.5 text-[10px] text-foreground opacity-0 shadow-xl transition-opacity group-hover/bar:opacity-100">
                        {b.label}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="pop-out grid grid-cols-3 gap-3">
              <Stat label="SAFE" value={String(safe)} dot="bg-safe" />
              <Stat label="WARN" value={String(warn)} dot="bg-warn" />
              <Stat label="BLOCK" value={String(block)} dot="bg-block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function NavItem({
  icon: Icon,
  label,
}: {
  icon: typeof Play;
  label: string;
}) {
  return (
    <div className="flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function Stat({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/50 p-3 transition-colors hover:bg-card/80">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full transition-shadow", dot)} />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-lg font-medium tabular-nums">{value}</div>
    </div>
  );
}
