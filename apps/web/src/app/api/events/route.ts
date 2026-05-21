import { NextResponse } from "next/server";
import { listEvents } from "@/lib/db/eventRepository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
  const events = await listEvents(limit);
  return NextResponse.json({ events, count: events.length });
}
