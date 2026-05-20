## 12. Simulation Engine Design

```typescript
export class SimulationAdapter implements AegisAdapter {
  name = "simulation";

  supports(intent: TxIntent, policy: AegisPolicy) {
    return Boolean(intent.to) && policy.rules.blockSimulationRevert;
  }

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise {
    const start = Date.now();
    try {
      await publicClient.call({
        account: intent.from, to: intent.to,
        data: intent.data, value: intent.valueWei,
      });
      return { adapter: this.name, status: "OK", message: "Simulation succeeded.", latencyMs: Date.now() - start };
    } catch (err) {
      return { adapter: this.name, status: "WARN", reasonCode: "SIMULATION_REVERT",
               message: `Simulation reverted: ${(err as Error).message?.slice(0, 100)}`,
               data: { error: (err as Error).message }, latencyMs: Date.now() - start };
    }
  }
}
```

**Can detect:** revert, invalid target, insufficient balance, contract call failure.
**Cannot detect:** MEV/sandwich, post-block price movement, complex state diffs, private mempool.

---
