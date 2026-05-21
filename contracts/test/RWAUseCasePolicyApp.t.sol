// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RWAUseCasePolicyApp} from "../src/usecases/RWAUseCasePolicyApp.sol";
import {MockFeed} from "./mocks/MockFeed.sol";

contract RWAUseCasePolicyAppTest is Test {
    RWAUseCasePolicyApp app;
    MockFeed feed;
    bytes32 assetId = keccak256("rwa-gold");

    function setUp() public {
        app = new RWAUseCasePolicyApp();
        vm.warp(1_000_000);
        feed = new MockFeed(100_00000000, block.timestamp - 100);
        app.setRwaPolicy(assetId, address(feed), 1000_00000000, 500_00000000, 3600);
    }

    function test_CheckMintOk() public {
        (bool ok, uint256 usd) = app.checkMintValue(assetId, 10e18);
        assertTrue(ok);
        assertEq(usd, 1000_00000000);
    }

    function test_RevertMintExceeded() public {
        vm.expectRevert();
        app.checkMintValue(assetId, 200e18);
    }

    function test_RevertRedeemExceeded() public {
        vm.expectRevert();
        app.checkRedeemValue(assetId, 100e18);
    }
}
