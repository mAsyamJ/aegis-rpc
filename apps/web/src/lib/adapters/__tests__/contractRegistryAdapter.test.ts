import { describe, expect, it } from "vitest";
import { contractRegistryAdapter } from "@/lib/adapters/contractRegistryAdapter";
import { contractAddresses } from "@/lib/chain/addresses";
import { defaultWalletPolicy } from "@/lib/policies/default-wallet-policy";
import type { TxIntent } from "@/lib/types";

describe("contractRegistryAdapter", () => {
  it("WARNs on indexed contract with unknown selector flag", async () => {
    const intent: TxIntent = {
      requestId: "req_test",
      chainId: 84532,
      method: "aegis_preflight",
      to: contractAddresses.DemoERC20.toLowerCase() as `0x${string}`,
      data: "0xdeadbeef00000000000000000000000000000000000000000000000000000000",
      valueWei: 0n,
      selector: "0xdeadbeef",
      decodedFunction: "unknown(0xdeadbeef)",
      isUnknownSelector: true,
      calldataLength: 4,
    };
    expect(contractRegistryAdapter.supports(intent, defaultWalletPolicy)).toBe(true);
    const signal = await contractRegistryAdapter.getSignal(intent, defaultWalletPolicy);
    expect(signal.status).toBe("WARN");
    expect(signal.reasonCode).toBe("UNKNOWN_INDEXED_CONTRACT_SELECTOR");
  });
});
