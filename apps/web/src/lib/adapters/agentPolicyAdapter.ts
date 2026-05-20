import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

const TRANSFER_SELECTOR = "0xa9059cbb";

function decodeTransferAmount(data: string): bigint | undefined {
  if (!data.startsWith(TRANSFER_SELECTOR) || data.length < 138) return undefined;
  return BigInt(`0x${data.slice(74, 138)}`);
}

export const agentPolicyAdapter: AegisAdapter = {
  name: "AgentPolicyAdapter",

  supports(_intent: TxIntent, policy: AegisPolicy): boolean {
    return policy.template === "agent";
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();

    if (
      intent.selector &&
      policy.allowlists.selectors.length > 0 &&
      !policy.allowlists.selectors.includes(intent.selector)
    ) {
      const status = policy.mode === "warn" ? "WARN" : "BLOCK";
      return {
        adapter: "AgentPolicyAdapter",
        status,
        reasonCode: "SELECTOR_NOT_ALLOWLISTED",
        message: `Selector ${intent.selector} not in agent allowlist`,
        latencyMs: Date.now() - started,
      };
    }

    const cap = policy.limits.maxSingleAgentActionUsd;
    if (cap !== undefined && intent.selector === TRANSFER_SELECTOR) {
      let usdApprox: number | undefined;
      if (intent.decodedArgs?.amount) {
        usdApprox = Number(intent.decodedArgs.amount) / 1e6;
      } else {
        const amount = decodeTransferAmount(intent.data);
        if (amount !== undefined) {
          usdApprox = Number(amount) / 1e6;
        }
      }
      if (usdApprox !== undefined && usdApprox > cap) {
          return {
            adapter: "AgentPolicyAdapter",
            status: "BLOCK",
            reasonCode: "AGENT_TX_CAP_EXCEEDED",
            message: `Transfer ~$${usdApprox.toFixed(2)} exceeds agent cap $${cap}`,
            data: { usdApprox, cap },
            latencyMs: Date.now() - started,
          };
      }
    }

    return {
      adapter: "AgentPolicyAdapter",
      status: "OK",
      message: "Agent policy checks passed",
      latencyMs: Date.now() - started,
    };
  },
};
