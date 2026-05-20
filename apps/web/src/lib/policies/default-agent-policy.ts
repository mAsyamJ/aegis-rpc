import type { AegisPolicy } from "@/lib/types";

export const defaultAgentPolicy: AegisPolicy = {
  id: "default-agent-policy",
  name: "Default Agent Policy",
  mode: "enforce",
  template: "agent",
  chainId: 84532,
  limits: {
    maxSingleAgentActionUsd: 500,
    maxDailyAgentSpendUsd: 5000,
  },
  rules: {
    blockUnlimitedApproval: true,
    requireSpenderAllowlist: true,
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
    selectors: ["0xa9059cbb", "0x095ea7b3"],
  },
  denylists: {
    addresses: [],
    selectors: [],
  },
};
