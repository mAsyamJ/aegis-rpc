import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getOnChainPolicyHash,
  verifyOnChainPolicyHash,
} from "@/lib/chain/policyVerifier";
import { listPolicies, upsertPolicy, getPolicyHash } from "@/lib/policies";
import type { AegisPolicy } from "@/lib/types";

const policySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mode: z.enum(["observe", "warn", "enforce"]),
  template: z.enum(["wallet", "agent", "defi", "rwa", "treasury", "backend"]),
  chainId: z.number().int().positive(),
  limits: z.record(z.string(), z.number()).optional(),
  rules: z.record(z.string(), z.boolean()).optional(),
  allowlists: z
    .object({
      agents: z.array(z.string()).optional(),
      recipients: z.array(z.string()).optional(),
      spenders: z.array(z.string()).optional(),
      contracts: z.array(z.string()).optional(),
      selectors: z.array(z.string()).optional(),
    })
    .optional(),
  denylists: z
    .object({
      addresses: z.array(z.string()).optional(),
      selectors: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function GET() {
  const policies = await Promise.all(
    listPolicies().map(async (p) => {
      const policyHash = getPolicyHash(p.id);
      let onChainHash: string | null = null;
      let onChainVerified = false;
      try {
        onChainHash = (await getOnChainPolicyHash(p.id)) ?? null;
        if (onChainHash) {
          onChainVerified = await verifyOnChainPolicyHash(
            p.id,
            policyHash as `0x${string}`,
          );
        }
      } catch {
        onChainHash = null;
        onChainVerified = false;
      }
      return {
        ...p,
        policyHash,
        onChainHash,
        onChainVerified,
      };
    })
  );
  return NextResponse.json({ policies });
}

export async function POST(req: Request) {
  let raw: z.infer<typeof policySchema>;
  try {
    raw = policySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid policy" },
      { status: 400 }
    );
  }

  const existing = listPolicies().find((p) => p.id === raw.id);
  const base: AegisPolicy = existing ?? {
    id: raw.id,
    name: raw.name,
    mode: raw.mode,
    template: raw.template,
    chainId: raw.chainId,
    limits: {},
    rules: {
      blockUnlimitedApproval: true,
      requireSpenderAllowlist: true,
      blockUnknownContracts: false,
      requireFreshPrice: false,
      blockSimulationRevert: false,
      flagUnknownSelectors: true,
    },
    allowlists: {
      agents: [],
      recipients: [],
      spenders: [],
      contracts: [],
      selectors: [],
    },
    denylists: { addresses: [], selectors: [] },
  };

  const merged: AegisPolicy = {
    ...base,
    ...raw,
    limits: { ...base.limits, ...(raw.limits ?? {}) },
    rules: { ...base.rules, ...(raw.rules as AegisPolicy["rules"]) },
    allowlists: { ...base.allowlists, ...(raw.allowlists as AegisPolicy["allowlists"]) },
    denylists: { ...base.denylists, ...(raw.denylists as AegisPolicy["denylists"]) },
  };

  upsertPolicy(merged);
  return NextResponse.json({
    policy: merged,
    policyHash: getPolicyHash(merged.id),
  });
}

export async function PUT(req: Request) {
  return POST(req);
}
