import { describe, expect, it } from "vitest";
import { encodeFunctionData, maxUint256 } from "viem";
import {
  getIndexedContract,
  getIndexerSyncedAt,
  listIndexedContracts,
  lookupIndexedSelector,
} from "@/lib/indexer/abiIndex";
import { decodeWithIndexer } from "@/lib/indexer/decodeWithIndexer";
import { contractAddresses } from "@/lib/chain/addresses";

describe("abiIndex", () => {
  it("loads committed index with six contracts", () => {
    expect(listIndexedContracts().length).toBeGreaterThanOrEqual(6);
    expect(getIndexerSyncedAt()).toBeTruthy();
  });

  it("decodes DemoERC20.approve via indexer", () => {
    const to = contractAddresses.DemoERC20.toLowerCase() as `0x${string}`;
    const spender = "0xdeadbee5deadbeefdeadbeefdeadbeefdeadbee5";
    const data = encodeFunctionData({
      abi: getIndexedContract(to)!.abi,
      functionName: "approve",
      args: [spender, maxUint256],
    });
    const decoded = decodeWithIndexer(to, data);
    expect(decoded?.decodedFunction).toBe("approve(address,uint256)");
    expect(decoded?.contractName).toBe("DemoERC20");
    expect(decoded?.isUnlimitedApproval).toBe(true);
    expect(decoded?.isUnknownSelector).toBe(false);
  });

  it("decodes DeFiUseCasePolicyApp.checkSwapDeviation", () => {
    const to = contractAddresses.DeFiUseCasePolicyApp.toLowerCase() as `0x${string}`;
    const contract = getIndexedContract(to)!;
    const data = encodeFunctionData({
      abi: contract.abi,
      functionName: "checkSwapDeviation",
      args: [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        1_000_000n,
        1_000_000n,
        100n,
        50n,
      ],
    });
    const decoded = decodeWithIndexer(to, data);
    expect(decoded?.decodedFunction).toContain("checkSwapDeviation");
    expect(decoded?.isUnknownSelector).toBe(false);
    expect(lookupIndexedSelector(to, data.slice(0, 10))).toContain("checkSwapDeviation");
  });
});
