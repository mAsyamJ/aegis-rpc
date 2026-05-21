import { createPublicClient, http, keccak256, toBytes } from "viem";
import { baseSepolia } from "viem/chains";
import type { AegisPolicy } from "@/lib/types";
import { aegisPolicyRegistryAbi } from "./abis";
import { contractAddresses } from "./addresses";
import { canonicalPolicyJsonForDeploy } from "./canonicalPolicyJson";

const registryClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org"),
});

export function policyIdToBytes32(policyId: string): `0x${string}` {
  return keccak256(toBytes(policyId));
}

export function computePolicyHash(policy: Pick<AegisPolicy, "id" | "template" | "mode" | "limits">): `0x${string}` {
  const json = canonicalPolicyJsonForDeploy(policy);
  return keccak256(toBytes(json));
}

export async function getOnChainPolicyHash(policyId: string): Promise<`0x${string}` | null> {
  try {
    return await registryClient.readContract({
      address: contractAddresses.AegisPolicyRegistry,
      abi: aegisPolicyRegistryAbi,
      functionName: "getPolicyHash",
      args: [policyIdToBytes32(policyId)],
    });
  } catch {
    return null;
  }
}

export async function verifyOnChainPolicyHash(
  policyId: string,
  hash: `0x${string}`
): Promise<boolean> {
  try {
    return await registryClient.readContract({
      address: contractAddresses.AegisPolicyRegistry,
      abi: aegisPolicyRegistryAbi,
      functionName: "verifyHash",
      args: [policyIdToBytes32(policyId), hash],
    });
  } catch {
    return false;
  }
}
