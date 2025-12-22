// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {AIArtNFT} from "../src/AIArtNFT.sol";

contract DeployAIArtNFT is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        new AIArtNFT(
            msg.sender,
            "ipfs://"
        );

        vm.stopBroadcast();
    }
}  