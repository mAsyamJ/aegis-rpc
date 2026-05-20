import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";
import { forwardRpcCall } from "@/lib/rpc/client";

export const contractCodeAdapter: AegisAdapter = {
  name: "ContractCodeAdapter",

  supports(intent: TxIntent, policy: AegisPolicy): boolean {
    return policy.rules.blockUnknownContracts && Boolean(intent.to);
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    if (!intent.to) {
      return {
        adapter: "ContractCodeAdapter",
        status: "OK",
        message: "No target address",
        latencyMs: Date.now() - started,
      };
    }

    try {
      const code = (await forwardRpcCall("eth_getCode", [intent.to, "latest"])) as string;
      const isContract = code && code !== "0x" && code.length > 4;
      if (!isContract && policy.rules.blockUnknownContracts) {
        return {
          adapter: "ContractCodeAdapter",
          status: "WARN",
          reasonCode: "TARGET_IS_EOA",
          message: "Target address has no contract code",
          data: { to: intent.to },
          latencyMs: Date.now() - started,
        };
      }
      return {
        adapter: "ContractCodeAdapter",
        status: "OK",
        message: isContract ? "Target is a contract" : "Target is EOA",
        data: { isContract },
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      return {
        adapter: "ContractCodeAdapter",
        status: "ERROR",
        reasonCode: "CODE_CHECK_FAILED",
        message: err instanceof Error ? err.message : "eth_getCode failed",
        latencyMs: Date.now() - started,
      };
    }
  },
};
