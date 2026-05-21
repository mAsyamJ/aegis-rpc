export const aegisPolicyRegistryAbi = [
  {
    type: "function",
    name: "getPolicyHash",
    stateMutability: "view",
    inputs: [{ name: "policyId", type: "bytes32" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "verifyHash",
    stateMutability: "view",
    inputs: [
      { name: "policyId", type: "bytes32" },
      { name: "hash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getPolicy",
    stateMutability: "view",
    inputs: [{ name: "policyId", type: "bytes32" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "policyHash", type: "bytes32" },
      { name: "metadataURI", type: "string" },
      { name: "updatedAt", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
] as const;
