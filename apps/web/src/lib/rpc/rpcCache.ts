import { forwardRpcCall } from "@/lib/rpc/client";

const CACHEABLE = new Set(["eth_chainId", "eth_blockNumber"]);

type CacheEntry = { result: unknown; expiresAt: number };

const cache = new Map<string, CacheEntry>();

function cacheKey(method: string, params: unknown[]): string {
  return `${method}:${JSON.stringify(params)}`;
}

export function rpcCacheTtlMs(): number {
  const raw = process.env.AEGIS_RPC_CACHE_TTL_MS;
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function isCacheableMethod(method: string): boolean {
  return CACHEABLE.has(method) && rpcCacheTtlMs() > 0;
}

export type ForwardResult =
  | { result: unknown; cacheHit?: boolean }
  | { error: import("@/lib/rpc/client").JsonRpcErrorShape };

export async function forwardWithCache(
  id: string | number | null,
  method: string,
  params: unknown[]
): Promise<ForwardResult> {
  const ttl = rpcCacheTtlMs();
  if (!CACHEABLE.has(method) || ttl <= 0) {
    return forwardRpcCall(id, method, params);
  }

  const key = cacheKey(method, params);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return { result: hit.result, cacheHit: true };
  }

  const upstream = await forwardRpcCall(id, method, params);
  if ("result" in upstream) {
    cache.set(key, { result: upstream.result, expiresAt: Date.now() + ttl });
    return { ...upstream, cacheHit: false };
  }
  return upstream;
}

export function clearRpcCacheForTests(): void {
  cache.clear();
}
