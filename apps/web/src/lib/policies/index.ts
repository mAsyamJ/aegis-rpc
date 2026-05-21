import type { AegisPolicy } from "@/lib/types";
import { computePolicyHash } from "@/lib/chain/policyVerifier";
import { defaultWalletPolicy } from "./default-wallet-policy";
import { defaultAgentPolicy } from "./default-agent-policy";
import { defaultAgentPolicyWarn } from "./default-agent-policy-warn";
import { defaultAaPolicy } from "./default-aa-policy";
import { defaultTreasuryPolicy } from "./default-treasury-policy";

const policies = new Map<string, AegisPolicy>([
  [defaultWalletPolicy.id, defaultWalletPolicy],
  [defaultAgentPolicy.id, defaultAgentPolicy],
  [defaultAgentPolicyWarn.id, defaultAgentPolicyWarn],
  [defaultAaPolicy.id, defaultAaPolicy],
  [defaultTreasuryPolicy.id, defaultTreasuryPolicy],
]);

export function getPolicy(policyId?: string): AegisPolicy {
  if (policyId && policies.has(policyId)) {
    return policies.get(policyId)!;
  }
  return defaultWalletPolicy;
}

export function listPolicies(): AegisPolicy[] {
  return [...policies.values()];
}

export function upsertPolicy(policy: AegisPolicy): AegisPolicy {
  policies.set(policy.id, policy);
  return policy;
}

export function getPolicyHash(policyId: string): string {
  const policy = getPolicy(policyId);
  return computePolicyHash(policy);
}
