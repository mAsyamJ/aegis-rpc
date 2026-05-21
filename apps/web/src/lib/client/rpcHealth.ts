export type RpcHealth = {
  ok: boolean;
  latencyMs: number | null;
  blockNumber: string | null;
  chainLabel: string;
};

export async function probeRpc(): Promise<RpcHealth> {
  const started = Date.now();
  try {
    const res = await fetch("/api/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    const json = (await res.json()) as { result?: string };
    const latencyMs = Date.now() - started;
    const blockNumber = json.result
      ? parseInt(json.result, 16).toLocaleString()
      : null;
    return {
      ok: Boolean(json.result),
      latencyMs,
      blockNumber,
      chainLabel: "Base Sepolia",
    };
  } catch {
    return {
      ok: false,
      latencyMs: null,
      blockNumber: null,
      chainLabel: "Base Sepolia",
    };
  }
}
