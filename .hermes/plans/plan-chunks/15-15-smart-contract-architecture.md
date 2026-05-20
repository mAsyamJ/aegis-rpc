## 15. Smart Contract Architecture

> **Complete redesign.** v3 said "Decision: CUT for MVP." That was wrong. At a Web3 conference hackathon, "What's on-chain?" is the first technical question. `AegisPolicyRegistry.sol` answers it: policy commitments are on-chain, verifiable on the explorer, timestamped before any transaction was screened. That's a qualitatively different trust model from a centralized API.

### Why Contracts Matter

**Auditability:** "This BLOCK verdict was produced by policy hash `0xabc123`, registered on-chain at block 12345, before the transaction at block 12350." You can verify this on the explorer.

**Chainlink proof on-chain:** `ChainlinkFeedConsumer.sol` shows the adapter pattern in Solidity — same logic as the TypeScript adapter, deployed and verifiable.

**Web3 completeness:** Judges at SEABW 2026 are builders. They'll look for deployed addresses.

### Contract Priority Stack

| Contract | Priority | Est. Lines | Est. Time | Purpose |
|---|---|---|---|---|
| `AegisPolicyRegistry.sol` | **MUST** | ~80 | 45min | Policy hash store + events |
| `ChainlinkFeedConsumer.sol` | **MUST** | ~60 | 30min | On-chain AggregatorV3 reader, base for use-case contracts |
| `DemoERC20.sol` | **SHOULD** | ~35 | 15min | Real deployed token for approval demo |
| `DemoSpender.sol` | **SHOULD** | ~20 | 10min | Real unknown spender for BLOCK demo |
| `AgentUseCasePolicyApp.sol` | **STRETCH** | ~100 | 60min | Agent policy enforcement on-chain |
| `DeFiUseCasePolicyApp.sol` | **STRETCH** | ~80 | 60min | Swap deviation guard |
| `RWAUseCasePolicyApp.sol` | **STRETCH** | ~70 | 60min | NAV-sensitive policy |

### Interfaces

```solidity
// src/interfaces/IAggregatorV3.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAggregatorV3 {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}
```

```solidity
// src/interfaces/IAegisPolicyRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAegisPolicyRegistry {
    function registerPolicy(bytes32 policyId, bytes32 policyHash, string calldata metadataURI) external;
    function updatePolicy(bytes32 policyId, bytes32 newHash, string calldata metadataURI) external;
    function getPolicy(bytes32 policyId) external view returns (
        address owner, bytes32 policyHash, string memory metadataURI, uint256 updatedAt, bool active
    );
    function getPolicyHash(bytes32 policyId) external view returns (bytes32);
    function verifyHash(bytes32 policyId, bytes32 hash) external view returns (bool);
}
```

### Contract 1: AegisPolicyRegistry.sol (MUST)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAegisPolicyRegistry.sol";

