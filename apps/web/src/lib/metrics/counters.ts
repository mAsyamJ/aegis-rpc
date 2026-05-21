let screeningsTotal = 0;
let blocksTotal = 0;
let rpcRequestsTotal = 0;

export function incrementScreening(verdict: string): void {
  screeningsTotal += 1;
  if (verdict === "BLOCK") blocksTotal += 1;
}

export function incrementRpcRequest(): void {
  rpcRequestsTotal += 1;
}

export function getMetricsSnapshot(): {
  screenings_total: number;
  blocks_total: number;
  rpc_requests_total: number;
} {
  return {
    screenings_total: screeningsTotal,
    blocks_total: blocksTotal,
    rpc_requests_total: rpcRequestsTotal,
  };
}

export function resetMetricsForTests(): void {
  screeningsTotal = 0;
  blocksTotal = 0;
  rpcRequestsTotal = 0;
}
