// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AegisPolicyRegistry} from "../src/registry/AegisPolicyRegistry.sol";

contract AegisPolicyRegistryTest is Test {
    AegisPolicyRegistry registry;
    address owner = address(0xABCD);
    bytes32 id = keccak256("test");

    function setUp() public {
        registry = new AegisPolicyRegistry();
    }

    function test_RegisterPolicy() public {
        bytes32 hash = keccak256("v1");
        vm.prank(owner);
        registry.registerPolicy(id, hash, "ipfs://test");
        (address o, bytes32 h,,, bool active) = registry.getPolicy(id);
        assertEq(o, owner);
        assertEq(h, hash);
        assertTrue(active);
    }

    function test_VerifyHash() public {
        bytes32 hash = keccak256("v1");
        vm.prank(owner);
        registry.registerPolicy(id, hash, "ipfs://test");
        assertTrue(registry.verifyHash(id, hash));
        assertFalse(registry.verifyHash(id, bytes32(0)));
    }

    function test_UpdatePolicy() public {
        vm.prank(owner);
        registry.registerPolicy(id, keccak256("v1"), "ipfs://v1");
        bytes32 newHash = keccak256("v2");
        vm.prank(owner);
        registry.updatePolicy(id, newHash, "ipfs://v2");
        (, bytes32 h,,,) = registry.getPolicy(id);
        assertEq(h, newHash);
    }

    function test_RevertDuplicateRegister() public {
        vm.prank(owner);
        registry.registerPolicy(id, keccak256("v1"), "ipfs://v1");
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(AegisPolicyRegistry.PolicyAlreadyExists.selector, id));
        registry.registerPolicy(id, keccak256("v2"), "ipfs://v2");
    }

    function test_RevertUpdateIfNotOwner() public {
        vm.prank(owner);
        registry.registerPolicy(id, keccak256("v1"), "ipfs://v1");
        vm.prank(address(0xDEAD));
        vm.expectRevert(abi.encodeWithSelector(AegisPolicyRegistry.NotPolicyOwner.selector, id, address(0xDEAD)));
        registry.updatePolicy(id, keccak256("v2"), "ipfs://v2");
    }

    function test_DeactivateBlocksGetPolicyHash() public {
        vm.prank(owner);
        registry.registerPolicy(id, keccak256("v1"), "ipfs://v1");
        vm.prank(owner);
        registry.deactivatePolicy(id);
        vm.expectRevert(abi.encodeWithSelector(AegisPolicyRegistry.PolicyNotActive.selector, id));
        registry.getPolicyHash(id);
    }
}
