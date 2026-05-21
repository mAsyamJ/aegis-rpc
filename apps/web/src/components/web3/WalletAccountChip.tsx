"use client";

import type { ReactNode } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { reownProjectId } from "@/config/reown";
import { openWalletConnect } from "@/lib/appkit/openConnect";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/utils/format";

function WalletAccountChipInner({
  size = "sm",
  onConnect,
  connectLabel = "Connect",
  connectIcon,
  loading,
  className,
}: {
  size?: "sm" | "default" | "lg";
  onConnect?: () => void;
  connectLabel?: string;
  connectIcon?: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  const { open } = useAppKit();
  const { isConnected, address, embeddedWalletInfo } = useAppKitAccount();
  const { connector } = useAccount();
  const isSmartAccount = embeddedWalletInfo?.accountType === "smartAccount";

  if (!isConnected || !address) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        className={cn("border-aegis/30 hover:bg-aegis/10", className)}
        onClick={onConnect ?? (() => openWalletConnect(open))}
        disabled={loading}
      >
        {connectIcon}
        {loading ? "Loading…" : connectLabel}
      </Button>
    );
  }

  const connectorName = connector?.name ?? "Wallet";

  return (
    <button
      type="button"
      onClick={() => open({ view: "Account" })}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs transition-colors hover:border-aegis/40 hover:bg-aegis/5",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-safe shadow-[0_0_8px_2px_var(--safe)]" />
      <span className="font-mono text-foreground">{shortAddress(address)}</span>
      {isSmartAccount ? (
        <span className="rounded bg-aegis/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-aegis">
          AA
        </span>
      ) : null}
    </button>
  );
}

export function WalletAccountChip(
  props: Parameters<typeof WalletAccountChipInner>[0],
) {
  if (!reownProjectId) return null;
  return <WalletAccountChipInner {...props} />;
}
