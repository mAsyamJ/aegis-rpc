import { approvalRiskAdapter } from "./approvalRiskAdapter";
import { allowlistAdapter } from "./allowlistAdapter";
import { chainlinkPriceAdapter } from "./chainlinkPriceAdapter";
import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

export const allAdapters: AegisAdapter[] = [
  approvalRiskAdapter,
  allowlistAdapter,
  chainlinkPriceAdapter,
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

export { approvalRiskAdapter, allowlistAdapter, chainlinkPriceAdapter };
