import type { AuditEvent } from "@/lib/types";

const events: AuditEvent[] = [];

export function appendEvent(event: AuditEvent): AuditEvent {
  events.unshift(event);
  if (events.length > 500) events.pop();
  return event;
}

export function listEvents(limit = 50): AuditEvent[] {
  return events.slice(0, limit);
}

export function getEventByRequestId(requestId: string): AuditEvent | undefined {
  return events.find((e) => e.requestId === requestId);
}

export function updateEvent(
  requestId: string,
  patch: Partial<Pick<AuditEvent, "aiMemo" | "memoStatus">>
): AuditEvent | undefined {
  const idx = events.findIndex((e) => e.requestId === requestId);
  if (idx === -1) return undefined;
  events[idx] = { ...events[idx], ...patch };
  return events[idx];
}
