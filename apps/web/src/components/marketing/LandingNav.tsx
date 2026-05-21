"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { SignInButton } from "@/components/web3/SignInButton";
import { landingCopy } from "@/content/landing-copy";

import { ConicCtaButton } from "./ConicCtaButton";

export function LandingNav() {
  return (
    <nav className="fixed top-6 left-1/2 z-[60] w-[94%] max-w-3xl -translate-x-1/2 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none">
      <div className="relative flex items-center justify-between gap-1 rounded-full border border-border/80 bg-background/50 px-2 py-2 shadow-2xl ring-1 ring-border/50 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 pl-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr from-aegis to-aegis-glow shadow-lg shadow-aegis/20">
            <Shield className="h-3 w-3 text-aegis-foreground" />
          </div>
          <span className="text-sm font-medium tracking-tight">Aegis RPC</span>
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {landingCopy.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="relative z-[60] flex shrink-0 items-center gap-1.5 pr-1 sm:gap-2">
          <SignInButton
            size="sm"
            connectLabel={landingCopy.nav.signUp}
            className="inline-flex rounded-full border-border/80 bg-transparent text-xs hover:bg-white/5 sm:px-3"
          />
          <ConicCtaButton href="/demo/agent" className="shrink-0">
            <span className="hidden sm:inline">{landingCopy.hero.ctas.primary.label}</span>
            <span className="sm:hidden">Demo</span>
          </ConicCtaButton>
        </div>
      </div>
    </nav>
  );
}
