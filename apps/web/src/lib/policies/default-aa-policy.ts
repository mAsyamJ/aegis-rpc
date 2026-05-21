import type { AegisPolicy } from "@/lib/types";

export const defaultAaPolicy: AegisPolicy = {
  id: "default-aa-policy",
  name: "Default Account Abstraction Policy",
  mode: "enforce",
  template: "wallet",
  chainId: 84532,
  limits: {
    maxNativeTransferUsd: 500,
  },
  rules: {
    blockUnlimitedApproval: true,
    requireSpenderAllowlist: false,
    blockUnknownContracts: false,
    requireFreshPrice: false,
    blockSimulationRevert: true,
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
