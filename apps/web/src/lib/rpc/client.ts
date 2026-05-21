const PASSTHROUGH_METHODS = new Set([
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBalance",
  "eth_call",
  "eth_getTransactionCount",
  "eth_estimateGas",
  "eth_getCode",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getLogs",
]);

/** Must use POST /api/preflight before broadcast. */
const INTERCEPTED_SEND_METHODS = new Set([
  "eth_sendRawTransaction",
  "eth_sendTransaction",
]);

/** ERC-4337 send/estimate — require aegis_preflightUserOp first. */
const INTERCEPTED_USER_OP_METHODS = new Set([
  "eth_sendUserOperation",
  "eth_estimateUserOperationGas",
]);

/** Aegis JSON-RPC extensions handled in /api/rpc route. */
export const AEGIS_RPC_METHODS = new Set([
  "aegis_preflight",
  "aegis_preflightUserOp",
  "aegis_sendTransaction",
]);

export type JsonRpcErrorShape = {
  code: number;
  message: string;
  data?: unknown;
};

/** JSON-RPC -32090 when a tx method hits /api/rpc without pre-screening (spec `docs/04-api-spec.md`). */
export const REQUIRES_PREFLIGHT_REASON = "REQUIRES_PREFLIGHT" as const;

export function buildInterceptScreeningError(method: string): JsonRpcErrorShape {
  return {
    code: -32090,
    message:
      "Aegis BLOCK: transaction must be screened before broadcast (POST /api/preflight)",
    data: {
      verdict: "BLOCK" as const,
      reasonCode: REQUIRES_PREFLIGHT_REASON,
      broadcasted: false as const,
      method,
    },
  };
}

export function isPassthroughMethod(method: string): boolean {
  return PASSTHROUGH_METHODS.has(method);
}

export function isInterceptedSendMethod(method: string): boolean {
  return INTERCEPTED_SEND_METHODS.has(method);
}

export function isInterceptedUserOpMethod(method: string): boolean {
  return INTERCEPTED_USER_OP_METHODS.has(method);
}

export function isAegisRpcMethod(method: string): boolean {
  return AEGIS_RPC_METHODS.has(method);
}

/** @deprecated Use isInterceptedSendMethod */
export function isInterceptedMethod(method: string): boolean {
  return isInterceptedSendMethod(method);
}

export function rpcUrl(): string {
  return process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
}

export async function forwardRpcCall(
  id: string | number | null,
  method: string,
  params: unknown[]
): Promise<{ result: unknown } | { error: JsonRpcErrorShape }> {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });

  if (!res.ok) {
    return {
      error: {
        code: -32603,
        message: `Upstream RPC HTTP ${res.status}`,
      },
    };
  }

  const json = (await res.json()) as {
    result?: unknown;
    error?: { code?: number; message?: string; data?: unknown };
  };

  if (json.error) {
    const code =
      typeof json.error.code === "number" ? json.error.code : -32603;
    const message = json.error.message ?? "Upstream RPC error";
    const out: JsonRpcErrorShape = { code, message };
    if (json.error.data !== undefined) out.data = json.error.data;
    return { error: out };
  }

  return { result: json.result };
}
