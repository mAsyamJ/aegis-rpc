import type { Hex } from "viem";

/** Build eth_call stateOverride for balance/allowance gaps (viem-style). */
export function buildBalanceStateOverride(
  address: `0x${string}`,
  balanceWei: bigint
): Record<string, { balance?: Hex }> {
  return {
    [address]: {
      balance: `0x${balanceWei.toString(16)}` as Hex,
    },
  };
}

export function mergeStateOverrides(
  ...parts: Array<Record<string, { balance?: Hex }> | undefined>
): Record<string, { balance?: Hex }> | undefined {
  const merged: Record<string, { balance?: Hex }> = {};
  let any = false;
  for (const part of parts) {
    if (!part) continue;
    for (const [addr, state] of Object.entries(part)) {
      any = true;
      merged[addr] = { ...merged[addr], ...state };
    }
  }
  return any ? merged : undefined;
}
