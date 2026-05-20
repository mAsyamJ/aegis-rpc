const PASSTHROUGH_METHODS = new Set([
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBalance",
  "eth_call",
  "eth_getTransactionCount",
  "eth_estimateGas",
  "eth_getCode",
]);

const INTERCEPTED_METHODS = new Set([
  "eth_sendRawTransaction",
  "aegis_preflight",
  "aegis_sendTransaction",
]);

export function isPassthroughMethod(method: string): boolean {
  return PASSTHROUGH_METHODS.has(method);
}

export function isInterceptedMethod(method: string): boolean {
  return INTERCEPTED_METHODS.has(method);
}

export function rpcUrl(): string {
  return process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
}

export async function forwardRpcCall(
  method: string,
  params: unknown[]
): Promise<unknown> {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  if (!res.ok) {
    throw new Error(`Upstream RPC HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    result?: unknown;
    error?: { message?: string };
  };

  if (json.error) {
    throw new Error(json.error.message ?? "Upstream RPC error");
  }

  return json.result;
}
