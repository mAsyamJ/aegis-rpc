import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";
import type { AegisAdapter } from "./types";
import type { AdapterSignal, AegisPolicy, TxIntent } from "@/lib/types";

const aggregatorAbi = parseAbi([
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() view returns (uint8)",
]);

const DEFAULT_FEED =
  "0x4aDC67696Ba383f67Dd721149D36317a7C0E8c10" as `0x${string}`;
const MAX_STALE_SECONDS = 3600;

export const chainlinkPriceAdapter: AegisAdapter = {
  name: "ChainlinkPriceAdapter",

  supports(_intent: TxIntent, _policy: AegisPolicy): boolean {
    return true;
  },

  async getSignal(intent: TxIntent, policy: AegisPolicy): Promise<AdapterSignal> {
    const started = Date.now();
    const feedAddress = (process.env.CHAINLINK_ETH_USD_FEED ??
      DEFAULT_FEED) as `0x${string}`;

    try {
      const url = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
      const client = createPublicClient({
        chain: baseSepolia,
        transport: http(url),
      });

      const [roundData, decimals] = await Promise.all([
        client.readContract({
          address: feedAddress,
          abi: aggregatorAbi,
          functionName: "latestRoundData",
        }),
        client.readContract({
          address: feedAddress,
          abi: aggregatorAbi,
          functionName: "decimals",
        }),
      ]);

      const answer = roundData[1];
      const updatedAt = Number(roundData[3]);
      const now = Math.floor(Date.now() / 1000);
      const staleSeconds = now - updatedAt;
      const priceUsd = Number(answer) / 10 ** decimals;
      const valueEth = Number(intent.valueWei) / 1e18;
      const valueUsd = valueEth * priceUsd;

      if (answer <= BigInt(0)) {
        return {
          adapter: "ChainlinkPriceAdapter",
          status: policy.rules.requireFreshPrice ? "BLOCK" : "WARN",
          reasonCode: "CHAINLINK_INVALID_ANSWER",
          message: "Chainlink feed returned non-positive answer",
          latencyMs: Date.now() - started,
        };
      }

      if (staleSeconds > MAX_STALE_SECONDS) {
        return {
          adapter: "ChainlinkPriceAdapter",
          status: policy.rules.requireFreshPrice ? "BLOCK" : "WARN",
          reasonCode: "CHAINLINK_STALE_FEED",
          message: `Chainlink feed stale by ${staleSeconds}s`,
          data: { staleSeconds, updatedAt },
          latencyMs: Date.now() - started,
        };
      }

      const maxUsd = policy.limits.maxNativeTransferUsd;
      if (
        maxUsd !== undefined &&
        intent.decodedFunction === "native_transfer" &&
        valueUsd > maxUsd
      ) {
        return {
          adapter: "ChainlinkPriceAdapter",
          status: "BLOCK",
          reasonCode: "NATIVE_TRANSFER_ABOVE_USD_LIMIT",
          message: `Native transfer ~$${valueUsd.toFixed(2)} exceeds limit $${maxUsd}`,
          data: { valueUsd, priceUsd, maxUsd },
          latencyMs: Date.now() - started,
        };
      }

      return {
        adapter: "ChainlinkPriceAdapter",
        status: "OK",
        reasonCode: "CHAINLINK_FEED_OK",
        message: "Chainlink price feed fresh",
        data: { priceUsd, valueUsd, staleSeconds, feedAddress },
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Chainlink read failed";
      if (!policy.rules.requireFreshPrice) {
        return {
          adapter: "ChainlinkPriceAdapter",
          status: "OK",
          reasonCode: "CHAINLINK_SKIPPED",
          message: "Chainlink unavailable; skipped (policy does not require fresh price)",
          data: { feedAddress, skipped: true, detail: message.slice(0, 120) },
          latencyMs: Date.now() - started,
        };
      }
      return {
        adapter: "ChainlinkPriceAdapter",
        status: "WARN",
        reasonCode: "CHAINLINK_FEED_UNAVAILABLE",
        message: `Chainlink fallback: ${message}`,
        data: { feedAddress, mock: true },
        latencyMs: Date.now() - started,
      };
    }
  },
};

export async function getChainlinkHealth(): Promise<{
  ok: boolean;
  feedAddress: string;
  priceUsd?: number;
  staleSeconds?: number;
  error?: string;
}> {
  const feedAddress = process.env.CHAINLINK_ETH_USD_FEED ?? DEFAULT_FEED;
  try {
    const url = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(url),
    });
    const [roundData, decimals] = await Promise.all([
      client.readContract({
        address: feedAddress as `0x${string}`,
        abi: aggregatorAbi,
        functionName: "latestRoundData",
      }),
      client.readContract({
        address: feedAddress as `0x${string}`,
        abi: aggregatorAbi,
        functionName: "decimals",
      }),
    ]);
    const updatedAt = Number(roundData[3]);
    const staleSeconds = Math.floor(Date.now() / 1000) - updatedAt;
    return {
      ok: roundData[1] > BigInt(0),
      feedAddress,
      priceUsd: Number(roundData[1]) / 10 ** decimals,
      staleSeconds,
    };
  } catch (err) {
    return {
      ok: false,
      feedAddress,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}
