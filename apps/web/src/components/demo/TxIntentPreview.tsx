import type { TxIntent } from "@/lib/types/aegis";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/utils/format";

export function TxIntentPreview({
  intent,
  className,
}: {
  intent: TxIntent;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Decoded intent
          </span>
          <span className="rounded-md bg-aegis/10 px-1.5 py-0.5 font-mono text-[10px] text-aegis ring-1 ring-aegis/30">
            {intent.functionSignature ?? "raw"}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          chain {intent.chainId} · nonce {intent.nonce ?? "—"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-2 px-4 py-3 text-xs md:grid-cols-2">
        <Row k="from" v={<span className="font-mono">{shortAddress(intent.from, 10, 8)}</span>} />
        <Row k="to" v={<span className="font-mono">{shortAddress(intent.to, 10, 8)}</span>} />
        <Row k="value" v={<span className="font-mono">{intent.value} wei</span>} />
        <Row k="selector" v={<span className="font-mono">{intent.selector}</span>} />
      </div>

      {intent.decodedArgs && intent.decodedArgs.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Arguments
          </div>
          <div className="space-y-1.5">
            {intent.decodedArgs.map((a, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-1.5 font-mono text-xs",
                  a.highlight
                    ? "border-block/40 bg-block/10 text-block"
                    : "bg-background/40 text-foreground/90",
                )}
              >
                <span className="text-muted-foreground">
                  <span className="text-foreground/70">{a.name}</span>{" "}
                  <span className="opacity-60">: {a.type}</span>
                </span>
                <span className={cn(a.highlight && "font-semibold")}>
                  {a.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border px-4 py-3">
        <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Calldata
        </div>
        <pre className="overflow-x-auto rounded-md bg-background/60 p-2 font-mono text-[11px] leading-relaxed text-foreground/80">
          {intent.data}
        </pre>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1 last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {k}
      </span>
      {v}
    </div>
  );
}
