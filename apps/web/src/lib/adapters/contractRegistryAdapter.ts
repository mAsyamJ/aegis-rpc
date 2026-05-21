import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";
import { isIndexedAddress, lookupIndexedSelector } from "@/lib/indexer/abiIndex";

export const contractRegistryAdapter: AegisAdapter = {
  name: "ContractRegistryAdapter",

  supports(intent: TxIntent, _policy: AegisPolicy): boolean {
    return (
      Boolean(intent.to) &&
      isIndexedAddress(intent.to) &&
      intent.isUnknownSelector &&
      Boolean(intent.selector)
    );
  },

  async getSignal(intent: TxIntent, _policy: AegisPolicy): Promise<AdapterSignal> {
    const knownSig = lookupIndexedSelector(intent.to, intent.selector);
    return {
      adapter: "ContractRegistryAdapter",
      status: "WARN",
      reasonCode: "UNKNOWN_INDEXED_CONTRACT_SELECTOR",
      message: knownSig
        ? `Indexed contract call with undecoded selector (${knownSig})`
        : "Indexed contract call with unknown selector",
      data: {
        to: intent.to,
        selector: intent.selector,
        knownSignature: knownSig,
      },
      latencyMs: 0,
    };
  },
};
