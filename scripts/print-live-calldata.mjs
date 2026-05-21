#!/usr/bin/env node
/**
 * Prints live 3-tx preflight JSON fields for curl-live-three-tx.sh.
 * Requires: node scripts/sync-abi-index.mjs (abi-index.json present).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(join(root, "apps/web/package.json"));

const { encodeFunctionData, maxUint256 } = require("viem");

const deployments = JSON.parse(
  readFileSync(join(root, "contracts/deployments/base-sepolia.json"), "utf8"),
);
const abiIndex = JSON.parse(
  readFileSync(join(root, "apps/web/src/data/abi-index.json"), "utf8"),
);

function abiFor(address) {
  const key = address.toLowerCase();
  const entry = abiIndex.contracts[key];
  if (!entry) throw new Error(`ABI missing for ${address} — run sync-abi-index`);
  return entry.abi;
}

const HIGH_ALLOWANCE_WEI = BigInt("1000000000000000000000000");
const demoErc20 = deployments.DemoERC20;
const demoSpender = deployments.DemoSpender;
const defiApp = deployments.DeFiUseCasePolicyApp;
const demoAbi = abiFor(demoErc20);
const defiAbi = abiFor(defiApp);

const payload = {
  from: "0x1234567890123456789012345678901234567890",
  chainId: deployments.chainId,
  safe: {
    to: defiApp,
    data: encodeFunctionData({
      abi: defiAbi,
      functionName: "checkSwapDeviation",
      args: [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        BigInt(1_000_000),
        BigInt(1_000_000),
        BigInt(100),
        BigInt(50),
      ],
    }),
    policyId: "default-wallet-policy",
  },
  warn: {
    to: demoErc20,
    data: encodeFunctionData({
      abi: demoAbi,
      functionName: "approve",
      args: [demoSpender, HIGH_ALLOWANCE_WEI],
    }),
    policyId: "default-wallet-policy",
  },
  block: {
    to: demoErc20,
    data: encodeFunctionData({
      abi: demoAbi,
      functionName: "approve",
      args: [demoSpender, maxUint256],
    }),
    policyId: "default-wallet-policy",
  },
};

console.log(JSON.stringify(payload));
