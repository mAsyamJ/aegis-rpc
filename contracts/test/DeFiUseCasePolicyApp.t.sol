// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DeFiUseCasePolicyApp} from "../src/usecases/DeFiUseCasePolicyApp.sol";
import {MockFeed} from "./mocks/MockFeed.sol";

contract DeFiUseCasePolicyAppTest is Test {
    DeFiUseCasePolicyApp app;

    function setUp() public {
        app = new DeFiUseCasePolicyApp();
        vm.warp(1_000_000);
    }

    function test_WithinDeviation() public {
        MockFeed base = new MockFeed(2000_00000000, block.timestamp - 100);
        MockFeed quote = new MockFeed(2000_00000000, block.timestamp - 100);
        (bool ok, uint256 bps) = app.checkSwapDeviation(
            address(base), address(quote), 1 ether, 1 ether, 500, 3600
        );
        assertTrue(ok);
        assertEq(bps, 0);
    }

    function test_RevertDeviationTooHigh() public {
        MockFeed base = new MockFeed(2000_00000000, block.timestamp - 100);
        MockFeed quote = new MockFeed(1000_00000000, block.timestamp - 100);
        vm.expectRevert();
        app.checkSwapDeviation(address(base), address(quote), 1 ether, 1 ether, 100, 3600);
    }
}
