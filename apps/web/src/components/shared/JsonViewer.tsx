import { cn } from "@/lib/utils";

export function JsonViewer({
  data,
  className,
  maxHeight = 320,
}: {
  data: unknown;
  className?: string;
  maxHeight?: number;
}) {
  const text = JSON.stringify(data, null, 2);
  return (
    <pre
      className={cn(
        "overflow-auto rounded-md border border-border bg-background/70 p-3 font-mono text-[11.5px] leading-relaxed text-foreground/90",
        className,
      )}
      style={{ maxHeight }}
    >
      {text}
    </pre>
  );
}
