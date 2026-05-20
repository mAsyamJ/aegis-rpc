import type { TxIntent } from "@/lib/types";

export function classifyUseCase(intent: TxIntent): TxIntent["useCase"] {
  if (intent.decodedFunction === "approve(address,uint256)") return "wallet";
  if (intent.decodedFunction === "transfer(address,uint256)") return "wallet";
  if (intent.decodedFunction === "transferFrom(address,address,uint256)") return "defi";
  if (intent.decodedFunction === "native_transfer") {
    const valueEth = Number(intent.valueWei) / 1e18;
    if (valueEth > 0.1) return "agent";
    return "wallet";
  }
  if (intent.isUnknownSelector) return "unknown";
  return "backend";
}
