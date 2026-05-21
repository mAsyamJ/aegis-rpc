"use client";

import "@/lib/appkit/init";
import { LogIn } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reownProjectId } from "@/config/reown";
import { openWalletConnect } from "@/lib/appkit/openConnect";
import { WalletAccountChip } from "./WalletAccountChip";

const REOWN_SETUP_HINT =
  "Add NEXT_PUBLIC_REOWN_PROJECT_ID to apps/web/.env.local (free at dashboard.reown.com), then restart the dev server.";

function SignUpInner({
  size,
  className,
  connectLabel,
}: {
  size: "sm" | "default" | "lg";
  className?: string;
  connectLabel: string;
}) {
  const { open } = useAppKit();

  return (
    <WalletAccountChip
      size={size}
      className={className}
      onConnect={() => openWalletConnect(open)}
      connectLabel={connectLabel}
      connectIcon={<LogIn className="mr-1.5 h-3.5 w-3.5" />}
    />
  );
}

export function SignInButton({
  size = "sm",
  className,
  connectLabel = "Sign up",
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
  connectLabel?: string;
}) {
  if (!reownProjectId) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        className={className}
        onClick={() => toast.error("Wallet sign-up is not configured", { description: REOWN_SETUP_HINT })}
        title="Wallet sign-up requires Reown project ID"
      >
        {connectLabel}
      </Button>
    );
  }

  return (
    <SignUpInner size={size} className={className} connectLabel={connectLabel} />
  );
}
