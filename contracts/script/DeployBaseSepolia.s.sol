// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {AegisPolicyRegistry} from "../src/AegisPolicyRegistry.sol";
import {ChainlinkFeedConsumer} from "../src/ChainlinkFeedConsumer.sol";
import {DemoERC20} from "../src/DemoERC20.sol";
import {DemoSpender} from "../src/DemoSpender.sol";

/// @notice Base Sepolia deployment script — requires human approval + funded deployer key.
contract DeployBaseSepolia is Script {
    address constant BASE_SEPOLIA_ETH_USD =
        0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        AegisPolicyRegistry registry = new AegisPolicyRegistry();
        ChainlinkFeedConsumer feedConsumer =
            new ChainlinkFeedConsumer(BASE_SEPOLIA_ETH_USD);
        DemoERC20 token = new DemoERC20();
        DemoSpender spender = new DemoSpender();

        vm.stopBroadcast();

        console2.log("AegisPolicyRegistry", address(registry));
        console2.log("ChainlinkFeedConsumer", address(feedConsumer));
        console2.log("DemoERC20", address(token));
        console2.log("DemoSpender", address(spender));
    }
}
