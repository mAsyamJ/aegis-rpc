"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/web3/SignInButton";
import { landingCopy } from "@/content/landing-copy";

import { HeroDashboardMockup } from "./HeroDashboardMockup";
import { useHeroTilt } from "./useHeroTilt";

export function LandingHero() {
  const { sectionRef, cardRef, onMouseMove, onMouseLeave } = useHeroTilt();
  const c = landingCopy.hero;

  return (
    <main
      ref={sectionRef}
      id="hero-section"
      className="relative overflow-visible pt-28 pb-10 md:pt-36 md:pb-14"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <div className="landing-enter group mb-8 inline-flex cursor-default items-center gap-2 rounded-full border border-border/80 bg-card/30 px-3 py-1 shadow-[0_0_20px_-10px] shadow-aegis/30 backdrop-blur-md transition-all hover:border-aegis/50 hover:bg-card/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aegis opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-aegis" />
          </span>
          <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
            {c.badge}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-aegis" />
        </div>

        <h1 className="landing-enter landing-enter-delay-1 mx-auto mb-5 max-w-5xl text-5xl leading-[1.1] font-medium tracking-tighter md:text-6xl lg:text-7xl">
          <span className="text-metallic block">{c.title}</span>
          <span className="mt-1 block bg-gradient-to-r from-aegis/90 via-foreground to-aegis-glow bg-clip-text text-transparent">
            {c.titleAccent}
          </span>
        </h1>

        <p className="landing-enter landing-enter-delay-2 mx-auto mb-10 max-w-2xl text-base leading-relaxed font-light text-muted-foreground md:text-lg">
          {c.lead}
        </p>

        <div className="landing-enter landing-enter-delay-3 relative z-20 mb-14 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Button
            asChild
            size="lg"
            className="shine-button h-12 rounded-full bg-foreground px-8 text-background shadow-[0_0_30px_-5px_rgba(255,255,255,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none"
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
            className="h-12 rounded-full border-border/80 bg-white/5 px-8 backdrop-blur-sm hover:border-white/10 hover:bg-white/10 motion-reduce:transform-none"
          >
            <Link href={c.ctas.secondary.href}>{c.ctas.secondary.label}</Link>
          </Button>
          <SignInButton
            size="lg"
            connectLabel={landingCopy.nav.signUp}
            className="h-12 rounded-full border-border/80 bg-white/5 px-8 backdrop-blur-sm hover:border-aegis/40 hover:bg-aegis/10"
          />
        </div>

        <div className="landing-enter landing-enter-delay-4 perspective-[1200px] relative mx-auto h-[min(280px,42vh)] w-full max-w-6xl md:h-[min(420px,55vh)] lg:h-[min(480px,60vh)]">
          <div className="absolute top-1/2 left-1/2 h-[40%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aegis/10 blur-[100px]" />
          <HeroDashboardMockup ref={cardRef} className="h-full" />
        </div>
      </div>
    </main>
  );
}
