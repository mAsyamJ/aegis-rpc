import { ArrowRight, Binary, Scale, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { landingCopy } from "@/content/landing-copy";

import { SpotlightCard } from "./SpotlightCard";

const iconByStep: Record<string, LucideIcon> = {
  decode: Binary,
  check: ShieldCheck,
  decide: Scale,
};

export function ProductFlow() {
  const c = landingCopy.productFlow;

  return (
    <section id="product" className="border-y border-border/80 bg-surface/20 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-metallic mb-10 text-center text-2xl font-medium tracking-tighter md:text-3xl">
          {c.title}
        </h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          {c.steps.map((step, index) => {
            const Icon = iconByStep[step.id] ?? ShieldCheck;
            return (
              <div key={step.id} className="contents">
                <SpotlightCard className="group rounded-3xl border-border/80 p-6 transition-colors hover:border-border">
                  <div className="pointer-events-none relative z-10 flex h-full flex-col items-center text-center">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white/5 text-muted-foreground transition-colors group-hover:text-aegis">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-mono text-sm text-aegis">{step.title}</div>
                    <p className="mt-2 text-sm leading-relaxed font-light text-muted-foreground">
                      {step.line}
                    </p>
                  </div>
                </SpotlightCard>
                {index < c.steps.length - 1 ? (
                  <div className="hidden items-center justify-center md:flex">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
