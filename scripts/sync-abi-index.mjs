#!/usr/bin/env node
/**
 * Sync ABI index: Foundry artifacts must match Blockscout getabi (strict).
 * Usage: node scripts/sync-abi-index.mjs
 * Env: ABI_INDEX_SKIP_BLOCKSCOUT=1 uses forge only (dev offline; not for release)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTRACTS = path.join(ROOT, "contracts");
const OUT_DIR = path.join(CONTRACTS, "out");
const DEPLOYMENTS = path.join(CONTRACTS, "deployments", "base-sepolia.json");
const DATA_DIR = path.join(ROOT, "apps/web/src/data");
const INDEX_PATH = path.join(DATA_DIR, "abi-index.json");
const META_PATH = path.join(DATA_DIR, "abi-index.meta.json");

const BLOCKSCOUT_API =
  process.env.BLOCKSCOUT_API_URL ??
  "https://base-sepolia.blockscout.com/api";

const CONTRACT_MAP = [
  { key: "AegisPolicyRegistry", artifact: "AegisPolicyRegistry.sol/AegisPolicyRegistry.json" },
  { key: "DemoERC20", artifact: "DemoERC20.sol/DemoERC20.json" },
  { key: "DemoSpender", artifact: "DemoSpender.sol/DemoSpender.json" },
  { key: "AgentUseCasePolicyApp", artifact: "AgentUseCasePolicyApp.sol/AgentUseCasePolicyApp.json" },
  { key: "DeFiUseCasePolicyApp", artifact: "DeFiUseCasePolicyApp.sol/DeFiUseCasePolicyApp.json" },
  { key: "RWAUseCasePolicyApp", artifact: "RWAUseCasePolicyApp.sol/RWAUseCasePolicyApp.json" },
];

function normalizeAddress(addr) {
  return addr.toLowerCase();
}

function normalizeAbiItem(item) {
  const inputs = (item.inputs ?? []).map((i) => ({
    name: i.name ?? "",
    type: i.type,
    internalType: i.internalType ?? i.type,
  }));
  const outputs = (item.outputs ?? []).map((o) => ({
    name: o.name ?? "",
    type: o.type,
    internalType: o.internalType ?? o.type,
  }));
  return JSON.stringify({
    type: item.type,
    name: item.name ?? "",
    stateMutability: item.stateMutability ?? "",
    inputs,
    outputs,
  });
}

function normalizeAbi(abi) {
  return [...abi]
    .map(normalizeAbiItem)
    .sort()
    .join("\n");
}

function hashAbi(abi) {
  return crypto.createHash("sha256").update(normalizeAbi(abi)).digest("hex");
}

/** Forge methodIdentifiers: signature -> selector hex (no 0x prefix). */
function selectorsFromMethodIds(methodIdentifiers = {}) {
  const out = {};
  for (const [signature, selectorHex] of Object.entries(methodIdentifiers)) {
    const sel = selectorHex.startsWith("0x")
      ? selectorHex.toLowerCase()
      : `0x${selectorHex}`.toLowerCase();
    out[sel] = signature;
  }
  return out;
}

function readForgeAbi(artifactRel) {
  const p = path.join(OUT_DIR, artifactRel);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing forge artifact: ${p}. Run: cd contracts && forge build`);
  }
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  if (!raw.abi || !Array.isArray(raw.abi)) {
    throw new Error(`No abi in ${p}`);
  }
  return {
    abi: raw.abi,
    methodIdentifiers: raw.methodIdentifiers ?? {},
  };
}

async function fetchBlockscoutAbi(address) {
  const url = `${BLOCKSCOUT_API}?module=contract&action=getabi&address=${address}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Blockscout HTTP ${res.status} for ${address}`);
  }
  const body = await res.json();
  if (body.status !== "1" || !body.result) {
    throw new Error(
      `Blockscout getabi failed for ${address}: ${body.message ?? body.result ?? "unknown"}. Verify contract on Blockscout.`
    );
  }
  const abi = typeof body.result === "string" ? JSON.parse(body.result) : body.result;
  if (!Array.isArray(abi)) {
    throw new Error(`Invalid ABI from Blockscout for ${address}`);
  }
  return abi;
}

function compareAbis(forgeAbi, blockscoutAbi, name) {
  const fh = hashAbi(forgeAbi);
  const bh = hashAbi(blockscoutAbi);
  if (fh === bh) return null;
  const forgeFns = new Set(
    forgeAbi.filter((i) => i.type === "function").map((i) => i.name)
  );
  const bsFns = new Set(
    blockscoutAbi.filter((i) => i.type === "function").map((i) => i.name)
  );
  const onlyForge = [...forgeFns].filter((f) => !bsFns.has(f));
  const onlyBs = [...bsFns].filter((f) => !forgeFns.has(f));
  return {
    name,
    forgeHash: fh.slice(0, 12),
    blockscoutHash: bh.slice(0, 12),
    onlyForge,
    onlyBs,
  };
}

async function main() {
  const skipBs = process.env.ABI_INDEX_SKIP_BLOCKSCOUT === "1";
  const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS, "utf8"));
  const chainId = deployments.chainId ?? 84532;

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const contracts = {};
  const metaContracts = [];
  const mismatches = [];

  for (const { key, artifact } of CONTRACT_MAP) {
    const address = deployments[key];
    if (!address) {
      throw new Error(`Missing address for ${key} in ${DEPLOYMENTS}`);
    }
    const addr = normalizeAddress(address);
    const { abi: forgeAbi, methodIdentifiers } = readForgeAbi(artifact);

    let blockscoutAbi = forgeAbi;
    if (!skipBs) {
      blockscoutAbi = await fetchBlockscoutAbi(address);
      const diff = compareAbis(forgeAbi, blockscoutAbi, key);
      if (diff) {
        mismatches.push(diff);
      }
    }

    const abi = forgeAbi;
    const selectors = selectorsFromMethodIds(methodIdentifiers);

    contracts[addr] = {
      name: key,
      address: addr,
      abi,
      selectors,
    };

    metaContracts.push({
      name: key,
      address: addr,
      selectorCount: Object.keys(selectors).length,
      abiHash: hashAbi(abi).slice(0, 16),
      sources: skipBs ? ["forge"] : ["forge", "blockscout"],
    });

    console.log(`OK ${key} @ ${addr} (${Object.keys(selectors).length} selectors)`);
  }

  if (mismatches.length > 0) {
    console.error("\nABI mismatch (forge vs Blockscout):");
    for (const m of mismatches) {
      console.error(`  ${m.name}: forge=${m.forgeHash} blockscout=${m.blockscoutHash}`);
      if (m.onlyForge.length) console.error(`    only forge: ${m.onlyForge.join(", ")}`);
      if (m.onlyBs.length) console.error(`    only blockscout: ${m.onlyBs.join(", ")}`);
    }
    process.exit(1);
  }

  const syncedAt = new Date().toISOString();
  const index = { chainId, syncedAt, contracts };
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);

  const meta = {
    chainId,
    syncedAt,
    strictDualSource: !skipBs,
    blockscoutApi: BLOCKSCOUT_API,
    contracts: metaContracts,
  };
  fs.writeFileSync(META_PATH, `${JSON.stringify(meta, null, 2)}\n`);

  console.log(`\nWrote ${INDEX_PATH}`);
  console.log(`Wrote ${META_PATH}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
