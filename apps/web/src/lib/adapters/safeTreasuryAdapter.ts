import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

function isAllowlistedContract(
  address: string | undefined,
  policy: AegisPolicy
): boolean {
  if (!address) return false;
  const n = address.toLowerCase();
  return policy.allowlists.contracts.some((c) => c.toLowerCase() === n);
}

export const safeTreasuryAdapter: AegisAdapter = {
  name: "SafeTreasuryAdapter",

  supports(intent: TxIntent, policy: AegisPolicy): boolean {
    return (
      policy.template === "treasury" &&
      policy.rules.requireTreasuryTargetAllowlist === true &&
      (intent.safeInner !== undefined || intent.useCase === "treasury")
    );
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    const target = intent.safeInner?.to ?? intent.to;

    if (!target) {
      return {
        adapter: "SafeTreasuryAdapter",
        status: "WARN",
        reasonCode: "TREASURY_TARGET_UNKNOWN",
        message: "Treasury transaction has no resolvable target",
        latencyMs: Date.now() - started,
      };
    }

    if (!isAllowlistedContract(target, policy)) {
      return {
        adapter: "SafeTreasuryAdapter",
        status: policy.mode === "enforce" ? "BLOCK" : "WARN",
        reasonCode: "TREASURY_TARGET_NOT_ALLOWLISTED",
        message: "Treasury inner target not on contract allowlist",
        data: { target },
        latencyMs: Date.now() - started,
      };
    }

    return {
      adapter: "SafeTreasuryAdapter",
      status: "OK",
      message: "Treasury target allowlisted",
      data: { target },
      latencyMs: Date.now() - started,
    };
  },
};
