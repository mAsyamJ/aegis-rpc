## 11. Adapter Layer Design

### Adapter Interface

```typescript
export type AdapterStatus = "OK" | "WARN" | "BLOCK" | "ERROR";

export type AdapterSignal = {
  adapter: string;
  status: AdapterStatus;
  reasonCode?: string;
  message: string;
  data?: Record;
  latencyMs?: number;
};

export interface AegisAdapter {
  name: string;
  supports(intent: TxIntent, policy: AegisPolicy): boolean;
  getSignal(intent: TxIntent, policy: AegisPolicy): Promise;
}
```

### ChainlinkPriceAdapter (MUST)

```typescript
export class ChainlinkPriceAdapter implements AegisAdapter {
  name = "chainlink-price";

  supports(intent: TxIntent, policy: AegisPolicy) {
    return policy.rules.requireFreshPrice;
  }

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise {
    const start = Date.now();
    const feedAddress = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"; // Base Sepolia ETH/USD

    try {
      const [, answer, , updatedAt] = await publicClient.readContract({
        address: feedAddress, abi: aggregatorV3Abi, functionName: "latestRoundData",
      }) as [bigint, bigint, bigint, bigint, bigint];

      const decimals = await publicClient.readContract({
        address: feedAddress, abi: aggregatorV3Abi, functionName: "decimals",
      }) as number;

      const age = Math.floor(Date.now() / 1000) - Number(updatedAt);
      const maxAge = policy.adapters?.chainlinkPrice?.maxAgeSeconds ?? 3600;
      const priceE8 = Number(answer);

      if (priceE8 <= 0) return {
        adapter: this.name, status: "ERROR", reasonCode: "INVALID_PRICE",
        message: "Feed returned non-positive price.", data: { priceE8 }, latencyMs: Date.now() - start,
      };

      if (age > maxAge) return {
        adapter: this.name, status: "BLOCK", reasonCode: "STALE_PRICE_FEED",
        message: `ETH/USD feed stale by ${age}s (max ${maxAge}s). High-value tx blocked.`,
        data: { priceE8, age, maxAge }, latencyMs: Date.now() - start,
      };

      let valueUsd: number | undefined;
      let exceedsLimit = false;
      if (intent.valueWei > 0n) {
        valueUsd = Number(intent.valueWei) / 1e18 * (priceE8 / 1e8);
        const limit = policy.limits.maxNativeTransferUsd ?? policy.limits.maxSingleAgentActionUsd;
        if (limit && valueUsd > limit) exceedsLimit = true;
      }

      return {
        adapter: this.name,
        status: exceedsLimit ? "BLOCK" : "OK",
        reasonCode: exceedsLimit ? "EXCEEDS_USD_LIMIT" : undefined,
        message: exceedsLimit
          ? `Action value $${valueUsd?.toFixed(2)} exceeds policy limit $${policy.limits.maxSingleAgentActionUsd}`
          : `ETH/USD: $${(priceE8/1e8).toFixed(2)}, feed age: ${age}s`,
        data: { priceE8, age, decimals, valueUsd, feedAddress },
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return { adapter: this.name, status: "ERROR", reasonCode: "FEED_READ_ERROR",
               message: `Failed to read Chainlink feed: ${(err as Error).message}`,
               latencyMs: Date.now() - start };
    }
  }
}
```

### ApprovalRiskAdapter (MUST)

```typescript
export class ApprovalRiskAdapter implements AegisAdapter {
  name = "approval-risk";

  supports(intent: TxIntent) { return intent.selector === "0x095ea7b3"; }

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise {
    const amount = BigInt(intent.decodedArgs?.amount as string ?? "0");
    const spender = (intent.decodedArgs?.spender as string ?? "").toLowerCase() as `0x${string}`;
    const isUnlimited = amount === maxUint256;
    const isAllowlisted = policy.allowlists.spenders.map(s => s.toLowerCase()).includes(spender);

    if (isUnlimited && !isAllowlisted && policy.rules.blockUnlimitedApproval) {
      return { adapter: this.name, status: "BLOCK",
               reasonCode: "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
               message: `MaxUint256 approval to non-allowlisted spender ${spender}`,
               data: { spender, isUnlimited, isAllowlisted } };
    }
    if (isUnlimited && isAllowlisted) {
      return { adapter: this.name, status: "WARN",
               reasonCode: "UNLIMITED_APPROVAL_ALLOWLISTED",
               message: `MaxUint256 approval to allowlisted spender ${spender} — review recommended`,
               data: { spender, isAllowlisted } };
    }
    return { adapter: this.name, status: "OK", message: "Approval within policy." };
  }
}
```

---
