import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/web3/SignInButton";
import { landingCopy } from "@/content/landing-copy";

import { SpotlightCard } from "./SpotlightCard";

export function LandingFinalCta() {
  const c = landingCopy.finalCta;

  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-24">
      <div className="animate-landing-pulse-glow absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aegis/10 blur-[100px] mix-blend-screen motion-reduce:hidden" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <SpotlightCard className="rounded-3xl border-border/80 p-8 text-center md:p-12">
          <div className="relative z-10">
            <h2 className="text-metallic text-3xl font-medium tracking-tighter md:text-4xl">
              {c.title}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm font-light text-muted-foreground md:text-base">
              {c.body}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="shine-button h-12 rounded-full bg-foreground px-8 text-background shadow-[0_0_30px_-5px_rgba(255,255,255,0.25)] hover:bg-foreground/90"
              >
                <Link href={c.ctas.primary.href}>
                  {c.ctas.primary.label}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/80 bg-white/5 px-8 backdrop-blur-sm hover:border-white/10 hover:bg-white/10"
              >
                <Link href={c.ctas.secondary.href}>{c.ctas.secondary.label}</Link>
              </Button>
              <SignInButton
                size="lg"
                connectLabel={landingCopy.nav.signUp}
                className="h-12 rounded-full border-border/80 bg-white/5 px-8 backdrop-blur-sm hover:border-aegis/40 hover:bg-aegis/10"
              />
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