/// @title AegisPolicyRegistry
/// @notice On-chain store for Aegis policy commitments.
/// @dev policyHash = keccak256(abi.encodePacked(JSON.stringify(policy config)))
///      Backend reads this hash to prove a policy configuration existed
///      on-chain before a transaction was screened against it.
contract AegisPolicyRegistry is IAegisPolicyRegistry {

    struct PolicyRecord {
        address owner;
        bytes32 policyHash;
        string  metadataURI;   // IPFS or off-chain doc link
        uint256 updatedAt;
        bool    active;
    }

    mapping(bytes32 => PolicyRecord) public policies;

    event PolicyRegistered(
        bytes32 indexed policyId,
        address indexed owner,
        bytes32 policyHash,
        string  metadataURI,
        uint256 timestamp
    );

    event PolicyUpdated(
        bytes32 indexed policyId,
        bytes32 oldHash,
        bytes32 newHash,
        string  metadataURI,
        uint256 timestamp
    );

    event PolicyDeactivated(bytes32 indexed policyId, uint256 timestamp);

    error PolicyAlreadyExists(bytes32 policyId);
    error PolicyNotFound(bytes32 policyId);
    error NotPolicyOwner(bytes32 policyId, address caller);
    error PolicyNotActive(bytes32 policyId);

    function registerPolicy(
        bytes32 policyId,
        bytes32 policyHash,
        string calldata metadataURI
    ) external {
        if (policies[policyId].owner != address(0)) revert PolicyAlreadyExists(policyId);
        policies[policyId] = PolicyRecord({
            owner: msg.sender, policyHash: policyHash,
            metadataURI: metadataURI, updatedAt: block.timestamp, active: true
        });
        emit PolicyRegistered(policyId, msg.sender, policyHash, metadataURI, block.timestamp);
    }

    function updatePolicy(
        bytes32 policyId,
        bytes32 newHash,
        string calldata metadataURI
    ) external {
        PolicyRecord storage r = policies[policyId];
        if (r.owner == address(0)) revert PolicyNotFound(policyId);
        if (r.owner != msg.sender) revert NotPolicyOwner(policyId, msg.sender);
        bytes32 oldHash = r.policyHash;
        r.policyHash = newHash;
        r.metadataURI = metadataURI;
        r.updatedAt = block.timestamp;
        emit PolicyUpdated(policyId, oldHash, newHash, metadataURI, block.timestamp);
    }

    function deactivatePolicy(bytes32 policyId) external {
        PolicyRecord storage r = policies[policyId];
        if (r.owner != msg.sender) revert NotPolicyOwner(policyId, msg.sender);
        r.active = false;
        emit PolicyDeactivated(policyId, block.timestamp);
    }

    function getPolicy(bytes32 policyId) external view returns (
        address owner, bytes32 policyHash, string memory metadataURI, uint256 updatedAt, bool active
    ) {
        PolicyRecord storage r = policies[policyId];
        return (r.owner, r.policyHash, r.metadataURI, r.updatedAt, r.active);
    }

    function getPolicyHash(bytes32 policyId) external view returns (bytes32) {
        if (!policies[policyId].active) revert PolicyNotActive(policyId);
        return policies[policyId].policyHash;
    }

    function verifyHash(bytes32 policyId, bytes32 hash) external view returns (bool) {
        return policies[policyId].policyHash == hash && policies[policyId].active;
    }
}
```

### Contract 2: ChainlinkFeedConsumer.sol (MUST)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAggregatorV3.sol";

/// @title ChainlinkFeedConsumer
/// @notice Base contract for reading Chainlink AggregatorV3 feeds.
/// @dev Normalizes any decimals feed to E8 (8 decimal places).
///      Inherited by AgentUseCasePolicyApp, DeFiUseCasePolicyApp, RWAUseCasePolicyApp.
///      Mirrors the TypeScript ChainlinkPriceAdapter logic.
contract ChainlinkFeedConsumer {

    error InvalidPrice(address feed, int256 answer);
    error StalePrice(address feed, uint256 age, uint256 maxAge);

    struct PriceData {
        uint256 priceE8;
        uint256 updatedAt;
        uint8   decimals;
        uint256 ageSeconds;
    }

    /// @notice Read a price feed and return normalized E8 price.
    function readPriceE8(
        address feed,
        uint256 maxAgeSeconds
    ) public view returns (PriceData memory data) {
        (, int256 answer, , uint256 updatedAt, ) = IAggregatorV3(feed).latestRoundData();

        if (answer <= 0) revert InvalidPrice(feed, answer);

        uint256 age = block.timestamp - updatedAt;
        if (age > maxAgeSeconds) revert StalePrice(feed, age, maxAgeSeconds);

        uint8  dec = IAggregatorV3(feed).decimals();
        uint256 raw = uint256(answer);

        uint256 priceE8;
        if      (dec == 8) { priceE8 = raw; }
        else if (dec >  8) { priceE8 = raw / (10 ** (dec - 8)); }
        else               { priceE8 = raw * (10 ** (8 - dec)); }

        return PriceData({ priceE8: priceE8, updatedAt: updatedAt, decimals: dec, ageSeconds: age });
    }

    /// @notice Convert wei to USD value (E8 format).
    function weiToUsdE8(uint256 valueWei, uint256 ethUsdE8) public pure returns (uint256) {
        return (valueWei * ethUsdE8) / 1e18;
    }
}
```

