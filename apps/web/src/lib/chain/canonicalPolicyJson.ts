import type { AegisPolicy } from "@/lib/types";

/** Canonical JSON shape — must match DeployBaseSepolia.s.sol registration blobs. */
export function canonicalPolicyJsonForDeploy(policy: Pick<AegisPolicy, "id" | "template" | "mode" | "limits">): string {
  if (policy.id === "default-wallet-policy") {
    return '{"id":"default-wallet-policy","template":"wallet","mode":"enforce"}';
  }
  if (policy.id === "default-agent-policy") {
    return '{"id":"default-agent-policy","template":"agent","mode":"enforce","limits":{"maxSingleAgentActionUsd":500}}';
  }
  return JSON.stringify({
    id: policy.id,
    template: policy.template,
    mode: policy.mode,
    limits: policy.limits,
  });
}
