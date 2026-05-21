import { afterEach, describe, expect, it, vi } from "vitest";
import { simulationAdapter } from "@/lib/adapters/simulationAdapter";
import { getPolicy } from "@/lib/policies";
import type { TxIntent } from "@/lib/types";

vi.mock("@/lib/rpc/client", () => ({
  forwardRpcCall: vi.fn(async () => ({
    error: { code: 3, message: "revert" },
  })),
}));

const intent: TxIntent = {
  requestId: "req_sa",
  chainId: 84532,
  method: "aegis_preflight",
  from: "0x1111111111111111111111111111111111111111",
  to: "0x2222222222222222222222222222222222222222",
  valueWei: 0n,
  data: "0x",
  isUnknownSelector: false,
  calldataLength: 0,
};

describe("simulationAdapter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("BLOCKs on revert when blockSimulationRevert enabled", async () => {
    const policy = getPolicy("default-wallet-policy");
    const p = {
      ...policy,
      rules: { ...policy.rules, blockSimulationRevert: true },
    };
    expect(simulationAdapter.supports(intent, p)).toBe(true);
    const signal = await simulationAdapter.getSignal(intent, p);
    expect(signal.status).toBe("BLOCK");
    expect(signal.reasonCode).toBe("SIMULATION_REVERT");
    expect(signal.data?.simulationHint).toBeDefined();
  });
});