### Contract 3: DemoERC20.sol (SHOULD)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DemoERC20
/// @notice Mintable ERC20 for Aegis hackathon demo.
/// @dev Used in approve(DemoSpender, MaxUint256) → BLOCK demo scenario.
contract DemoERC20 {
    string public name     = "Aegis Demo Token";
    string public symbol   = "AEGIS";
    uint8  public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() { _mint(msg.sender, 1_000_000 * 1e18); }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount; balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount); return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount); return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount; balanceOf[to] += amount;
        emit Transfer(from, to, amount); return true;
    }

    function mint(address to, uint256 amount) external { _mint(to, amount); }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount; balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}
```

### Contract 4: DemoSpender.sol (SHOULD)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DemoSpender
/// @notice Unknown spender contract for Aegis approval-block demo.
/// @dev This contract is deployed to a non-allowlisted address.
///      When a user tries approve(DemoSpender, MaxUint256), Aegis BLOCKs it
///      because DemoSpender is not on the policy spender allowlist.
///      This contract intentionally has minimal logic — it exists to be a
///      realistic-looking contract address for the demo.
contract DemoSpender {
    address public immutable token;
    mapping(address => uint256) public pulled;
    event TokensPulled(address indexed from, uint256 amount);

    constructor(address _token) { token = _token; }

    /// @notice In the demo, Aegis blocks approve() before this is ever called.
    function pullTokens(address from, uint256 amount) external {
        pulled[from] += amount;
        emit TokensPulled(from, amount);
    }
}
```

### Contract 5: AgentUseCasePolicyApp.sol (STRETCH)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ChainlinkFeedConsumer.sol";

/// @title AgentUseCasePolicyApp
/// @notice On-chain agent policy enforcement: verify agent, check max USD, verify target.
/// @dev Mirrors the TypeScript agent policy template. Backend can call checkNativeTransfer
///      to verify the same policy exists on-chain.
contract AgentUseCasePolicyApp is ChainlinkFeedConsumer {

    struct AgentPolicy {
        bool    active;
        uint256 maxTxUsdE8;
        uint256 maxAgeSeconds;
        address ethUsdFeed;
    }

    mapping(address => AgentPolicy) public agentPolicies;
    mapping(address => bool)        public approvedTargets;
    mapping(bytes4  => bool)        public approvedSelectors;

    event AgentPolicySet(address indexed agent, uint256 maxTxUsdE8);

    error NoAgentPolicy(address agent);
    error TargetNotApproved(address target);
    error SelectorNotApproved(bytes4 selector);
    error ExceedsPerActionLimit(uint256 usdE8, uint256 limitE8);

    function setAgentPolicy(
        address agent, uint256 maxTxUsdE8, uint256 maxAgeSeconds, address ethUsdFeed
    ) external {
        agentPolicies[agent] = AgentPolicy({
            active: true, maxTxUsdE8: maxTxUsdE8, maxAgeSeconds: maxAgeSeconds, ethUsdFeed: ethUsdFeed
        });
        emit AgentPolicySet(agent, maxTxUsdE8);
    }

    function setApprovedTarget(address target, bool approved) external { approvedTargets[target] = approved; }
    function setApprovedSelector(bytes4 selector, bool approved) external { approvedSelectors[selector] = approved; }

    function checkNativeTransfer(address agent, address target, uint256 valueWei)
        external view returns (bool ok, uint256 usdValueE8)
    {
        AgentPolicy memory policy = agentPolicies[agent];
        if (!policy.active) revert NoAgentPolicy(agent);
        if (!approvedTargets[target]) revert TargetNotApproved(target);
        PriceData memory price = readPriceE8(policy.ethUsdFeed, policy.maxAgeSeconds);
        usdValueE8 = weiToUsdE8(valueWei, price.priceE8);
        if (usdValueE8 > policy.maxTxUsdE8) revert ExceedsPerActionLimit(usdValueE8, policy.maxTxUsdE8);
        return (true, usdValueE8);
    }
}
```

### Contract 6: DeFiUseCasePolicyApp.sol (STRETCH)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ChainlinkFeedConsumer.sol";

/// @title DeFiUseCasePolicyApp
/// @notice Swap deviation guard: verifies that a swap's implied price is within
///         acceptable deviation from Chainlink reference prices.
contract DeFiUseCasePolicyApp is ChainlinkFeedConsumer {

    error DeviationTooHigh(uint256 deviationBps, uint256 maxBps);

    function checkSwapDeviation(
        address baseFeed,      // Chainlink feed for input token
        address quoteFeed,     // Chainlink feed for output token
        uint256 inputAmountE18,
        uint256 outputAmountE18,
        uint256 maxDeviationBps,
        uint256 maxAgeSeconds
    ) external view returns (bool ok, uint256 deviationBps) {
        PriceData memory base  = readPriceE8(baseFeed,  maxAgeSeconds);
        PriceData memory quote = readPriceE8(quoteFeed, maxAgeSeconds);

        uint256 inputUsdE8  = (inputAmountE18  * base.priceE8)  / 1e18;
        uint256 outputUsdE8 = (outputAmountE18 * quote.priceE8) / 1e18;

        if (inputUsdE8 == 0) return (true, 0);

        deviationBps = inputUsdE8 >= outputUsdE8
            ? ((inputUsdE8  - outputUsdE8) * 10_000) / inputUsdE8
            : ((outputUsdE8 - inputUsdE8)  * 10_000) / inputUsdE8;

        if (deviationBps > maxDeviationBps) revert DeviationTooHigh(deviationBps, maxDeviationBps);
        return (true, deviationBps);
    }
}
```

