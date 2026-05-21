"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useAccount, useChainId } from "wagmi";
import { Wallet } from "lucide-react";
import { reownProjectId } from "@/config/reown";
import { shortAddress } from "@/lib/utils/format";

function ConnectedWalletOverviewInner() {
  const { isConnected, address, embeddedWalletInfo } = useAppKitAccount();
  const { connector } = useAccount();
  const chainId = useChainId();

  if (!isConnected || !address) return null;

  const connectorName = connector?.name ?? "Wallet";
  const isSmartAccount = embeddedWalletInfo?.accountType === "smartAccount";

  return (
    <div className="mt-6 rounded-xl border border-aegis/30 bg-aegis/5 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-aegis/15 text-aegis ring-1 ring-aegis/30">
          <Wallet className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Signed in
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-foreground">
            {shortAddress(address)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {connectorName} · chain {chainId}
            {isSmartAccount
              ? " · Smart account (account abstraction)"
              : " · EOA via installed wallet or WalletConnect"}
          </p>
        </div>
        {isSmartAccount ? (
          <span className="rounded-md border border-aegis/40 bg-aegis/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-aegis">
            Account abstraction
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ConnectedWalletOverview() {
  if (!reownProjectId) return null;
  return <ConnectedWalletOverviewInner />;
}
