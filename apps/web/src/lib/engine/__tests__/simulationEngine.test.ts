import { afterEach, describe, expect, it, vi } from "vitest";
import { runSimulation } from "@/lib/engine/simulationEngine";
import { getPolicy } from "@/lib/policies";
import type { TxIntent } from "@/lib/types";

vi.mock("@/lib/rpc/client", () => ({
  forwardRpcCall: vi.fn(),
}));

import { forwardRpcCall } from "@/lib/rpc/client";

const intent: TxIntent = {
  requestId: "req_sim",
  chainId: 84532,
  method: "aegis_preflight",
  from: "0x1111111111111111111111111111111111111111",
  to: "0x2222222222222222222222222222222222222222",
  valueWei: 0n,
  data: "0x095ea7b3000000000000000000000000dead0000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  isUnknownSelector: false,
  calldataLength: 68,
};

describe("runSimulation", () => {
  afterEach(() => {
    vi.mocked(forwardRpcCall).mockReset();
  });

  it("returns reverted with hint when eth_call errors", async () => {
    vi.mocked(forwardRpcCall).mockResolvedValue({
      error: { code: 3, message: "execution reverted" },
    });
    const policy = getPolicy("default-wallet-policy");
    const policySim = {
      ...policy,
      rules: { ...policy.rules, blockSimulationRevert: true },
    };
    const result = await runSimulation(intent, policySim);
    expect(result.reverted).toBe(true);
    expect(result.hint).toContain("stateOverride");
  });

  it("returns success when eth_call succeeds", async () => {
    vi.mocked(forwardRpcCall).mockResolvedValue({ result: "0x" });
    const policy = getPolicy("default-wallet-policy");
    const result = await runSimulation(intent, policy);
    expect(result.reverted).toBe(false);
  });
});
