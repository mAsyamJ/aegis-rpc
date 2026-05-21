import { decodeFunctionData, maxUint256 } from "viem";
import type { InnerCallSummary } from "@/lib/types";
import { decodeWithIndexer } from "@/lib/indexer/decodeWithIndexer";
import { lookupKnownSelector } from "./knownSelectors";

const APPROVE_SELECTOR = "0x095ea7b3";
const TRANSFER_SELECTOR = "0xa9059cbb";
const TRANSFER_FROM_SELECTOR = "0x23b872dd";
export const MULTICALL_SELECTOR = "0xac9650d8";
export const SAFE_EXEC_SELECTOR = "0x6a761202";

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

const multicallAbi = [
  {
    type: "function",
    name: "multicall",
    inputs: [{ name: "data", type: "bytes[]" }],
  },
] as const;

const safeExecAbi = [
  {
    type: "function",
    name: "execTransaction",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "operation", type: "uint8" },
      { name: "safeTxGas", type: "uint256" },
      { name: "baseGas", type: "uint256" },
      { name: "gasPrice", type: "uint256" },
      { name: "gasToken", type: "address" },
      { name: "refundReceiver", type: "address" },
      { name: "signatures", type: "bytes" },
    ],
  },
] as const;

/** High finite allowance threshold (wallet-guard style WARN). */
export const HIGH_ALLOWANCE_WEI = BigInt("1000000000000000000000000");

export function decodeInnerCallSummary(
  data: `0x${string}`,
  to?: `0x${string}`
): InnerCallSummary {
  if (!data || data === "0x" || data.length < 10) {
    return { isUnknownSelector: true, decodedFunction: "empty" };
  }
  const selector = data.slice(0, 10).toLowerCase();

  if (to) {
    const indexed = decodeWithIndexer(to, data);
    if (indexed) {
      return {
        selector,
        decodedFunction: indexed.decodedFunction,
        isUnlimitedApproval: indexed.isUnlimitedApproval,
        isUnknownSelector: false,
      };
    }
  }

  if (selector === APPROVE_SELECTOR) {
    const decoded = decodeFunctionData({ abi: erc20Abi, data });
    const args = decoded.args as readonly [`0x${string}`, bigint];
    const unlimited = args[1] === maxUint256;
    return {
      selector,
      decodedFunction: "approve(address,uint256)",
      isUnlimitedApproval: unlimited,
      isUnknownSelector: false,
    };
  }
  if (selector === TRANSFER_SELECTOR || selector === TRANSFER_FROM_SELECTOR) {
    return {
      selector,
      decodedFunction:
        selector === TRANSFER_SELECTOR
          ? "transfer(address,uint256)"
          : "transferFrom(address,address,uint256)",
      isUnknownSelector: false,
    };
  }
  const known = lookupKnownSelector(selector);
  if (known) {
    return {
      selector,
      decodedFunction: known.signature,
      isUnknownSelector: false,
    };
  }
  return {
    selector,
    decodedFunction: `unknown(${selector})`,
    isUnknownSelector: true,
  };
}

export function unwrapMulticallInnerCalls(data: `0x${string}`): InnerCallSummary[] {
  try {
    const decoded = decodeFunctionData({ abi: multicallAbi, data });
    const raw = decoded.args?.[0];
    if (!raw || !Array.isArray(raw)) return [];
    const payloads = raw as readonly `0x${string}`[];
    return payloads.map((payload) => decodeInnerCallSummary(payload));
  } catch {
    return [];
  }
}

export function pickWorstInnerCall(inners: InnerCallSummary[]): InnerCallSummary | undefined {
  const risky = inners.find((c) => c.isUnlimitedApproval);
  if (risky) return risky;
  const unknown = inners.find((c) => c.isUnknownSelector);
  return unknown ?? inners[0];
}

export function tryDecodeSafeInner(data: `0x${string}`): {
  to?: `0x${string}`;
  valueWei: bigint;
  data: `0x${string}`;
} | undefined {
  if (data.length < 10 || data.slice(0, 10).toLowerCase() !== SAFE_EXEC_SELECTOR) {
    return undefined;
  }
  try {
    const decoded = decodeFunctionData({ abi: safeExecAbi, data });
    const args = decoded.args as readonly [
      `0x${string}`,
      bigint,
      `0x${string}`,
      number,
      bigint,
      bigint,
      bigint,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
    ];
    return {
      to: args[0],
      valueWei: args[1],
      data: args[2],
    };
  } catch {
    return undefined;
  }
}

export function decodeErc20ApproveFields(data: `0x${string}`): {
  spender?: `0x${string}`;
  amount?: bigint;
  isUnlimitedApproval?: boolean;
  isHighAllowance?: boolean;
} {
  if (data.slice(0, 10).toLowerCase() !== APPROVE_SELECTOR) return {};
  try {
    const decoded = decodeFunctionData({ abi: erc20Abi, data });
    const args = decoded.args as readonly [`0x${string}`, bigint];
    const unlimited = args[1] === maxUint256;
    return {
      spender: args[0],
      amount: args[1],
      isUnlimitedApproval: unlimited,
      isHighAllowance: !unlimited && args[1] >= HIGH_ALLOWANCE_WEI,
    };
  } catch {
    return {};
  }
}
