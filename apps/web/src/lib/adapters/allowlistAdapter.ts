import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

export const allowlistAdapter: AegisAdapter = {
  name: "AllowlistAdapter",

  supports(_intent: TxIntent, policy: AegisPolicy): boolean {
    return (
      policy.denylists.addresses.length > 0 ||
      policy.denylists.selectors.length > 0
    );
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    const to = intent.to?.toLowerCase();
    if (to && policy.denylists.addresses.some((a) => a.toLowerCase() === to)) {
      return {
        adapter: "AllowlistAdapter",
        status: "BLOCK",
        reasonCode: "DENYLISTED_ADDRESS",
        message: "Target address is denylisted",
        latencyMs: Date.now() - started,
      };
    }
    if (
      intent.selector &&
      policy.denylists.selectors.includes(intent.selector)
    ) {
      return {
        adapter: "AllowlistAdapter",
        status: "BLOCK",
        reasonCode: "DENYLISTED_SELECTOR",
        message: "Function selector is denylisted",
        latencyMs: Date.now() - started,
      };
    }
    return {
      adapter: "AllowlistAdapter",
      status: "OK",
      message: "Allowlist checks passed",
      latencyMs: Date.now() - started,
    };
  },
};