### Contract 7: RWAUseCasePolicyApp.sol (STRETCH)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ChainlinkFeedConsumer.sol";

/// @title RWAUseCasePolicyApp
/// @notice Price/NAV-sensitive policy for tokenized asset mint/redeem.
contract RWAUseCasePolicyApp is ChainlinkFeedConsumer {

    struct RwaPolicy {
        address navFeed;
        uint256 maxMintUsdE8;
        uint256 maxRedeemUsdE8;
        uint256 maxAgeSeconds;
        bool    active;
    }

    mapping(bytes32 => RwaPolicy) public rwaPolicies;

    error NoPolicyForAsset(bytes32 assetId);
    error MintValueExceeded(uint256 usdE8, uint256 limitE8);
    error RedeemValueExceeded(uint256 usdE8, uint256 limitE8);

    function setRwaPolicy(
        bytes32 assetId, address navFeed,
        uint256 maxMintUsdE8, uint256 maxRedeemUsdE8, uint256 maxAgeSeconds
    ) external {
        rwaPolicies[assetId] = RwaPolicy({
            navFeed: navFeed, maxMintUsdE8: maxMintUsdE8,
            maxRedeemUsdE8: maxRedeemUsdE8, maxAgeSeconds: maxAgeSeconds, active: true
        });
    }

    function checkMintValue(bytes32 assetId, uint256 unitAmountE18)
        external view returns (bool ok, uint256 mintUsdE8)
    {
        RwaPolicy memory policy = rwaPolicies[assetId];
        if (!policy.active) revert NoPolicyForAsset(assetId);
        PriceData memory price = readPriceE8(policy.navFeed, policy.maxAgeSeconds);
        mintUsdE8 = (unitAmountE18 * price.priceE8) / 1e18;
        if (mintUsdE8 > policy.maxMintUsdE8) revert MintValueExceeded(mintUsdE8, policy.maxMintUsdE8);
        return (true, mintUsdE8);
    }

    function checkRedeemValue(bytes32 assetId, uint256 unitAmountE18)
        external view returns (bool ok, uint256 redeemUsdE8)
    {
        RwaPolicy memory policy = rwaPolicies[assetId];
        if (!policy.active) revert NoPolicyForAsset(assetId);
        PriceData memory price = readPriceE8(policy.navFeed, policy.maxAgeSeconds);
        redeemUsdE8 = (unitAmountE18 * price.priceE8) / 1e18;
        if (redeemUsdE8 > policy.maxRedeemUsdE8) revert RedeemValueExceeded(redeemUsdE8, policy.maxRedeemUsdE8);
        return (true, redeemUsdE8);
    }
}
```

### Deployment Script: DeployBaseSepolia.s.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/registry/AegisPolicyRegistry.sol";
import "../src/adapters/ChainlinkFeedConsumer.sol";
import "../src/demo/DemoERC20.sol";
import "../src/demo/DemoSpender.sol";

contract DeployBaseSepolia is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        // 1. Registry
        AegisPolicyRegistry registry = new AegisPolicyRegistry();
        console.log("AegisPolicyRegistry:", address(registry));

        // 2. Demo token + spender
        DemoERC20   token   = new DemoERC20();
        DemoSpender spender = new DemoSpender(address(token));
        console.log("DemoERC20:", address(token));
        console.log("DemoSpender:", address(spender));

        // 3. Register demo policies on-chain
        bytes32 walletPolicyId   = keccak256("default-wallet-policy");
        bytes32 walletPolicyHash = keccak256(abi.encodePacked(
            '{"id":"default-wallet-policy","template":"wallet","mode":"enforce"}'
        ));
        registry.registerPolicy(walletPolicyId, walletPolicyHash, "ipfs://aegis-wallet-policy-v1");
        console.log("Registered default-wallet-policy on-chain");

        bytes32 agentPolicyId   = keccak256("default-agent-policy");
        bytes32 agentPolicyHash = keccak256(abi.encodePacked(
            '{"id":"default-agent-policy","template":"agent","mode":"enforce","limits":{"maxSingleAgentActionUsd":500}}'
        ));
        registry.registerPolicy(agentPolicyId, agentPolicyHash, "ipfs://aegis-agent-policy-v1");
        console.log("Registered default-agent-policy on-chain");

        vm.stopBroadcast();

        // Write deployments file
        vm.writeFile("./deployments/base-sepolia.json", string(abi.encodePacked(
            '{"chainId":84532,',
            '"AegisPolicyRegistry":"', vm.toString(address(registry)), '",',
            '"DemoERC20":"', vm.toString(address(token)), '",',
            '"DemoSpender":"', vm.toString(address(spender)), '",',
            '"walletPolicyId":"', vm.toString(walletPolicyId), '",',
            '"agentPolicyId":"', vm.toString(agentPolicyId), '"}'
        )));
        console.log("Wrote ./deployments/base-sepolia.json");
    }
}
```

