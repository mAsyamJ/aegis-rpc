import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

const MAX_CALLDATA_BYTES = 24_576;

export const userOpAdapter: AegisAdapter = {
  name: "UserOpAdapter",

  supports(_intent: TxIntent, policy: AegisPolicy): boolean {
    return policy.id === "default-aa-policy";
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    const bytes = intent.calldataLength;

    if (bytes > MAX_CALLDATA_BYTES) {
      return {
        adapter: "UserOpAdapter",
        status: policy.mode === "observe" ? "WARN" : "BLOCK",
        reasonCode: "USEROP_CALLDATA_TOO_LARGE",
        message: `UserOp callData ${bytes} bytes exceeds cap ${MAX_CALLDATA_BYTES}`,
        latencyMs: Date.now() - started,
      };
    }

    return {
      adapter: "UserOpAdapter",
      status: "OK",
      message: "UserOp callData within policy limits",
      data: { callDataBytes: bytes },
      latencyMs: Date.now() - started,
    };
  },
};
