import { decodeFunctionData, maxUint256 } from "viem";
import type { PreflightRequest, TxIntent } from "@/lib/types";

const APPROVE_SELECTOR = "0x095ea7b3";
const TRANSFER_SELECTOR = "0xa9059cbb";
const TRANSFER_FROM_SELECTOR = "0x23b872dd";

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
] as const;

function newRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeAddress(addr?: string): `0x${string}` | undefined {
  if (!addr) return undefined;
  return addr.toLowerCase() as `0x${string}`;
}

export function decodeTxIntent(
  input: PreflightRequest,
  requestId = newRequestId()
): TxIntent {
  const data = (input.data ?? "0x") as `0x${string}`;
  const intent: TxIntent = {
    requestId,
    chainId: input.chainId,
    method: "aegis_preflight",
    from: normalizeAddress(input.from),
    to: normalizeAddress(input.to),
    valueWei: BigInt(input.valueWei ?? "0"),
    data,
    selector: data.length >= 10 ? data.slice(0, 10).toLowerCase() : undefined,
    isUnknownSelector: false,
    calldataLength: data === "0x" ? 0 : (data.length - 2) / 2,
    useCase: "wallet",
  };

  if (!intent.data || intent.data === "0x") {
    intent.decodedFunction = "native_transfer";
    return intent;
  }

  if (intent.selector === APPROVE_SELECTOR) {
    const decoded = decodeFunctionData({ abi: erc20Abi, data: intent.data });
    const args = decoded.args as readonly [`0x${string}`, bigint];
    const spender = args[0];
    const amount = args[1];
    intent.decodedFunction = "approve(address,uint256)";
    intent.decodedArgs = {
      spender,
      amount: amount.toString(),
    };
    intent.isUnlimitedApproval = amount === maxUint256;
    return intent;
  }

  if (intent.selector === TRANSFER_SELECTOR) {
    const decoded = decodeFunctionData({ abi: erc20Abi, data: intent.data });
    const args = decoded.args as readonly [`0x${string}`, bigint];
    intent.decodedFunction = "transfer(address,uint256)";
    intent.decodedArgs = {
      to: args[0],
      amount: args[1].toString(),
    };
    return intent;
  }

  if (intent.selector === TRANSFER_FROM_SELECTOR) {
    const decoded = decodeFunctionData({ abi: erc20Abi, data: intent.data });
    const args = decoded.args as readonly [`0x${string}`, `0x${string}`, bigint];
    intent.decodedFunction = "transferFrom(address,address,uint256)";
    intent.decodedArgs = {
      from: args[0],
      to: args[1],
      amount: args[2].toString(),
    };
    return intent;
  }

  intent.decodedFunction = `unknown(${intent.selector})`;
  intent.isUnknownSelector = true;
  return intent;
}