### Foundry Test: AegisPolicyRegistry.t.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/registry/AegisPolicyRegistry.sol";

contract AegisPolicyRegistryTest is Test {
    AegisPolicyRegistry registry;
    address owner = address(0xABCD);

    function setUp() public { registry = new AegisPolicyRegistry(); }

    function test_RegisterPolicy() public {
        bytes32 id = keccak256("test"); bytes32 hash = keccak256("v1");
        vm.prank(owner);
        registry.registerPolicy(id, hash, "ipfs://test");
        (address o, bytes32 h,,,bool active) = registry.getPolicy(id);
        assertEq(o, owner); assertEq(h, hash); assertTrue(active);
    }

    function test_VerifyHash() public {
        bytes32 id = keccak256("test"); bytes32 hash = keccak256("v1");
        vm.prank(owner); registry.registerPolicy(id, hash, "ipfs://test");
        assertTrue(registry.verifyHash(id, hash));
        assertFalse(registry.verifyHash(id, bytes32(0)));
    }

    function test_UpdatePolicy() public {
        bytes32 id = keccak256("test");
        vm.prank(owner); registry.registerPolicy(id, keccak256("v1"), "ipfs://v1");
        bytes32 newHash = keccak256("v2");
        vm.prank(owner); registry.updatePolicy(id, newHash, "ipfs://v2");
        (, bytes32 h,,,) = registry.getPolicy(id); assertEq(h, newHash);
    }

    function test_RevertDuplicateRegister() public {
        bytes32 id = keccak256("test");
        vm.prank(owner); registry.registerPolicy(id, keccak256("v1"), "ipfs://v1");
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(AegisPolicyRegistry.PolicyAlreadyExists.selector, id));
        registry.registerPolicy(id, keccak256("v2"), "ipfs://v2");
    }

    function test_RevertUpdateIfNotOwner() public {
        bytes32 id = keccak256("test");
        vm.prank(owner); registry.registerPolicy(id, keccak256("v1"), "ipfs://v1");
        vm.prank(address(0xDEAD));
        vm.expectRevert();
        registry.updatePolicy(id, keccak256("v2"), "ipfs://v2");
    }
}
```

### Foundry Test: ChainlinkFeedConsumer.t.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/adapters/ChainlinkFeedConsumer.sol";
import "../src/interfaces/IAggregatorV3.sol";

contract MockFeed is IAggregatorV3 {
    int256 public ans; uint256 public upd; uint8 public dec = 8;
    constructor(int256 _a, uint256 _u) { ans = _a; upd = _u; }
    function decimals() external view returns (uint8) { return dec; }
    function description() external pure returns (string memory) { return "Mock/USD"; }
    function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint80) {
        return (1, ans, block.timestamp, upd, 1);
    }
}

contract ChainlinkFeedConsumerTest is Test {
    ChainlinkFeedConsumer consumer;
    function setUp() public { consumer = new ChainlinkFeedConsumer(); vm.warp(1_000_000); }

    function test_ReadFreshPrice() public {
        MockFeed feed = new MockFeed(2000_00000000, block.timestamp - 100);
        ChainlinkFeedConsumer.PriceData memory d = consumer.readPriceE8(address(feed), 3600);
        assertEq(d.priceE8, 2000_00000000); assertEq(d.ageSeconds, 100);
    }

    function test_RevertStaleFeed() public {
        MockFeed feed = new MockFeed(2000_00000000, block.timestamp - 7200);
        vm.expectRevert(); consumer.readPriceE8(address(feed), 3600);
    }

    function test_RevertInvalidPrice() public {
        MockFeed feed = new MockFeed(-1, block.timestamp - 10);
        vm.expectRevert(); consumer.readPriceE8(address(feed), 3600);
    }

    function test_WeiToUsdE8() public view {
        assertEq(consumer.weiToUsdE8(1 ether, 2000_00000000), 2000_00000000);
        assertEq(consumer.weiToUsdE8(0.5 ether, 2000_00000000), 1000_00000000);
    }
}
```

