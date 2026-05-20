import { approvalRiskAdapter } from "./approvalRiskAdapter";
import { allowlistAdapter } from "./allowlistAdapter";
import { chainlinkPriceAdapter } from "./chainlinkPriceAdapter";
import { contractCodeAdapter } from "./contractCodeAdapter";
import { simulationAdapter } from "./simulationAdapter";
import { agentPolicyAdapter } from "./agentPolicyAdapter";
import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

export const allAdapters: AegisAdapter[] = [
  approvalRiskAdapter,
  allowlistAdapter,
  agentPolicyAdapter,
  chainlinkPriceAdapter,
  contractCodeAdapter,
  simulationAdapter,
];

export async function collectAdapterSignals(
  intent: TxIntent,
  policy: AegisPolicy
): Promise<AdapterSignal[]> {
  const signals: AdapterSignal[] = [];
  for (const adapter of allAdapters) {
    if (!adapter.supports(intent, policy)) continue;
    signals.push(await adapter.getSignal(intent, policy));
  }
  return signals;
}

export {
  approvalRiskAdapter,
  allowlistAdapter,
  chainlinkPriceAdapter,
  contractCodeAdapter,
  simulationAdapter,
  agentPolicyAdapter,
};
