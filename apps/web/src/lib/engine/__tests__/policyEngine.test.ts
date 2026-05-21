import { describe, expect, it } from "vitest";
import { finalizeVerdict } from "@/lib/engine/policyEngine";
import { getPolicy } from "@/lib/policies";
import type { AdapterSignal, TxIntent } from "@/lib/types";

const intent: TxIntent = {
  requestId: "req_test",
  chainId: 84532,
  method: "aegis_preflight",
  valueWei: 0n,
  data: "0x",
  isUnknownSelector: false,
  calldataLength: 0,
};

const blockSignal: AdapterSignal = {
  adapter: "test",
  status: "BLOCK",
  reasonCode: "TEST_BLOCK",
  message: "blocked",
};

describe("finalizeVerdict", () => {
  it("hard BLOCK wins in enforce mode", () => {
    const policy = getPolicy("default-wallet-policy");
    const result = finalizeVerdict([blockSignal], intent, policy);
    expect(result.verdict).toBe("BLOCK");
    expect(result.needsAiAnalysis).toBe(true);
  });

  it("warn mode softens BLOCK to WARN", () => {
    const policy = getPolicy("default-agent-policy-warn");
    const result = finalizeVerdict([blockSignal], intent, policy);
    expect(result.verdict).toBe("WARN");
  });
});
