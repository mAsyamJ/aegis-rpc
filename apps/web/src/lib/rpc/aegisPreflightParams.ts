import { z } from "zod";

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const aegisPreflightParamSchema = z.object({
  chainId: z.number().int().positive(),
  from: address.optional(),
  to: address.optional(),
  valueWei: z.string().optional(),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/).optional(),
  policyId: z.string().optional(),
  serializedTransaction: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/)
    .optional(),
});

export const aegisSendTransactionParamSchema = z.object({
  requestId: z.string().min(1),
  override: z.boolean().optional(),
  overrideWarn: z.boolean().optional(),
});

export function parseAegisPreflightParams(params: unknown[]): z.infer<
  typeof aegisPreflightParamSchema
> {
  const first = params[0];
  return aegisPreflightParamSchema.parse(first);
}

export function parseAegisSendParams(params: unknown[]): z.infer<
  typeof aegisSendTransactionParamSchema
> {
  const first = params[0];
  return aegisSendTransactionParamSchema.parse(first);
}
