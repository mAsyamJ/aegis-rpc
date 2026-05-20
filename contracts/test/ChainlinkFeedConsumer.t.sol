// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ChainlinkFeedConsumer} from "../src/ChainlinkFeedConsumer.sol";

/// @dev Uses Base Sepolia ETH/USD feed when FORK_URL is set; otherwise skips.
contract ChainlinkFeedConsumerTest is Test {
    address constant BASE_SEPOLIA_ETH_USD =
        0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    function test_latestPrice_onFork() public {
        string memory forkUrl = vm.envOr("FORK_URL", string(""));
        if (bytes(forkUrl).length == 0) {
            return;
        }
        vm.createSelectFork(forkUrl);
        ChainlinkFeedConsumer consumer = new ChainlinkFeedConsumer(BASE_SEPOLIA_ETH_USD);
        (int256 answer, uint8 decimals) = consumer.latestPrice();
        assertGt(answer, 0);
        assertEq(decimals, 8);
    }

    function test_constructorStoresFeed() public {
        ChainlinkFeedConsumer consumer = new ChainlinkFeedConsumer(BASE_SEPOLIA_ETH_USD);
        assertEq(address(consumer.feed()), BASE_SEPOLIA_ETH_USD);
    }
}
