import { describe, expect, it, vi, afterEach } from "vitest";
import { getAegisRpcUrl } from "./aegisRpc";

describe("getAegisRpcUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers NEXT_PUBLIC_AEGIS_RPC_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_AEGIS_RPC_URL", "https://prod.example/api/rpc");
    expect(getAegisRpcUrl()).toBe("https://prod.example/api/rpc");
  });

  it("uses VERCEL_URL on server when public env unset", () => {
    vi.stubEnv("NEXT_PUBLIC_AEGIS_RPC_URL", "");
    vi.stubEnv("VERCEL_URL", "aegis-rpc.vercel.app");
    expect(getAegisRpcUrl()).toBe("https://aegis-rpc.vercel.app/api/rpc");
  });
});
