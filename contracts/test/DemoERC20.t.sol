// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DemoERC20} from "../src/demo/DemoERC20.sol";

contract DemoERC20Test is Test {
    DemoERC20 token;

    function setUp() public {
        token = new DemoERC20();
    }

    function test_ConstructorMintsDeployer() public view {
        assertEq(token.balanceOf(address(this)), 1_000_000 * 1e18);
    }

    function test_ApproveAndTransferFrom() public {
        address spender = address(0xBEEF);
        token.approve(spender, 100e18);
        vm.prank(spender);
        token.transferFrom(address(this), spender, 50e18);
        assertEq(token.balanceOf(spender), 50e18);
    }

    function test_Mint() public {
        address user = address(0xCAFE);
        token.mint(user, 1e18);
        assertEq(token.balanceOf(user), 1e18);
    }
}
