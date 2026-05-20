// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AegisPolicyRegistry} from "../src/AegisPolicyRegistry.sol";

contract AegisPolicyRegistryTest is Test {
    AegisPolicyRegistry registry;
    bytes32 constant POLICY_ID = keccak256("default-wallet-policy");

    function setUp() public {
        registry = new AegisPolicyRegistry();
    }

    function test_registerPolicy() public {
        registry.registerPolicy(POLICY_ID, keccak256("v1"), "ipfs://demo");
        (address owner, bytes32 hash, , , bool active) = registry.policies(POLICY_ID);
        assertEq(owner, address(this));
        assertEq(hash, keccak256("v1"));
        assertTrue(active);
    }

    function test_verifyHash() public {
        bytes32 hash = keccak256("v1");
        registry.registerPolicy(POLICY_ID, hash, "ipfs://demo");
        assertTrue(registry.verifyHash(POLICY_ID, hash));
        assertFalse(registry.verifyHash(POLICY_ID, keccak256("v2")));
    }

    function test_duplicateRegisterReverts() public {
        registry.registerPolicy(POLICY_ID, keccak256("v1"), "ipfs://demo");
        vm.expectRevert("POLICY_EXISTS");
        registry.registerPolicy(POLICY_ID, keccak256("v2"), "ipfs://demo2");
    }
}
