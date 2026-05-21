import { buildBalanceStateOverride } from "@/lib/chain/simulation";
import { forwardRpcCall } from "@/lib/rpc/client";
import type { AegisPolicy, TxIntent } from "@/lib/types";

export type SimulationResult = {
  reverted: boolean;
  message: string;
  hint?: string;
  latencyMs: number;
};

function simulationStateOverride(intent: TxIntent): Record<string, { balance?: `0x${string}` }> | undefined {
  if (!intent.from) return undefined;
  const minBalance = intent.valueWei + BigInt(1e15);
  return buildBalanceStateOverride(intent.from, minBalance);
}

export async function runSimulation(
  intent: TxIntent,
  policy: AegisPolicy
): Promise<SimulationResult> {
  const started = Date.now();
  if (!intent.from || !intent.to) {
    return {
      reverted: false,
      message: "Simulation skipped (incomplete intent)",
      latencyMs: Date.now() - started,
    };
  }

  const stateOverride = simulationStateOverride(intent);
  const callParams: unknown[] = [
    {
      from: intent.from,
      to: intent.to,
      value: `0x${intent.valueWei.toString(16)}`,
      data: intent.data,
    },
    "latest",
  ];
  if (stateOverride) {
    callParams.push(stateOverride);
  }

  try {
    const sim = await forwardRpcCall(null, "eth_call", callParams);
    if ("error" in sim) {
      const message = sim.error.message ?? "eth_call reverted";
      return {
        reverted: true,
        message,
        hint: policy.rules.blockSimulationRevert
          ? "eth_call reverted; stateOverride did not clear revert"
          : undefined,
        latencyMs: Date.now() - started,
      };
    }
    return {
      reverted: false,
      message: stateOverride
        ? "eth_call simulation succeeded (with balance stateOverride)"
        : "eth_call simulation succeeded",
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "simulation reverted";
    return {
      reverted: true,
      message,
      hint: policy.rules.blockSimulationRevert
        ? "eth_call reverted; stateOverride did not clear revert"
        : undefined,
      latencyMs: Date.now() - started,
    };
  }
}
