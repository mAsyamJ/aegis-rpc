import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearRpcCacheForTests,
  forwardWithCache,
  isCacheableMethod,
  rpcCacheTtlMs,
} from "@/lib/rpc/rpcCache";

vi.mock("@/lib/rpc/client", () => ({
  forwardRpcCall: vi.fn(async () => ({ result: "0x14a34" })),
}));

describe("rpcCache", () => {
  afterEach(() => {
    clearRpcCacheForTests();
    vi.unstubAllEnvs();
  });

  it("returns 0 TTL when env unset", () => {
    vi.stubEnv("AEGIS_RPC_CACHE_TTL_MS", "");
    expect(rpcCacheTtlMs()).toBe(0);
    expect(isCacheableMethod("eth_chainId")).toBe(false);
  });

  it("caches eth_chainId on second call", async () => {
    vi.stubEnv("AEGIS_RPC_CACHE_TTL_MS", "60000");
    const first = await forwardWithCache(1, "eth_chainId", []);
    const second = await forwardWithCache(2, "eth_chainId", []);
    expect(first.result).toBe("0x14a34");
    expect(second.cacheHit).toBe(true);
  });
});
