"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PolicyTemplateCard } from "@/components/policies/PolicyTemplateCard";
import { PolicyRuleMatrix } from "@/components/policies/PolicyRuleMatrix";
import { PolicyModeToggle } from "@/components/policies/PolicyModeToggle";
import { getPolicies } from "@/lib/client/aegisApi";
import type { AegisPolicy, PolicyMode } from "@/lib/types/aegis";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<AegisPolicy[]>([]);
  const [selected, setSelected] = useState<string | undefined>();

  useEffect(() => {
    getPolicies().then((p) => {
      setPolicies(p as AegisPolicy[]);
      setSelected(p[0]?.id);
    });
  }, []);

  const active = policies.find((p) => p.id === selected);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Configuration
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Policy console</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Deterministic templates by signer profile — mode, limits, allowlists, rules.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            <div className="grid gap-3 md:grid-cols-2">
              {policies.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className="text-left"
                >
                  <PolicyTemplateCard
                    policy={p}
                    className={
                      selected === p.id ? "ring-1 ring-aegis/40 border-aegis/40" : ""
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:col-span-5">
            {active && (
              <>
                <PolicyModeToggle
                  policyId={active.id}
                  mode={active.mode}
                  onChange={(mode: PolicyMode) =>
                    setPolicies((prev) =>
                      prev.map((p) => (p.id === active.id ? { ...p, mode } : p))
                    )
                  }
                />
                <PolicyRuleMatrix policy={active} />
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
