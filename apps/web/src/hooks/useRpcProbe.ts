"use client";

import { useQuery } from "@tanstack/react-query";
import { probeRpc } from "@/lib/client/rpcHealth";

export function useRpcProbe() {
  return useQuery({
    queryKey: ["rpc-health"],
    queryFn: probeRpc,
    staleTime: 5000,
    refetchInterval: 15000,
  });
}
