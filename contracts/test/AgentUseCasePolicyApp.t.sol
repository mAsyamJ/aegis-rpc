// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentUseCasePolicyApp} from "../src/usecases/AgentUseCasePolicyApp.sol";
import {MockFeed} from "./mocks/MockFeed.sol";

contract AgentUseCasePolicyAppTest is Test {
    AgentUseCasePolicyApp app;
    MockFeed feed;
    address agent = address(0xA61);
    address target = address(0x7A9E);

    function setUp() public {
        app = new AgentUseCasePolicyApp();
        vm.warp(1_000_000);
        feed = new MockFeed(2000_00000000, block.timestamp - 100);
        app.setAgentPolicy(agent, 500_00000000, 3600, address(feed));
        app.setApprovedTarget(target, true);
    }

    function test_CheckNativeTransferOk() public {
        (bool ok, uint256 usd) = app.checkNativeTransfer(agent, target, 0.1 ether);
        assertTrue(ok);
        assertEq(usd, 200_00000000);
    }

    function test_RevertExceedsLimit() public {
        vm.expectRevert();
        app.checkNativeTransfer(agent, target, 1 ether);
    }

    function test_RevertStaleFeed() public {
        feed.setUpdatedAt(block.timestamp - 7200);
        vm.expectRevert();
        app.checkNativeTransfer(agent, target, 0.1 ether);
    }
}
