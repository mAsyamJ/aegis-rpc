// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ChainlinkFeedConsumer} from "../src/adapters/ChainlinkFeedConsumer.sol";
import {MockFeed} from "./mocks/MockFeed.sol";

contract ChainlinkFeedConsumerTest is Test {
    ChainlinkFeedConsumer consumer;

    address constant BASE_SEPOLIA_ETH_USD = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    function setUp() public {
        consumer = new ChainlinkFeedConsumer();
        vm.warp(1_000_000);
    }

    function test_ReadFreshPrice() public {
        MockFeed feed = new MockFeed(2000_00000000, block.timestamp - 100);
        ChainlinkFeedConsumer.PriceData memory d = consumer.readPriceE8(address(feed), 3600);
        assertEq(d.priceE8, 2000_00000000);
        assertEq(d.ageSeconds, 100);
    }

    function test_RevertStaleFeed() public {
        MockFeed feed = new MockFeed(2000_00000000, block.timestamp - 7200);
        vm.expectRevert();
        consumer.readPriceE8(address(feed), 3600);
    }

    function test_RevertInvalidPrice() public {
        MockFeed feed = new MockFeed(-1, block.timestamp - 10);
        vm.expectRevert();
        consumer.readPriceE8(address(feed), 3600);
    }

    function test_WeiToUsdE8() public view {
        assertEq(consumer.weiToUsdE8(1 ether, 2000_00000000), 2000_00000000);
        assertEq(consumer.weiToUsdE8(0.5 ether, 2000_00000000), 1000_00000000);
    }

    function test_NormalizeDecimals18() public {
        MockFeed feed = new MockFeed(2000e18, block.timestamp - 10);
        feed.setDecimals(18);
        ChainlinkFeedConsumer.PriceData memory d = consumer.readPriceE8(address(feed), 3600);
        assertEq(d.priceE8, 2000_00000000);
    }

    function test_latestPrice_onFork() public {
        string memory forkUrl = vm.envOr("FORK_URL", string(""));
        if (bytes(forkUrl).length == 0) return;
        vm.createSelectFork(forkUrl);
        ChainlinkFeedConsumer.PriceData memory d =
            consumer.readPriceE8(BASE_SEPOLIA_ETH_USD, 7200);
        assertGt(d.priceE8, 0);
        assertEq(d.decimals, 8);
    }
}
