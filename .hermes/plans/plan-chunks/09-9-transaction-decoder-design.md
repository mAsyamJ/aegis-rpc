## 9. Transaction Decoder Design

### TxIntent Model

```typescript
export type TxIntent = {
  requestId: string;
  chainId: number;
  method: "eth_sendRawTransaction" | "aegis_preflight" | "aegis_sendTransaction";
  from?: `0x${string}`;
  to?: `0x${string}`;
  valueWei: bigint;
  data: `0x${string}`;
  rawTx?: `0x${string}`;
  selector?: string;
  decodedFunction?: string;
  decodedArgs?: Record;
  useCase?: "wallet" | "agent" | "defi" | "rwa" | "treasury" | "backend" | "unknown";
  isUnknownSelector: boolean;   // NEW: triggers AI UnknownSelectorAnalyzer
  calldataLength: number;       // NEW: helps AI assess complexity
};
```

### Known Selectors

| Selector | Function | Extra detection |
|---|---|---|
| `0x095ea7b3` | `approve(address,uint256)` | Check amount == MaxUint256 |
| `0xa9059cbb` | `transfer(address,uint256)` | Check value vs. policy limit |
| `0x23b872dd` | `transferFrom(address,address,uint256)` | Check all addresses |
| `0x7ff36ab5` | `swapExactETHForTokens(...)` | Uniswap V2 swap |
| `0x38ed1739` | `swapExactTokensForTokens(...)` | Uniswap V2 swap |
| Unknown | Unrecognized | `isUnknownSelector = true` → AI analysis |

### Decoder Pseudocode

```typescript
import { decodeFunctionData, maxUint256 } from 'viem';

export function decodeTxIntent(raw: PreflightRequest): TxIntent {
  const intent: TxIntent = {
    requestId: crypto.randomUUID(),
    chainId: raw.chainId,
    method: "aegis_preflight",
    from: raw.from as `0x${string}`,
    to: raw.to as `0x${string}`,
    valueWei: BigInt(raw.valueWei || "0"),
    data: (raw.data || "0x") as `0x${string}`,
    isUnknownSelector: false,
    calldataLength: raw.data?.length ?? 0,
  };

  if (intent.data.length >= 10) {
    intent.selector = intent.data.slice(0, 10).toLowerCase();
  }

  if (intent.selector === "0x095ea7b3") {
    try {
      const { args } = decodeFunctionData({ abi: erc20Abi, data: intent.data });
      intent.decodedFunction = "approve(address,uint256)";
      intent.decodedArgs = { spender: args[0], amount: (args[1] as bigint).toString() };
    } catch { intent.isUnknownSelector = true; }

  } else if (intent.selector === "0xa9059cbb") {
    try {
      const { args } = decodeFunctionData({ abi: erc20Abi, data: intent.data });
      intent.decodedFunction = "transfer(address,uint256)";
      intent.decodedArgs = { to: args[0], amount: (args[1] as bigint).toString() };
    } catch { intent.isUnknownSelector = true; }

  } else if (intent.selector === "0x23b872dd") {
    try {
      const { args } = decodeFunctionData({ abi: erc20Abi, data: intent.data });
      intent.decodedFunction = "transferFrom(address,address,uint256)";
      intent.decodedArgs = { from: args[0], to: args[1], amount: (args[2] as bigint).toString() };
    } catch { intent.isUnknownSelector = true; }

  } else if (!intent.data || intent.data === "0x") {
    intent.decodedFunction = "native_transfer";
    intent.isUnknownSelector = false;

  } else {
    // Unknown selector — flag for AI analysis
    intent.isUnknownSelector = true;
    intent.decodedFunction = `unknown(${intent.selector})`;
  }

  intent.useCase = classifyUseCase(intent, raw.policyId);
  return intent;
}
```

---
