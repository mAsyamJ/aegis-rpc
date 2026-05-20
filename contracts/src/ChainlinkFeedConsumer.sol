// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract ChainlinkFeedConsumer {
    AggregatorV3Interface public immutable feed;

    constructor(address _feed) {
        feed = AggregatorV3Interface(_feed);
    }

    function latestPrice() external view returns (int256 answer, uint8 decimals) {
        (, answer, , , ) = feed.latestRoundData();
        decimals = feed.decimals();
    }
}
