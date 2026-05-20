import { NextResponse } from "next/server";
import { getChainlinkHealth } from "@/lib/adapters/chainlinkPriceAdapter";

export async function GET() {
  const health = await getChainlinkHealth();
  return NextResponse.json(health);
}
