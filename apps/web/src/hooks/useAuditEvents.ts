"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/lib/client/aegisApi";

export function useAuditEvents() {
  return useQuery({
    queryKey: ["audit-events"],
    queryFn: getEvents,
    refetchInterval: 3000,
    staleTime: 2000,
  });
}
