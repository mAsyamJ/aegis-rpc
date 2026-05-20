import type { AegisPolicy } from "@/lib/types";
import { defaultWalletPolicy } from "./default-wallet-policy";
import { defaultAgentPolicy } from "./default-agent-policy";
import { defaultAgentPolicyWarn } from "./default-agent-policy-warn";

const policies = new Map<string, AegisPolicy>([
  [defaultWalletPolicy.id, defaultWalletPolicy],
  [defaultAgentPolicy.id, defaultAgentPolicy],
  [defaultAgentPolicyWarn.id, defaultAgentPolicyWarn],
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
  const payload = JSON.stringify({
    id: policy.id,
    mode: policy.mode,
    template: policy.template,
    rules: policy.rules,
    limits: policy.limits,
  });
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 31 + payload.charCodeAt(i)) >>> 0;
  }
  return `0x${hash.toString(16).padStart(64, "0")}`;
}
