import { decodeFunctionData, maxUint256, type AbiFunction } from "viem";
import { getIndexedContract } from "./abiIndex";

export type IndexerDecodeResult = {
  decodedFunction: string;
  decodedArgs: Record<string, unknown>;
  selector: string;
  contractName: string;
  isUnknownSelector: false;
  isUnlimitedApproval?: boolean;
};

function serializeArgValue(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string" && value.startsWith("0x") && value.length === 42) {
    return value.toLowerCase();
  }
  if (Array.isArray(value)) return value.map(serializeArgValue);
  return value;
}

function argsToRecord(
  abi: readonly AbiFunction[],
  functionName: string,
  args: readonly unknown[],
): Record<string, unknown> {
  const item = abi.find((i) => i.name === functionName);
  if (!item?.inputs?.length) return {};
  const out: Record<string, unknown> = {};
  item.inputs.forEach((input, i) => {
    const key = input.name ?? `arg${i}`;
    out[key] = serializeArgValue(args[i]);
  });
  return out;
}

export function decodeWithIndexer(
  to: `0x${string}`,
  data: `0x${string}`
): IndexerDecodeResult | null {
  const contract = getIndexedContract(to);
  if (!contract || !data || data === "0x" || data.length < 10) return null;

  const selector = data.slice(0, 10).toLowerCase();
  try {
    const decoded = decodeFunctionData({ abi: contract.abi, data });
    const fnAbi = contract.abi.filter(
      (i): i is AbiFunction =>
        i.type === "function" && i.name === decoded.functionName,
    );
    const inputs = fnAbi[0]?.inputs ?? [];
    const canonicalSig = `${decoded.functionName}(${inputs.map((i) => i.type).join(",")})`;
    const decodedFunction = contract.selectors[selector] ?? canonicalSig;

    const decodedArgs = argsToRecord(
      fnAbi,
      decoded.functionName,
      decoded.args ?? [],
    );

    let isUnlimitedApproval: boolean | undefined;
    if (decoded.functionName === "approve" && decoded.args?.[1] !== undefined) {
      isUnlimitedApproval = decoded.args[1] === maxUint256;
    }

    return {
      decodedFunction,
      decodedArgs,
      selector,
      contractName: contract.name,
      isUnknownSelector: false,
      isUnlimitedApproval,
    };
  } catch {
    const knownSig = contract.selectors[selector];
    if (!knownSig) return null;
    return {
      decodedFunction: knownSig,
      decodedArgs: {},
      selector,
      contractName: contract.name,
      isUnknownSelector: false,
    };
  }
}
