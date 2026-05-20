import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { copyToClipboard, shortAddress } from "@/lib/utils/format";

export function ContractAddressCard({
  label,
  address,
  href,
  full,
  className,
}: {
  label: string;
  address: string;
  href?: string;
  full?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate font-mono text-xs text-foreground">
          {full ? address : shortAddress(address, 10, 8)}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          aria-label="Copy"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={async () => {
            await copyToClipboard(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-safe" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rounded px-1.5 py-0.5 text-[11px] text-aegis hover:underline"
          >
            view ↗
          </a>
        )}
      </div>
    </div>
  );
}
