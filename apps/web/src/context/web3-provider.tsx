"use client";

import "@/lib/appkit/init";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cookieToInitialState,
  WagmiProvider,
  type Config,
} from "wagmi";
import { type ReactNode, useState } from "react";
import { wagmiConfig } from "@/config/reown";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
      refetchOnWindowFocus: true,
    },
  },
});

export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const [client] = useState(() => queryClient);

  const initialState = cookieToInitialState(wagmiConfig as Config, cookies);

  return (
    <WagmiProvider
      config={wagmiConfig as Config}
      initialState={initialState}
      reconnectOnMount={false}
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
