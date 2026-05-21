import abiIndex from "@/data/abi-index.json";
import abiMeta from "@/data/abi-index.meta.json";
import type { Abi } from "viem";
import type { TxIntent } from "@/lib/types";

export type AbiIndexEntry = {
  name: string;
  address: string;
  abi: Abi;
  selectors: Record<string, string>;
};

export type IndexedContract = {
  name: string;
  address: `0x${string}`;
  abi: Abi;
  selectors: Record<string, string>;
};

const indexData = abiIndex as {
  chainId: number;
  syncedAt: string;
  contracts: Record<string, AbiIndexEntry>;
};

const metaData = abiMeta as {
  chainId: number;
  syncedAt: string;
  strictDualSource: boolean;
  contracts: { name: string; address: string; selectorCount: number }[];
};

const byAddress = new Map<string, IndexedContract>();

for (const [addr, entry] of Object.entries(indexData.contracts)) {
  const normalized = addr.toLowerCase();
  byAddress.set(normalized, {
    name: entry.name,
    address: normalized as `0x${string}`,
    abi: entry.abi as Abi,
    selectors: entry.selectors,
  });
}

export function getIndexerChainId(): number {
  return indexData.chainId;
}

export function getIndexerSyncedAt(): string {
  return indexData.syncedAt;
}

export function getIndexerMeta() {
  return metaData;
}

export function listIndexedContracts(): IndexedContract[] {
  return [...byAddress.values()];
}

export function isIndexedAddress(address?: string): boolean {
  if (!address) return false;
  return byAddress.has(address.toLowerCase());
}

export function getIndexedContract(address?: string): IndexedContract | null {
  if (!address) return null;
  return byAddress.get(address.toLowerCase()) ?? null;
}

export function lookupIndexedSelector(
  address: string | undefined,
  selector: string | undefined
): string | undefined {
  const contract = getIndexedContract(address);
  if (!contract || !selector) return undefined;
  return contract.selectors[selector.toLowerCase()];
}

export function useCaseFromContractName(name: string): TxIntent["useCase"] {
  if (name.includes("Agent")) return "agent";
  if (name.includes("DeFi")) return "defi";
  if (name.includes("RWA")) return "rwa";
  if (name === "DemoERC20" || name === "DemoSpender" || name === "AegisPolicyRegistry") {
    return "wallet";
  }
  return "backend";
}

export function buildSelectorRegistry(): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const contract of byAddress.values()) {
    for (const [sel, sig] of Object.entries(contract.selectors)) {
      merged[sel] = sig;
    }
  }
  return merged;
}
