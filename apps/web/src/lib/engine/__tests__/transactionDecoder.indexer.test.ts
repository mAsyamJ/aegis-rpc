import { describe, expect, it } from "vitest";
import { encodeFunctionData } from "viem";
import { contractAddresses } from "@/lib/chain/addresses";
import { getIndexedContract } from "@/lib/indexer/abiIndex";
import { decodeTxIntent } from "@/lib/engine/transactionDecoder";

describe("decodeTxIntent indexer", () => {
  it("decodes mint on indexed DemoERC20", () => {
    const to = contractAddresses.DemoERC20.toLowerCase() as `0x${string}`;
    const recipient = "0x1234567890123456789012345678901234567890";
    const data = encodeFunctionData({
      abi: getIndexedContract(to)!.abi,
      functionName: "mint",
      args: [recipient, 1_000_000n],
    });
    const intent = decodeTxIntent({
      chainId: 84532,
      from: recipient,
      to,
      data,
      valueWei: "0",
    });
    expect(intent.decodedFunction).toContain("mint");
    expect(intent.isUnknownSelector).toBe(false);
    expect(intent.decodedArgs?.amount).toBe("1000000");
  });
});
