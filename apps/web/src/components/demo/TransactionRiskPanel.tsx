"use client";

import type { PreflightResponse, TxIntent } from "@/lib/types/aegis";
import { VerdictBadge } from "@/components/status/VerdictBadge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/utils/format";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export function TransactionRiskPanel({
  intent,
  response,
  useCase,
  className,
}: {
  intent: TxIntent;
  response?: PreflightResponse;
  useCase?: string;
  className?: string;
}) {
  const verdict = response?.verdict;
  const spender = intent.decodedArgs?.find(
    (a) => a.name === "spender" || a.name.toLowerCase().includes("spender"),
  );
  const isApprove = intent.functionSignature?.includes("approve");
  const preview = response?.adapters.find((a) => a.adapter === "PreviewEnrichmentAdapter");
  const contractName =
    typeof preview?.data?.contractName === "string"
      ? preview.data.contractName
      : undefined;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Transaction preview
          </span>
          {useCase ? (
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] capitalize text-muted-foreground">
              {useCase}
            </span>
          ) : null}
        </div>
        <VerdictBadge verdict={verdict} size="sm" />
      </div>

      {response?.reasonCode ? (
        <div className="px-4 pt-3">
          <div className="font-mono text-xs text-foreground">{response.reasonCode}</div>
          {response.reason ? (
            <p className="mt-1 text-[11px] text-muted-foreground">{response.reason}</p>
          ) : null}
        </div>
      ) : null}

      {response?.reasonCode === "SIMULATION_REVERT" ? (
        <Alert variant="warning" className="mx-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulation reverted</AlertTitle>
          <AlertDescription>
            eth_call reverted; state override did not clear revert — review before sign.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 px-4 py-3 text-xs md:grid-cols-2">
        <RiskRow label="Target" value={shortAddress(intent.to, 10, 8)} mono />
        <RiskRow label="From" value={shortAddress(intent.from, 10, 8)} mono />
        {isApprove && spender ? (
          <RiskRow
            label="Spender"
            value={spender.value}
            mono
            highlight={verdict === "BLOCK"}
          />
        ) : null}
        {intent.valueUsd != null ? (
          <RiskRow
            label="USD value"
            value={`$${intent.valueUsd.toLocaleString()}`}
            highlight={response?.reasonCode?.includes("CAP")}
          />
        ) : null}
        <RiskRow label="Selector" value={intent.selector} mono />
        {intent.functionSignature ? (
          <RiskRow label="Function" value={intent.functionSignature} mono />
        ) : null}
        {contractName && contractName !== "contract" && contractName !== "eoa_or_empty" ? (
          <RiskRow label="Contract" value={contractName} />
        ) : null}
      </div>

      {response && response.checks.length > 0 ? (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Policy checks
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Check</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response.checks.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <StatusPill status={c.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.detail ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {response && response.adapters.length > 0 ? (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <ShieldAlert className="h-3 w-3" />
            Adapter signals
          </div>
          <ul className="space-y-1.5">
            {response.adapters.map((a) => (
              <li
                key={a.adapter}
                className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5 text-[11px]"
              >
                <span className="font-medium">{a.adapter}</span>
                <StatusPill status={a.status} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {intent.decodedArgs && intent.decodedArgs.length > 0 ? (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Decoded arguments
          </div>
          <div className="space-y-1">
            {intent.decodedArgs.map((arg) => (
              <div
                key={arg.name}
                className={cn(
                  "flex justify-between gap-2 rounded px-2 py-1 font-mono text-[11px]",
                  arg.highlight && "bg-block/10 text-block",
                )}
              >
                <span className="text-muted-foreground">{arg.name}</span>
                <span className="truncate">{arg.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function RiskRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-2 rounded-md border border-border/50 bg-background/30 px-2.5 py-1.5",
        highlight && "border-block/30 bg-block/5",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-foreground", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "OK"
      ? "bg-safe/15 text-safe"
      : status === "WARN"
        ? "bg-warn/15 text-warn"
        : status === "BLOCK"
          ? "bg-block/15 text-block"
          : "bg-muted text-muted-foreground";
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", tone)}>
      {status}
    </span>
  );
}
