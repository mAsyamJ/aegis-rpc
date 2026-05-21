// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAggregatorV3} from "../interfaces/IAggregatorV3.sol";

/// @title ChainlinkFeedConsumer
/// @notice Base contract for reading Chainlink AggregatorV3 feeds.
/// @dev Normalizes any decimals feed to E8 (8 decimal places).
contract ChainlinkFeedConsumer {
    error InvalidPrice(address feed, int256 answer);
    error StalePrice(address feed, uint256 age, uint256 maxAge);

    struct PriceData {
        uint256 priceE8;
        uint256 updatedAt;
        uint8 decimals;
        uint256 ageSeconds;
    }

    function readPriceE8(address feed, uint256 maxAgeSeconds) public view returns (PriceData memory data) {
        (, int256 answer,, uint256 updatedAt,) = IAggregatorV3(feed).latestRoundData();

        if (answer <= 0) revert InvalidPrice(feed, answer);

        uint256 age = block.timestamp - updatedAt;
        if (age > maxAgeSeconds) revert StalePrice(feed, age, maxAgeSeconds);

        uint8 dec = IAggregatorV3(feed).decimals();
        uint256 raw = uint256(answer);

        uint256 priceE8;
        if (dec == 8) {
            priceE8 = raw;
        } else if (dec > 8) {
            priceE8 = raw / (10 ** (dec - 8));
        } else {
            priceE8 = raw * (10 ** (8 - dec));
        }

        return PriceData({priceE8: priceE8, updatedAt: updatedAt, decimals: dec, ageSeconds: age});
    }

    function weiToUsdE8(uint256 valueWei, uint256 ethUsdE8) public pure returns (uint256) {
        return (valueWei * ethUsdE8) / 1e18;
    }
}
