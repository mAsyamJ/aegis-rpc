import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";
import { lookupKnownSelector } from "@/lib/engine/knownSelectors";
import { getIndexedContract } from "@/lib/indexer/abiIndex";
import { forwardRpcCall } from "@/lib/rpc/client";

export const previewEnrichmentAdapter: AegisAdapter = {
  name: "PreviewEnrichmentAdapter",

  supports(intent: TxIntent, _policy: AegisPolicy): boolean {
    return Boolean(intent.to && intent.data && intent.data !== "0x");
  },

  async getSignal(intent: TxIntent, _policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    const indexed = getIndexedContract(intent.to);
    const known = lookupKnownSelector(intent.selector);
    const decodedLabel =
      indexed?.name && intent.decodedFunction && !intent.isUnknownSelector
        ? `${indexed.name}: ${intent.decodedFunction}`
        : (known?.label ?? intent.decodedFunction);
    let contractHasCode = false;

    if (intent.to) {
      try {
        const code = await forwardRpcCall(null, "eth_getCode", [intent.to, "latest"]);
        if ("result" in code && typeof code.result === "string") {
          contractHasCode = code.result !== "0x" && code.result.length > 2;
        }
      } catch {
        contractHasCode = false;
      }
    }

    return {
      adapter: "PreviewEnrichmentAdapter",
      status: "OK",
      message: decodedLabel
        ? `Preview: ${decodedLabel}`
        : "Preview enrichment applied",
      data: {
        decodedLabel,
        contractName: indexed?.name ?? (contractHasCode ? "contract" : "eoa_or_empty"),
        signature: known?.signature ?? intent.decodedFunction,
        useCaseHint: known?.useCase ?? intent.useCase,
        indexed: Boolean(indexed),
      },
      latencyMs: Date.now() - started,
    };
  },
};
