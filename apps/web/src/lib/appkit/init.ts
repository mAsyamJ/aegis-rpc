"use client";

import { createAppKit } from "@reown/appkit/react";
import { reownProjectId, wagmiAdapter, baseSepoliaAegis } from "@/config/reown";

let initialized = false;

/** Client singleton — must run before any `useAppKit` / `useAppKitAccount` hook. */
export function initAppKit() {
  if (initialized || !reownProjectId || !wagmiAdapter) return;
  initialized = true;

  createAppKit({
    adapters: [wagmiAdapter],
    projectId: reownProjectId,
    networks: [baseSepoliaAegis],
    defaultNetwork: baseSepoliaAegis,
    // Email/social sign-in uses Reown smart accounts (ERC-4337) on supported chains.
    defaultAccountTypes: { eip155: "smartAccount" },
    // Do not block the marketing/overview page when a wallet is on another chain.
    allowUnsupportedChain: true,
    enableReconnect: false,
    // EIP-6963: list MetaMask, Rabby, etc. installed in the browser automatically.
    enableEIP6963: true,
    enableInjected: true,
    enableWallets: true,
    allWallets: "SHOW",
    enableCoinbase: true,
    coinbasePreference: "all",
    metadata: {
      name: "Aegis RPC",
      description: "Pre-broadcast transaction screening gateway",
      url:
        typeof window !== "undefined"
          ? window.location.origin
          : "https://aegis-rpc.vercel.app",
      icons: ["https://avatars.githubusercontent.com/u/179229932"],
    },
    features: {
      analytics: false,
      email: true,
      socials: ["google", "github", "apple", "discord"],
      emailShowWallets: true,
      connectMethodsOrder: ["email", "social", "wallet"],
      onramp: false,
      swaps: false,
    },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "oklch(0.72 0.16 220)",
    },
  });
}

// Eager init when this module loads (Web3Provider imports it before children render).
initAppKit();
