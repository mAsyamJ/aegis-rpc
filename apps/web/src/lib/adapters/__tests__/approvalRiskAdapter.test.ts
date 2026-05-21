import { describe, expect, it } from "vitest";
import { approvalRiskAdapter } from "@/lib/adapters/approvalRiskAdapter";
import { getPolicy } from "@/lib/policies";
import type { TxIntent } from "@/lib/types";

describe("approvalRiskAdapter", () => {
  it("BLOCKs unlimited approval to unknown spender", async () => {
    const policy = getPolicy("default-wallet-policy");
    const intent: TxIntent = {
      requestId: "req_test",
      chainId: 84532,
      method: "aegis_preflight",
      valueWei: 0n,
      data: "0x",
      isUnknownSelector: false,
      calldataLength: 0,
      decodedFunction: "approve(address,uint256)",
      decodedArgs: {
        spender: "0xdeadbee5deadbeefdeadbeefdeadbeefdeadbee5",
        amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      },
      isUnlimitedApproval: true,
    };

    const signal = await approvalRiskAdapter.getSignal(intent, policy);
    expect(signal.status).toBe("BLOCK");
    expect(signal.reasonCode).toBe("UNLIMITED_APPROVAL_UNKNOWN_SPENDER");
  });
});
