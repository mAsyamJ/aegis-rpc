#!/usr/bin/env bash
# Judge / production smoke — SAFE / WARN / BLOCK preflight only (no ai-analyze poll).
# Works on Vercel without Supabase (verdicts are in the preflight JSON body).
# Usage: AEGIS_BASE_URL=https://web-gamma-bay-96.vercel.app ./tests/curl-judge-preflight-only.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${AEGIS_BASE_URL:-http://127.0.0.1:3020}"
BASE="${BASE%/}"

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
  console.log(JSON.stringify(json).slice(0, 420));
  console.log("");
  if (json.verdict !== expectVerdict) {
    throw new Error(`${label}: expected verdict ${expectVerdict}, got ${json.verdict}`);
  }
  if (!String(json.reasonCode).includes(expectReason)) {
    throw new Error(`${label}: expected reason ${expectReason}, got ${json.reasonCode}`);
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
  console.log("OK: curl-judge-preflight-only finished (verdicts only; enable Supabase for /api/events + ai-analyze)");
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
NODE
