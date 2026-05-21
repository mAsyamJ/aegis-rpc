import { describe, expect, it } from "vitest";
import { mergeVerdict } from "@/lib/engine/verdictEngine";
import { getPolicy } from "@/lib/policies";
import type { AdapterSignal, TxIntent } from "@/lib/types";

const baseIntent: TxIntent = {
  requestId: "req_v",
  chainId: 84532,
  method: "aegis_preflight",
  valueWei: 0n,
  data: "0x",
  isUnknownSelector: false,
  calldataLength: 0,
};

describe("mergeVerdict", () => {
  it("picks highest-precedence BLOCK reasonCode", () => {
    const policy = getPolicy("default-wallet-policy");
    const signals: AdapterSignal[] = [
      {
        adapter: "a",
        status: "BLOCK",
        reasonCode: "SIMULATION_REVERT",
        message: "sim",
      },
      {
        adapter: "b",
        status: "BLOCK",
        reasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
        message: "approve",
      },
    ];
    const result = mergeVerdict(signals, baseIntent, policy);
    expect(result.verdict).toBe("BLOCK");
    expect(result.reasonCode).toBe("UNLIMITED_APPROVAL_UNKNOWN_SPENDER");
  });

  it("elevates multicall inner risk when no adapter BLOCK", () => {
    const policy = getPolicy("default-wallet-policy");
    const intent: TxIntent = {
      ...baseIntent,
      hasMulticallInnerRisk: true,
      isUnlimitedApproval: true,
    };
    const result = mergeVerdict([], intent, policy);
    expect(result.verdict).toBe("BLOCK");
    expect(result.reasonCode).toBe("UNLIMITED_APPROVAL_UNKNOWN_SPENDER");
  });
});
