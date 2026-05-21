import type { AegisAdapter } from "./types";
import { runSimulation } from "@/lib/engine/simulationEngine";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

export const simulationAdapter: AegisAdapter = {
  name: "SimulationAdapter",

  supports(_intent: TxIntent, policy: AegisPolicy): boolean {
    return policy.rules.blockSimulationRevert;
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const result = await runSimulation(intent, policy);
    if (!result.reverted) {
      return {
        adapter: "SimulationAdapter",
        status: "OK",
        message: result.message,
        latencyMs: result.latencyMs,
      };
    }
    return {
      adapter: "SimulationAdapter",
      status: policy.rules.blockSimulationRevert ? "BLOCK" : "WARN",
      reasonCode: "SIMULATION_REVERT",
      message: result.message,
      data: result.hint ? { simulationHint: result.hint } : undefined,
      latencyMs: result.latencyMs,
    };
  },
};
