import { allowlistAdapter } from "./allowlistAdapter";
import { approvalRiskAdapter } from "./approvalRiskAdapter";
import { agentPolicyAdapter } from "./agentPolicyAdapter";
import { chainlinkPriceAdapter } from "./chainlinkPriceAdapter";
import { contractCodeAdapter } from "./contractCodeAdapter";
import { contractRegistryAdapter } from "./contractRegistryAdapter";
import { previewEnrichmentAdapter } from "./previewEnrichmentAdapter";
import { safeTreasuryAdapter } from "./safeTreasuryAdapter";
import { simulationAdapter } from "./simulationAdapter";
import { spenderReputationAdapter } from "./spenderReputationAdapter";
import { userOpAdapter } from "./userOpAdapter";
import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

/** Order: allowlist → enrichment → approval → spender → agent → userOp → simulation → chainlink → contract → treasury */
export const allAdapters: AegisAdapter[] = [
  allowlistAdapter,
  previewEnrichmentAdapter,
  contractRegistryAdapter,
  approvalRiskAdapter,
  spenderReputationAdapter,
  agentPolicyAdapter,
  userOpAdapter,
  simulationAdapter,
  chainlinkPriceAdapter,
  contractCodeAdapter,
  safeTreasuryAdapter,
];

export async function collectAdapterSignals(
  intent: TxIntent,
  policy: AegisPolicy
): Promise<AdapterSignal[]> {
  const active = allAdapters.filter((a) => a.supports(intent, policy));
  return Promise.all(active.map((a) => a.getSignal(intent, policy)));
}

export {
  allowlistAdapter,
  approvalRiskAdapter,
  chainlinkPriceAdapter,
  contractCodeAdapter,
  simulationAdapter,
  agentPolicyAdapter,
  previewEnrichmentAdapter,
  contractRegistryAdapter,
  userOpAdapter,
  spenderReputationAdapter,
  safeTreasuryAdapter,
};
