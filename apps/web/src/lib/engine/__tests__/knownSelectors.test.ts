import { describe, expect, it } from "vitest";
import { lookupKnownSelector } from "@/lib/engine/knownSelectors";
import { decodeTxIntent } from "@/lib/engine/transactionDecoder";

const base = {
  chainId: 84532,
  from: "0x1234567890123456789012345678901234567890",
  to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

describe("knownSelectors", () => {
  it("resolves uniswap swap selector", () => {
    const entry = lookupKnownSelector("0x38ed1739");
    expect(entry?.label).toContain("Swap");
  });

  it("decoder uses registry for swap calldata prefix", () => {
    const data =
      "0x38ed1739000000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
    const intent = decodeTxIntent({ ...base, data });
    expect(intent.isUnknownSelector).toBe(false);
    expect(intent.decodedFunction).toContain("swapExactTokensForTokens");
  });
});
