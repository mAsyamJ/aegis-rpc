import { describe, expect, it } from "vitest";
import { spenderReputationAdapter } from "@/lib/adapters/spenderReputationAdapter";
import { getPolicy } from "@/lib/policies";
import type { TxIntent } from "@/lib/types";

describe("spenderReputationAdapter", () => {
  it("BLOCKs denylisted spender on approve", async () => {
    const base = getPolicy("default-wallet-policy");
    const spender = "0xbad0000000000000000000000000000000000001" as const;
    const policy = {
      ...base,
      denylists: {
        ...base.denylists,
        addresses: [...base.denylists.addresses, spender],
      },
    };
    const intent: TxIntent = {
      requestId: "req_sp",
      chainId: 84532,
      method: "aegis_preflight",
      valueWei: 0n,
      data: "0x",
      decodedFunction: "approve(address,uint256)",
      decodedArgs: { spender, amount: "1000" },
      isUnknownSelector: false,
      calldataLength: 0,
    };
    expect(spenderReputationAdapter.supports(intent, policy)).toBe(true);
    const signal = await spenderReputationAdapter.getSignal(intent, policy);
    expect(signal.status).toBe("BLOCK");
    expect(signal.reasonCode).toBe("HIGH_RISK_SPENDER");
  });
});
