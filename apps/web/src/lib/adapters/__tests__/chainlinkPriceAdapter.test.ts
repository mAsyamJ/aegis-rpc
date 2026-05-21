import { afterEach, describe, expect, it, vi } from "vitest";

const { mockReadContract } = vi.hoisted(() => ({
  mockReadContract: vi.fn(),
}));

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      readContract: mockReadContract,
    })),
  };
});

import { chainlinkPriceAdapter } from "@/lib/adapters/chainlinkPriceAdapter";
import { getPolicy } from "@/lib/policies";
import type { TxIntent } from "@/lib/types";

const baseIntent: TxIntent = {
  requestId: "req_cl",
  chainId: 84532,
  method: "aegis_preflight",
  valueWei: BigInt("1000000000000000000"),
  data: "0x",
  decodedFunction: "native_transfer",
  isUnknownSelector: false,
  calldataLength: 0,
};

describe("chainlinkPriceAdapter", () => {
  afterEach(() => {
    mockReadContract.mockReset();
  });

  it("returns OK when feed is fresh and value within cap", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockReadContract
      .mockResolvedValueOnce([1n, BigInt(2000e8), 0n, BigInt(now - 100), 1n])
      .mockResolvedValueOnce(8);

    const intent: TxIntent = {
      ...baseIntent,
      valueWei: BigInt("100000000000000000"),
    };
    const policy = getPolicy("default-wallet-policy");
    const signal = await chainlinkPriceAdapter.getSignal(intent, policy);
    expect(signal.status).toBe("OK");
    expect(signal.reasonCode).toBe("CHAINLINK_FEED_OK");
  });

  it("BLOCKs native transfer above USD cap", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockReadContract
      .mockResolvedValueOnce([1n, BigInt(3000e8), 0n, BigInt(now - 100), 1n])
      .mockResolvedValueOnce(8);

    const policy = getPolicy("default-wallet-policy");
    const signal = await chainlinkPriceAdapter.getSignal(baseIntent, policy);
    expect(signal.status).toBe("BLOCK");
    expect(signal.reasonCode).toBe("NATIVE_TRANSFER_ABOVE_USD_LIMIT");
  });

  it("WARNs on stale feed when requireFreshPrice is false", async () => {
    const now = Math.floor(Date.now() / 1000);
    mockReadContract
      .mockResolvedValueOnce([1n, BigInt(2000e8), 0n, BigInt(now - 10000), 1n])
      .mockResolvedValueOnce(8);

    const intent: TxIntent = {
      ...baseIntent,
      valueWei: BigInt("100000000000000000"),
    };
    const policy = getPolicy("default-wallet-policy");
    const signal = await chainlinkPriceAdapter.getSignal(intent, policy);
    expect(signal.status).toBe("WARN");
    expect(signal.reasonCode).toBe("ORACLE_STALE");
  });

  it("skips with OK when RPC fails and requireFreshPrice is false", async () => {
    mockReadContract.mockRejectedValue(new Error("network error"));

    const policy = getPolicy("default-wallet-policy");
    const signal = await chainlinkPriceAdapter.getSignal(baseIntent, policy);
    expect(signal.status).toBe("OK");
    expect(signal.reasonCode).toBe("CHAINLINK_SKIPPED");
  });
});
