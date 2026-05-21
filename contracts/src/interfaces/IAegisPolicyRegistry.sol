// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAegisPolicyRegistry {
    function registerPolicy(bytes32 policyId, bytes32 policyHash, string calldata metadataURI) external;
    function updatePolicy(bytes32 policyId, bytes32 newHash, string calldata metadataURI) external;
    function getPolicy(bytes32 policyId)
        external
        view
        returns (address owner, bytes32 policyHash, string memory metadataURI, uint256 updatedAt, bool active);
    function getPolicyHash(bytes32 policyId) external view returns (bytes32);
    function verifyHash(bytes32 policyId, bytes32 hash) external view returns (bool);
}
