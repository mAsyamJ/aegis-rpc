"use client";

import { useCallback, useMemo, useState } from "react";
import { Play, ShieldX, Wallet } from "lucide-react";
import { useAccount, useChainId, useSendTransaction, useSwitchChain } from "wagmi";
import { baseSepolia } from "viem/chains";
import { toast } from "sonner";

import { DemoWorkbench } from "@/components/layout/DemoWorkbench";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { DemoStepper, type DemoStep } from "@/components/shared/DemoStepper";
import { TransactionRiskPanel } from "@/components/demo/TransactionRiskPanel";
import { VerdictCard } from "@/components/demo/VerdictCard";
import { DemoResultsPanel } from "@/components/demo/DemoResultsPanel";
import { SignInButton } from "@/components/web3/SignInButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildDemoUnlimitedApproveCalldata,
  demoApproveTarget,
} from "@/lib/client/contractActions";
import { postPreflightLive } from "@/lib/client/aegisApi";
import { contractAddresses } from "@/lib/chain/addresses";
import type { PreflightResponse } from "@/lib/types/aegis";
import { DEMO_SPENDER } from "@/lib/fixtures/liveCalldata";

const WALLET_STEPS: DemoStep[] = [
  {
    id: "connect",
    label: "Connect on Base Sepolia",
    description: "Wallet uses Aegis RPC gateway when Reown is configured.",
  },
  {
    id: "preflight",
    label: "Preflight unlimited approve",
    description: `DemoERC20 → approve(${DEMO_SPENDER.slice(0, 6)}…, MaxUint256) — expect BLOCK.`,
  },
  {
    id: "sign",
    label: "Optional: sign in wallet",
    description: "Signing does not bypass policy; gateway still intercepts raw send.",
  },
];

export default function WalletDemoPage() {
  const [guidedStep, setGuidedStep] = useState(0);
  const [response, setResponse] = useState<PreflightResponse | undefined>();
  const [running, setRunning] = useState(false);
  const [memoStatus, setMemoStatus] = useState<"idle" | "generating" | "ready" | "failed">("idle");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync, isPending: signing } = useSendTransaction();

  const calldata = useMemo(() => buildDemoUnlimitedApproveCalldata(), []);
  const from = address ?? "0x1234567890123456789012345678901234567890";

  const runPreflight = useCallback(async () => {
    setRunning(true);
    setMemoStatus("generating");
    try {
      const result = await postPreflightLive({
        chainId: 84532,
        from,
        to: demoApproveTarget,
        data: calldata,
        valueWei: "0",
        policyId: "default-wallet-policy",
      });
      setResponse(result);
      setMemoStatus(result.memoStatus ?? "ready");
      setGuidedStep(2);
    } catch (e) {
      setMemoStatus("failed");
      toast.error(e instanceof Error ? e.message : "Preflight failed");
    } finally {
      setRunning(false);
    }
  }, [calldata, from]);

  const signTx = useCallback(async () => {
    if (!isConnected || !address) {
      toast.message("Connect wallet first");
      return;
    }
    if (chainId !== baseSepolia.id) {
      try {
        await switchChainAsync({ chainId: baseSepolia.id });
      } catch {
        toast.error("Switch to Base Sepolia in your wallet");
        return;
      }
    }
    try {
      await sendTransactionAsync({
        to: demoApproveTarget,
        data: calldata,
        value: BigInt(0),
        chainId: baseSepolia.id,
      });
      toast.success("Transaction signed — use Aegis RPC to broadcast after preflight");
      setGuidedStep(3);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign rejected");
    }
  }, [address, calldata, chainId, isConnected, sendTransactionAsync, switchChainAsync]);

  const intent = useMemo(
    () => ({
      from,
      to: demoApproveTarget,
      value: "0",
      data: calldata,
      selector: calldata.slice(0, 10),
      functionSignature: "approve(address,uint256)",
      decodedArgs: [
        { name: "spender", type: "address", value: contractAddresses.DemoSpender, highlight: true },
        { name: "amount", type: "uint256", value: "MaxUint256", highlight: true },
      ],
      chainId: 84532,
    }),
    [calldata, from],
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AdminPageHeader
        section="Demo · wallet"
        title="Wallet approval firewall"
        description="Live preflight against deployed DemoERC20 on Base Sepolia — unlimited approve to DemoSpender."
        actions={<SignInButton size="sm" />}
      />

      <Alert variant="warning">
        <ShieldX className="h-4 w-4" />
        <AlertTitle>Live Base Sepolia screening</AlertTitle>
        <AlertDescription>
          Preflight hits <span className="font-mono">/api/preflight</span> with indexed ABI decode.
          BLOCK verdict prevents safe-send; custom RPC returns -32090 until screened.
        </AlertDescription>
      </Alert>

      <DemoWorkbench
        controls={
          <Card>
            <CardContent className="space-y-4 pt-6">
              <DemoStepper
                steps={WALLET_STEPS}
                activeIndex={guidedStep}
                completedThrough={
                  response?.verdict === "BLOCK" ? 2 : guidedStep > 0 ? 0 : -1
                }
              />
              {guidedStep === 0 ? (
                <Button
                  className="w-full bg-aegis text-aegis-foreground hover:bg-aegis/90"
                  onClick={() => setGuidedStep(1)}
                  disabled={!isConnected}
                >
                  <Wallet className="mr-1.5 h-4 w-4" />
                  {isConnected ? "Continue" : "Connect wallet first"}
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full bg-aegis text-aegis-foreground hover:bg-aegis/90"
                    onClick={() => void runPreflight()}
                    disabled={running}
                  >
                    <Play className="mr-1.5 h-4 w-4" />
                    {running ? "Running preflight…" : "Run live preflight"}
                  </Button>
                  {response?.verdict === "BLOCK" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => void signTx()}
                      disabled={signing || !isConnected}
                    >
                      {signing ? "Signing…" : "Sign tx in wallet (optional)"}
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        }
        primary={
          <div className="space-y-4">
            <TransactionRiskPanel
              intent={response?.intent ?? intent}
              response={response}
              useCase="wallet"
            />
          </div>
        }
        secondary={
          <VerdictCard
            response={response}
            loading={running}
            memoStatus={memoStatus}
            onReset={() => {
              setResponse(undefined);
              setMemoStatus("idle");
              setGuidedStep(1);
            }}
          />
        }
        footer={response ? <DemoResultsPanel response={response} /> : null}
      />
    </div>
  );
}
