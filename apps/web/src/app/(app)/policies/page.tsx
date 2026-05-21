"use client";

import { useEffect, useState } from "react";

import { useAppStatus } from "@/components/layout/AppStatusProvider";
import { PolicyTemplateCard } from "@/components/policies/PolicyTemplateCard";
import { PolicyRuleMatrix } from "@/components/policies/PolicyRuleMatrix";
import { PolicyModeToggle } from "@/components/policies/PolicyModeToggle";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getPolicies } from "@/lib/client/aegisApi";
import type { AegisPolicy, PolicyMode } from "@/lib/types/aegis";

export default function PoliciesPage() {
  const { setPolicyMode } = useAppStatus();
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
    <div className="flex flex-col gap-4 md:gap-6">
      <AdminPageHeader
        section="Configuration"
        title="Policy console"
        description="Deterministic templates by signer profile — mode, limits, allowlists, rules."
      />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="grid gap-3 md:grid-cols-2 lg:col-span-7">
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
        <div className="space-y-4 lg:col-span-5">
          {active ? (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <PolicyModeToggle
                  policyId={active.id}
                  mode={active.mode}
                  onChange={(mode: PolicyMode) => {
                    setPolicyMode(mode);
                    setPolicies((prev) =>
                      prev.map((p) => (p.id === active.id ? { ...p, mode } : p)),
                    );
                  }}
                />
                <PolicyRuleMatrix policy={active} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