### foundry.toml

```toml
[profile.default]
src    = "src"
out    = "out"
libs   = ["lib"]
test   = "test"
script = "script"
solc   = "0.8.24"

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}", url = "https://api-sepolia.basescan.org/api" }
```

### Deployment Commands

```bash
# Setup Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup
cd contracts && forge install foundry-rs/forge-std

# Run tests (MUST pass before deploy)
forge test -vv

# Dry run (no broadcast)
forge script script/DeployBaseSepolia.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL

# Deploy + verify
forge script script/DeployBaseSepolia.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  -vvv

# Copy addresses to frontend
cat deployments/base-sepolia.json
# Paste into lib/chain/addresses.ts and .env.local
```

### Backend Integration: On-Chain Policy Hash Verification

```typescript
// lib/chain/policyVerifier.ts
import { publicClient } from "./clients";
import { aegisPolicyRegistryAbi } from "./abis";
import { addresses } from "./addresses";
import { keccak256, toBytes, toHex } from "viem";

export async function getOnChainPolicyHash(policyId: string): Promise<`0x${string}` | null> {
  try {
    const policyIdBytes32 = toHex(keccak256(toBytes(policyId)), { size: 32 });
    return await publicClient.readContract({
      address: addresses.AEGIS_POLICY_REGISTRY,
      abi: aegisPolicyRegistryAbi,
      functionName: "getPolicyHash",
      args: [policyIdBytes32],
    }) as `0x${string}`;
  } catch {
    return null; // Registry not reachable or policy not found
  }
}

export function computePolicyHash(policy: Pick): `0x${string}` {
  const json = JSON.stringify({ id: policy.id, template: policy.template, mode: policy.mode, limits: policy.limits });
  return keccak256(toBytes(json));
}
```

---
