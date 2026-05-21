import { NextResponse } from "next/server";
import {
  getIndexerChainId,
  getIndexerMeta,
  getIndexerSyncedAt,
  listIndexedContracts,
} from "@/lib/indexer/abiIndex";

/** ABI indexer status (no secrets). */
export async function GET() {
  const contracts = listIndexedContracts().map((c) => ({
    name: c.name,
    address: c.address,
    selectorCount: Object.keys(c.selectors).length,
  }));

  const meta = getIndexerMeta();

  return NextResponse.json({
    chainId: getIndexerChainId(),
    contractCount: contracts.length,
    syncedAt: getIndexerSyncedAt(),
    strictDualSource: meta.strictDualSource,
    contracts,
  });
}
