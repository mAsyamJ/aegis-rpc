import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DemoStepper } from "@/components/shared/DemoStepper";
import { Button } from "@/components/ui/button";
import { landingCopy } from "@/content/landing-copy";

import { SpotlightCard } from "./SpotlightCard";

export function JudgeDemoSection() {
  const c = landingCopy.judgeDemo;

  return (
    <section id="demo" className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <SpotlightCard className="overflow-hidden rounded-2xl border-border/80 p-6 md:p-8">
          <div className="absolute top-0 left-0 z-20 h-px w-full bg-gradient-to-r from-transparent via-aegis/60 to-transparent opacity-60" />
          <div className="relative z-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-metallic text-xl font-medium tracking-tighter md:text-2xl">
                  {c.title}
                </h2>
                <p className="mt-1.5 text-sm font-light text-muted-foreground">{c.subtitle}</p>
              </div>
              <Button
                asChild
                size="sm"
                className="shine-button rounded-full bg-aegis text-aegis-foreground hover:bg-aegis/90"
              >
                <Link href={c.cta.href}>
                  {c.cta.label}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <DemoStepper
              orientation="horizontal"
              activeIndex={0}
              completedThrough={-1}
              steps={c.steps.map((s) => ({ id: s.id, label: s.label }))}
              className="gap-3 text-sm md:gap-4"
              size="lg"
            />
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
