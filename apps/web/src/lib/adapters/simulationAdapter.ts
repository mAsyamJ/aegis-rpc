import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";
import { forwardRpcCall } from "@/lib/rpc/client";

const TRANSFER_SELECTOR = "0xa9059cbb";

export const simulationAdapter: AegisAdapter = {
  name: "SimulationAdapter",

  supports(_intent: TxIntent, policy: AegisPolicy): boolean {
    return policy.rules.blockSimulationRevert;
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    if (intent.selector === TRANSFER_SELECTOR) {
      return {
        adapter: "SimulationAdapter",
        status: "OK",
        message: "Simulation skipped for ERC20 transfer (preflight intent only)",
        latencyMs: Date.now() - started,
      };
    }
    if (!intent.from || !intent.to) {
      return {
        adapter: "SimulationAdapter",
        status: "OK",
        message: "Simulation skipped (incomplete intent)",
        latencyMs: Date.now() - started,
      };
    }

    try {
      await forwardRpcCall("eth_call", [
        {
          from: intent.from,
          to: intent.to,
          value: `0x${intent.valueWei.toString(16)}`,
          data: intent.data,
        },
        "latest",
      ]);
      return {
        adapter: "SimulationAdapter",
        status: "OK",
        message: "eth_call simulation succeeded",
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "simulation reverted";
      return {
        adapter: "SimulationAdapter",
        status: policy.rules.blockSimulationRevert ? "BLOCK" : "WARN",
        reasonCode: "SIMULATION_REVERT",
        message,
        latencyMs: Date.now() - started,
      };
    }
  },
};
