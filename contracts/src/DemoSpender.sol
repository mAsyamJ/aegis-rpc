// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DemoSpender {
    function pull(address token, address from, uint256 amount) external {
        (bool ok, ) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, address(this), amount)
        );
        require(ok, "TRANSFER_FAILED");
    }
}
