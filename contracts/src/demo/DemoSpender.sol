// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DemoSpender
/// @notice Unknown spender contract for Aegis approval-block demo.
contract DemoSpender {
    address public immutable token;
    mapping(address => uint256) public pulled;

    event TokensPulled(address indexed from, uint256 amount);

    constructor(address _token) {
        token = _token;
    }

    function pullTokens(address from, uint256 amount) external {
        pulled[from] += amount;
        emit TokensPulled(from, amount);
    }
}
