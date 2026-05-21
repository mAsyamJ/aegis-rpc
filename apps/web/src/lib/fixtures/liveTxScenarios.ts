import type { Verdict } from "@/lib/types/aegis";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/chain/addresses";
import {
  DEFI_CHECK_SWAP_DEVIATION_DATA,
  DEFI_POLICY_APP,
  DEMO_ERC20,
  WALLET_HIGH_ALLOWANCE_APPROVE_DATA,
  WALLET_UNLIMITED_APPROVE_DATA,
} from "./liveCalldata";

const DEMO_FROM = "0x1234567890123456789012345678901234567890";

export type LiveTxScenario = {
  id: "live-safe-defi" | "live-warn-high-allowance" | "live-block-unlimited-approve";
  title: string;
  summary: string;
  policyId: string;
  expectedVerdict: Verdict;
  expectedReasonCode: string;
  audience: "live";
  buildPreflightBody: (from?: string) => {
    chainId: number;
    from: string;
    to: string;
    data: string;
    valueWei: string;
    policyId: string;
  };
};

export const liveTxScenarios: LiveTxScenario[] = [
  {
    id: "live-safe-defi",
    title: "SAFE — benign DeFi check",
    summary:
      "checkSwapDeviation on deployed DeFiUseCasePolicyApp — indexed decode, policy passes.",
    policyId: "default-wallet-policy",
    expectedVerdict: "SAFE",
    expectedReasonCode: "ALL_CHECKS_PASSED",
    audience: "live",
    buildPreflightBody: (from = DEMO_FROM) => ({
      chainId: BASE_SEPOLIA_CHAIN_ID,
      from,
      to: DEFI_POLICY_APP,
      data: DEFI_CHECK_SWAP_DEVIATION_DATA,
      valueWei: "0",
      policyId: "default-wallet-policy",
    }),
  },
  {
    id: "live-warn-high-allowance",
    title: "WARN — high allowance approval",
    summary:
      "approve(DemoSpender, high finite amount) on DemoERC20 — not unlimited, exceeds high-allowance threshold.",
    policyId: "default-wallet-policy",
    expectedVerdict: "WARN",
    expectedReasonCode: "HIGH_ALLOWANCE",
    audience: "live",
    buildPreflightBody: (from = DEMO_FROM) => ({
      chainId: BASE_SEPOLIA_CHAIN_ID,
      from,
      to: DEMO_ERC20,
      data: WALLET_HIGH_ALLOWANCE_APPROVE_DATA,
      valueWei: "0",
      policyId: "default-wallet-policy",
    }),
  },
  {
    id: "live-block-unlimited-approve",
    title: "BLOCK — malicious unlimited approve",
    summary:
      "approve(DemoSpender, MaxUint256) on DemoERC20 — unknown spender pattern blocked before broadcast.",
    policyId: "default-wallet-policy",
    expectedVerdict: "BLOCK",
    expectedReasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
    audience: "live",
    buildPreflightBody: (from = DEMO_FROM) => ({
      chainId: BASE_SEPOLIA_CHAIN_ID,
      from,
      to: DEMO_ERC20,
      data: WALLET_UNLIMITED_APPROVE_DATA,
      valueWei: "0",
      policyId: "default-wallet-policy",
    }),
  },
];

export function getLiveScenario(
  id: LiveTxScenario["id"],
): LiveTxScenario | undefined {
  return liveTxScenarios.find((s) => s.id === id);
}
