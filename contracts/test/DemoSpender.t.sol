// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DemoERC20} from "../src/demo/DemoERC20.sol";
import {DemoSpender} from "../src/demo/DemoSpender.sol";

contract DemoSpenderTest is Test {
    function test_ConstructorBindsToken() public {
        DemoERC20 token = new DemoERC20();
        DemoSpender spender = new DemoSpender(address(token));
        assertEq(spender.token(), address(token));
    }

    function test_PullTokensAccounting() public {
        DemoERC20 token = new DemoERC20();
        DemoSpender spender = new DemoSpender(address(token));
        address user = address(0x1234);
        spender.pullTokens(user, 100);
        assertEq(spender.pulled(user), 100);
    }
}
