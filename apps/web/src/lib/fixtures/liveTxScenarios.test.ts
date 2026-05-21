import { describe, expect, it } from "vitest";
import { HIGH_ALLOWANCE_WEI } from "@/lib/engine/decodeCallData";
import {
  DEFI_CHECK_SWAP_DEVIATION_DATA,
  WALLET_HIGH_ALLOWANCE_APPROVE_DATA,
  WALLET_UNLIMITED_APPROVE_DATA,
} from "./liveCalldata";
import { getLiveScenario, liveTxScenarios } from "./liveTxScenarios";

describe("liveTxScenarios", () => {
  it("defines three lanes with distinct ids", () => {
    expect(liveTxScenarios).toHaveLength(3);
    const ids = liveTxScenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("SAFE lane targets DeFi app with checkSwapDeviation calldata", () => {
    const s = getLiveScenario("live-safe-defi")!;
    const body = s.buildPreflightBody();
    expect(body.policyId).toBe("default-wallet-policy");
    expect(body.data).toBe(DEFI_CHECK_SWAP_DEVIATION_DATA);
    expect(s.expectedVerdict).toBe("SAFE");
    expect(s.expectedReasonCode).toBe("ALL_CHECKS_PASSED");
  });

  it("WARN lane uses high allowance approve calldata", () => {
    const s = getLiveScenario("live-warn-high-allowance")!;
    const body = s.buildPreflightBody();
    expect(body.data).toBe(WALLET_HIGH_ALLOWANCE_APPROVE_DATA);
    expect(body.data).toContain("095ea7b3");
    expect(s.expectedVerdict).toBe("WARN");
    expect(s.expectedReasonCode).toBe("HIGH_ALLOWANCE");
    expect(WALLET_HIGH_ALLOWANCE_APPROVE_DATA.startsWith("0x095ea7b3")).toBe(true);
    expect(HIGH_ALLOWANCE_WEI).toBeGreaterThan(0n);
  });

  it("BLOCK lane uses unlimited approve calldata", () => {
    const s = getLiveScenario("live-block-unlimited-approve")!;
    const body = s.buildPreflightBody();
    expect(body.data).toBe(WALLET_UNLIMITED_APPROVE_DATA);
    expect(s.expectedVerdict).toBe("BLOCK");
    expect(s.expectedReasonCode).toBe("UNLIMITED_APPROVAL_UNKNOWN_SPENDER");
  });
});
