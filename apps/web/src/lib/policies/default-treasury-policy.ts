import type { AegisPolicy } from "@/lib/types";

export const defaultTreasuryPolicy: AegisPolicy = {
  id: "default-treasury-policy",
  name: "Default Treasury / Safe Policy",
  mode: "enforce",
  template: "treasury",
  chainId: 84532,
  limits: {
    maxNativeTransferUsd: 50000,
  },
  rules: {
    blockUnlimitedApproval: true,
    requireSpenderAllowlist: true,
    blockUnknownContracts: true,
    requireFreshPrice: false,
    blockSimulationRevert: false,
    flagUnknownSelectors: true,
    warnHighAllowance: true,
    warnHighRiskSpender: true,
    requireTreasuryTargetAllowlist: true,
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
