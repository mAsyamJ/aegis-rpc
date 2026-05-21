import { describe, expect, it } from "vitest";
import { encodeFunctionData, maxUint256 } from "viem";
import { enrichIntentWithMulticall } from "@/lib/engine/multicallDecoder";
import type { TxIntent } from "@/lib/types";

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
] as const;

const multicallAbi = [
  {
    type: "function",
    name: "multicall",
    inputs: [{ name: "data", type: "bytes[]" }],
  },
] as const;

describe("enrichIntentWithMulticall", () => {
  it("flags unlimited approve inside multicall batch", () => {
    const approve = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: ["0x000000000000000000000000000000000000dead", maxUint256],
    });
    const data = encodeFunctionData({
      abi: multicallAbi,
      functionName: "multicall",
      args: [[approve]],
    });

    const intent: TxIntent = {
      requestId: "req_mc",
      chainId: 84532,
      method: "aegis_preflight",
      valueWei: 0n,
      data,
      selector: "0xac9650d8",
      decodedFunction: "multicall(bytes[])",
      isUnknownSelector: false,
      calldataLength: (data.length - 2) / 2,
    };

    const enriched = enrichIntentWithMulticall(intent);
    expect(enriched.hasMulticallInnerRisk).toBe(true);
    expect(enriched.isUnlimitedApproval).toBe(true);
    expect(enriched.innerCalls?.length).toBe(1);
  });
});
