// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ChainlinkFeedConsumer} from "../adapters/ChainlinkFeedConsumer.sol";

/// @title AgentUseCasePolicyApp
/// @notice On-chain agent policy enforcement: verify agent, check max USD, verify target.
contract AgentUseCasePolicyApp is ChainlinkFeedConsumer {
    struct AgentPolicy {
        bool active;
        uint256 maxTxUsdE8;
        uint256 maxAgeSeconds;
        address ethUsdFeed;
    }

    mapping(address => AgentPolicy) public agentPolicies;
    mapping(address => bool) public approvedTargets;
    mapping(bytes4 => bool) public approvedSelectors;

    event AgentPolicySet(address indexed agent, uint256 maxTxUsdE8);

    error NoAgentPolicy(address agent);
    error TargetNotApproved(address target);
    error ExceedsPerActionLimit(uint256 usdE8, uint256 limitE8);

    function setAgentPolicy(address agent, uint256 maxTxUsdE8, uint256 maxAgeSeconds, address ethUsdFeed)
        external
    {
        agentPolicies[agent] =
            AgentPolicy({active: true, maxTxUsdE8: maxTxUsdE8, maxAgeSeconds: maxAgeSeconds, ethUsdFeed: ethUsdFeed});
        emit AgentPolicySet(agent, maxTxUsdE8);
    }

    function setApprovedTarget(address target, bool approved) external {
        approvedTargets[target] = approved;
    }

    function setApprovedSelector(bytes4 selector, bool approved) external {
        approvedSelectors[selector] = approved;
    }

    function checkNativeTransfer(address agent, address target, uint256 valueWei)
        external
        view
        returns (bool ok, uint256 usdValueE8)
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
