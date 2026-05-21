import { z } from "zod";
import type { PreflightRequest } from "@/lib/types";

const hex = z.string().regex(/^0x[a-fA-F0-9]*$/);
const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/i);

/** ERC-4337 UserOperation (bundler-spec subset). */
export const userOperationSchema = z.object({
  sender: address,
  nonce: hex,
  initCode: hex.optional().default("0x"),
  callData: hex,
  callGasLimit: hex,
  verificationGasLimit: hex,
  preVerificationGas: hex,
  maxFeePerGas: hex,
  maxPriorityFeePerGas: hex,
  paymasterAndData: hex.optional().default("0x"),
  signature: hex.optional().default("0x"),
});

export type UserOperationWire = z.infer<typeof userOperationSchema>;

export type UserOpScreeningInput = {
  chainId: number;
  userOperation: UserOperationWire;
  entryPoint?: string;
  policyId?: string;
};

export function parseUserOpPreflightParams(params: unknown[]): UserOpScreeningInput {
  const first = params[0];
  const parsed = z
    .object({
      chainId: z.number().int().positive(),
      userOperation: userOperationSchema,
      entryPoint: address.optional(),
      policyId: z.string().optional(),
    })
    .parse(first);
  return parsed;
}

/** Map UserOp callData into a preflight-shaped request for the screening pipeline. */
export function userOpToPreflightRequest(input: UserOpScreeningInput): PreflightRequest {
  const op = input.userOperation;
  return {
    chainId: input.chainId,
    from: op.sender,
    to: input.entryPoint ?? op.sender,
    valueWei: "0",
    data: op.callData,
    policyId: input.policyId ?? "default-aa-policy",
  };
}

export function decodeUserOpSummary(op: UserOperationWire): {
  sender: string;
  hasPaymaster: boolean;
  callDataLength: number;
} {
  return {
    sender: op.sender,
    hasPaymaster: (op.paymasterAndData ?? "0x").length > 2,
    callDataLength: (op.callData.length - 2) / 2,
  };
}
