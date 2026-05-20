import { NextResponse } from "next/server";
import { listEvents } from "@/lib/db/eventStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
  const events = listEvents(limit);
  return NextResponse.json({ events, count: events.length });
}
