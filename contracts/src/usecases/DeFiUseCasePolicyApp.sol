// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ChainlinkFeedConsumer} from "../adapters/ChainlinkFeedConsumer.sol";

/// @title DeFiUseCasePolicyApp
/// @notice Swap deviation guard using Chainlink reference prices.
contract DeFiUseCasePolicyApp is ChainlinkFeedConsumer {
    error DeviationTooHigh(uint256 deviationBps, uint256 maxBps);

    function checkSwapDeviation(
        address baseFeed,
        address quoteFeed,
        uint256 inputAmountE18,
        uint256 outputAmountE18,
        uint256 maxDeviationBps,
        uint256 maxAgeSeconds
    ) external view returns (bool ok, uint256 deviationBps) {
        PriceData memory base = readPriceE8(baseFeed, maxAgeSeconds);
        PriceData memory quote = readPriceE8(quoteFeed, maxAgeSeconds);

        uint256 inputUsdE8 = (inputAmountE18 * base.priceE8) / 1e18;
        uint256 outputUsdE8 = (outputAmountE18 * quote.priceE8) / 1e18;

        if (inputUsdE8 == 0) return (true, 0);

        deviationBps = inputUsdE8 >= outputUsdE8
            ? ((inputUsdE8 - outputUsdE8) * 10_000) / inputUsdE8
            : ((outputUsdE8 - inputUsdE8) * 10_000) / inputUsdE8;

        if (deviationBps > maxDeviationBps) revert DeviationTooHigh(deviationBps, maxDeviationBps);
        return (true, deviationBps);
    }
}
