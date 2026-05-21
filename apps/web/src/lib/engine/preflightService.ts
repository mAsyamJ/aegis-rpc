import { z } from "zod";
import { parseTransaction, type Hex } from "viem";
import { runScreening } from "@/lib/engine/screeningPipeline";
import type { PreflightRequest } from "@/lib/types";

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const preflightSchema = z
  .object({
    serializedTransaction: z
      .string()
      .regex(/^0x[0-9a-fA-F]+$/)
      .optional(),
    chainId: z.number().int().positive().optional(),
    from: address.optional(),
    to: address.optional(),
    valueWei: z.string().optional(),
    data: z.string().regex(/^0x[a-fA-F0-9]*$/).optional(),
    policyId: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.serializedTransaction) return;
    if (val.chainId === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "chainId is required when serializedTransaction is omitted",
        path: ["chainId"],
      });
    }
  });

export type PreflightWireBody = z.infer<typeof preflightSchema>;

/** Expands optional `serializedTransaction` (viem parseTransaction) into a PreflightRequest. */
export function toPreflightRequest(body: PreflightWireBody): PreflightRequest {
  if (!body.serializedTransaction) {
    return {
      chainId: body.chainId!,
      from: body.from,
      to: body.to,
      valueWei: body.valueWei,
      data: body.data,
      policyId: body.policyId,
    };
  }

  let parsed: ReturnType<typeof parseTransaction>;
  try {
    parsed = parseTransaction(body.serializedTransaction as Hex);
  } catch {
    throw new Error("Invalid serializedTransaction");
  }

  if (parsed.chainId === undefined) {
    throw new Error("serializedTransaction must include chainId (EIP-155)");
  }

  const value =
    "value" in parsed && parsed.value !== undefined
      ? parsed.value.toString()
      : body.valueWei ?? "0";
  const data =
    "data" in parsed && parsed.data !== undefined && parsed.data !== "0x"
      ? parsed.data
      : body.data ?? "0x";
  const toAddr =
    "to" in parsed && parsed.to !== undefined && parsed.to !== null
      ? (parsed.to as string)
      : body.to;

  return {
    chainId: Number(parsed.chainId),
    from: body.from,
    to: toAddr,
    valueWei: value,
    data,
    policyId: body.policyId,
    serializedTransaction: body.serializedTransaction,
  };
}

export async function runPreflight(input: PreflightRequest) {
  return runScreening(input);
}
