import { describe, expect, it } from "vitest";
import { maxUint256 } from "viem";
import { decodeTxIntent } from "@/lib/engine/transactionDecoder";

const base = {
  chainId: 84532,
  from: "0x1234567890123456789012345678901234567890",
  to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

describe("decodeTxIntent", () => {
  it("decodes native transfer", () => {
    const intent = decodeTxIntent({ ...base, valueWei: "1000", data: "0x" });
    expect(intent.decodedFunction).toBe("native_transfer");
    expect(intent.isUnknownSelector).toBe(false);
  });

  it("decodes ERC20 approve with spender and amount", () => {
    const spender = "0xdeadbee5deadbeefdeadbeefdeadbeefdeadbee5";
    const data =
      `0x095ea7b3${spender.slice(2).padStart(64, "0")}${maxUint256.toString(16).padStart(64, "0")}` as `0x${string}`;
    const intent = decodeTxIntent({ ...base, data });
    expect(intent.decodedFunction).toBe("approve(address,uint256)");
    expect(intent.decodedArgs?.spender).toBeDefined();
    expect(intent.isUnlimitedApproval).toBe(true);
  });

  it("flags unknown selector", () => {
    const intent = decodeTxIntent({
      ...base,
      data: "0xdeadbeef00000000000000000000000000000000000000000000000000000000",
    });
    expect(intent.isUnknownSelector).toBe(true);
    expect(intent.decodedFunction).toMatch(/^unknown\(/);
  });
});
