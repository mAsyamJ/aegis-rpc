// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {AegisPolicyRegistry} from "../src/registry/AegisPolicyRegistry.sol";
import {DemoERC20} from "../src/demo/DemoERC20.sol";
import {DemoSpender} from "../src/demo/DemoSpender.sol";
import {AgentUseCasePolicyApp} from "../src/usecases/AgentUseCasePolicyApp.sol";
import {DeFiUseCasePolicyApp} from "../src/usecases/DeFiUseCasePolicyApp.sol";
import {RWAUseCasePolicyApp} from "../src/usecases/RWAUseCasePolicyApp.sol";

/// @notice Base Sepolia deployment — requires human approval + funded deployer key.
contract DeployBaseSepolia is Script {
    function run() external {
        uint256 deployerKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0));
        if (deployerKey != 0) {
            vm.startBroadcast(deployerKey);
        } else {
            vm.startBroadcast();
        }

        AegisPolicyRegistry registry = new AegisPolicyRegistry();
        DemoERC20 token = new DemoERC20();
        DemoSpender spender = new DemoSpender(address(token));
        AgentUseCasePolicyApp agentApp = new AgentUseCasePolicyApp();
        DeFiUseCasePolicyApp defiApp = new DeFiUseCasePolicyApp();
        RWAUseCasePolicyApp rwaApp = new RWAUseCasePolicyApp();

        bytes32 walletPolicyId = keccak256("default-wallet-policy");
        bytes32 walletPolicyHash = keccak256(
            abi.encodePacked('{"id":"default-wallet-policy","template":"wallet","mode":"enforce"}')
        );
        registry.registerPolicy(walletPolicyId, walletPolicyHash, "ipfs://aegis-wallet-policy-v1");

        bytes32 agentPolicyId = keccak256("default-agent-policy");
        bytes32 agentPolicyHash = keccak256(
            abi.encodePacked(
                '{"id":"default-agent-policy","template":"agent","mode":"enforce","limits":{"maxSingleAgentActionUsd":500}}'
            )
        );
        registry.registerPolicy(agentPolicyId, agentPolicyHash, "ipfs://aegis-agent-policy-v1");

        vm.stopBroadcast();

        console2.log("AegisPolicyRegistry", address(registry));
        console2.log("DemoERC20", address(token));
        console2.log("DemoSpender", address(spender));
        console2.log("AgentUseCasePolicyApp", address(agentApp));
        console2.log("DeFiUseCasePolicyApp", address(defiApp));
        console2.log("RWAUseCasePolicyApp", address(rwaApp));

        string memory json = string(
            abi.encodePacked(
                '{"chainId":84532,',
                '"AegisPolicyRegistry":"',
                vm.toString(address(registry)),
                '",',
                '"DemoERC20":"',
                vm.toString(address(token)),
                '",',
                '"DemoSpender":"',
                vm.toString(address(spender)),
                '",',
                '"AgentUseCasePolicyApp":"',
                vm.toString(address(agentApp)),
                '",',
                '"DeFiUseCasePolicyApp":"',
                vm.toString(address(defiApp)),
                '",',
                '"RWAUseCasePolicyApp":"',
                vm.toString(address(rwaApp)),
                '",',
                '"walletPolicyId":"',
                vm.toString(walletPolicyId),
                '",',
                '"agentPolicyId":"',
                vm.toString(agentPolicyId),
                '"}'
            )
        );
        vm.writeFile("./deployments/base-sepolia.json", json);
        console2.log("Wrote ./deployments/base-sepolia.json");
    }
}
