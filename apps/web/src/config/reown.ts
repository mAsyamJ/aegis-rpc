import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { baseSepolia } from "viem/chains";
import { getAegisRpcUrl } from "@/lib/client/aegisRpc";

/** Reown Cloud project id — https://dashboard.reown.com */
export const reownProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ??
  process.env.NEXT_PUBLIC_PROJECT_ID ??
  "";

/** Base Sepolia routed through Aegis /api/rpc gateway. */
export const baseSepoliaAegis = defineChain({
  ...baseSepolia,
  rpcUrls: {
    default: { http: [getAegisRpcUrl()] },
  },
});

export const reownNetworks = [baseSepoliaAegis];

export const wagmiAdapter = reownProjectId
  ? new WagmiAdapter({
      storage: createStorage({ storage: cookieStorage }),
      ssr: true,
      projectId: reownProjectId,
      networks: reownNetworks,
    })
  : null;

/** SSR-safe fallback when Reown is not configured — demos still render (wallet optional). */
export const fallbackWagmiConfig = createConfig({
  chains: [baseSepoliaAegis],
  transports: {
    [baseSepoliaAegis.id]: http(),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});

export const wagmiConfig = wagmiAdapter?.wagmiConfig ?? fallbackWagmiConfig;
