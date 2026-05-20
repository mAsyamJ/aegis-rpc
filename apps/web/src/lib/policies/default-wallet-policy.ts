import type { AegisPolicy } from "@/lib/types";

export const defaultWalletPolicy: AegisPolicy = {
  id: "default-wallet-policy",
  name: "Default Wallet Policy",
  mode: "enforce",
  template: "wallet",
  chainId: 84532,
  limits: {
    maxNativeTransferUsd: 1000,
  },
  rules: {
    blockUnlimitedApproval: true,
    requireSpenderAllowlist: true,
    blockUnknownContracts: false,
    requireFreshPrice: false,
    blockSimulationRevert: false,
    flagUnknownSelectors: true,
  },
  allowlists: {
    agents: [],
    recipients: [],
    spenders: [],
    contracts: [],
    selectors: [],
  },
  denylists: {
    addresses: [],
    selectors: [],
  },
};

const policies = new Map<string, AegisPolicy>([
  [defaultWalletPolicy.id, defaultWalletPolicy],
]);

export function getPolicy(policyId?: string): AegisPolicy {
  if (policyId && policies.has(policyId)) {
    return policies.get(policyId)!;
  }
  return defaultWalletPolicy;
}
