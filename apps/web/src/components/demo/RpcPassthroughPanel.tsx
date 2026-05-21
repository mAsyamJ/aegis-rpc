"use client";

import { useState } from "react";
import { Activity, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonViewer } from "@/components/shared/JsonViewer";
import { aegisRpcCall, getAegisRpcUrl } from "@/lib/client/aegisRpc";
import { cn } from "@/lib/utils";

const DEMO_FROM = "0xA9e15A7d2c0B7F0EaF94c2De27B5C7e1aaF50001" as const;

export function RpcPassthroughPanel({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [interceptLoading, setInterceptLoading] = useState(false);
  const [payload, setPayload] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const rpcUrl = getAegisRpcUrl();

  async function runPassthrough() {
    setLoading(true);
    setError(null);
    setPayload(null);
    const block = await aegisRpcCall("eth_blockNumber", []);
    if (!block.ok) {
      setError(block.error);
      setLoading(false);
      return;
    }
    const bal = await aegisRpcCall("eth_getBalance", [DEMO_FROM, "latest"], 2);
    if (!bal.ok) {
      setError(bal.error);
      setLoading(false);
      return;
    }
    setPayload({
      note: "Read-only JSON-RPC via Aegis gateway (Base Sepolia upstream)",
      rpcUrl,
      eth_blockNumber: block.json,
      eth_getBalance: bal.json,
    });
    setLoading(false);
  }

  async function runIntercept() {
    setInterceptLoading(true);
    setError(null);
    const res = await aegisRpcCall("eth_sendTransaction", [
      {
        from: DEMO_FROM,
        to: "0x0000000000000000000000000000000000000002",
        value: "0x0",
      },
    ]);
    setInterceptLoading(false);
    if (!res.ok && res.json) {
      const err = res.json as { error?: { code?: number; message?: string } };
      const code = err.error?.code;
      const msg = err.error?.message ?? "";
      if (code === -32090 && msg.includes("REQUIRES_PREFLIGHT")) {
        setPayload({
          note: "Send intercept OK — gateway requires preflight before broadcast",
          rpcUrl,
          eth_sendTransaction: res.json,
        });
        return;
      }
    }
    if (res.ok) {
      setError("Expected -32090 REQUIRES_PREFLIGHT intercept");
      return;
    }
    setError(res.error);
  }

  async function copyRpcUrl() {
    try {
      await navigator.clipboard.writeText(rpcUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy RPC URL");
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-aegis/10 text-aegis ring-1 ring-aegis/30">
          <Activity className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Demo 1 · RPC passthrough
          </div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">
            Aegis RPC gateway (Base Sepolia)
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Add this URL in MetaMask/Rabby (chain 84532). Reads pass through; sends return{" "}
            <span className="font-mono text-foreground/80">-32090 REQUIRES_PREFLIGHT</span> until
            screened.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[10px] text-foreground/90">
              {rpcUrl}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={() => void copyRpcUrl()}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy RPC URL"}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void runPassthrough()}
              disabled={loading}
            >
              {loading ? "Calling RPC…" : "Passthrough test"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void runIntercept()}
              disabled={interceptLoading}
            >
              {interceptLoading ? "Testing…" : "Test send intercept"}
            </Button>
          </div>
          {error ? (
            <p className="mt-2 text-xs text-block">{error}</p>
          ) : null}
          {payload ? (
            <div className="mt-3">
              <JsonViewer data={payload} maxHeight={280} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
