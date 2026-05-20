"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  LayoutDashboard,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ContractAddressCard } from "@/components/shared/ContractAddressCard";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <AppShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-aegis/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-aegis shadow-[0_0_8px_2px_var(--aegis-glow)]" />
            <span className="font-mono">base-sepolia · enforce · v0.1</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Pre-broadcast transaction screening for{" "}
            <span className="text-aegis">agents</span>, wallets, DeFi, and RWA.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Aegis RPC decodes intent, checks deterministic policy, reads adapter
            signals, and blocks unsafe execution before broadcast. AI explains
            the verdict — it does not decide.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Button asChild size="lg" className="bg-aegis text-aegis-foreground hover:bg-aegis/90">
              <Link href="/demo/agent">
                Run agent demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                OpsRisk dashboard
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/demo/wallet">
                <Wallet className="mr-2 h-4 w-4" />
                Wallet firewall
              </Link>
            </Button>
          </div>
          <FlowDiagram />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold">What Aegis stops, today</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ProofCard
            verdict="BLOCK"
            Icon={ShieldX}
            title="Approval drainer blocked"
            body="Unlimited ERC-20 approval to an unverified spender — stopped before signing."
            href="/demo/wallet"
          />
          <ProofCard
            verdict="BLOCK"
            Icon={ShieldCheck}
            title="Agent over-spend blocked"
            body="Transfer exceeds per-tx USD cap. Deterministic policy blocks before broadcast."
            href="/demo/agent"
          />
          <ProofCard
            verdict="WARN"
            Icon={Sparkles}
            title="AI explains, does not decide"
            body="Every verdict gets an auditable memo and pre-signing assist on WARN."
            href="/dashboard"
          />
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">One gateway. Many signer profiles.</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Persona Icon={Bot} title="AI agents" body="USD caps, selector allowlists, oracle freshness." />
            <Persona Icon={Wallet} title="Wallets" body="Block drainers and unlimited approvals." />
            <Persona Icon={Boxes} title="DeFi bots" body="Slippage sanity and simulation checks." />
            <Persona Icon={ShieldCheck} title="Treasury" body="Strict allowlists and daily caps." />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-semibold">On-chain proof (Base Sepolia)</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <ContractAddressCard
              label="Chainlink ETH/USD feed"
              address="0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"
              href="https://sepolia.basescan.org/address/0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"
            />
            <ContractAddressCard
              label="Policy registry"
              address="0x0000000000000000000000000000000000000000"
              href="https://sepolia.basescan.org/"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Registry deploy pending human approval — local policy hash shown in preflight responses.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function FlowDiagram() {
  const steps = [
    "Signer",
    "Aegis RPC",
    "Decoder",
    "Adapters",
    "Policy",
    "Verdict",
    "Audit",
  ];
  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`rounded-lg border border-border bg-background/60 px-3 py-2 text-sm font-semibold ${
                s === "Aegis RPC" ? "border-aegis/40 text-aegis" : ""
              }`}
            >
              {s}
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProofCard({
  verdict,
  Icon,
  title,
  body,
  href,
}: {
  verdict: "SAFE" | "WARN" | "BLOCK";
  Icon: typeof ShieldX;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:border-aegis/40"
    >
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-aegis/10 text-aegis ring-1 ring-aegis/30">
          <Icon className="h-4 w-4" />
        </div>
        <VerdictBadge verdict={verdict} />
      </div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}

function Persona({
  Icon,
  title,
  body,
}: {
  Icon: typeof Bot;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-aegis" />
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
