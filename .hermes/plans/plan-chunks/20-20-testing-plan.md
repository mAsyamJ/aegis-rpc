## 20. Testing Plan

### Unit tests

| Test | Expected |
|---|---|
| decode native transfer | `decodedFunction = native_transfer` |
| decode ERC20 approve | spender and amount extracted |
| detect MaxUint256 | `isUnlimited = true` |
| unknown selector | `isUnknownSelector = true` |
| approval risk adapter | BLOCK for unknown MaxUint256 spender |
| Chainlink adapter | OK for fresh positive feed |
| stale feed signal | BLOCK or WARN depending policy |
| finalize verdict | hard BLOCK wins in enforce mode |
| warn mode | BLOCK signal becomes WARN |
| AI fallback | memo returned without provider |

### API tests

```bash
# passthrough
curl -s -X POST http://localhost:3000/api/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' | jq

# approval block
curl -s -X POST http://localhost:3000/api/preflight \
  -H "Content-Type: application/json" \
  -d '{
    "chainId":84532,
    "from":"0x0000000000000000000000000000000000000001",
    "to":"0x0000000000000000000000000000000000000002",
    "valueWei":"0",
    "data":"0x095ea7b30000000000000000000000000000000000000000000000000000000000000003ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "policyId":"default-wallet-policy"
  }' | jq

# events
curl -s http://localhost:3000/api/events | jq
```

### Contract tests

```bash
cd contracts
forge test -vv
```

Must include:

```text
AegisPolicyRegistry.t.sol
- registerPolicy stores owner/hash/metadata
- duplicate register reverts
- update by owner works
- update by non-owner reverts
- deactivate prevents getPolicyHash
- verifyHash returns true/false correctly

ChainlinkFeedConsumer.t.sol
- normalizes decimals to E8
- rejects zero/negative price
- rejects stale price
- converts wei to USD E8

DemoERC20.t.sol
- approve emits allowance
- spender can transferFrom after approval
```

### Demo acceptance tests

| Scenario | Expected screen |
|---|---|
| `eth_blockNumber` passthrough | block result returned |
| safe low-value preflight | SAFE, green card |
| `$5K` agent action with `$500` policy cap | BLOCK, Chainlink signal visible |
| policy mode enforce to warn | same action becomes WARN |
| WARN override | tx hash or simulated forwarded state |
| unlimited approval | BLOCK, approval-risk signal visible |
| dashboard | all events visible with memo/status |
| contract registry | BaseScan link opens deployed registry |

---
