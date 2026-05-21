import { encodeFunctionData, maxUint256 } from "viem";
import { contractAddresses } from "@/lib/chain/addresses";
import { getIndexedContract } from "@/lib/indexer/abiIndex";

export function buildDemoUnlimitedApproveCalldata(): `0x${string}` {
  const token = getIndexedContract(contractAddresses.DemoERC20.toLowerCase());
  if (!token) {
    throw new Error("DemoERC20 not in ABI index — run npm run sync:abi-index");
  }
  return encodeFunctionData({
    abi: token.abi,
    functionName: "approve",
    args: [contractAddresses.DemoSpender, maxUint256],
  });
}

export const demoApproveTarget = contractAddresses.DemoERC20;
