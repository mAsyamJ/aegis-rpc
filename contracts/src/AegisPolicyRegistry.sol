// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AegisPolicyRegistry {
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
        string metadataURI
    );
    event PolicyUpdated(
        bytes32 indexed policyId,
        bytes32 oldHash,
        bytes32 newHash,
        string metadataURI
    );

    function registerPolicy(
        bytes32 policyId,
        bytes32 policyHash,
        string calldata metadataURI
    ) external {
        require(policies[policyId].owner == address(0), "POLICY_EXISTS");
        policies[policyId] = PolicyRecord({
            owner: msg.sender,
            policyHash: policyHash,
            metadataURI: metadataURI,
            updatedAt: block.timestamp,
            active: true
        });
        emit PolicyRegistered(policyId, msg.sender, policyHash, metadataURI);
    }

    function updatePolicy(
        bytes32 policyId,
        bytes32 newHash,
        string calldata metadataURI
    ) external {
        PolicyRecord storage r = policies[policyId];
        require(r.owner == msg.sender, "NOT_OWNER");
        bytes32 oldHash = r.policyHash;
        r.policyHash = newHash;
        r.metadataURI = metadataURI;
        r.updatedAt = block.timestamp;
        emit PolicyUpdated(policyId, oldHash, newHash, metadataURI);
    }

    function verifyHash(bytes32 policyId, bytes32 hash) external view returns (bool) {
        return policies[policyId].active && policies[policyId].policyHash == hash;
    }
}
