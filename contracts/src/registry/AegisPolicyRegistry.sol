// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAegisPolicyRegistry} from "../interfaces/IAegisPolicyRegistry.sol";

/// @title AegisPolicyRegistry
/// @notice On-chain store for Aegis policy commitments.
/// @dev policyHash = keccak256(abi.encodePacked(JSON.stringify(policy config)))
contract AegisPolicyRegistry is IAegisPolicyRegistry {
    struct PolicyRecord {
        address owner;
        bytes32 policyHash;
        string metadataURI;
        uint256 updatedAt;
        bool active;
    }

    mapping(bytes32 => PolicyRecord) public policies;

    event PolicyRegistered(
        bytes32 indexed policyId,
        address indexed owner,
        bytes32 policyHash,
        string metadataURI,
        uint256 timestamp
    );
    event PolicyUpdated(
        bytes32 indexed policyId,
        bytes32 oldHash,
        bytes32 newHash,
        string metadataURI,
        uint256 timestamp
    );
    event PolicyDeactivated(bytes32 indexed policyId, uint256 timestamp);

    error PolicyAlreadyExists(bytes32 policyId);
    error PolicyNotFound(bytes32 policyId);
    error NotPolicyOwner(bytes32 policyId, address caller);
    error PolicyNotActive(bytes32 policyId);

    function registerPolicy(bytes32 policyId, bytes32 policyHash, string calldata metadataURI) external {
        if (policies[policyId].owner != address(0)) revert PolicyAlreadyExists(policyId);
        policies[policyId] = PolicyRecord({
            owner: msg.sender,
            policyHash: policyHash,
            metadataURI: metadataURI,
            updatedAt: block.timestamp,
            active: true
        });
        emit PolicyRegistered(policyId, msg.sender, policyHash, metadataURI, block.timestamp);
    }

    function updatePolicy(bytes32 policyId, bytes32 newHash, string calldata metadataURI) external {
        PolicyRecord storage r = policies[policyId];
        if (r.owner == address(0)) revert PolicyNotFound(policyId);
        if (r.owner != msg.sender) revert NotPolicyOwner(policyId, msg.sender);
        bytes32 oldHash = r.policyHash;
        r.policyHash = newHash;
        r.metadataURI = metadataURI;
        r.updatedAt = block.timestamp;
        emit PolicyUpdated(policyId, oldHash, newHash, metadataURI, block.timestamp);
    }

    function deactivatePolicy(bytes32 policyId) external {
        PolicyRecord storage r = policies[policyId];
        if (r.owner != msg.sender) revert NotPolicyOwner(policyId, msg.sender);
        r.active = false;
        emit PolicyDeactivated(policyId, block.timestamp);
    }

    function getPolicy(bytes32 policyId)
        external
        view
        returns (address owner, bytes32 policyHash, string memory metadataURI, uint256 updatedAt, bool active)
    {
        PolicyRecord storage r = policies[policyId];
        return (r.owner, r.policyHash, r.metadataURI, r.updatedAt, r.active);
    }

    function getPolicyHash(bytes32 policyId) external view returns (bytes32) {
        if (!policies[policyId].active) revert PolicyNotActive(policyId);
        return policies[policyId].policyHash;
    }

    function verifyHash(bytes32 policyId, bytes32 hash) external view returns (bool) {
        return policies[policyId].policyHash == hash && policies[policyId].active;
    }
}
