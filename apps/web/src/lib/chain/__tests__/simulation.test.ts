import { describe, expect, it } from "vitest";
import {
  buildBalanceStateOverride,
  mergeStateOverrides,
} from "@/lib/chain/simulation";

describe("simulation stateOverride", () => {
  it("builds balance override hex", () => {
    const addr = "0x1234567890123456789012345678901234567890" as const;
    const o = buildBalanceStateOverride(addr, 1_000_000_000_000_000n);
    expect(o[addr]?.balance).toMatch(/^0x/);
  });

  it("merges overrides", () => {
    const a = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
    const b = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;
    const merged = mergeStateOverrides(
      buildBalanceStateOverride(a, 1n),
      buildBalanceStateOverride(b, 2n)
    );
    expect(merged?.[a]).toBeDefined();
    expect(merged?.[b]).toBeDefined();
  });
});
