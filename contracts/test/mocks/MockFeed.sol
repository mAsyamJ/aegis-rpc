// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAggregatorV3} from "../../src/interfaces/IAggregatorV3.sol";

contract MockFeed is IAggregatorV3 {
    int256 public ans;
    uint256 public upd;
    uint8 public dec = 8;

    constructor(int256 _a, uint256 _u) {
        ans = _a;
        upd = _u;
    }

    function setAnswer(int256 _a) external {
        ans = _a;
    }

    function setUpdatedAt(uint256 _u) external {
        upd = _u;
    }

    function setDecimals(uint8 _d) external {
        dec = _d;
    }

    function decimals() external view returns (uint8) {
        return dec;
    }

    function description() external pure returns (string memory) {
        return "Mock/USD";
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (1, ans, block.timestamp, upd, 1);
    }
}
