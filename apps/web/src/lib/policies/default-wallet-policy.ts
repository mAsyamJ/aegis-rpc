import type { AegisPolicy } from "@/lib/types";
import { contractAddresses } from "@/lib/chain/addresses";

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
    warnHighAllowance: true,
    warnHighRiskSpender: true,
  },
  allowlists: {
    agents: [],
    recipients: [],
    spenders: [],
    contracts: [
      contractAddresses.AegisPolicyRegistry,
      contractAddresses.DemoERC20,
      contractAddresses.DemoSpender,
      contractAddresses.DeFiUseCasePolicyApp,
    ],
    selectors: [],
  },
  denylists: {
    addresses: [],
    selectors: [],
  },
};
