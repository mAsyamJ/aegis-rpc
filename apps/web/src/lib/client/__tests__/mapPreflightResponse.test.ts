import { describe, expect, it } from "vitest";
import { mapIntentFromApi } from "@/lib/client/mapPreflightResponse";
import type { TxIntent } from "@/lib/types/aegis";

const base: TxIntent = {
  from: "0x1234567890123456789012345678901234567890",
  to: "0xba0e8e5cbdd3dc2d3787776298fa524313bab52e",
  value: "0",
  data: "0xdeadbeef",
  selector: "0xdeadbeef",
  chainId: 84532,
};

describe("mapIntentFromApi", () => {
  it("merges API decodedFunction into UI intent", () => {
    const merged = mapIntentFromApi(base, {
      decodedFunction: "mint(address,uint256)",
      decodedArgs: { to: "0xabc", amount: "1000" },
      selector: "0x40c10f19",
    });
    expect(merged.functionSignature).toBe("mint(address,uint256)");
    expect(merged.decodedArgs?.length).toBe(2);
    expect(merged.selector).toBe("0x40c10f19");
  });

  it("returns scenario intent when API slice empty", () => {
    expect(mapIntentFromApi(base, undefined)).toEqual(base);
  });
});
