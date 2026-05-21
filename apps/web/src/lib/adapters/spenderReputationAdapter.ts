import { maxUint256 } from "viem";
import type { AegisAdapter } from "./types";
import { HIGH_ALLOWANCE_WEI } from "@/lib/engine/decodeCallData";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

function isDenylistedSpender(
  spender: string | undefined,
  policy: AegisPolicy
): boolean {
  if (!spender) return false;
  const n = spender.toLowerCase();
  return policy.denylists.addresses.some((a) => a.toLowerCase() === n);
}

function isKnownSpender(spender: string | undefined, policy: AegisPolicy): boolean {
  if (!spender) return false;
  const n = spender.toLowerCase();
  return policy.allowlists.spenders.some((s) => s.toLowerCase() === n);
}

export const spenderReputationAdapter: AegisAdapter = {
  name: "SpenderReputationAdapter",

  supports(intent: TxIntent, policy: AegisPolicy): boolean {
    if (!policy.rules.warnHighRiskSpender && !policy.rules.warnHighAllowance) {
      return false;
    }
    return (
      intent.decodedFunction === "approve(address,uint256)" ||
      intent.isUnlimitedApproval === true ||
      intent.hasMulticallInnerRisk === true
    );
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    const spender = intent.decodedArgs?.spender as string | undefined;

    if (policy.rules.warnHighRiskSpender && isDenylistedSpender(spender, policy)) {
      return {
        adapter: "SpenderReputationAdapter",
        status: policy.mode === "enforce" ? "BLOCK" : "WARN",
        reasonCode: "HIGH_RISK_SPENDER",
        message: "Spender address is on policy denylist",
        data: { spender },
        latencyMs: Date.now() - started,
      };
    }

    if (
      policy.rules.warnHighRiskSpender &&
      intent.isUnlimitedApproval &&
      !isKnownSpender(spender, policy)
    ) {
      return {
        adapter: "SpenderReputationAdapter",
        status: "WARN",
        reasonCode: "HIGH_RISK_SPENDER",
        message: "Unlimited approval to non-allowlisted spender (reputation WARN)",
        data: { spender },
        latencyMs: Date.now() - started,
      };
    }

    if (policy.rules.warnHighAllowance && intent.decodedArgs?.amount) {
      const amount = BigInt(String(intent.decodedArgs.amount));
      if (amount >= HIGH_ALLOWANCE_WEI && amount !== maxUint256) {
        return {
          adapter: "SpenderReputationAdapter",
          status: "WARN",
          reasonCode: "HIGH_ALLOWANCE",
          message: "Approve amount exceeds high-allowance threshold",
          data: { spender, amount: amount.toString() },
          latencyMs: Date.now() - started,
        };
      }
    }

    return {
      adapter: "SpenderReputationAdapter",
      status: "OK",
      message: "Spender reputation within policy",
      latencyMs: Date.now() - started,
    };
  },
};
