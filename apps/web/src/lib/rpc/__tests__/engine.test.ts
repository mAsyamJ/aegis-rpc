import { afterEach, describe, expect, it, vi } from "vitest";
import { resetMetricsForTests } from "@/lib/metrics/counters";
import { clearRpcCacheForTests } from "@/lib/rpc/rpcCache";
import { handleSingleJsonRpc } from "@/lib/rpc/engine";

vi.mock("@/lib/rpc/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rpc/client")>();
  return {
    ...actual,
    forwardRpcCall: vi.fn(async () => ({ result: "0x2105" })),
  };
});

describe("rpc engine", () => {
  afterEach(() => {
    resetMetricsForTests();
    clearRpcCacheForTests();
    vi.unstubAllEnvs();
  });

  it("routes aegis_preflight with invalid params to -32602", async () => {
    const res = await handleSingleJsonRpc({
      jsonrpc: "2.0",
      id: 1,
      method: "aegis_preflight",
      params: [{}],
    });
    expect(res.error?.code).toBe(-32602);
  });

  it("blocks eth_sendRawTransaction with REQUIRES_PREFLIGHT", async () => {
    const res = await handleSingleJsonRpc({
      jsonrpc: "2.0",
      id: 2,
      method: "eth_sendRawTransaction",
      params: ["0x02f8"],
    });
    expect(res.error?.code).toBe(-32090);
    expect(
      (res.error?.data as { reasonCode?: string })?.reasonCode
    ).toBe("REQUIRES_PREFLIGHT");
  });

  it("blocks eth_sendUserOperation with REQUIRES_PREFLIGHT", async () => {
    const res = await handleSingleJsonRpc({
      jsonrpc: "2.0",
      id: 3,
      method: "eth_sendUserOperation",
      params: [{}, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"],
    });
    expect(res.error?.code).toBe(-32090);
  });

  it("passthroughs eth_chainId", async () => {
    const res = await handleSingleJsonRpc({
      jsonrpc: "2.0",
      id: 4,
      method: "eth_chainId",
      params: [],
    });
    expect(res.result).toBe("0x2105");
  });

  it("increments rpc_requests_total via metrics middleware", async () => {
    const { getMetricsSnapshot } = await import("@/lib/metrics/counters");
    const before = getMetricsSnapshot().rpc_requests_total;
    await handleSingleJsonRpc({
      jsonrpc: "2.0",
      id: 99,
      method: "eth_chainId",
      params: [],
    });
    expect(getMetricsSnapshot().rpc_requests_total).toBe(before + 1);
  });

  it("inline raw screening returns -32602 for invalid hex when enabled", async () => {
    vi.stubEnv("AEGIS_INLINE_RAW_SCREENING", "true");
    const res = await handleSingleJsonRpc({
      jsonrpc: "2.0",
      id: 5,
      method: "eth_sendRawTransaction",
      params: ["0xdead"],
    });
    expect(res.error?.code).toBe(-32602);
  });
});
