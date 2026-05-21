import Link from "next/link";
import { Lock, ShieldX, Sparkles, type LucideIcon } from "lucide-react";

import { VerdictBadge } from "@/components/status/VerdictBadge";
import { landingCopy } from "@/content/landing-copy";
import { cn } from "@/lib/utils";

import { SpotlightCard } from "./SpotlightCard";

const iconByVerdict: Record<"SAFE" | "WARN" | "BLOCK", LucideIcon> = {
  BLOCK: ShieldX,
  WARN: Sparkles,
  SAFE: ShieldX,
};

type ProofCard = (typeof landingCopy.whatStops.cards)[number];

function hasMemoSnippet(
  card: ProofCard,
): card is ProofCard & { memoSnippet: string } {
  return "memoSnippet" in card && typeof card.memoSnippet === "string";
}

export function WhatAegisStops() {
  const c = landingCopy.whatStops;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-metallic mb-10 text-center text-2xl font-medium tracking-tighter md:text-3xl">
          {c.title}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {c.cards.map((card) => {
            const Icon = iconByVerdict[card.verdict];
            const isWarn = card.verdict === "WARN";

            return (
              <Link key={card.title} href={card.href} className="group block h-full">
                <SpotlightCard className="flex h-full min-h-[220px] flex-col rounded-3xl border-border/80 transition-colors hover:border-border">
                  <div className="relative z-10 flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white/5 text-muted-foreground transition-colors group-hover:bg-aegis/10 group-hover:text-aegis">
                        <Icon className="h-5 w-5" />
                      </div>
                      <VerdictBadge verdict={card.verdict} />
                    </div>
                    <h3 className="mt-4 text-base font-medium">{card.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed font-light text-muted-foreground">
                      {card.body}
                    </p>

                    {isWarn && hasMemoSnippet(card) ? (
                      <div className="mt-auto pt-4">
                        <div className="rounded-lg border border-border/80 bg-background/80 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground shadow-inner">
                          {card.memoSnippet}
                        </div>
                      </div>
                    ) : (
                      <div className="relative mt-auto overflow-hidden rounded-lg border border-border/80 bg-white/[0.02] pt-4">
                        <div
                          className={cn(
                            "absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,color-mix(in_oklab,var(--aegis)_6%,transparent)_50%,transparent_75%)] bg-[length:250%_250%] animate-landing-shimmer motion-reduce:animate-none",
                          )}
                        />
                        <div className="relative flex items-center justify-center gap-2 py-3">
                          <Lock className="h-4 w-4 text-aegis" />
                          <span className="text-xs font-mono text-aegis">Screened pre-broadcast</span>
                        </div>
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
