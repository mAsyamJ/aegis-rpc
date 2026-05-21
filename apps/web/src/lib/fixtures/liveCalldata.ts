import { encodeFunctionData, maxUint256 } from "viem";
import { contractAddresses } from "@/lib/chain/addresses";
import { HIGH_ALLOWANCE_WEI } from "@/lib/engine/decodeCallData";
import { getIndexedContract } from "@/lib/indexer/abiIndex";

export const DEMO_ERC20 = contractAddresses.DemoERC20.toLowerCase() as `0x${string}`;
export const DEMO_SPENDER = contractAddresses.DemoSpender.toLowerCase() as `0x${string}`;
export const DEFI_POLICY_APP =
  contractAddresses.DeFiUseCasePolicyApp.toLowerCase() as `0x${string}`;

function requireIndexed(address: string, label: string) {
  const entry = getIndexedContract(address);
  if (!entry) {
    throw new Error(
      `${label} not in abi-index.json — run: cd aegis-rpc && npm run sync:abi-index`,
    );
  }
  return entry;
}

function buildCalldata() {
  const demoToken = requireIndexed(DEMO_ERC20, "DemoERC20");
  const defiApp = requireIndexed(DEFI_POLICY_APP, "DeFiUseCasePolicyApp");

  return {
    WALLET_UNLIMITED_APPROVE_DATA: encodeFunctionData({
      abi: demoToken.abi,
      functionName: "approve",
      args: [contractAddresses.DemoSpender, maxUint256],
    }),
    WALLET_HIGH_ALLOWANCE_APPROVE_DATA: encodeFunctionData({
      abi: demoToken.abi,
      functionName: "approve",
      args: [contractAddresses.DemoSpender, HIGH_ALLOWANCE_WEI],
    }),
    DEFI_CHECK_SWAP_DEVIATION_DATA: encodeFunctionData({
      abi: defiApp.abi,
      functionName: "checkSwapDeviation",
      args: [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        BigInt(1_000_000),
        BigInt(1_000_000),
        BigInt(100),
        BigInt(50),
      ],
    }),
  };
}

const calldata = buildCalldata();

export const WALLET_UNLIMITED_APPROVE_DATA = calldata.WALLET_UNLIMITED_APPROVE_DATA;
export const WALLET_HIGH_ALLOWANCE_APPROVE_DATA = calldata.WALLET_HIGH_ALLOWANCE_APPROVE_DATA;
export const DEFI_CHECK_SWAP_DEVIATION_DATA = calldata.DEFI_CHECK_SWAP_DEVIATION_DATA;
