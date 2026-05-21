import type { AegisPolicy as BackendPolicy } from "@/lib/types";
import type { AegisPolicy as UiPolicy } from "@/lib/types/aegis";

const TEMPLATE_AUDIENCE: Record<BackendPolicy["template"], UiPolicy["audience"]> = {
  wallet: "wallet",
  agent: "agent",
  defi: "defi",
  rwa: "rwa",
  treasury: "rwa",
  backend: "backend",
};

export function mapPolicyToUi(
  p: BackendPolicy & {
    policyHash?: string;
    onChainHash?: string | null;
    onChainVerified?: boolean;
  }
): UiPolicy {
  const audience = TEMPLATE_AUDIENCE[p.template] ?? "wallet";
  return {
    id: p.id,
    name: p.name,
    audience,
    mode: p.mode,
    description: `${p.name} — deterministic ${p.template} policy on Base Sepolia.`,
    limits: Object.entries(p.limits).map(([name, value]) => ({
      name,
      value: String(value),
    })),
    allowlists: [
      {
        name: "Selectors",
        entries: p.allowlists.selectors.length
          ? p.allowlists.selectors
          : ["(none configured)"],
      },
      {
        name: "Spenders",
        entries: p.allowlists.spenders.length
          ? p.allowlists.spenders
          : ["(none configured)"],
      },
    ],
    rules: [
      {
        id: "r1",
        description: p.rules.blockUnlimitedApproval
          ? "Block unlimited ERC20 approvals"
          : "Warn on unlimited approvals",
        severity: p.rules.blockUnlimitedApproval ? "BLOCK" : "WARN",
      },
      {
        id: "r2",
        description: p.rules.requireFreshPrice
          ? "Require fresh Chainlink price"
          : "Chainlink optional",
        severity: p.rules.requireFreshPrice ? "BLOCK" : "WARN",
      },
      {
        id: "r3",
        description: p.rules.flagUnknownSelectors
          ? "Flag unknown selectors"
          : "Ignore unknown selectors",
        severity: "WARN",
      },
    ],
    policyHash: p.policyHash ?? "0x0",
    onChainHash: p.onChainHash ?? undefined,
    onChainVerified: p.onChainVerified,
    updatedAt: new Date().toISOString(),
  };
}

export function basescanUrl(addressOrHash: string): string {
  const base =
    process.env.NEXT_PUBLIC_BASESCAN_URL ?? "https://sepolia.basescan.org";
  if (addressOrHash.startsWith("0x") && addressOrHash.length === 66) {
    return `${base}/tx/${addressOrHash}`;
  }
  if (addressOrHash.startsWith("0x") && addressOrHash.length === 42) {
    return `${base}/address/${addressOrHash}`;
  }
  return base;
}
