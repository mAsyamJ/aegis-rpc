#!/usr/bin/env bash
# Live 3-tx preflight — SAFE / WARN / BLOCK on deployed Base Sepolia contracts.
# Requires: dev server + abi-index (node scripts/sync-abi-index.mjs).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3000}"

PAYLOAD=$(node "$ROOT/scripts/print-live-calldata.mjs")
export BASE PAYLOAD

node <<'NODE'
const base = process.env.BASE;
const payload = JSON.parse(process.env.PAYLOAD);

async function preflight(label, lane, expectVerdict, expectReason) {
  const body = {
    chainId: payload.chainId,
    from: payload.from,
    to: lane.to,
    valueWei: "0",
    data: lane.data,
    policyId: lane.policyId,
  };
  console.log(`=== ${label} ===`);
  const r = await fetch(`${base}/api/preflight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${label} preflight HTTP ${r.status}`);
  const json = await r.json();
  console.log(JSON.stringify(json).slice(0, 400));
  console.log("");
  if (json.verdict !== expectVerdict) {
    throw new Error(`${label}: expected verdict ${expectVerdict}, got ${json.verdict}`);
  }
  if (!String(json.reasonCode).includes(expectReason)) {
    throw new Error(`${label}: expected reason ${expectReason}, got ${json.reasonCode}`);
  }
  await new Promise((res) => setTimeout(res, 800));
  const ai = await fetch(`${base}/api/ai-analyze?requestId=${encodeURIComponent(json.requestId)}`);
  if (!ai.ok) throw new Error(`${label} ai-analyze HTTP ${ai.status}`);
  const aiJson = await ai.json();
  console.log(JSON.stringify(aiJson).slice(0, 280));
  console.log("");
  if (!aiJson.analysis && !aiJson.memo) {
    throw new Error(`${label}: expected AI memo or analysis`);
  }
}

(async () => {
  await preflight(
    "1. SAFE — DeFi checkSwapDeviation",
    payload.safe,
    "SAFE",
    "ALL_CHECKS_PASSED",
  );
  await preflight(
    "2. WARN — high allowance approve",
    payload.warn,
    "WARN",
    "HIGH_ALLOWANCE",
  );
  await preflight(
    "3. BLOCK — unlimited approve",
    payload.block,
    "BLOCK",
    "UNLIMITED_APPROVAL_UNKNOWN_SPENDER",
  );
  const ev = await fetch(`${base}/api/events?limit=5`);
  if (!ev.ok) throw new Error("events HTTP " + ev.status);
  const evJson = await ev.json();
  console.log("=== Events (last 5) ===");
  console.log(JSON.stringify(evJson).slice(0, 300));
  console.log("");
  console.log("OK: curl-live-three-tx finished");
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
NODE
