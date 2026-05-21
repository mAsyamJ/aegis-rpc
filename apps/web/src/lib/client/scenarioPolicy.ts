export const SCENARIO_POLICY: Record<string, string> = {
  "agent-safe-low-value": "default-agent-policy",
  "agent-over-cap": "default-agent-policy",
  "agent-unknown-selector": "default-agent-policy-warn",
  "agent-stale-feed": "default-agent-policy",
  "wallet-unlimited-approval": "default-wallet-policy",
  "defi-check-swap-deviation": "default-wallet-policy",
};

export function policyIdForScenario(scenarioId: string): string {
  return SCENARIO_POLICY[scenarioId] ?? "default-wallet-policy";
}
