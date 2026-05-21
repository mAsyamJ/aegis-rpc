import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { runScreening } from "@/lib/engine/screeningPipeline";
import { DEFI_CHECK_SWAP_DEVIATION_DATA, DEFI_POLICY_APP } from "@/lib/fixtures/liveCalldata";

describe("runScreening SAFE AI memo", () => {
  const prev = process.env.AEGIS_AI_MEMO_ON_SAFE;

  beforeEach(() => {
    delete process.env.AEGIS_AI_MEMO_ON_SAFE;
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.AEGIS_AI_MEMO_ON_SAFE;
    else process.env.AEGIS_AI_MEMO_ON_SAFE = prev;
    vi.restoreAllMocks();
  });

  it("schedules AI memo for SAFE DeFi check by default", async () => {
    const result = await runScreening({
      chainId: 84532,
      from: "0x1234567890123456789012345678901234567890",
      to: DEFI_POLICY_APP,
      data: DEFI_CHECK_SWAP_DEVIATION_DATA,
      policyId: "default-wallet-policy",
    });
    expect(result.verdict).toBe("SAFE");
    expect(result.memoStatus).toBe("generating");
  });

  it("skips SAFE AI memo when AEGIS_AI_MEMO_ON_SAFE=false", async () => {
    process.env.AEGIS_AI_MEMO_ON_SAFE = "false";
    const result = await runScreening({
      chainId: 84532,
      from: "0x1234567890123456789012345678901234567890",
      to: DEFI_POLICY_APP,
      data: DEFI_CHECK_SWAP_DEVIATION_DATA,
      policyId: "default-wallet-policy",
    });
    expect(result.verdict).toBe("SAFE");
    expect(result.memoStatus).toBe("pending");
  });
});
