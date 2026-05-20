import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

function isKnownSpender(
  spender: string | undefined,
  policy: AegisPolicy
): boolean {
  if (!spender) return false;
  const normalized = spender.toLowerCase();
  return policy.allowlists.spenders.some((s) => s.toLowerCase() === normalized);
}

export const approvalRiskAdapter: AegisAdapter = {
  name: "ApprovalRiskAdapter",

  supports(intent: TxIntent, policy: AegisPolicy): boolean {
    return (
      policy.rules.blockUnlimitedApproval &&
      intent.decodedFunction === "approve(address,uint256)"
    );
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    const spender = intent.decodedArgs?.spender as string | undefined;
    const unlimited = intent.isUnlimitedApproval === true;

    if (unlimited && policy.rules.requireSpenderAllowlist && !isKnownSpender(spender, policy)) {
      return {
        adapter: "ApprovalRiskAdapter",
        status: "BLOCK",
        reasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
        message: "Unlimited ERC20 approval to unknown spender",
        data: { spender, unlimited },
        latencyMs: Date.now() - started,
      };
    }

    if (unlimited && isKnownSpender(spender, policy)) {
      return {
        adapter: "ApprovalRiskAdapter",
        status: "WARN",
        reasonCode: "UNLIMITED_APPROVAL_KNOWN_SPENDER",
        message: "Unlimited approval to allowlisted spender",
        data: { spender },
        latencyMs: Date.now() - started,
      };
    }

    return {
      adapter: "ApprovalRiskAdapter",
      status: "OK",
      message: "Approval risk within policy",
      latencyMs: Date.now() - started,
    };
  },
};
