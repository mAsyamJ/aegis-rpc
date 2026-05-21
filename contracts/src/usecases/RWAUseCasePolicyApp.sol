// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ChainlinkFeedConsumer} from "../adapters/ChainlinkFeedConsumer.sol";

/// @title RWAUseCasePolicyApp
/// @notice Price/NAV-sensitive policy for tokenized asset mint/redeem.
contract RWAUseCasePolicyApp is ChainlinkFeedConsumer {
    struct RwaPolicy {
        address navFeed;
        uint256 maxMintUsdE8;
        uint256 maxRedeemUsdE8;
        uint256 maxAgeSeconds;
        bool active;
    }

    mapping(bytes32 => RwaPolicy) public rwaPolicies;

    error NoPolicyForAsset(bytes32 assetId);
    error MintValueExceeded(uint256 usdE8, uint256 limitE8);
    error RedeemValueExceeded(uint256 usdE8, uint256 limitE8);

    function setRwaPolicy(
        bytes32 assetId,
        address navFeed,
        uint256 maxMintUsdE8,
        uint256 maxRedeemUsdE8,
        uint256 maxAgeSeconds
    ) external {
        rwaPolicies[assetId] = RwaPolicy({
            navFeed: navFeed,
            maxMintUsdE8: maxMintUsdE8,
            maxRedeemUsdE8: maxRedeemUsdE8,
            maxAgeSeconds: maxAgeSeconds,
            active: true
        });
    }

    function checkMintValue(bytes32 assetId, uint256 unitAmountE18)
        external
        view
        returns (bool ok, uint256 mintUsdE8)
    {
        RwaPolicy memory policy = rwaPolicies[assetId];
        if (!policy.active) revert NoPolicyForAsset(assetId);
        PriceData memory price = readPriceE8(policy.navFeed, policy.maxAgeSeconds);
        mintUsdE8 = (unitAmountE18 * price.priceE8) / 1e18;
        if (mintUsdE8 > policy.maxMintUsdE8) revert MintValueExceeded(mintUsdE8, policy.maxMintUsdE8);
        return (true, mintUsdE8);
    }

    function checkRedeemValue(bytes32 assetId, uint256 unitAmountE18)
        external
        view
        returns (bool ok, uint256 redeemUsdE8)
    {
        RwaPolicy memory policy = rwaPolicies[assetId];
        if (!policy.active) revert NoPolicyForAsset(assetId);
        PriceData memory price = readPriceE8(policy.navFeed, policy.maxAgeSeconds);
        redeemUsdE8 = (unitAmountE18 * price.priceE8) / 1e18;
        if (redeemUsdE8 > policy.maxRedeemUsdE8) revert RedeemValueExceeded(redeemUsdE8, policy.maxRedeemUsdE8);
        return (true, redeemUsdE8);
    }
}
